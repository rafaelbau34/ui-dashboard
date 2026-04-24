import { ProjectsTable } from "@/components/dashboard/projects-table";
import { getClients, getProjects } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const clients = await getClients();

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
      <ProjectsTable projects={projects as any} clients={clients as any} />
    </main>
  );
}
