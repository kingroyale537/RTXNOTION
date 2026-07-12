// app/api/workspaces/[workspaceId]/members/route.ts
// GET    /api/workspaces/:id/members        – list members with roles
// DELETE /api/workspaces/:id/members?userId – remove a member (ADMIN only)
// PATCH  /api/workspaces/:id/members?userId – change a member's role (ADMIN)

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  Res,
  getAuthUser,
  requireWorkspaceMember,
  parseBody,
  ApiError,
} from "@/lib/api-helpers";
import { updateMemberRoleSchema } from "@/lib/validators";

type Ctx = { params: { workspaceId: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requireWorkspaceMember(params.workspaceId, user.id, "VIEWER");

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: params.workspaceId },
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
    });

    return Res.ok(members);
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

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");
    if (!targetUserId) return Res.error("userId query param required", 400);

    const body = await parseBody<unknown>(req);
    const parsed = updateMemberRoleSchema.safeParse(body);
    if (!parsed.success) return Res.error(parsed.error.issues[0].message, 422);

    // Prevent the workspace owner from being demoted
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { ownerId: true },
    });
    if (workspace?.ownerId === targetUserId && parsed.data.role !== "ADMIN") {
      return Res.error("Cannot demote the workspace owner", 400);
    }

    const member = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: targetUserId,
        },
      },
      data: { role: parsed.data.role },
    });

    await prisma.activity.create({
      data: {
        type: "MEMBER_ROLE_CHANGED",
        workspaceId: params.workspaceId,
        userId: user.id,
        metadata: { targetUserId, newRole: parsed.data.role },
      },
    });

    return Res.ok(member);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") ?? user.id;

    // Users can remove themselves; admins can remove others
    if (targetUserId !== user.id) {
      await requireWorkspaceMember(params.workspaceId, user.id, "ADMIN");
    } else {
      await requireWorkspaceMember(params.workspaceId, user.id, "VIEWER");
    }

    // Prevent owner from leaving their own workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { ownerId: true },
    });
    if (workspace?.ownerId === targetUserId) {
      return Res.error("Owner cannot leave. Transfer ownership first.", 400);
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: targetUserId,
        },
      },
    });

    return Res.noContent();
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
