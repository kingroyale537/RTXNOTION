// server/ws-server.ts
// Standalone Socket.io + Yjs CRDT WebSocket server.
// Runs on PORT 3001 alongside the Next.js dev server.
//
// Protocol overview:
//   join-page       → client joins a page room, broadcasts presence
//   leave-page      → client leaves, removes presence
//   yjs-update      → Yjs binary update forwarded to all peers in room
//   cursor-update   → TipTap cursor position broadcast
//   page-meta-update→ title / emoji changed (non-editor users need to know)
//   awareness       → Yjs awareness state (used by TipTap collab cursor)

import * as dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import * as Y from "yjs";
import { PrismaClient } from "@prisma/client";
import { decode } from "next-auth/jwt";

const prisma = new PrismaClient();
const httpServer = createServer();

const allowedOrigins = [
  process.env.NEXTAUTH_URL,
  "https://voltaic.vercel.app",
  "http://localhost:3000",
].filter(Boolean) as string[];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".vercel.app") ||
        /^https:\/\/voltaic.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ─── In-memory Yjs document registry ─────────────────────────────────────────
// pageId → Y.Doc
const ydocs = new Map<string, Y.Doc>();

// pageId → Set<socketId>  (which sockets are in this room)
const pageRooms = new Map<string, Set<string>>();

// socketId → { userId, pageId, name, color, image }
const socketMeta = new Map<
  string,
  { userId: string; pageId: string; name: string; color: string; image?: string | null }
>();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOrCreateYDoc(pageId: string): Y.Doc {
  if (!ydocs.has(pageId)) {
    const doc = new Y.Doc();
    ydocs.set(pageId, doc);
    console.log(`[Yjs] Created new Y.Doc for page ${pageId}`);
  }
  return ydocs.get(pageId)!;
}

function getRoomPresence(pageId: string) {
  const sockets = pageRooms.get(pageId) ?? new Set<string>();
  return Array.from(sockets)
    .map((sid) => socketMeta.get(sid))
    .filter(Boolean);
}

async function persistYDocToDb(pageId: string, ydoc: Y.Doc) {
  try {
    // Extract plain text from Yjs XML fragment for full-text search
    const xmlText = ydoc.getXmlFragment("default");
    const contentText = xmlText.toString();

    await prisma.page.update({
      where: { id: pageId },
      data: {
        contentText,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error(`[Persist] Failed to persist page ${pageId}:`, err);
  }
}

// Debounced persistence – avoid hammering DB on every keystroke
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();
function debouncedPersist(pageId: string, ydoc: Y.Doc) {
  if (persistTimers.has(pageId)) clearTimeout(persistTimers.get(pageId)!);
  const timer = setTimeout(() => {
    persistYDocToDb(pageId, ydoc);
    persistTimers.delete(pageId);
  }, 2000); // 2 s debounce
  persistTimers.set(pageId, timer);
}

// ─── Authentication Middleware ────────────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const cookies = cookieHeader.split(";").reduce((acc, c) => {
      const parts = c.split("=");
      if (parts.length >= 2) {
        acc[parts[0].trim()] = parts.slice(1).join("=");
      }
      return acc;
    }, {} as Record<string, string>);

    const sessionToken = cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];

    if (!sessionToken) {
      console.warn(`[WS Auth] Connection rejected for ${socket.id}: No session token found in cookies`);
      return next(new Error("Unauthorized: No session token found"));
    }

    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!decoded || !decoded.sub) {
      console.warn(`[WS Auth] Connection rejected for ${socket.id}: Invalid session token`);
      return next(new Error("Unauthorized: Invalid session token"));
    }

    // Attach decoded user token info to the socket instance
    socket.data.user = decoded;
    next();
  } catch (err) {
    console.error("[WS Auth Middleware] Error:", err);
    next(new Error("Unauthorized: Authentication failed"));
  }
});

