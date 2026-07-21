// app/api/ai/search/route.ts
// Universal Search & Connected Knowledge endpoint supporting Research Mode, external connectors, and document Q&A.

import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { PrismaClient } from "@prisma/client";
import { Res, getAuthUser, requireWorkspaceMember } from "@/lib/api-helpers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return Res.error("GEMINI_API_KEY is not configured.", 400);
    }

    const body = await req.json();
    const { query, workspaceId, researchMode = false, includeConnectors = true, attachmentText } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return Res.error("Search query is required.", 400);
    }

    if (workspaceId) {
      await requireWorkspaceMember(workspaceId, user.id);
    }

    // 1. Query Workspace Pages, Comments, and Page Versions
    const pages = await prisma.page.findMany({
      where: {
        workspaceId: workspaceId || undefined,
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
        contentText: true,
        updatedAt: true,
      },
      take: 10,
    });

    const comments = await prisma.comment.findMany({
      where: {
        content: { contains: query, mode: "insensitive" },
        page: { workspaceId: workspaceId || undefined },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { name: true } },
        page: { select: { id: true, title: true } },
      },
      take: 5,
    });

    // 2. Simulated Smart App Connectors (Slack, Google Drive, GitHub, Jira, Salesforce)
    const connectorResults = includeConnectors ? [
      {
        source: "Slack",
        title: `#general discussion matching "${query}"`,
        snippet: `Team mentioned: "${query}" in project sync thread.`,
        url: "https://slack.com",
      },
      {
        source: "Google Drive",
        title: `Doc: Q3 Roadmap - ${query}`,
        snippet: `Internal document covering strategy for ${query}.`,
        url: "https://drive.google.com",
      },
      {
        source: "GitHub",
        title: `Issue #142: Fix ${query} handling`,
        snippet: `Closed pull request updating ${query} algorithm.`,
        url: "https://github.com",
      },
      {
        source: "Jira",
        title: `Task VOL-89: ${query} integration`,
        snippet: `In Progress item assigned to Lead Developer.`,
        url: "https://atlassian.net",
      },
    ] : [];

    // 3. Construct Context for AI Synthesis
    const docContext = pages
      .map((p) => `[Page: "${p.title}" (ID: ${p.id})] ${p.contentText || "(Empty)"}`)
      .join("\n\n");

    const commentContext = comments
      .map((c) => `[Comment on "${c.page.title}" by ${c.author?.name || "User"}]: ${c.content}`)
      .join("\n");

    const connectorContext = connectorResults
      .map((c) => `[External ${c.source}: ${c.title}] ${c.snippet}`)
      .join("\n");

    const attachmentContext = attachmentText ? `\n[Uploaded Attachment Content]\n${attachmentText}` : "";

    const googleProvider = createGoogleGenerativeAI({ apiKey });

    const systemPrompt = `You are Notion AI's Universal Search & Knowledge Assistant.
Your job is to synthesize answers to user queries across their workspace documents, comments, connected apps, and optional research sources.

Research Mode: ${researchMode ? "ENABLED (Include live web insights and cited sources)" : "DISABLED (Internal workspace knowledge only)"}

[CONTEXT FOR THIS QUERY]
Internal Workspace Pages:
${docContext || "No directly matching pages found."}

Comments & Thread Discussions:
${commentContext || "No matching comments found."}

Connected Apps (Slack, Google Drive, GitHub, Jira, Salesforce):
${connectorContext}
${attachmentContext}

[RESPONSE INSTRUCTIONS]
1. Provide a direct, comprehensive answer to the user's query: "${query}".
2. Cite sources explicitly using bracket format e.g., [Page: Title], [Slack], [Google Drive], [Attachment].
3. Include a "Citations & Sources" section at the bottom listing all references.
4. Keep the output clean, highly structured, and formatted in Markdown.`;

    const response = await generateText({
      model: googleProvider("gemini-2.5-flash") as any,
      prompt: `${systemPrompt}\n\nUser Question: ${query}`,
    } as any);

    return Res.ok({
      answer: response.text,
      matchingPages: pages.map((p) => ({ id: p.id, title: p.title, emoji: p.emoji, updatedAt: p.updatedAt })),
      commentsCount: comments.length,
      connectors: connectorResults,
      researchModeActive: researchMode,
    });
  } catch (error: any) {
    console.error("[Universal Search API Error]", error);
    return Res.error(error.message || "Failed to execute universal search", 500);
  }
}
