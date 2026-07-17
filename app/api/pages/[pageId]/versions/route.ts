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

    // Query and map author profiles in-memory
    const authorIds = Array.from(new Set(versions.map((v) => v.authorId)));
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true, email: true, image: true },
    });
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    const versionsWithAuthors = versions.map((v) => ({
      ...v,
      author: authorMap.get(v.authorId) || null,
    }));

    return Res.ok({
      data: versionsWithAuthors,
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
