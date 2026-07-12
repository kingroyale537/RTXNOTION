// app/api/workspaces/[workspaceId]/route.ts
// GET    /api/workspaces/:id  – fetch workspace detail + members
// PATCH  /api/workspaces/:id  – update name / logo / description (ADMIN only)
// DELETE /api/workspaces/:id  – delete workspace (owner only)

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  Res,
  getAuthUser,
  requireWorkspaceMember,
  parseBody,
  ApiError,
} from "@/lib/api-helpers";

type Ctx = { params: { workspaceId: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requireWorkspaceMember(params.workspaceId, user.id, "VIEWER");

    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      include: {
        settings: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                color: true,
                createdAt: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: { select: { pages: true, members: true } },
      },
    });

    if (!workspace) return Res.notFound("Workspace");
    return Res.ok(workspace);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requireWorkspaceMember(params.workspaceId, user.id, "ADMIN");

    const body = await parseBody<{
      name?: string;
      description?: string;
      logo?: string;
      domain?: string;
    }>(req);

    const workspace = await prisma.workspace.update({
      where: { id: params.workspaceId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.logo !== undefined && { logo: body.logo }),
        ...(body.domain !== undefined && { domain: body.domain }),
      },
    });

    return Res.ok(workspace);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { ownerId: true },
    });
    if (!workspace) return Res.notFound("Workspace");
    if (workspace.ownerId !== user.id) return Res.forbidden();

    await prisma.workspace.delete({ where: { id: params.workspaceId } });
    return Res.noContent();
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
