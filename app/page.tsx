// app/page.tsx
// Root marketing page: authenticated users → /dashboard, guests → Notion-style animated landing page

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Testimonials } from "@/components/marketing/Testimonials";
import { BottomCta } from "@/components/marketing/BottomCta";
import { Footer } from "@/components/marketing/Footer";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center">
        <Hero />
        <FeatureGrid />
        <Testimonials />
        <BottomCta />
      </main>
      <Footer />
    </div>
  );
}
