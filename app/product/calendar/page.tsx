"use client";

// app/product/calendar/page.tsx
// Calendar landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { Calendar, Clock, Bell, UserPlus, Sliders, CalendarDays } from "lucide-react";



export default function CalendarPage() {
  const features = [
    {
      icon: CalendarDays,
      title: "Interactive Timeline Grids",
      description: "Visualize launches, milestones, and release windows on a clean, zoomable calendar canvas.",
    },
    {
      icon: Clock,
      title: "Task Date Mapping",
      description: "Associate tasks with start and end dates. Your project checklists populate the team calendar instantly.",
    },
    {
      icon: Bell,
      title: "Smart Notification Alerts",
      description: "Receive alert pings inside your inbox whenever a milestone deadline is approaching.",
    },
    {
      icon: UserPlus,
      title: "Participant Scheduling",
      description: "Assign coworkers and track meeting owners directly inside team calendar events.",
    },
    {
      icon: Sliders,
      title: "Custom View Filters",
      description: "Filter calendar events by project tag, engineer, or teamspace to focus on what is relevant.",
    },
    {
      icon: Calendar,
      title: "Drag-and-Drop Reordering",
      description: "Reschedule sprints and extend deadlines by dragging cards directly on the timeline grid.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Product"
      title="Calendar"
      subtitle="Keep team milestones in alignment."
      description="Track deadlines, timelines, and meeting schedules in a clean database-backed calendar workspace. Organize sprints and coordinate milestones alongside your project sheets."
      gradientFrom="from-[#3b82f6]"
      gradientTo="to-[#06b6d4]"
      features={features}
    />
  );
}
