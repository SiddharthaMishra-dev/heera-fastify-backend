import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

// Create a PostgreSQL client
export const client = postgres(connectionString, { prepare: false });

// Initialize the database connection using drizzle
const db = drizzle(client, { schema: schema });

// Export the database instance
export { db };

// Optional: Connect to the database and log the connection status
