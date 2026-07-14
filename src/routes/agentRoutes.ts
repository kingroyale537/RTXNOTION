// src/routes/agentRoutes.ts
// Express REST API routes to manage long-running background agents.

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { addAgentJobToQueue } from "../queue/queueManager";
import { JobStatus, TriggerType } from "../types/agent";

const router = Router();
const prisma = new PrismaClient();

/**
 * Trigger a new background agent execution.
 * POST /api/agents/run
 */
router.post("/run", async (req: Request, res: Response) => {
  try {
    const { workspaceId, userId, triggerType = TriggerType.MANUAL } = req.body;

    if (!workspaceId || !userId) {
      return res.status(400).json({ error: "Missing required fields: workspaceId and userId." });
    }

    // Verify workspace and user exist
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ error: `Workspace with ID ${workspaceId} not found.` });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: `User with ID ${userId} not found.` });
    }

    // Create background agent job in database
    const job = await prisma.agentJob.create({
      data: {
        workspaceId,
        userId,
        status: JobStatus.PENDING,
        triggerType,
      },
    });

    // Add job to BullMQ / fallback queue coordinator
    await addAgentJobToQueue(job.id);

    return res.status(202).json({
      message: "Agent job successfully submitted to execution queue.",
      jobId: job.id,
      status: job.status,
    });
  } catch (err: any) {
    console.error("[Routes] Error triggering agent:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

/**
 * Check task timeline execution status.
 * GET /api/agents/status/:jobId
 */
router.get("/status/:jobId", async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;

    const job = await prisma.agentJob.findUnique({
      where: { id: jobId },
      include: {
        steps: {
          orderBy: { startedAt: "asc" },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: `Agent job with ID ${jobId} not found.` });
    }

    const jobAny = job as any;

    return res.status(200).json({
      jobId: jobAny.id,
      status: jobAny.status,
      triggerType: jobAny.triggerType,
      tokenUsage: jobAny.tokenUsage,
      createdAt: jobAny.createdAt,
      startedAt: jobAny.startedAt,
      finishedAt: jobAny.finishedAt,
      stepsCount: jobAny.steps.length,
      timeline: jobAny.steps.map((step: any) => ({
        stepId: step.id,
        name: step.name,
        status: step.status,
        input: step.input ? JSON.parse(step.input) : null,
        output: step.output,
        error: step.error,
        startedAt: step.startedAt,
        finishedAt: step.finishedAt,
      })),
    });
  } catch (err: any) {
    console.error("[Routes] Error fetching agent status:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

/**
 * Manually abort a long-running execution loop.
 * POST /api/agents/abort/:jobId
 */
router.post("/abort/:jobId", async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;

    const job = await prisma.agentJob.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: `Agent job with ID ${jobId} not found.` });
    }

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED || job.status === JobStatus.ABORTED) {
      return res.status(400).json({
        error: `Cannot abort job with current terminal status: ${job.status}`,
      });
    }

    // Mark job as ABORTED in the database
    // The active worker thread checks this state cooperatively before starting the next step.
    const updatedJob = await prisma.agentJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.ABORTED,
        finishedAt: new Date(),
      },
    });

    console.log(`[Routes] Agent Job ${jobId} aborted by user.`);

    return res.status(200).json({
      message: "Agent job marked as aborted. Running processes will terminate immediately.",
      jobId: updatedJob.id,
      status: updatedJob.status,
    });
  } catch (err: any) {
    console.error("[Routes] Error aborting agent job:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

export default router;
