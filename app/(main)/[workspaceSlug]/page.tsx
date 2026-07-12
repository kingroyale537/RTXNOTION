// app/(main)/[workspaceSlug]/page.tsx
// Workspace home screen – shown when no page is selected.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { WorkspaceHome } from "@/components/workspace/WorkspaceHome";

interface Props { params: { workspaceSlug: string } }

export default async function WorkspacePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    include: {
      _count: { select: { pages: true, members: true } },
    },
  });

  if (!workspace) redirect("/dashboard");

  // Recent pages for this user
  const recentPages = await prisma.page.findMany({
    where: { workspaceId: workspace.id, isArchived: false },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      id: true, title: true, iconValue: true, updatedAt: true,
      lastEditedBy: { select: { name: true, image: true } },
    },
  });

  return (
    <WorkspaceHome
      workspace={workspace}
      recentPages={recentPages}
      workspaceSlug={params.workspaceSlug}
      userId={userId}
    />
  );
}
