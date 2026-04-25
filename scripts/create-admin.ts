import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in .env.local");
  }

  const client = postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: 1,
  });
  const db = drizzle(client, { schema });

  try {
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash("bacteria", 10);

    console.log("Inserting new user...");
    await db.insert(schema.users).values({
      name: "bacteria",
      password: hashedPassword,
    });

    console.log("User 'bacteria' created successfully!");
  } catch (error) {
    console.error("Failed to create user:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
