// app/api/workspaces/[workspaceId]/pages/route.ts
// GET  /api/workspaces/:id/pages  – full nested page tree for the sidebar
// POST /api/workspaces/:id/pages  – create a new page (optionally nested)

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  Res,
  getAuthUser,
  requireWorkspaceMember,
  parseBody,
  ApiError,
} from "@/lib/api-helpers";
import { createPageSchema } from "@/lib/validators";
import type { PageTree } from "@/types";

type Ctx = { params: { workspaceId: string } };

// ─── Build recursive tree from flat list ──────────────────────────────────────
function buildPageTree(pages: PageTree[], parentId: string | null = null): PageTree[] {
  return pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => ({
      ...p,
      children: buildPageTree(pages, p.id),
    }));
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requireWorkspaceMember(params.workspaceId, user.id, "VIEWER");

    // Fetch all non-archived pages as a flat list then build the tree in memory.
    // For very large workspaces, switch to a recursive CTE in raw SQL.
    const pages = await prisma.page.findMany({
      where: {
        workspaceId: params.workspaceId,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        iconType: true,
        iconValue: true,
        parentId: true,
        sortOrder: true,
        isArchived: true,
        workspaceId: true,
        properties: true,
        _count: { select: { children: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    const tree = buildPageTree(pages as PageTree[]);
    return Res.ok(tree);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    await requireWorkspaceMember(params.workspaceId, user.id, "EDITOR");

    const body = await parseBody<unknown>(req);
    const parsed = createPageSchema.safeParse({
      ...(body as Record<string, any>),
      workspaceId: params.workspaceId,
    });
    if (!parsed.success) return Res.error(parsed.error.issues[0].message, 422);

    const { title, parentId, emoji } = parsed.data;

    // Calculate sort order: place at the end of siblings
    const lastSibling = await prisma.page.findFirst({
      where: { workspaceId: params.workspaceId, parentId: parentId ?? null },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (lastSibling?.sortOrder ?? 0) + 1;

    const page = await prisma.page.create({
      data: {
        title: title ?? "Untitled",
        iconValue: emoji ?? null,
        iconType: emoji ? "EMOJI" : "EMOJI",
        workspaceId: params.workspaceId,
        parentId: parentId ?? null,
        createdById: user.id,
        lastEditedById: user.id,
        sortOrder,
        content: {
          type: "doc",
          content: [{ type: "paragraph" }],
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "PAGE_CREATED",
        workspaceId: params.workspaceId,
        userId: user.id,
        pageId: page.id,
        metadata: { pageTitle: page.title },
      },
    });

    return Res.created(page);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
