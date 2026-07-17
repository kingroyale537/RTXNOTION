// app/api/pages/[pageId]/versions/[versionId]/restore/route.ts
// POST /api/pages/:pageId/versions/:versionId/restore - Revert page to historical version snapshot

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, requirePageAccess, ApiError } from "@/lib/api-helpers";

type Ctx = { params: { pageId: string; versionId: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Require EDITOR level access to modify/restore content
    await requirePageAccess(params.pageId, user.id, "EDITOR");

    const targetVersion = await prisma.pageVersion.findUnique({
      where: { id: params.versionId },
    });

    if (!targetVersion || targetVersion.pageId !== params.pageId) {
      return Res.error("Version not found or does not belong to this page.", 404);
    }

    const currentPage = await prisma.page.findUnique({
      where: { id: params.pageId },
    });

    if (!currentPage) {
      return Res.error("Active page not found.", 404);
    }

    // 1. Create a snapshot of the current state before we overwrite it (so they can undo)
    await prisma.pageVersion.create({
      data: {
        pageId: params.pageId,
        title: currentPage.title,
        content: currentPage.content || { type: "doc", content: [] },
        authorId: user.id,
      },
    });

    // Extract plain text content from the restored TipTap/ProseMirror json if possible,
    // or use target version's cached text content.
    // ProseMirror documents usually parse nodes recursively. We'll extract raw text if we can,
    // otherwise fallback to a generic placeholder.
    let contentText = "";
    try {
      const doc = targetVersion.content as any;
      const extractText = (node: any): string => {
        if (!node) return "";
        if (node.text) return node.text;
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join(" ");
        }
        return "";
      };
      contentText = extractText(doc).trim();
    } catch {
      contentText = "";
    }

    // 2. Overwrite active page content in the database
    const restoredPage = await prisma.page.update({
      where: { id: params.pageId },
      data: {
        title: targetVersion.title,
        content: targetVersion.content || { type: "doc", content: [] },
        contentText: contentText || null,
        updatedAt: new Date(),
        lastEditedById: user.id,
      },
    });

    // 3. Log activity
    await prisma.activity.create({
      data: {
        type: "PAGE_UPDATED",
        workspaceId: restoredPage.workspaceId,
        userId: user.id,
        pageId: restoredPage.id,
        metadata: { pageTitle: restoredPage.title, detail: `Restored to version from ${targetVersion.createdAt.toISOString()}` },
      },
    });

    return Res.ok({ data: restoredPage });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
