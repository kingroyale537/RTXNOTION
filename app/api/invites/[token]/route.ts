// app/api/invites/[token]/route.ts
// GET  /api/invites/:token  – preview an invite (show workspace name without auth)
// POST /api/invites/:token  – accept the invite (requires auth)

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, ApiError } from "@/lib/api-helpers";

type Ctx = { params: { token: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
      include: {
        workspace: { select: { id: true, name: true, logo: true, slug: true } },
        invitedBy: { select: { name: true, image: true } },
      },
    });

    if (!invite) return Res.notFound("Invite");
    if (invite.status !== "PENDING") return Res.error("This invite has expired or been revoked", 410);
    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
      return Res.error("This invite has expired", 410);
    }
    if (invite.maxUses !== null && invite.useCount >= invite.maxUses) {
      return Res.error("This invite has reached its maximum uses", 410);
    }

    return Res.ok({
      workspace: invite.workspace,
      invitedBy: invite.invitedBy,
      role: invite.role,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    return Res.serverError(err);
  }
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
    });

    if (!invite) return Res.notFound("Invite");
    if (invite.status !== "PENDING") return Res.error("Invite already used or revoked", 410);
    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
      return Res.error("This invite has expired", 410);
    }
    if (invite.maxUses !== null && invite.useCount >= invite.maxUses) {
      return Res.error("This invite has reached its maximum uses", 410);
    }
    if (invite.email && invite.email !== user.email) {
      return Res.error("This invite is for a different email address", 403);
    }

    // Idempotent: if already a member just return the workspace
    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } },
    });

    if (!existing) {
      await prisma.$transaction([
        // Add member
        prisma.workspaceMember.create({
          data: {
            workspaceId: invite.workspaceId,
            userId: user.id,
            role: invite.role,
          },
        }),
        // Update invite use count (mark ACCEPTED if single-use or no more uses)
        prisma.invite.update({
          where: { id: invite.id },
          data: {
            useCount: { increment: 1 },
            invitedUserId: user.id,
            status:
              invite.maxUses !== null && invite.useCount + 1 >= invite.maxUses
                ? "ACCEPTED"
                : "PENDING",
          },
        }),
        // Activity log
        prisma.activity.create({
          data: {
            type: "MEMBER_JOINED",
            workspaceId: invite.workspaceId,
            userId: user.id,
            metadata: { inviteToken: invite.token },
          },
        }),
      ]);
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: invite.workspaceId },
      select: { id: true, name: true, slug: true },
    });

    return Res.ok({ workspace, message: "Successfully joined the workspace" });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
