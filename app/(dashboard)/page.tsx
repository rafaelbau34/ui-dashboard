import { DashboardContent } from "@/components/dashboard/content";
import {
  getClients,
  getDashboardStats,
  getPerformanceData,
  getProjects,
  getTodayTasks,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, performanceData, tasks, projects, clients] = await Promise.all([
    getDashboardStats(),
    getPerformanceData(),
    getTodayTasks(),
    getProjects(),
    getClients(),
  ]);

  return (
    <DashboardContent 
      stats={stats}
      performanceData={performanceData}
      tasks={tasks}
      projects={projects as any}
      clients={clients as any}
    />
  );
}
