import { getProjects } from "@/lib/db/queries";
import { ReportsCharts } from "@/components/dashboard/reports-charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const projects = await getProjects();

  // 🔥 KPIs
  const totalProjects = projects.length;

  const completedProjects = projects.filter(
    (p: any) => p.status === "completed"
  ).length;

  const inProgressProjects = projects.filter(
    (p: any) => p.status === "in_progress"
  ).length;

  const onHoldProjects = projects.filter(
    (p: any) => p.status === "on_hold"
  ).length;

  const avgProgress =
    projects.reduce((acc: number, p: any) => acc + p.progress, 0) /
      (projects.length || 1);

  const completionRate =
    totalProjects > 0
      ? ((completedProjects / totalProjects) * 100).toFixed(1)
      : 0;

  // 🔥 proyectos por cliente
  const projectsByClient = projects.reduce((acc: any, p: any) => {
    const client = p.clientName || "Unknown";
    acc[client] = (acc[client] || 0) + 1;
    return acc;
  }, {});

  // 🔥 top proyectos (por progreso)
  const topProjects = [...projects]
    .sort((a: any, b: any) => b.progress - a.progress)
    .slice(0, 5);

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports Overview</h1>

      {/* 🔥 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">Total Projects</p>
          <h2 className="text-2xl font-bold">{totalProjects}</h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">Completed</p>
          <h2 className="text-2xl font-bold text-green-500">
            {completedProjects}
          </h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">In Progress</p>
          <h2 className="text-2xl font-bold text-blue-500">
            {inProgressProjects}
          </h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">On Hold</p>
          <h2 className="text-2xl font-bold text-yellow-500">
            {onHoldProjects}
          </h2>
        </div>

        <div className="bg-zinc-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-zinc-400">Completion Rate</p>
          <h2 className="text-2xl font-bold text-purple-500">
            {completionRate}%
          </h2>
        </div>
      </div>

      {/* 📊 Chart principal */}
      <div className="bg-zinc-900 p-5 rounded-2xl shadow">
        <ReportsCharts projects={projects} />
      </div>

      {/* 📈 Progreso promedio */}
      <div className="bg-zinc-900 p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-2">Average Progress</h2>
        <p className="text-3xl font-bold text-blue-400">
          {avgProgress.toFixed(1)}%
        </p>
      </div>

      {/* 🧾 Top proyectos */}
      <div className="bg-zinc-900 p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Top Performing Projects</h2>

        <ul className="space-y-2">
          {topProjects.map((p: any) => (
            <li
              key={p.id}
              className="flex justify-between text-sm border-b border-zinc-800 pb-1"
            >
              <span className="text-zinc-400">{p.name}</span>
              <span className="text-green-400 font-medium">
                {p.progress}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 👥 Proyectos por cliente */}
      <div className="bg-zinc-900 p-5 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Projects by Client</h2>

        <ul className="space-y-2">
          {Object.entries(projectsByClient).map(
            ([client, count]: any) => (
              <li
                key={client}
                className="flex justify-between text-sm"
              >
                <span className="text-zinc-400">{client}</span>
                <span className="font-medium">{count}</span>
              </li>
            )
          )}
        </ul>
      </div>
    </main>
  );
}