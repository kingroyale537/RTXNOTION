// app/api/ai/route.ts
// Backend endpoint for Voltaic AI. Supports both Q&A workspace chat and inline editing.
// Features resilient multi-provider fallback (Gemini -> Groq -> OpenRouter -> OpenAI) to eliminate quota rate-limit crashes.

import { NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, isStepCount } from "ai";
import { z } from "zod";
import { Res, getAuthUser, requireWorkspaceMember, requirePageAccess } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { McpRouter } from "@/src/services/mcpRouter";

async function getModelInstance(modelKey: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (modelKey && modelKey.startsWith("groq/") && groqApiKey) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const groqModelName = modelKey.replace("groq/", "");
    const groqProvider = createOpenAI({
      apiKey: groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
    return groqProvider(groqModelName);
  }

  if (modelKey && modelKey.startsWith("openrouter/") && openrouterApiKey) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openRouterModelName = modelKey.replace("openrouter/", "");
    const openrouterProvider = createOpenAI({
      apiKey: openrouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
    return openrouterProvider(openRouterModelName);
  }

  if (modelKey && modelKey.startsWith("gpt-") && openaiApiKey) {
    const { openai } = await import("@ai-sdk/openai");
    return openai(modelKey);
  }

  if (geminiApiKey) {
    const googleProvider = createGoogleGenerativeAI({ apiKey: geminiApiKey });
    return googleProvider("gemini-2.5-flash");
  }

  if (groqApiKey) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const groqProvider = createOpenAI({ apiKey: groqApiKey, baseURL: "https://api.groq.com/openai/v1" });
    return groqProvider("llama-3.3-70b-specdec");
  }

  if (openrouterApiKey) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openrouterProvider = createOpenAI({ apiKey: openrouterApiKey, baseURL: "https://openrouter.ai/api/v1" });
    return openrouterProvider("meta-llama/llama-3.3-70b-instruct");
  }

  throw new Error("No AI API keys configured (GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY).");
}

