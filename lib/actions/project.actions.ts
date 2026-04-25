"use server";

import { db } from "../db";

import { projects, tasks, users } from "../db/schema";
import { ProjectSchema, type ProjectInput } from "../validations";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProject(data: ProjectInput) {
  const result = ProjectSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid project data");
  }

  const adminUser = await db.select().from(users).limit(1);
  const validOwnerId = adminUser[0]?.id ?? 1;

  await db.insert(projects).values({
    ...result.data,
    // Keep a formatted text version for existing UI while also storing a sortable date.
    dueDate: result.data.dueDate.toISOString(),
    dueDateAt: result.data.dueDate,
    status: result.data.status as any,
    ownerId: validOwnerId,
  });

  revalidatePath("/projects");
  revalidatePath("/");
}

export async function updateProject(id: number, data: ProjectInput) {
  const result = ProjectSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid project data");
  }

  await db
    .update(projects)
    .set({
      ...result.data,
      dueDate: result.data.dueDate.toISOString(),
      dueDateAt: result.data.dueDate,
      status: result.data.status as any,
    })
    .where(eq(projects.id, id));

  revalidatePath("/projects");
  revalidatePath("/");
}

export async function deleteProject(id: number) {
  // First delete associated tasks to prevent foreign key violation
  await db.delete(tasks).where(eq(tasks.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/projects");
  revalidatePath("/");
}
