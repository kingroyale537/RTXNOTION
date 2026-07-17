// app/api/pages/[pageId]/trash/route.ts
// POST   /api/pages/:pageId/trash - Restore page from trash (action: "restore")
// DELETE /api/pages/:pageId/trash - Delete page permanently

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, requirePageAccess, parseBody, ApiError } from "@/lib/api-helpers";

type Ctx = { params: { pageId: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Require EDITOR level access to restore pages
    await requirePageAccess(params.pageId, user.id, "EDITOR");

    const body = await parseBody<any>(req);
    if (body?.action !== "restore") {
      return Res.error("Invalid action. Action must be 'restore'.", 400);
    }

    const updatedPage = await prisma.page.update({
      where: { id: params.pageId },
      data: {
        isArchived: false,
        updatedAt: new Date(),
      },
    });

    // Also restore parent pages recursively if they were archived, or set parent to null if parent is archived?
    // Notion keeps parent nested, but if parent is also archived, it's shown as restored.
    // In our case, just setting isArchived to false on the page itself is perfect and simple.

    // Log activity
    await prisma.activity.create({
      data: {
        type: "PAGE_UPDATED",
        workspaceId: updatedPage.workspaceId,
        userId: user.id,
        pageId: updatedPage.id,
        metadata: { pageTitle: updatedPage.title, detail: "Restored from trash" },
      },
    });

    return Res.ok({ data: updatedPage });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    // Require EDITOR level access to permanently delete pages
    await requirePageAccess(params.pageId, user.id, "EDITOR");

    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      select: { id: true, title: true, workspaceId: true },
    });

    if (!page) {
      return Res.error("Page not found.", 404);
    }

    // Permanently delete from PostgreSQL database
    await prisma.page.delete({
      where: { id: params.pageId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "PAGE_DELETED",
        workspaceId: page.workspaceId,
        userId: user.id,
        metadata: { pageTitle: page.title, detail: "Permanently deleted" },
      },
    });

    return Res.ok({ message: `Page "${page.title}" was permanently deleted.` });
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