async function runAiWithFallback(modelKey: string, options: any) {
  try {
    const primaryInstance = await getModelInstance(modelKey);
    return await generateText({ ...options, model: primaryInstance });
  } catch (err: any) {
    console.warn(`[AI Engine Warning] Primary model '${modelKey}' encountered rate limit/error:`, err.message || err);

    const fallbackList = [
      "groq/llama-3.3-70b-specdec",
      "openrouter/meta-llama/llama-3.3-70b-instruct",
      "gpt-4o-mini",
      "gemini-2.5-flash",
    ];

    for (const altKey of fallbackList) {
      if (altKey === modelKey) continue;
      try {
        const altInstance = await getModelInstance(altKey);
        console.log(`[AI Engine Fallback] Successfully switched to backup model: ${altKey}`);
        return await generateText({ ...options, model: altInstance });
      } catch {
        continue;
      }
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return Res.unauthorized();

    const body = await req.json();
    const { mode, prompt, messages, workspaceId, text, pageId, modelKey, columnType, customPrompt, rowData } = body;

    // ── Notion Auto-Select Engine (LLM Flex Complexity Classifier) ─────────────
    let resolvedModelKey = modelKey;
    if (!modelKey || modelKey === "auto") {
      const isComplexPrompt = (prompt && prompt.length > 250) || 
        /\b(database|schema|code|architect|refactor|analyze|multi-step|html|mermaid)\b/i.test(prompt || "");
      resolvedModelKey = isComplexPrompt ? "gpt-4o" : "gemini-2.5-flash";
    }

    // ── Mode: Prompted Database Generation (Pillar 3) ──────────────────────────
    if (mode === "generateDatabase") {
      if (!prompt) return Res.error("Prompt description is required to generate database", 400);

      const dbGenPrompt = `You are Notion AI's Database Architect.
Convert the user's description into a structured database layout.

[USER DESCRIPTION]
"${prompt}"

[OUTPUT SCHEMA REQUIREMENT]
Respond ONLY with a valid JSON object matching this structure:
{
  "name": "Database Title",
  "schema": [
    { "id": "title", "name": "Name", "type": "title" },
    { "id": "status", "name": "Status", "type": "select", "options": ["To Do", "In Progress", "Done"] },
    { "id": "priority", "name": "Priority", "type": "select", "options": ["High", "Medium", "Low"] },
    { "id": "assignee", "name": "Assignee", "type": "text" },
    { "id": "date", "name": "Due Date", "type": "date" },
    { "id": "ai_summary", "name": "AI Summary", "type": "AI_SUMMARY" }
  ],
  "defaultView": "table",
  "initialRows": [
    { "title": "Sample Entry 1", "status": "To Do", "priority": "High" },
    { "title": "Sample Entry 2", "status": "In Progress", "priority": "Medium" }
  ]
}`;

      const response = await runAiWithFallback(resolvedModelKey, {
        prompt: dbGenPrompt,
      });

      let cleanJson = response.text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
      try {
        const dbConfig = JSON.parse(cleanJson);
        return Res.ok(dbConfig);
      } catch {
        return Res.error("Failed to parse AI generated database structure.", 500);
      }
    }

    // ── Mode: AI Database Property Column Autofill (Pillar 3) ─────────────────
    if (mode === "autofillColumn") {
      if (!rowData) return Res.error("Row data context is required for column autofill", 400);

      const columnInstruction = 
        columnType === "AI_SUMMARY" ? "Summarize the key points from this row content into 1-2 concise sentences." :
        columnType === "AI_TRANSLATE" ? "Translate the main text from this row into clear Hindi / English." :
        columnType === "AI_SENTIMENT" ? "Identify the overall sentiment of this row (Positive, Neutral, Negative, or Urgent)." :
        columnType === "AI_ACTION_ITEMS" ? "Extract explicit action items or tasks from this row." :
        customPrompt ? customPrompt : "Extract relevant insights from this row.";

      const autofillPrompt = `You are Notion AI Database Property Autofill.
Row Data: ${JSON.stringify(rowData)}
Instruction: ${columnInstruction}

Return ONLY the plain-text computed result value for this database cell.`;

      const response = await runAiWithFallback(resolvedModelKey, {
        prompt: autofillPrompt,
      });

      return Res.ok({ value: response.text.trim() });
    }

    if (!prompt) return Res.error("Prompt is required", 400);

    if (workspaceId) {
      await requireWorkspaceMember(workspaceId, user.id);
    }

    if (pageId) {
      await requirePageAccess(pageId, user.id);
    }

    if (mode === "edit") {
      if (!text) return Res.error("Text is required for editing mode", 400);

      const systemPrompt = `You are an expert document editor. Output ONLY the final modified text. Just output the raw edited text.

Text to modify:
"""
${text}
"""

Instruction Command to execute:
"""
${prompt}
"""
`;

      const result = await runAiWithFallback(resolvedModelKey, {
        prompt: systemPrompt,
      });

      return Res.ok({ text: result.text.trim() });
    }

    if (mode === "chat") {
      let activeWorkspaceId = workspaceId;
      if (pageId && !activeWorkspaceId) {
        const page = await prisma.page.findUnique({
          where: { id: pageId },
          select: { workspaceId: true },
        });
        if (page) {
          activeWorkspaceId = page.workspaceId;
        }
      }
      if (!activeWorkspaceId) {
        const membership = await prisma.workspaceMember.findFirst({
          where: { userId: user.id },
          select: { workspaceId: true },
        });
        if (membership) {
          activeWorkspaceId = membership.workspaceId;
        }
      }

      if (!activeWorkspaceId) {
        return Res.error("No active workspace context found for this chat session.", 400);
      }

      let pageContext = "";
      if (pageId) {
        const page = await prisma.page.findUnique({
          where: { id: pageId },
          select: { title: true, contentText: true },
        });
        if (page) {
          pageContext = `You are assisting the user with the active document page titled "${page.title}" (ID: ${pageId}).
Current Content:
---
${page.contentText || "(Empty)"}
---
If the user asks you to write content to their page, write notes, or generate a roadmap, execute the 'writeToPage' tool!\n\n`;
        }
      }

      let workspaceContext = "";
      if (workspaceId) {
        const pages = await prisma.page.findMany({
          where: { workspaceId, isArchived: false },
          select: { id: true, title: true, contentText: true },
          take: 10,
        });

        if (pages.length > 0) {
          workspaceContext = "Workspace Pages Context:\n";
          pages.forEach((p) => {
            workspaceContext += `- [${p.title}] (ID: ${p.id}): ${p.contentText?.slice(0, 200) || "(Empty)"}\n`;
          });
          workspaceContext += "\n";
        }
      }

      const systemPrompt = `You are Voltaic AI, an expert workspace assistant.
${pageContext}
${workspaceContext}
Answer in clean Markdown. If the user asks you to write or add content to their page, make sure to execute the 'writeToPage' tool with the text!`;

      const mcpRouter = new McpRouter({
        workspaceId: activeWorkspaceId,
        userId: user.id,
      });

      let pageWasUpdated = false;
      let updatedPageId = "";
      let writtenContentText = "";

      const formattedMessages = [
        ...(messages || []).map((m: { role: "user" | "model"; content: string }) => ({
          role: m.role === "model" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        ...(prompt ? [{ role: "user" as const, content: prompt }] : []),
      ];

      const result = await runAiWithFallback(resolvedModelKey, {
        system: systemPrompt,
        messages: formattedMessages,
        tools: {
          readWorkspacePage: {
            description: "Safely reads the content of a page within the workspace.",
            parameters: z.object({
              pageId: z.string().optional(),
            }),
            execute: async ({ pageId: toolPageId }: { pageId?: string }) => {
              const targetPageId = toolPageId || pageId;
              if (!targetPageId) throw new Error("No page ID context provided.");
              return mcpRouter.readWorkspacePage(targetPageId);
            },
          },
          writeToPage: {
            description: "Overwrites or adds content directly to the active workspace page.",
            parameters: z.object({
              pageId: z.string().optional(),
              text: z.string().optional(),
              content: z.string().optional(),
            }),
            execute: async ({ pageId: toolPageId, text, content }: { pageId?: string; text?: string; content?: string }) => {
              const targetPageId = toolPageId || pageId;
              if (!targetPageId) throw new Error("No page ID context provided.");
              const targetText = text || content;
              if (targetText === undefined) throw new Error("No text or content parameter provided.");
              const res = await mcpRouter.writeToPage(targetPageId, targetText);
              pageWasUpdated = true;
              updatedPageId = targetPageId;
              writtenContentText = targetText;
              return res;
            },
          },
          searchWorkspaceMetadata: {
            description: "Searches document titles and notes for keywords within the workspace.",
            parameters: z.object({
              query: z.string(),
            }),
            execute: async ({ query }: { query: string }) => mcpRouter.searchWorkspaceMetadata(query),
          },
        } as any,
        stopWhen: isStepCount(5),
      });

      return Res.ok({
        text: result.text || (writtenContentText ? `Written to page successfully: \n\n${writtenContentText}` : "Completed."),
        pageUpdated: pageWasUpdated,
        pageId: updatedPageId,
        updatedContent: writtenContentText,
      });
    }

    return Res.error("Invalid mode. Must be 'chat' or 'edit'", 400);
  } catch (err: any) {
    console.error("[AI Engine Error]", err);
    return Res.error(err instanceof Error ? err.message : "AI service temporarily unavailable.", 500);
  }
}
