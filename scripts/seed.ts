import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";
import { performanceChartData, todayTasks } from "../mock-data/dashboard";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
// Use max: 1 to avoid pool errors during sequential script execution
const client = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  max: 1,
});
const db = drizzle(client, { schema });

const projectSeeds = [
  {
    name: "Fintech Project",
    color: "blue",
    status: "in_progress",
    progress: 70,
    totalTasks: 20,
    completedTasks: 14,
    dueDate: "12 Mar 2024",
    ownerName: "Michael M.",
    ownerAvatarSeed: "michael",
  },
  {
    name: "Design System",
    color: "violet",
    status: "in_progress",
    progress: 45,
    totalTasks: 15,
    completedTasks: 7,
    dueDate: "20 Mar 2024",
    ownerName: "Sarah K.",
    ownerAvatarSeed: "sarah",
  },
  {
    name: "Backend API",
    color: "cyan",
    status: "completed",
    progress: 100,
    totalTasks: 12,
    completedTasks: 12,
    dueDate: "10 Mar 2024",
    ownerName: "James L.",
    ownerAvatarSeed: "james",
  },
  {
    name: "Marketing",
    color: "pink",
    status: "on_hold",
    progress: 30,
    totalTasks: 8,
    completedTasks: 2,
    dueDate: "25 Mar 2024",
    ownerName: "Emily R.",
    ownerAvatarSeed: "emily",
  },
  {
    name: "Mobile App",
    color: "amber",
    status: "in_progress",
    progress: 60,
    totalTasks: 25,
    completedTasks: 15,
    dueDate: "18 Mar 2024",
    ownerName: "David T.",
    ownerAvatarSeed: "david",
  },
];

async function seed() {
  console.log("Seeding database...");

  // Clean up existing data
  await db.delete(schema.tasks);
  await db.delete(schema.projects);
  await db.delete(schema.users);
  await db.delete(schema.clients);
  await db.delete(schema.performanceMetrics);
  await db.delete(schema.finance);

  // Generate a hashed password for all seeded users
  const defaultPassword = await bcrypt.hash("password123", 10);

  // Seed Users (Updated for Auth.js Schema)
  const insertedUsers = await db
    .insert(schema.users)
    .values(
      projectSeeds.map((p) => ({
        name: p.ownerName,
        password: defaultPassword, // Replaced email/avatarSeed with hashed password
      })),
    )
    .returning();

  // Seed Clients
  const insertedClients = await db
    .insert(schema.clients)
    .values([
      { name: "Acme Corp", email: "contact@acme.com", phone: "555-0100" },
      { name: "Globex", email: "hello@globex.com", phone: "555-0101" },
    ])
    .returning();

  // Seed Projects
  const insertedProjects = await db
    .insert(schema.projects)
    .values(
      projectSeeds.map((p, index) => ({
        name: p.name,
        color: p.color,
        status: p.status as any,
        progress: p.progress,
        totalTasks: p.totalTasks,
        completedTasks: p.completedTasks,
        dueDate: p.dueDate,
        ownerId: insertedUsers[index].id,
        clientId: insertedClients[index % insertedClients.length].id,
      })),
    )
    .returning();

  // Seed Tasks
  await db.insert(schema.tasks).values(
    todayTasks.map((t) => {
      const matchIndex = projectSeeds.findIndex(
        (p) => p.name === t.projectName,
      );
      const projectId =
        matchIndex !== -1
          ? insertedProjects[matchIndex].id
          : insertedProjects[0].id;
      return {
        name: t.name,
        projectId,
        projectName: t.projectName,
        projectColor: t.projectColor,
        dueDate: t.dueDate,
      };
    }),
  );

  // Seed Performance Metrics
  await db.insert(schema.performanceMetrics).values(
    performanceChartData.map((d) => ({
      day: d.day,
      value: d.value,
      isHighlight: d.isHighlight,
    })),
  );

  // Seed Finance
  await db.insert(schema.finance).values([
    {
      amount: "5000.00",
      type: "income",
      category: "Services",
      date: new Date(),
    },
    {
      amount: "1200.00",
      type: "expense",
      category: "Software",
      date: new Date(),
    },
    {
      amount: "3000.00",
      type: "income",
      category: "Consulting",
      date: new Date(),
    },
    {
      amount: "800.00",
      type: "expense",
      category: "Marketing",
      date: new Date(),
    },
  ]);

  console.log("Seeding complete!");
  await client.end();
}

seed().catch(async (err) => {
  console.error("Seeding failed!", err);
  await client.end();
  process.exit(1);
});
