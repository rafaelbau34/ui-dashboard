import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { welcomeSummary } from "@/mock-data/dashboard";
import { StatsCards } from "./stats-cards";
import { TodaysTasks, type TaskData } from "./todays-tasks";
import { PerformanceChart } from "./performance-chart";
import { ProjectsTable, type Project } from "./projects-table";

function WelcomeSection() {
  const { userName, tasksDueToday, overdueTasks, upcomingDeadlines } =
    welcomeSummary;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Welcome Back, {userName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tasksDueToday} Tasks Due Today, {overdueTasks} Overdue Tasks,{" "}
          {upcomingDeadlines} Upcoming Deadlines (This Week)
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Download className="size-4" />
          Export
        </Button>
        <Button size="sm" className="h-9 gap-1.5 bg-primary hover:bg-primary/90">
          <Plus className="size-4" />
          New
        </Button>
      </div>
    </div>
  );
}

interface DashboardContentProps {
  stats: any;
  performanceData: any;
  tasks: TaskData[];
  projects: Project[];
}

export function DashboardContent({ stats, performanceData, tasks, projects }: DashboardContentProps) {
  // Hardcoded score and change for performance chart for now
  const score = 84;
  const change = 12;

  return (
    <main className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <WelcomeSection />
        <StatsCards stats={stats} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <TodaysTasks tasks={tasks} />
          </div>
          <div>
            <PerformanceChart score={score} change={change} data={performanceData} />
          </div>
        </div>
        <ProjectsTable projects={projects} />
      </div>
    </main>
  );
}
