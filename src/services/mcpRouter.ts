// src/services/mcpRouter.ts
// Unified Model Context Protocol (MCP) Tool Router for Background Agents.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface McpContext {
  workspaceId: string;
  userId: string;
}

export class McpRouter {
  private ctx: McpContext;

  constructor(ctx: McpContext) {
    this.ctx = ctx;
  }

  /**
   * Safely loads plain-text page specs verifying workspace isolation scope boundary.
   */
  async readWorkspacePage(pageId: string) {
    console.log(`[MCP] readWorkspacePage triggered for page ${pageId} in workspace ${this.ctx.workspaceId}`);
    
    let page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        title: true,
        contentText: true,
        workspaceId: true,
        isArchived: true,
      },
    });

    if (!page) {
      // Fallback: search by title (case-insensitive) in this workspace
      const cleanTitle = pageId.replace(/\b(page|document|doc|sheet)\b/gi, "").trim();
      const pageByTitle = await prisma.page.findFirst({
        where: {
          workspaceId: this.ctx.workspaceId,
          OR: [
            { title: { equals: pageId, mode: "insensitive" } },
            { title: { equals: cleanTitle, mode: "insensitive" } },
            { title: { contains: cleanTitle, mode: "insensitive" } },
          ],
          isArchived: false,
        },
        select: {
          id: true,
          title: true,
          contentText: true,
          workspaceId: true,
          isArchived: true,
        },
      });
      if (pageByTitle) {
        page = pageByTitle;
      }
    }

    if (!page) {
      throw new Error(`Page with ID or Title "${pageId}" not found.`);
    }

    if (page.workspaceId !== this.ctx.workspaceId) {
      throw new Error("Access Denied: Page does not belong to the active workspace.");
    }

    if (page.isArchived) {
      return `Page "${page.title}" (ID: ${page.id}) is archived. Content: (Archived)`;
    }

    return `Page Title: ${page.title}\nID: ${page.id}\nContent:\n${page.contentText || "(Empty)"}`;
  }

  /**
   * Safely writes text content to a page, converting it into a valid TipTap JSON schema.
   */
  async writeToPage(pageId: string, text: string) {
    console.log(`[MCP] writeToPage triggered for page ${pageId} in workspace ${this.ctx.workspaceId}`);

    let page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!page) {
      // Fallback: search by title (case-insensitive) in this workspace
      const cleanTitle = pageId.replace(/\b(page|document|doc|sheet)\b/gi, "").trim();
      const pageByTitle = await prisma.page.findFirst({
        where: {
          workspaceId: this.ctx.workspaceId,
          OR: [
            { title: { equals: pageId, mode: "insensitive" } },
            { title: { equals: cleanTitle, mode: "insensitive" } },
            { title: { contains: cleanTitle, mode: "insensitive" } },
          ],
          isArchived: false,
        },
        select: {
          id: true,
          workspaceId: true,
        },
      });
      if (pageByTitle) {
        page = pageByTitle;
      }
    }

    if (!page) {
      throw new Error(`Page with ID or Title "${pageId}" not found.`);
    }

    if (page.workspaceId !== this.ctx.workspaceId) {
      throw new Error("Access Denied: Page does not belong to the active workspace.");
    }

    // Convert plain text into a valid TipTap JSON document
    const paragraphs = text.split("\n").map((line) => {
      return {
        type: "paragraph",
        content: line ? [{ type: "text", text: line }] : [],
      };
    });

    const tipTapJson = {
      type: "doc",
      content: paragraphs,
    };

    const updatedPage = await prisma.page.update({
      where: { id: page.id },
      data: {
        contentText: text,
        content: tipTapJson,
        updatedAt: new Date(),
      },
    });

    return `Successfully updated page "${updatedPage.title}" (ID: ${updatedPage.id}).`;
  }

  /**
   * Searches page titles and text contents within the isolated workspace boundary.
   */
  async searchWorkspaceMetadata(query: string) {
    console.log(`[MCP] searchWorkspaceMetadata triggered for query "${query}" in workspace ${this.ctx.workspaceId}`);

    const pages = await prisma.page.findMany({
      where: {
        workspaceId: this.ctx.workspaceId,
        isArchived: false,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { contentText: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        updatedAt: true,
      },
      take: 10,
    });

    if (pages.length === 0) {
      return `No pages found matching query: "${query}"`;
    }

    return pages
      .map((p) => `- [${p.emoji || "📄"}] ${p.title} (ID: ${p.id}, Last Updated: ${p.updatedAt.toISOString()})`)
      .join("\n");
  }
}
