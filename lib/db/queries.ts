import { db } from "./index";
import { projects, users, clients, tasks, performanceMetrics, finance } from "./schema";
import { eq, sql, desc, sum } from "drizzle-orm";

export async function getProjects() {
  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      color: projects.color,
      status: projects.status,
      progress: projects.progress,
      totalTasks: projects.totalTasks,
      completedTasks: projects.completedTasks,
      dueDate: projects.dueDate,
      ownerId: projects.ownerId,
      ownerName: users.name,
      ownerAvatarSeed: users.avatarSeed,
      clientId: projects.clientId,
    })
    .from(projects)
    .leftJoin(users, eq(projects.ownerId, users.id));

  return result.map((p) => ({
    ...p,
    id: `p${p.id}`, // match the format expected by the frontend
    ownerName: p.ownerName ?? "Unknown",
    ownerAvatarSeed: p.ownerAvatarSeed ?? "default",
  }));
}

export async function getClients() {
  return await db.select().from(clients);
}

export async function getDashboardStats() {
  // Aggregate stats
  const projectsCount = await db.select({ count: sql<number>`cast(count(${projects.id}) as integer)` }).from(projects);
  const tasksCount = await db.select({ count: sql<number>`cast(count(${tasks.id}) as integer)` }).from(tasks);
  
  // Calculate completed tasks for "In Reviews" vs "Completed"
  const completedCountRes = await db.select({
    completed: sum(projects.completedTasks),
    total: sum(projects.totalTasks)
  }).from(projects);
  
  const completed = Number(completedCountRes[0]?.completed ?? 0);
  const total = Number(completedCountRes[0]?.total ?? 0);
  const inReviews = Math.max(0, total - completed);

  return {
    totalProjects: { value: projectsCount[0]?.count ?? 0, change: 5 }, // Hardcoded change for mock replacement
    totalTasks: { value: tasksCount[0]?.count ?? 0, change: 2 },
    inReviews: { value: inReviews, change: 12 },
    completedTasks: { value: completed, change: 15 },
  };
}

export async function getPerformanceData() {
  return await db.select().from(performanceMetrics).orderBy(performanceMetrics.id);
}

export async function getTodayTasks() {
  const result = await db.select().from(tasks);
  return result.map(t => ({
    ...t,
    id: t.id.toString(),
    projectId: `p${t.projectId}`
  }));
}

export async function getTasks() {
  return await db.select().from(tasks);
}

export async function getFinanceData() {
  return await db.select().from(finance).orderBy(finance.date);
}
