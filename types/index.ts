// types/index.ts
// Shared TypeScript types and interfaces used across the entire application.

import type {
  User,
  Workspace,
  WorkspaceMember,
  Page,
  Comment,
  Media,
  Activity,
  Notification,
  Invite,
  Role,
  ActivityType,
  MediaType,
  InviteStatus,
  PageIconType,
} from "@prisma/client";

// ─── Re-exports ────────────────────────────────────────────────────────────────
export type {
  User,
  Workspace,
  WorkspaceMember,
  Page,
  Comment,
  Media,
  Activity,
  Notification,
  Invite,
  Role,
  ActivityType,
  MediaType,
  InviteStatus,
  PageIconType,
};

// ─── Serializable User (safe to pass to client) ────────────────────────────────
export type SafeUser = Omit<User, "password"> & {
  workspaceMemberships?: WorkspaceMemberWithWorkspace[];
};

// ─── Extended types with relations ────────────────────────────────────────────
export type WorkspaceMemberWithUser = WorkspaceMember & {
  user: SafeUser;
};

export type WorkspaceMemberWithWorkspace = WorkspaceMember & {
  workspace: Workspace;
};

export type WorkspaceWithMembers = Workspace & {
  members: WorkspaceMemberWithUser[];
  _count?: { pages: number; members: number };
};

export type PageWithRelations = Page & {
  children?: PageTree[];
  createdBy?: SafeUser;
  lastEditedBy?: SafeUser;
  _count?: { children: number; comments: number };
};

// Recursive tree type for sidebar navigation
export interface PageTree {
  id: string;
  title: string;
  emoji: string | null;
  iconType: PageIconType;
  iconValue: string | null;
  parentId: string | null;
  sortOrder: number;
  isArchived: boolean;
  workspaceId: string;
  children: PageTree[];
  _count?: { children: number };
}

export type CommentWithAuthor = Comment & {
  author: SafeUser;
  replies?: CommentWithAuthor[];
};

export type MediaWithUploader = Media & {
  uploadedBy: SafeUser;
};

export type ActivityWithUser = Activity & {
  user: SafeUser;
  page?: Page | null;
};

// ─── TipTap Editor types ───────────────────────────────────────────────────────
export interface TipTapJSON {
  type: "doc";
  content: TipTapNode[];
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

// ─── Real-time / Socket.io types ───────────────────────────────────────────────
export interface PresenceUser {
  userId: string;
  name: string;
  color: string;
  image?: string | null;
  cursor?: { anchor: number; head: number } | null;
  pageId: string;
  socketId: string;
}

export interface YjsUpdateEvent {
  pageId: string;
  update: number[]; // Uint8Array serialised as number[]
  userId: string;
}

export interface CursorUpdateEvent {
  pageId: string;
  userId: string;
  cursor: { anchor: number; head: number } | null;
}

export interface PageUpdateEvent {
  pageId: string;
  title?: string;
  emoji?: string | null;
  updatedBy: string;
}

// ─── API Response envelopes ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// ─── Form / Input types ────────────────────────────────────────────────────────
export interface CreatePageInput {
  title?: string;
  parentId?: string | null;
  workspaceId: string;
  emoji?: string;
}

export interface UpdatePageInput {
  title?: string;
  content?: TipTapJSON;
  emoji?: string | null;
  iconType?: PageIconType;
  iconValue?: string | null;
  coverImage?: string | null;
  isPublished?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  sortOrder?: number;
  parentId?: string | null;
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface InviteMemberInput {
  email?: string;
  role: Role;
  expiresInDays?: number;
  maxUses?: number;
}

// ─── Zustand store slice types ─────────────────────────────────────────────────
export interface WorkspaceState {
  currentWorkspace: WorkspaceWithMembers | null;
  workspaces: Workspace[];
}

export interface PageState {
  pageTree: PageTree[];
  currentPage: PageWithRelations | null;
  openPageIds: string[]; // expanded sidebar nodes
}

export interface PresenceState {
  presentUsers: Record<string, PresenceUser[]>; // pageId → users
}

export interface UIState {
  sidebarOpen: boolean;
  commandOpen: boolean;
  settingsOpen: boolean;
}
