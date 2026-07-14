// src/types/agent.ts
// Robust TypeScript interfaces and enums for Background Agent engine.

export enum JobStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  ABORTED = "ABORTED",
  TIMEOUT = "TIMEOUT",
}

export enum StepStatus {
  PENDING = "PENDING",
  EXECUTING = "EXECUTING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum TriggerType {
  MANUAL = "MANUAL",
  SCHEDULE = "SCHEDULE",
  WEBHOOK = "WEBHOOK",
}

export interface AgentStep {
  id: string;
  jobId: string;
  name: string;
  status: StepStatus;
  input?: string | null;
  output?: string | null;
  error?: string | null;
  startedAt: Date;
  finishedAt?: Date | null;
}

export interface BackgroundAgentJob {
  id: string;
  workspaceId: string;
  userId: string;
  status: JobStatus;
  triggerType: TriggerType;
  tokenUsage: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  steps?: AgentStep[];
}

export interface AgentTriggerConfig {
  cronExpression?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  manualMetadata?: Record<string, any>;
}

export interface AgentTrigger {
  id: string;
  workspaceId: string;
  name: string;
  type: TriggerType;
  config: string; // stringified AgentTriggerConfig JSON
  createdAt: Date;
  updatedAt: Date;
}
