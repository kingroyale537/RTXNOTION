// app/page.tsx
// Root redirect: authenticated users → /dashboard, guests → /auth/login
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  redirect("/login");
}
