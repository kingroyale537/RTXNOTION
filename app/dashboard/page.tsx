// app/dashboard/page.tsx
// Post-login redirect: finds user's first workspace and navigates there.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  // Find the first workspace the user belongs to (personal workspace first)
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: { select: { slug: true, isPersonal: true } } },
    orderBy: [
      { workspace: { isPersonal: "desc" } }, // personal first
      { joinedAt: "asc" },
    ],
  });

  if (membership) {
    redirect(`/${membership.workspace.slug}`);
  }

  // No workspace: send to onboarding
  redirect("/onboarding");
}
