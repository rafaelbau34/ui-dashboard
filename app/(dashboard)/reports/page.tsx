import { getProjects } from "@/lib/db/queries";
import { ReportsCharts } from "@/components/dashboard/reports-charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const projects = await getProjects();

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      <ReportsCharts projects={projects} />
    </main>
  );
}
