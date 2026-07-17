// app/api/pages/[pageId]/permissions/route.ts
// GET  /api/pages/:pageId/permissions - List page permissions and workspace members
// POST /api/pages/:pageId/permissions - Upsert/Delete custom permission override for a user

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, requirePageAccess, parseBody, ApiError } from "@/lib/api-helpers";
import { Role } from "@prisma/client";

type Ctx = { params: { pageId: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Check page access level
    await requirePageAccess(params.pageId, user.id, "VIEWER");

    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      select: { workspaceId: true },
    });

    if (!page) return Res.error("Page not found", 404);

    // 1. Fetch all page permissions
    const permissions = await prisma.pagePermission.findMany({
      where: { pageId: params.pageId },
    });

    // 2. Fetch all workspace members
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: page.workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return Res.ok({
      data: {
        permissions,
        members,
      },
    });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Require ADMIN level access on the page to change permissions
    await requirePageAccess(params.pageId, user.id, "ADMIN");

    const body = await parseBody<{ userId: string; role: Role | null }>(req);
    if (!body?.userId) return Res.error("userId is required", 400);

    const { userId, role } = body;

    if (role === null) {
      // Delete permission override
      await prisma.pagePermission.deleteMany({
        where: {
          pageId: params.pageId,
          userId,
        },
      });
      return Res.ok({ message: "Override permission removed." });
    } else {
      // Upsert override
      const perm = await prisma.pagePermission.upsert({
        where: {
          pageId_userId: {
            pageId: params.pageId,
            userId,
          },
        },
        update: { role },
        create: {
          pageId: params.pageId,
          userId,
          role,
        },
      });
      return Res.ok({ data: perm });
    }
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
