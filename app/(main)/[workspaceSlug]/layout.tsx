// app/(main)/[workspaceSlug]/layout.tsx
// Main app shell: resizable sidebar + content area.
// Fetches workspace data server-side and passes to client components.

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import type { WorkspaceWithMembers } from "@/types";

interface Props {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    include: {
      settings: true,
      members: {
        include: {
          user: {
            select: {
              id: true, name: true, email: true,
              image: true, color: true, createdAt: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { pages: true, members: true } },
    },
  });

  if (!workspace) notFound();

  // Verify membership
  const member = workspace.members.find((m) => m.userId === userId);
  if (!member) redirect("/dashboard");

  return (
    <WorkspaceShell
      workspace={workspace as unknown as WorkspaceWithMembers}
      currentUserId={userId}
      currentUserRole={member.role}
    >
      {children}
    </WorkspaceShell>
  );
}
