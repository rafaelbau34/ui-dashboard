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

    // 2. Increment totalTasks in project
    await tx
      .update(projects)
      .set({ totalTasks: sql`${projects.totalTasks} + 1` })
      .where(eq(projects.id, result.data.projectId));
  });

  revalidatePath("/");
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
    // 1. Update task
    await tx.update(tasks).set({ isCompleted }).where(eq(tasks.id, id));

    // 2. Update project completedTasks count
    const increment = isCompleted ? 1 : -1;
    await tx
      .update(projects)
      .set({ completedTasks: sql`${projects.completedTasks} + ${increment}` })
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
          totalTasks: sql`${projects.totalTasks} - 1`,
          completedTasks: task.isCompleted
            ? sql`${projects.completedTasks} - 1`
            : sql`${projects.completedTasks}`,
        })
        .where(eq(projects.id, task.projectId!));
    }
  });

  revalidatePath("/");
}
