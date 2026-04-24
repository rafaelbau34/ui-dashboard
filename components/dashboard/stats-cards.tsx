"use client";

import { Folder, ListTodo, Eye, CheckCircle2 } from "lucide-react";

interface StatsProps {
  stats: {
    totalProjects: { value: number; change: number };
    totalTasks: { value: number; change: number };
    inReviews: { value: number; change: number };
    completedTasks: { value: number; change: number };
  };
}

export function StatsCards({ stats }: StatsProps) {
  const statsArray = [
    {
      title: "Total Projects",
      value: stats.totalProjects.value,
      change: stats.totalProjects.change,
      icon: Folder,
    },
    {
      title: "Total Task",
      value: stats.totalTasks.value,
      change: stats.totalTasks.change,
      icon: ListTodo,
    },
    {
      title: "In Reviews",
      value: stats.inReviews.value,
      change: stats.inReviews.change,
      icon: Eye,
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks.value,
      change: stats.completedTasks.change,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsArray.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-medium text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">
                +{stat.change} vs last month
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted shrink-0">
              <stat.icon className="size-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
