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

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import * as Y from "yjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
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
  console.log(`\n🔌 RTX Notion WebSocket server running on port ${PORT}`);
  console.log(`   Accepting connections from ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}\n`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n[WS] Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
