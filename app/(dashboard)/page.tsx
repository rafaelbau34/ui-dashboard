import { DashboardContent } from "@/components/dashboard/content";
import { getDashboardStats, getPerformanceData, getTodayTasks, getProjects } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, performanceData, tasks, projects] = await Promise.all([
    getDashboardStats(),
    getPerformanceData(),
    getTodayTasks(),
    getProjects()
  ]);

  return (
    <DashboardContent 
      stats={stats}
      performanceData={performanceData}
      tasks={tasks}
      projects={projects as any}
    />
  );
}
