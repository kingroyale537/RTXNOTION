// components/page/ChartView.tsx
// Interactive Database Analytics & SVG Chart Visualizer.

"use client";

import { BarChart3, PieChart, TrendingUp } from "lucide-react";

interface Props {
  items: Array<{
    id: string;
    title: string;
    properties?: any;
  }>;
}

export function ChartView({ items }: Props) {
  const statusCounts: Record<string, number> = {
    "To Do": 0,
    "In Progress": 0,
    "Done": 0,
  };

  const priorityCounts: Record<string, number> = {
    "High": 0,
    "Medium": 0,
    "Low": 0,
  };

  items.forEach((item) => {
    const props = item.properties || {};
    const status = props.status || "To Do";
    const priority = props.priority || "Medium";

    statusCounts[status] = (statusCounts[status] || 0) + 1;
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
  });

  const total = items.length || 1;

  return (
    <div className="my-6 p-5 bg-[#181818] border border-[#2a2a2a] rounded-2xl shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Database Analytics & Interactive Charts</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} Total Entries</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="space-y-3 bg-[#202020] p-4 rounded-xl border border-[#2c2c2c]">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-purple-400" />
            <span>Status Breakdown</span>
          </h4>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / total) * 100);
              const color = status === "Done" ? "bg-emerald-500" : status === "In Progress" ? "bg-amber-500" : "bg-blue-500";
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span>{status}</span>
                    <span className="font-mono text-gray-200">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#121212] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="space-y-3 bg-[#202020] p-4 rounded-xl border border-[#2c2c2c]">
          <h4 className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Priority Spread</span>
          </h4>
          <div className="space-y-2">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const pct = Math.round((count / total) * 100);
              const color = priority === "High" ? "bg-red-500" : priority === "Medium" ? "bg-purple-500" : "bg-gray-500";
              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span>{priority} Priority</span>
                    <span className="font-mono text-gray-200">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#121212] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
