// app/api/pages/[pageId]/route.ts
// GET    /api/pages/:id  – full page with content, author, comments count
// PATCH  /api/pages/:id  – update content / title / emoji / metadata
// DELETE /api/pages/:id  – archive or permanently delete

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  Res,
  getAuthUser,
  requirePageAccess,
  parseBody,
  ApiError,
} from "@/lib/api-helpers";
import { updatePageSchema } from "@/lib/validators";

type Ctx = { params: { pageId: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requirePageAccess(params.pageId, user.id, "VIEWER");

    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true, color: true },
        },
        lastEditedBy: {
          select: { id: true, name: true, email: true, image: true, color: true },
        },
        _count: { select: { children: true, comments: true } },
        presence: {
          include: {
            user: {
              select: { id: true, name: true, image: true, color: true },
            },
          },
        },
      },
    });

    if (!page) return Res.notFound("Page");
    return Res.ok(page);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requirePageAccess(params.pageId, user.id, "EDITOR");

    const body = await parseBody<unknown>(req);
    const parsed = updatePageSchema.safeParse(body);
    if (!parsed.success) return Res.error(parsed.error.issues[0].message, 422);

    const {
      title,
      content,
      emoji,
      iconType,
      iconValue,
      coverImage,
      isPublished,
      isFavorite,
      isArchived,
      sortOrder,
      parentId,
      properties,
    } = parsed.data;

    // Snapshot the current content as a version before updating
    if (content !== undefined) {
      const current = await prisma.page.findUnique({
        where: { id: params.pageId },
        select: { content: true, title: true },
      });
      if (current?.content) {
        await prisma.pageVersion.create({
          data: {
            pageId: params.pageId,
            content: current.content as object,
            title: current.title,
            authorId: user.id,
          },
        });
      }
    }

    let extractedText = "";
    if (content && typeof content === "object" && "content" in content && Array.isArray((content as any).content)) {
      const extractNodes = (nodes: any[]): string => {
        return nodes
          .map((node) => {
            if (node.text) return node.text;
            if (node.content && Array.isArray(node.content)) return extractNodes(node.content);
            return "";
          })
          .filter(Boolean)
          .join(" ");
      };
      extractedText = extractNodes((content as any).content);
    }

    const page = await prisma.page.update({
      where: { id: params.pageId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content, contentText: extractedText || undefined }),
        ...(emoji !== undefined && { emoji }),
        ...(iconType !== undefined && { iconType }),
        ...(iconValue !== undefined && { iconValue }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFavorite !== undefined && { isFavorite }),
        ...(isArchived !== undefined && { isArchived }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(parentId !== undefined && { parentId }),
        ...(properties !== undefined && { properties }),
        lastEditedById: user.id,
      },
    });

    // Log update activity (only for significant changes)
    if (isArchived === true) {
      await prisma.activity.create({
        data: {
          type: "PAGE_DELETED",
          workspaceId: page.workspaceId,
          userId: user.id,
          pageId: page.id,
          metadata: { pageTitle: page.title },
        },
      });
    } else if (parentId !== undefined) {
      await prisma.activity.create({
        data: {
          type: "PAGE_MOVED",
          workspaceId: page.workspaceId,
          userId: user.id,
          pageId: page.id,
          metadata: { pageTitle: page.title },
        },
      });
    } else if (title !== undefined || content !== undefined) {
      await prisma.activity.create({
        data: {
          type: "PAGE_UPDATED",
          workspaceId: page.workspaceId,
          userId: user.id,
          pageId: page.id,
          metadata: { pageTitle: page.title },
        },
      });
    }

    return Res.ok(page);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requirePageAccess(params.pageId, user.id, "EDITOR");

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Hard delete – cascades to children, comments, etc. via Prisma relations
      await prisma.page.delete({ where: { id: params.pageId } });
    } else {
      // Soft delete: archive the page
      await prisma.page.update({
        where: { id: params.pageId },
        data: { isArchived: true },
      });
    }

    return Res.noContent();
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
