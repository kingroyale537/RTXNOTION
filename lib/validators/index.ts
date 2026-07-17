// lib/validators/index.ts
// Zod schemas for all API request bodies and form inputs.

import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Workspace ─────────────────────────────────────────────────────────────────
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  logo: z.string().optional(),
  usageType: z.enum(["work", "personal", "school"]).optional(),
});

// ─── Page ──────────────────────────────────────────────────────────────────────
export const createPageSchema = z.object({
  title: z.string().max(255).optional().default("Untitled"),
  parentId: z.string().cuid().nullable().optional(),
  workspaceId: z.string().cuid(),
  emoji: z.string().optional(),
});

export const updatePageSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.any().optional(), // TipTap JSON – validated structurally elsewhere
  emoji: z.string().nullable().optional(),
  iconType: z.enum(["EMOJI", "URL", "LUCIDE"]).optional(),
  iconValue: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  sortOrder: z.number().optional(),
  parentId: z.string().cuid().nullable().optional(),
  properties: z.any().optional(),
});

export const movePageSchema = z.object({
  parentId: z.string().cuid().nullable(),
  sortOrder: z.number(),
});

// ─── Invites ───────────────────────────────────────────────────────────────────
export const createInviteSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).default("EDITOR"),
  expiresInDays: z.number().min(1).max(30).default(7),
  maxUses: z.number().min(1).nullable().optional(),
});

// ─── Comments ──────────────────────────────────────────────────────────────────
export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  blockId: z.string().optional(),
  parentId: z.string().cuid().optional(),
});

// ─── Member management ─────────────────────────────────────────────────────────
export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

// ─── Type exports ──────────────────────────────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
