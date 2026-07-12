// app/api/pages/[pageId]/versions/route.ts
// GET /api/pages/:id/versions  – list version history for a page

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, requirePageAccess, ApiError } from "@/lib/api-helpers";
import { getPaginationParams } from "@/lib/api-helpers";

type Ctx = { params: { pageId: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requirePageAccess(params.pageId, user.id, "VIEWER");

    const { skip, take, page, pageSize } = getPaginationParams(new URL(req.url));

    const [versions, total] = await Promise.all([
      prisma.pageVersion.findMany({
        where: { pageId: params.pageId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        // Don't return full content in the list (expensive) – only on demand
        select: {
          id: true,
          pageId: true,
          title: true,
          authorId: true,
          createdAt: true,
        },
      }),
      prisma.pageVersion.count({ where: { pageId: params.pageId } }),
    ]);

    return Res.ok({
      data: versions,
      total,
      page,
      pageSize,
      hasNextPage: skip + take < total,
    });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