// ─── Socket.io connection handler ─────────────────────────────────────────────
io.on("connection", (socket: Socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // ── join-page ──────────────────────────────────────────────────────────────
  socket.on(
    "join-page",
    async (data: {
      pageId: string;
      userId: string;
      name: string;
      color: string;
      image?: string | null;
    }) => {
      const { pageId, userId, name, color, image } = data;
      console.log(`[WS] ${name} joining page ${pageId}`);

      // 1. Verify user identity matches the token sub
      if (socket.data.user?.sub !== userId) {
        console.warn(`[WS] Blocked join-page: token sub (${socket.data.user?.sub}) !== data userId (${userId})`);
        socket.emit("error", { message: "Forbidden: user ID mismatch" });
        return;
      }

      // 2. Verify workspace/page access permissions
      try {
        const page = await prisma.page.findUnique({
          where: { id: pageId },
          select: { id: true, workspaceId: true, isArchived: true },
        });

        if (!page) {
          socket.emit("error", { message: "Page not found" });
          return;
        }

        // Check workspace membership
        const member = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: page.workspaceId,
              userId,
            },
          },
        });

        if (!member) {
          // Check if there is a page-level permission override
          const override = await prisma.pagePermission.findUnique({
            where: {
              pageId_userId: {
                pageId,
                userId,
              },
            },
          });

          if (!override) {
            console.warn(`[WS] User ${userId} is not allowed to access page ${pageId}`);
            socket.emit("error", { message: "Forbidden: No page access" });
            return;
          }
        }
      } catch (dbErr) {
        console.error("[WS] Database permission check failed:", dbErr);
        socket.emit("error", { message: "Internal server error" });
        return;
      }

      // Join Socket.io room
      socket.join(pageId);

      // Track which sockets are in this room
      if (!pageRooms.has(pageId)) pageRooms.set(pageId, new Set());
      pageRooms.get(pageId)!.add(socket.id);

      // Store per-socket metadata
      socketMeta.set(socket.id, { userId, pageId, name, color, image });

      // Get or create the Y.Doc for this page and send the current state to
      // the new joiner so they can fast-forward to the current version
      const ydoc = getOrCreateYDoc(pageId);
      const currentState = Y.encodeStateAsUpdate(ydoc);

      // Send as base64 string (matches js-base64 toUint8Array on client)
      const { fromUint8Array } = await import("js-base64");
      socket.emit("yjs-state", {
        pageId,
        state: fromUint8Array(currentState),
      });

      // Upsert presence in DB
      await prisma.pagePresence.upsert({
        where: { pageId_userId: { pageId, userId } },
        update: { socketId: socket.id, updatedAt: new Date() },
        create: { pageId, userId, socketId: socket.id },
      }).catch(console.error);

      // Broadcast updated presence list to everyone in the room
      const presence = getRoomPresence(pageId);
      io.to(pageId).emit("presence-update", { pageId, users: presence });
    }
  );

  // ── yjs-join ──────────────────────────────────────────────────────────────
  // Client Yjs provider requests the current document state on joining a page.
  socket.on("yjs-join", async (data: { pageId: string }) => {
    const { pageId } = data;
    const userId = socket.data.user?.sub;

    if (!userId) {
      socket.emit("error", { message: "Unauthorized" });
      return;
    }

    try {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
        select: { id: true, workspaceId: true },
      });

      if (!page) {
        socket.emit("error", { message: "Page not found" });
        return;
      }

      const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: page.workspaceId, userId } },
      });

      if (!member) {
        const override = await prisma.pagePermission.findUnique({
          where: { pageId_userId: { pageId, userId } },
        });

        if (!override) {
          console.warn(`[WS] User ${userId} is not allowed to join Yjs session for page ${pageId}`);
          socket.emit("error", { message: "Forbidden: No page access" });
          return;
        }
      }
    } catch (dbErr) {
      console.error("[WS] Database permission check failed in yjs-join:", dbErr);
      socket.emit("error", { message: "Internal server error" });
      return;
    }

    const ydoc = getOrCreateYDoc(pageId);
    const currentState = Y.encodeStateAsUpdate(ydoc);
    const { fromUint8Array } = await import("js-base64");
    socket.join(pageId); // ensure socket is in the room
    socket.emit("yjs-state", {
      pageId,
      state: fromUint8Array(currentState),
    });
    console.log(`[Yjs] Sent initial state for page ${pageId} to ${socket.id}`);
  });

  // ── yjs-update ────────────────────────────────────────────────────────────
  // Base64-encoded Yjs binary update from a collaborating client.
  // Apply to server doc and broadcast to all OTHER clients in the room.
  socket.on(
    "yjs-update",
    async (data: { pageId: string; update: string }) => {
      const { pageId, update } = data;
      const userId = socket.data.user?.sub;

      if (!userId) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      // Restrict payload size to prevent DDoS / overflow (e.g. max 2MB)
      if (update && update.length > 2 * 1024 * 1024) {
        console.warn(`[WS] Blocked update payload exceeding size limit on page ${pageId} from socket ${socket.id}`);
        socket.emit("error", { message: "Payload size limit exceeded" });
        return;
      }

      // Verify socket session info matches the user and page
      const meta = socketMeta.get(socket.id);
      if (!meta || meta.pageId !== pageId || meta.userId !== userId) {
        console.warn(`[WS] Blocked yjs-update: socket session mismatch for socket ${socket.id} on page ${pageId}`);
        socket.emit("error", { message: "Forbidden: Session mismatch" });
        return;
      }

      const ydoc = getOrCreateYDoc(pageId);
      try {
        const { toUint8Array, fromUint8Array } = await import("js-base64");
        const uint8 = toUint8Array(update);
        Y.applyUpdate(ydoc, uint8);
        // Forward base64 update to all other clients in the room
        socket.to(pageId).emit("yjs-update", {
          pageId,
          update,
        });
        debouncedPersist(pageId, ydoc);
      } catch (err) {
        console.error(`[Yjs] Failed to apply update for page ${pageId}:`, err);
      }
    }
  );

  // ── awareness-update ──────────────────────────────────────────────────────
  // Yjs Awareness protocol relay: broadcast to peers in the same page room.
  socket.on(
    "awareness-update",
    (data: { pageId: string; update: string }) => {
      socket.to(data.pageId).emit("awareness-update", data);
    }
  );

  // ── cursor-update ─────────────────────────────────────────────────────────
  socket.on(
    "cursor-update",
    async (data: {
      pageId: string;
      userId: string;
      cursor: { anchor: number; head: number } | null;
    }) => {
      const { pageId, userId, cursor } = data;

      // Broadcast to peers
      socket.to(pageId).emit("cursor-update", { pageId, userId, cursor });

      // Persist cursor position to DB (fire and forget)
      prisma.pagePresence
        .updateMany({
          where: { pageId, userId },
          data: { cursor: cursor ?? undefined, updatedAt: new Date() },
        })
        .catch(() => {});
    }
  );

  // ── page-meta-update ──────────────────────────────────────────────────────
  // Fired when a user changes the page title or emoji so the sidebar updates
  // instantly on other clients without a full refetch.
  socket.on(
    "page-meta-update",
    (data: {
      pageId: string;
      workspaceId: string;
      title?: string;
      emoji?: string | null;
      updatedBy: string;
    }) => {
      // Broadcast to the page room AND a workspace-level room
      socket.to(data.pageId).emit("page-meta-update", data);
      socket.to(`workspace:${data.workspaceId}`).emit("page-meta-update", data);
    }
  );

  // ── join-workspace ────────────────────────────────────────────────────────
  // Subscribe to workspace-level events (new page, deleted page, member join)
  socket.on("join-workspace", (data: { workspaceId: string }) => {
    socket.join(`workspace:${data.workspaceId}`);
    console.log(`[WS] ${socket.id} joined workspace room ${data.workspaceId}`);
  });

  // ── page-created / page-deleted ────────────────────────────────────────────
  socket.on(
    "page-created",
    (data: { workspaceId: string; page: unknown }) => {
      socket.to(`workspace:${data.workspaceId}`).emit("page-created", data);
    }
  );

  socket.on(
    "page-deleted",
    (data: { workspaceId: string; pageId: string }) => {
      socket.to(`workspace:${data.workspaceId}`).emit("page-deleted", data);
    }
  );

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", async () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
    const meta = socketMeta.get(socket.id);
    if (!meta) return;

    const { pageId, userId } = meta;
    socketMeta.delete(socket.id);

    // Remove from room tracking
    const room = pageRooms.get(pageId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        pageRooms.delete(pageId);
        // Optionally: evict the Y.Doc from memory after a TTL
        // For now, keep it for fast re-joins within the same process
      }
    }

    // Remove presence from DB
    await prisma.pagePresence
      .deleteMany({ where: { pageId, userId } })
      .catch(console.error);

    // Broadcast updated presence list
    const presence = getRoomPresence(pageId);
    io.to(pageId).emit("presence-update", { pageId, users: presence });
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? process.env.WS_PORT ?? 3001);
httpServer.listen(PORT, () => {
  console.log(`\n🔌 Voltaic WebSocket server running on port ${PORT}`);
  console.log(`   Accepting connections from ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}\n`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n[WS] Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
