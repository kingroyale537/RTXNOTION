// app/(main)/[workspaceSlug]/[pageId]/page.tsx
// Individual page – fetches content server-side, renders editor client-side.

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PageView } from "@/components/page/PageView";
import type { PageWithRelations } from "@/types";

interface Props { params: { workspaceSlug: string; pageId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
    select: { title: true, iconValue: true },
  });
  return {
    title: page ? `${page.iconValue ?? ""} ${page.title || "Untitled"}`.trim() : "Page",
  };
}

export default async function PageRoute({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
    include: {
      createdBy: { select: { id: true, name: true, email: true, image: true, color: true } },
      lastEditedBy: { select: { id: true, name: true, email: true, image: true, color: true } },
      presence: {
        include: { user: { select: { id: true, name: true, image: true, color: true } } },
      },
      _count: { select: { children: true, comments: true } },
    },
  });

  if (!page || page.isArchived) notFound();

  // Verify access
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: page.workspaceId, userId } },
  });
  if (!member) redirect(`/${params.workspaceSlug}`);

  const workspace = await prisma.workspace.findUnique({
    where: { id: page.workspaceId },
    select: { id: true, slug: true },
  });

  return (
    <PageView
      page={page as unknown as PageWithRelations}
      workspaceId={workspace!.id}
      workspaceSlug={params.workspaceSlug}
      currentUserId={userId}
      canEdit={member.role !== "VIEWER"}
    />
  );
}
