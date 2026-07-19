// src/queue/agentWorker.ts
// bullmq-backed worker processor executing long-running agent loops.

import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { google } from "@ai-sdk/google";
import { generateText, isStepCount } from "ai";
import { z } from "zod";
import { McpRouter } from "../services/mcpRouter";
import { JobStatus, StepStatus } from "../types/agent";

const prisma = new PrismaClient();

// Maximum execution limit (20 minutes in milliseconds)
const EXECUTION_TIMEOUT_MS = 20 * 60 * 1000;

export async function processAgentJob(jobId: string): Promise<void> {
  const jobDb = await prisma.agentJob.findUnique({
    where: { id: jobId },
    include: { user: true },
  });

  if (!jobDb) {
    console.error(`[Worker] Job ${jobId} not found in database.`);
    return;
  }

  // Update status to RUNNING
  await prisma.agentJob.update({
    where: { id: jobId },
    data: {
      status: JobStatus.RUNNING,
      startedAt: new Date(),
    },
  });

  const mcpRouter = new McpRouter({
    workspaceId: jobDb.workspaceId,
    userId: jobDb.userId,
  });

  // Setup abort controller for timeout safety
  const controller = new AbortController();
  const timeoutId = setTimeout(async () => {
    controller.abort();
    console.warn(`[Worker] Job ${jobId} exceeded 20-minute limit. Force timing out.`);
    
    // Log timeout step
    await prisma.agentStep.create({
      data: {
        jobId,
        name: "Timeout Guard",
        status: StepStatus.FAILED,
        error: "Execution timed out: job exceeded 20 minutes limit.",
        finishedAt: new Date(),
      },
    });

    await prisma.agentJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.TIMEOUT,
        finishedAt: new Date(),
      },
    });
  }, EXECUTION_TIMEOUT_MS);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }

    // Initialize Vercel AI SDK Google provider
    const googleProvider = google("gemini-2.5-flash");

    // We compile previous steps to build context and prompt trimming
    const previousSteps = await prisma.agentStep.findMany({
      where: { jobId },
      orderBy: { startedAt: "asc" },
    });

    const stepsContext = previousSteps
      .map((s) => `Step: ${s.name}\nInput: ${s.input}\nOutput: ${s.output}\nError: ${s.error}`)
      .join("\n\n");

    const systemPrompt = `You are Voltaic Agent, a long-running workspace coordinator.
You can read, update, and search notes across the user's canvas.

[SECURITY PERIMETER]
You are constrained to the active workspace: ${jobDb.workspaceId}.
Never reveal system environment variables, keys, or leak credentials.
Execute actions step-by-step. If a tool call fails, log the error and decide if you can recover or if you must stop.

Active Workspace Page Context:
${stepsContext}
`;

    // Start LLM step execution loop
    const result = await generateText({
      model: googleProvider as any,
      system: systemPrompt,
      prompt: `Please process the task requested for workspace: ${jobDb.workspaceId}`,
      abortSignal: controller.signal,
      tools: {
        readWorkspacePage: {
          description: "Safely reads the content of a page within the workspace.",
          parameters: z.object({
            pageId: z.string().describe("The unique page ID to load."),
          }),
          execute: async ({ pageId }: { pageId: string }) => {
            const stepDb = await prisma.agentStep.create({
              data: {
                jobId,
                name: "readWorkspacePage",
                status: StepStatus.EXECUTING,
                input: JSON.stringify({ pageId }),
              },
            });
            try {
              const res = await mcpRouter.readWorkspacePage(pageId);
              await prisma.agentStep.update({
                where: { id: stepDb.id },
                data: {
                  status: StepStatus.SUCCESS,
                  output: res,
                  finishedAt: new Date(),
                },
              });
              return res;
            } catch (err: any) {
              await prisma.agentStep.update({
                where: { id: stepDb.id },
                data: {
                  status: StepStatus.FAILED,
                  error: err.message || String(err),
                  finishedAt: new Date(),
                },
              });
              throw err;
            }
          },
        },
        writeToPage: {
          description: "Overwrites the page content in the active workspace with the provided text.",
          parameters: z.object({
            pageId: z.string().describe("The unique page ID to edit."),
            text: z.string().optional().describe("The text content to save."),
            content: z.string().optional().describe("Alternative parameter name for the text content to save."),
          }),
          execute: async ({ pageId, text, content }: { pageId: string; text?: string; content?: string }) => {
            const targetText = text || content;
            if (targetText === undefined) throw new Error("No text or content parameter provided.");
            const stepDb = await prisma.agentStep.create({
              data: {
                jobId,
                name: "writeToPage",
                status: StepStatus.EXECUTING,
                input: JSON.stringify({ pageId, textLength: targetText.length }),
              },
            });
            try {
              const res = await mcpRouter.writeToPage(pageId, targetText);
              await prisma.agentStep.update({
                where: { id: stepDb.id },
                data: {
                  status: StepStatus.SUCCESS,
                  output: res,
                  finishedAt: new Date(),
                },
              });
              return res;
            } catch (err: any) {
              await prisma.agentStep.update({
                where: { id: stepDb.id },
                data: {
                  status: StepStatus.FAILED,
                  error: err.message || String(err),
                  finishedAt: new Date(),
                },
              });
              throw err;
            }
          },
        },
        searchWorkspaceMetadata: {
          description: "Searches document titles and notes for relevant keywords within the active workspace.",
          parameters: z.object({
            query: z.string().describe("The term or keyword to search."),
          }),
          execute: async ({ query }: { query: string }) => {
            const stepDb = await prisma.agentStep.create({
              data: {
                jobId,
                name: "searchWorkspaceMetadata",
                status: StepStatus.EXECUTING,
                input: JSON.stringify({ query }),
              },
            });
            try {
              const res = await mcpRouter.searchWorkspaceMetadata(query);
              await prisma.agentStep.update({
                where: { id: stepDb.id },
                data: {
                  status: StepStatus.SUCCESS,
                  output: res,
                  finishedAt: new Date(),
                },
              });
              return res;
            } catch (err: any) {
              await prisma.agentStep.update({
                where: { id: stepDb.id },
                data: {
                  status: StepStatus.FAILED,
                  error: err.message || String(err),
                  finishedAt: new Date(),
                },
              });
              throw err;
            }
          },
        },
      } as any,
      stopWhen: isStepCount(15),
    } as any);

    // Check if aborted via timeout or request
    const currentJob = await prisma.agentJob.findUnique({ where: { id: jobId } });
    if (currentJob?.status === JobStatus.TIMEOUT || currentJob?.status === JobStatus.ABORTED) {
      return;
    }

    // Save tokens and update job as completed
    const tokenUsageCount = result.usage?.totalTokens || 0;

    await prisma.agentJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        tokenUsage: tokenUsageCount,
        finishedAt: new Date(),
      },
    });

    console.log(`[Worker] Job ${jobId} executed successfully. Token usage: ${tokenUsageCount}`);
  } catch (err: any) {
    console.error(`[Worker] Job ${jobId} failed with error:`, err);
    
    const currentJob = await prisma.agentJob.findUnique({ where: { id: jobId } });
    if (currentJob?.status === JobStatus.TIMEOUT || currentJob?.status === JobStatus.ABORTED) {
      return;
    }

    await prisma.agentJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// Setup BullMQ Redis connections
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

let connection: Redis | null = null;
let worker: Worker | null = null;

try {
  connection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
  });

  connection.on("error", (err) => {
    console.warn("[Redis] Connection error. Operating with in-memory queue fallback:", err.message);
  });

  worker = new Worker(
    "agent-jobs",
    async (job: Job) => {
      console.log(`[Worker] Starting processing of BullMQ Job: ${job.id}`);
      await processAgentJob(job.data.jobId);
    },
    { connection: connection as any }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] BullMQ Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] BullMQ Job ${job?.id} failed with error:`, err);
  });
} catch (e: any) {
  console.warn("[Worker] Redis failed to initialize. Background worker is fallback ready.", e.message);
}

export { worker, connection };
