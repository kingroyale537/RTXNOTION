// app/api/clipper/route.ts
// Public & Workspace Web Clipper REST API endpoint.
// Allows browser extensions, bookmarklets, and custom scripts to save web pages, recipes, and articles directly into Voltaic databases.

import { NextRequest } from "next/server";
import { Res, getAuthUser, requireWorkspaceMember } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const body = await req.json();
    const { url, title, content, workspaceId, parentId } = body;

    if (!url || typeof url !== "string") {
      return Res.error("URL is required for clipping.", 400);
    }

    if (!workspaceId) {
      return Res.error("Workspace ID is required.", 400);
    }

    await requireWorkspaceMember(workspaceId, user.id);

    const clippedTitle = title?.trim() || `Clipped: ${url.replace(/^https?:\/\//, "")}`;
    const formattedContent = content
      ? `# [${clippedTitle}](${url})\n\nClipped URL: ${url}\nSaved on: ${new Date().toLocaleDateString()}\n\n---\n\n${content}`
      : `# [${clippedTitle}](${url})\n\nClipped URL: ${url}\nSaved on: ${new Date().toLocaleDateString()}`;

    const newPage = await prisma.page.create({
      data: {
        title: clippedTitle,
        emoji: "🌐",
        iconType: "EMOJI",
        iconValue: "🌐",
        workspaceId,
        parentId: parentId || null,
        createdById: user.id,
        contentText: formattedContent,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: formattedContent,
                },
              ],
            },
          ],
        },
      },
    });

    return Res.ok({
      id: newPage.id,
      title: newPage.title,
      url,
      workspaceId,
      message: "Web page clipped successfully to workspace database!",
    });
  } catch (error: any) {
    console.error("[Web Clipper API Error]", error);
    return Res.error(error.message || "Failed to clip web page.", 500);
  }
}
