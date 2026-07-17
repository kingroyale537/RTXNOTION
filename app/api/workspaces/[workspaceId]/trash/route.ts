// app/api/workspaces/[workspaceId]/trash/route.ts
// GET /api/workspaces/:workspaceId/trash - Get all archived pages in a workspace

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, requireWorkspaceMember, ApiError } from "@/lib/api-helpers";

type Ctx = { params: { workspaceId: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Require VIEW access to see archived pages in the trash
    await requireWorkspaceMember(params.workspaceId, user.id, "VIEWER");

    const archivedPages = await prisma.page.findMany({
      where: {
        workspaceId: params.workspaceId,
        isArchived: true,
      },
      select: {
        id: true,
        title: true,
        iconValue: true,
        iconType: true,
        parentId: true,
        updatedAt: true,
        isArchived: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return Res.ok({ data: archivedPages });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
