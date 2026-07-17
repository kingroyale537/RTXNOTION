// app/api/pages/[pageId]/versions/[versionId]/route.ts
// GET /api/pages/:pageId/versions/:versionId - Get full historical version content

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, requirePageAccess, ApiError } from "@/lib/api-helpers";

type Ctx = { params: { pageId: string; versionId: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Check page access level
    await requirePageAccess(params.pageId, user.id, "VIEWER");

    const version = await prisma.pageVersion.findUnique({
      where: { id: params.versionId },
    });

    if (!version || version.pageId !== params.pageId) {
      return Res.error("Version not found or does not belong to this page.", 404);
    }

    // Retrieve user profile of the author who created this snapshot
    const author = await prisma.user.findUnique({
      where: { id: version.authorId },
      select: { id: true, name: true, email: true, image: true },
    });

    return Res.ok({
      data: {
        ...version,
        author,
      },
    });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
