"use server";

import { db } from "../db";
import { tasks, projects } from "../db/schema";
import { TaskSchema, type TaskInput } from "../validations";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTask(data: TaskInput) {
  const result = TaskSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid task data");
  }

  // Get project to copy name and color to task for simplicity
  const projectRows = await db.select().from(projects).where(eq(projects.id, result.data.projectId));
  if (!projectRows.length) {
    throw new Error("Project not found");
  }
  const project = projectRows[0];

  await db.transaction(async (tx) => {
    // 1. Create the task
    await tx.insert(tasks).values({
      name: result.data.name,
      projectId: result.data.projectId,
      projectName: project.name,
      projectColor: project.color,
      dueDate: result.data.dueDate,
      isCompleted: false,
    });

    // 2. Re-sync counters from source of truth (tasks table)
    await tx
      .update(projects)
      .set({
        totalTasks: sql`(select count(*)::int from ${tasks} where ${tasks.projectId} = ${result.data.projectId})`,
        completedTasks: sql`(select count(*)::int from ${tasks} where ${tasks.projectId} = ${result.data.projectId} and ${tasks.isCompleted} = true)`,
        progress: sql`case when (select count(*) from ${tasks} where ${tasks.projectId} = ${result.data.projectId}) = 0 then 0 else floor(((select count(*) from ${tasks} where ${tasks.projectId} = ${result.data.projectId} and ${tasks.isCompleted} = true)::numeric * 100) / (select count(*) from ${tasks} where ${tasks.projectId} = ${result.data.projectId})::numeric)::int end`,
      })
      .where(eq(projects.id, result.data.projectId));
  });

  revalidatePath("/");
  revalidatePath("/projects");
}

export async function updateTask(
  id: number,
  data: Partial<Pick<TaskInput, "name" | "dueDate">>
) {
  const patch: Record<string, any> = {};
  if (typeof data.name === "string") patch.name = data.name;
  if (typeof data.dueDate === "string") patch.dueDate = data.dueDate;

  if (Object.keys(patch).length === 0) return;

  await db.update(tasks).set(patch).where(eq(tasks.id, id));
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function toggleTaskStatus(id: number, isCompleted: boolean) {
  // We need to know which project to update, so fetch the task first
  const taskRows = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!taskRows.length) return;
  const task = taskRows[0];
  if (!task.projectId) return;

  // Don't update if nothing changed
  if (task.isCompleted === isCompleted) return;

  await db.transaction(async (tx) => {
    await tx.update(tasks).set({ isCompleted }).where(eq(tasks.id, id));

    // Re-sync counters to prevent drift (fixes ratios like 2/1).
    await tx
      .update(projects)
      .set({
        totalTasks: sql`(select count(*)::int from ${tasks} where ${tasks.projectId} = ${task.projectId!})`,
        completedTasks: sql`(select count(*)::int from ${tasks} where ${tasks.projectId} = ${task.projectId!} and ${tasks.isCompleted} = true)`,
        progress: sql`case when (select count(*) from ${tasks} where ${tasks.projectId} = ${task.projectId!}) = 0 then 0 else floor(((select count(*) from ${tasks} where ${tasks.projectId} = ${task.projectId!} and ${tasks.isCompleted} = true)::numeric * 100) / (select count(*) from ${tasks} where ${tasks.projectId} = ${task.projectId!})::numeric)::int end`,
      })
      .where(eq(projects.id, task.projectId!));
  });

  revalidatePath("/");
  revalidatePath("/projects");
}

export async function deleteTask(id: number) {
  const taskRows = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!taskRows.length) return;
  const task = taskRows[0];

  await db.transaction(async (tx) => {
    await tx.delete(tasks).where(eq(tasks.id, id));

    if (task.projectId) {
      await tx
        .update(projects)
        .set({
          totalTasks: sql`(select count(*)::int from ${tasks} where ${tasks.projectId} = ${task.projectId!})`,
          completedTasks: sql`(select count(*)::int from ${tasks} where ${tasks.projectId} = ${task.projectId!} and ${tasks.isCompleted} = true)`,
          progress: sql`case when (select count(*) from ${tasks} where ${tasks.projectId} = ${task.projectId!}) = 0 then 0 else floor(((select count(*) from ${tasks} where ${tasks.projectId} = ${task.projectId!} and ${tasks.isCompleted} = true)::numeric * 100) / (select count(*) from ${tasks} where ${tasks.projectId} = ${task.projectId!})::numeric)::int end`,
        })
        .where(eq(projects.id, task.projectId!));
    }
  });

  revalidatePath("/");
  revalidatePath("/projects");
}

// Friendly aliases to match the UI wording in this project.
export const addTask = createTask;
