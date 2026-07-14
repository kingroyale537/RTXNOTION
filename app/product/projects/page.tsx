"use client";

// app/product/projects/page.tsx
// Projects landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { FolderKanban, BarChart3, Clock, LayoutGrid, CheckSquare, ListFilter } from "lucide-react";



export default function ProjectsPage() {
  const features = [
    {
      icon: LayoutGrid,
      title: "Interactive Databases",
      description: "Manage tasks, bugs, and feature boards using clean, interactive database grids and rows.",
    },
    {
      icon: ListFilter,
      title: "Sort, Filter & Group",
      description: "Customize database views. Hide completed items, sort by priority, and group tasks by assigned team member.",
    },
    {
      icon: CheckSquare,
      title: "Task Checklists & Statuses",
      description: "Decompose epic projects into actionable lists. Transition states between Todo, In-Progress, and Completed.",
    },
    {
      icon: FolderKanban,
      title: "Kanban Board Swapping",
      description: "Toggle seamlessly from spreadsheet list views to cards boards to visualize developer pipelines.",
    },
    {
      icon: Clock,
      title: "Activity Auditing Trails",
      description: "Track task completions, status transitions, and team member assignments in real-time activity feeds.",
    },
    {
      icon: BarChart3,
      title: "Project Progress Insights",
      description: "Monitor milestones and completion percentages directly inside your team workspace homepage.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Product"
      title="Projects"
      subtitle="Track plans from kick-off to release."
      description="Connect your meeting docs with task boards. Voltaic Projects keeps tasks and checklists in the same environment as your specs, keeping execution in sync with plans."
      gradientFrom="from-[#ef4444]"
      gradientTo="to-[#f97316]"
      features={features}
    />
  );
}
