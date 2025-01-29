import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { client, db } from "./connection.js";

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./supabase/migrations" });
    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

// Execute the migration function
runMigrations();
