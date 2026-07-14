"use client";

// app/solutions/teams/page.tsx
// Teams solutions landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { Code, Palette, Rocket, Layers, Users, Sliders } from "lucide-react";



export default function TeamsPage() {
  const features = [
    {
      icon: Code,
      title: "Engineering: Sprint Roadmaps",
      description: "Track bug reports, document codebase API keys, write architectural reviews, and sync task boards in one place.",
    },
    {
      icon: Palette,
      title: "Design: Specs & Moodboards",
      description: "Embed Figma boards, document assets guidelines, and collect feedback on product specs with comments.",
    },
    {
      icon: Rocket,
      title: "Product: Launch Schedules",
      description: "Write epic PRDs, manage launch checklists, draft newsletter releases, and coordinate sprints alongside wikis.",
    },
    {
      icon: Layers,
      title: "Marketing: Campaign Trackers",
      description: "Plan content calendars, draft blog files, coordinate branding releases, and monitor social posts pipelines.",
    },
    {
      icon: Users,
      title: "HR: Employee Directories",
      description: "Build team directories, manage employee onboarding handbooks, and organize company holiday calendars.",
    },
    {
      icon: Sliders,
      title: "Cross-Functional Templates",
      description: "Bridge departments. Align engineers with design assets, and marketing teams with product specs.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Solutions"
      title="RTX Notion for Teams"
      subtitle="Tailored workflows for every department."
      description="Connect every team inside your company. RTX Notion provides specialized templates and database layouts for engineering, design, marketing, and product management."
      gradientFrom="from-[#06b6d4]"
      gradientTo="to-[#a855f7]"
      features={features}
    />
  );
}
