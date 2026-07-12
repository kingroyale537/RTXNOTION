// app/api/workspaces/[workspaceId]/invites/route.ts
// GET  /api/workspaces/:id/invites  – list active invite links
// POST /api/workspaces/:id/invites  – generate a new invite link (ADMIN/EDITOR)

import { NextRequest } from "next/server";
import { addDays } from "date-fns";
import prisma from "@/lib/prisma";
import {
  Res,
  getAuthUser,
  requireWorkspaceMember,
  parseBody,
  ApiError,
} from "@/lib/api-helpers";
import { createInviteSchema } from "@/lib/validators";

type Ctx = { params: { workspaceId: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requireWorkspaceMember(params.workspaceId, user.id, "EDITOR");

    const invites = await prisma.invite.findMany({
      where: {
        workspaceId: params.workspaceId,
        status: { in: ["PENDING"] },
        expiresAt: { gt: new Date() },
      },
      include: {
        invitedBy: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Res.ok(invites);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Check workspace settings: who can create invites?
    const settings = await prisma.workspaceSettings.findUnique({
      where: { workspaceId: params.workspaceId },
    });
    const minRole = settings?.allowMemberInvites ? "EDITOR" : "ADMIN";
    await requireWorkspaceMember(params.workspaceId, user.id, minRole);

    const body = await parseBody<unknown>(req);
    const parsed = createInviteSchema.safeParse(body);
    if (!parsed.success) return Res.error(parsed.error.issues[0].message, 422);

    const { email, role, expiresInDays, maxUses } = parsed.data;

    const invite = await prisma.invite.create({
      data: {
        workspaceId: params.workspaceId,
        email: email ?? null,
        role,
        status: "PENDING",
        expiresAt: addDays(new Date(), expiresInDays),
        maxUses: maxUses ?? null,
        invitedById: user.id,
      },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;

    return Res.created({ ...invite, inviteUrl });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
