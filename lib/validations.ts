import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  color: z.enum(["blue", "violet", "cyan", "pink", "amber"], {
    errorMap: () => ({ message: "Please select a project color" }),
  }),
  status: z.enum(["in_progress", "completed", "on_hold"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
  progress: z.number().min(0).max(100),
  totalTasks: z.number().min(0),
  completedTasks: z.number().min(0),
  dueDate: z.string().min(1, "Due date is required"),
  ownerId: z.number().min(1, "Owner is required"),
  clientId: z.number().min(1, "Client is required"),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

export const ClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
});

export type ClientInput = z.infer<typeof ClientSchema>;

export const TaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  projectId: z.coerce.number().min(1, "Project is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type TaskInput = z.infer<typeof TaskSchema>;
