// app/api/workspaces/route.ts
// GET  /api/workspaces  – list all workspaces for the current user
// POST /api/workspaces  – create a new workspace

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Res, getAuthUser, parseBody, ApiError } from "@/lib/api-helpers";
import { createWorkspaceSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            _count: { select: { pages: true, members: true } },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      myRole: m.role,
    }));

    return Res.ok(workspaces);
  } catch (err) {
    return Res.serverError(err);
  }
}

function getDefaultPagesForUsage(usageType: "work" | "personal" | "school" | undefined, userId: string) {
  if (usageType === "work") {
    return [
      {
        title: "Project Tracker",
        iconValue: "📋",
        iconType: "EMOJI" as const,
        sortOrder: 1,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Project Tracker 📋" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Use this page to track your team's active tasks and milestones. Customize columns and drag rows to organize." }],
            },
            {
              type: "taskList",
              content: [
                { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Define product requirements document (PRD)" }] }] },
                { type: "taskItem", attrs: { checked: true }, content: [{ type: "paragraph", content: [{ type: "text", text: "Set up collaborative database" }] }] },
                { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Launch MVP deployment" }] }] },
              ],
            },
          ],
        },
      },
      {
        title: "Meeting Notes",
        iconValue: "🗓️",
        iconType: "EMOJI" as const,
        sortOrder: 2,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Meeting Notes 🗓️" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Keep alignment high by logging meeting notes and action items here." }],
            },
          ],
        },
      },
      {
        title: "Company Goals",
        iconValue: "🎯",
        iconType: "EMOJI" as const,
        sortOrder: 3,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Company Goals 🎯" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Define OKRs and track critical performance metrics." }],
            },
          ],
        },
      },
    ];
  }

  if (usageType === "personal") {
    return [
      {
        title: "Personal Journal",
        iconValue: "📓",
        iconType: "EMOJI" as const,
        sortOrder: 1,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Personal Journal 📓" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Write down your daily thoughts, reflections, and key moments." }],
            },
          ],
        },
      },
      {
        title: "Reading List",
        iconValue: "📚",
        iconType: "EMOJI" as const,
        sortOrder: 2,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Reading List 📚" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "A curated list of books you want to read, currently reading, or completed." }],
            },
          ],
        },
      },
      {
        title: "To-Do List",
        iconValue: "✅",
        iconType: "EMOJI" as const,
        sortOrder: 3,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "To-Do List ✅" }],
            },
            {
              type: "taskList",
              content: [
                { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Buy groceries" }] }] },
                { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Gym workout" }] }] },
              ],
            },
          ],
        },
      },
    ];
  }

  if (usageType === "school") {
    return [
      {
        title: "Class Notes",
        iconValue: "✍️",
        iconType: "EMOJI" as const,
        sortOrder: 1,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Class Notes ✍️" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Review lectures, homework, and test preparation." }],
            },
          ],
        },
      },
      {
        title: "Research Hub",
        iconValue: "🔬",
        iconType: "EMOJI" as const,
        sortOrder: 2,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Research Hub 🔬" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Store sources, citations, drafts, and experiments." }],
            },
          ],
        },
      },
      {
        title: "Assignment Calendar",
        iconValue: "📅",
        iconType: "EMOJI" as const,
        sortOrder: 3,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Assignment Calendar 📅" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Never miss a deadline. Add lists of tasks with clear due dates." }],
            },
          ],
        },
      },
    ];
  }

  // Default Getting Started page
  return [
    {
      title: "Getting Started",
      iconValue: "🚀",
      iconType: "EMOJI" as const,
      sortOrder: 1,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to your workspace! 🚀" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Start here – use / to insert blocks." }],
          },
        ],
      },
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const body = await parseBody<unknown>(req);
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) return Res.error(parsed.error.issues[0].message, 422);

    const { name, slug, description, logo, usageType } = parsed.data;

    // Slug must be unique
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) return Res.error("Workspace URL already taken", 409);

    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          name,
          slug,
          description,
          logo,
          ownerId: user.id,
          settings: { create: {} },
        },
      });

      await tx.workspaceMember.create({
        data: { workspaceId: ws.id, userId: user.id, role: "ADMIN" },
      });

      // Seed pages based on user's onboarding category choice
      const defaultPages = getDefaultPagesForUsage(usageType, user.id);
      for (const pageData of defaultPages) {
        await tx.page.create({
          data: {
            ...pageData,
            workspaceId: ws.id,
            createdById: user.id,
          },
        });
      }

      return ws;
    });

    return Res.created(workspace);
  } catch (err) {
    if (err instanceof ApiError) return Res.error(err.message, err.status);
    return Res.serverError(err);
  }
}
