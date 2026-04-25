"use server";

import { db } from "../db";
import { clients } from "../db/schema";
import { ClientSchema, type ClientInput } from "../validations";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createClient(data: ClientInput) {
  const result = ClientSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid client data");
  }

  try {
    await db.insert(clients).values(result.data);
    revalidatePath("/clients");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: "A client with this email already exists." };
    }
    return { error: "Failed to create client." };
  }
}

export async function updateClient(id: number, data: ClientInput) {
  const result = ClientSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid client data");
  }

  try {
    await db.update(clients).set(result.data).where(eq(clients.id, id));
    revalidatePath("/clients");
    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: "A client with this email already exists." };
    }
    return { error: "Failed to update client." };
  }
}

export async function deleteClient(id: number) {
  await db.delete(clients).where(eq(clients.id, id));
  revalidatePath("/clients");
  revalidatePath("/");
  revalidatePath("/projects");
}
