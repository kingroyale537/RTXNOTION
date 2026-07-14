// src/queue/queueManager.ts
// Managed Queue interface that handles BullMQ submission with in-memory execution fallback.

import { Queue } from "bullmq";
import Redis from "ioredis";
import { processAgentJob } from "./agentWorker";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

let queue: Queue | null = null;
let redisConnection: Redis | null = null;
let redisHealthy = false;

try {
  redisConnection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
  });

  redisConnection.on("connect", () => {
    console.log("[Redis] Successfully connected to server.");
    redisHealthy = true;
  });

  redisConnection.on("error", (err) => {
    console.warn("[Redis] Disconnected or unable to reach server:", err.message);
    redisHealthy = false;
  });

  queue = new Queue("agent-jobs", {
    connection: redisConnection as any,
  });
} catch (e: any) {
  console.warn("[Queue] BullMQ failed to initialize. Operating in fallback mode.", e.message);
}

export async function addAgentJobToQueue(jobId: string): Promise<void> {
  if (queue && redisHealthy) {
    console.log(`[Queue] Enqueueing Job ${jobId} to BullMQ.`);
    await queue.add("agent-job", { jobId });
  } else {
    console.log(`[Queue] Redis is offline. Running Job ${jobId} asynchronously in-process.`);
    
    // Execute asynchronously using Express/Node event loop
    setTimeout(() => {
      processAgentJob(jobId).catch((err) => {
        console.error(`[Queue] Fallback processing failed for Job ${jobId}:`, err);
      });
    }, 50);
  }
}
