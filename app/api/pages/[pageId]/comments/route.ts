// app/api/pages/[pageId]/comments/route.ts
// GET  /api/pages/:id/comments  – list all top-level comments with replies
// POST /api/pages/:id/comments  – post a new comment

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  Res,
  getAuthUser,
  requirePageAccess,
  parseBody,
  ApiError,
} from "@/lib/api-helpers";
import { createCommentSchema } from "@/lib/validators";

type Ctx = { params: { pageId: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requirePageAccess(params.pageId, user.id, "VIEWER");

    const comments = await prisma.comment.findMany({
      where: { pageId: params.pageId, parentId: null },
      include: {
        author: {
          select: { id: true, name: true, image: true, color: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, image: true, color: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Res.ok(comments);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requirePageAccess(params.pageId, user.id, "VIEWER");

    const body = await parseBody<unknown>(req);
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) return Res.error(parsed.error.issues[0].message, 422);

    const { content, blockId, parentId } = parsed.data;

    const comment = await prisma.comment.create({
      data: {
        content,
        blockId,
        parentId,
        pageId: params.pageId,
        authorId: user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, color: true },
        },
      },
    });

    // Create notifications for other workspace members
    await prisma.activity.create({
      data: {
        type: "COMMENT_ADDED",
        workspaceId: (await prisma.page.findUnique({
          where: { id: params.pageId },
          select: { workspaceId: true },
        }))!.workspaceId,
        userId: user.id,
        pageId: params.pageId,
        metadata: { commentPreview: content.slice(0, 100) },
      },
    });

    return Res.created(comment);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
