// app/api/workspaces/route.ts
// GET  /api/workspaces  – list all workspaces for the current user
// POST /api/workspaces  – create a new workspace

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, parseBody, ApiError } from "@/lib/api-helpers";
import { createWorkspaceSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            _count: { select: { pages: true, members: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      myRole: m.role,
    }));

    return Res.ok(workspaces);
  } catch (err) {
    return Res.serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const body = await parseBody<unknown>(req);
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) return Res.error(parsed.error.issues[0].message, 422);

    const { name, slug, description, logo } = parsed.data;

    // Slug must be unique
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) return Res.error("Workspace URL already taken", 409);

    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          name,
          slug,
          description,
          logo,
          ownerId: user.id,
          settings: { create: {} },
        },
      });

      await tx.workspaceMember.create({
        data: { workspaceId: ws.id, userId: user.id, role: "ADMIN" },
      });

      return ws;
    });

    return Res.created(workspace);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
