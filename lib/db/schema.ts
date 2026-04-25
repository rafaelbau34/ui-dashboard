import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "in_progress",
  "completed",
  "on_hold",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  password: text("password").notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  status: projectStatusEnum("status").notNull(),
  progress: integer("progress").notNull(),
  totalTasks: integer("totalTasks").notNull(),
  completedTasks: integer("completedTasks").notNull(),
  // Legacy display value (kept as text to avoid casting failures on existing DBs).
  dueDate: text("dueDate").notNull(),
  // New sortable date value (Mexico datepicker will write here).
  dueDateAt: timestamp("due_date", { mode: "date" }),
  totalBudget: numeric("total_budget", { precision: 12, scale: 2 })
    .$type<number>()
    .notNull()
    .default(0),
  category: text("category").notNull().default("Development"),
  ownerId: integer("ownerId").references(() => users.id),
  clientId: integer("clientId").references(() => clients.id),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  projectId: integer("projectId").references(() => projects.id),
  projectName: text("projectName").notNull(),
  projectColor: text("projectColor").notNull(),
  dueDate: text("dueDate").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  value: integer("value").notNull(),
  isHighlight: boolean("is_highlight").default(false),
});

export const finance = pgTable("finance", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
});
