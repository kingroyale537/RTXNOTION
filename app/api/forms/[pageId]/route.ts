// app/api/forms/[pageId]/route.ts
// Public Form Submission API endpoint.
// Allows external or workspace visitors to submit responses into database properties.

import { NextRequest } from "next/server";
import { Res } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const { pageId } = params;
    const body = await req.json();
    const { title, status, priority, date, assignee, responseText } = body;

    const parentPage = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true, workspaceId: true, createdById: true },
    });

    if (!parentPage) {
      return Res.error("Target form database not found.", 404);
    }

    const newRow = await prisma.page.create({
      data: {
        title: title?.trim() || "Form Response",
        emoji: "📝",
        iconType: "EMOJI",
        iconValue: "📝",
        workspaceId: parentPage.workspaceId,
        parentId: parentPage.id,
        createdById: parentPage.createdById,
        contentText: responseText || `Submitted on ${new Date().toLocaleString()}`,
        properties: {
          status: status || "To Do",
          priority: priority || "Medium",
          date: date || new Date().toISOString().split("T")[0],
          assignee: assignee || "Form Submission",
        },
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: responseText || "Submitted via Public Voltaic Form",
                },
              ],
            },
          ],
        },
      },
    });

    return Res.ok({
      id: newRow.id,
      title: newRow.title,
      message: "Form response submitted successfully to database!",
    });
  } catch (error: any) {
    console.error("[Form Submit API Error]", error);
    return Res.error(error.message || "Failed to submit form response.", 500);
  }
}
