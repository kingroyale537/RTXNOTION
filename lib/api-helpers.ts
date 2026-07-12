// lib/api-helpers.ts
// Server-side helpers used by all Next.js Route Handlers.

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

// ─── Standard error responses ─────────────────────────────────────────────────
export const Res = {
  ok: <T>(data: T, status = 200) =>
    NextResponse.json({ data }, { status }),

  created: <T>(data: T) =>
    NextResponse.json({ data }, { status: 201 }),

  noContent: () =>
    new NextResponse(null, { status: 204 }),

  error: (message: string, status = 400) =>
    NextResponse.json({ error: message }, { status }),

  unauthorized: () =>
    NextResponse.json({ error: "Unauthorized" }, { status: 401 }),

  forbidden: () =>
    NextResponse.json({ error: "Forbidden – insufficient permissions" }, { status: 403 }),

  notFound: (resource = "Resource") =>
    NextResponse.json({ error: `${resource} not found` }, { status: 404 }),

  serverError: (err?: unknown) => {
    console.error("[API]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  },
};

// ─── Get the authenticated session user ───────────────────────────────────────
export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; name?: string | null; email?: string | null; image?: string | null; color: string };
}

// ─── Require authentication (returns user or throws 401) ──────────────────────
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) throw new ApiError("Unauthorized", 401);
  return user;
}

// ─── Custom API error ─────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 400
  ) {
    super(message);
  }
}

// ─── Workspace membership guard ───────────────────────────────────────────────
/**
 * Verifies the current user is a member of the workspace with at least
 * the required role. Returns the membership record on success.
 */
export async function requireWorkspaceMember(
  workspaceId: string,
  userId: string,
  minRole: Role = "VIEWER"
) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    include: { workspace: true },
  });

  if (!member) throw new ApiError("Not a member of this workspace", 403);

  const roleOrder: Record<Role, number> = { VIEWER: 0, EDITOR: 1, ADMIN: 2 };
  if (roleOrder[member.role] < roleOrder[minRole]) {
    throw new ApiError("Insufficient permissions", 403);
  }

  return member;
}

// ─── Page ownership guard ─────────────────────────────────────────────────────
export async function requirePageAccess(
  pageId: string,
  userId: string,
  minRole: Role = "VIEWER"
) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true, workspaceId: true, isArchived: true },
  });
  if (!page) throw new ApiError("Page not found", 404);

  await requireWorkspaceMember(page.workspaceId, userId, minRole);
  return page;
}

// ─── Safe JSON parse body ─────────────────────────────────────────────────────
export async function parseBody<T>(req: NextRequest): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiError("Invalid JSON body", 400);
  }
}

// ─── Route handler wrapper – catches ApiError and logs others ─────────────────
export function withErrorHandling(
  handler: (req: NextRequest, ctx: { params: Record<string, string> }) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: { params: Record<string, string> }) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[API Unhandled]", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

// ─── Pagination helpers ───────────────────────────────────────────────────────
export function getPaginationParams(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20)));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
