import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env" });

// export default defineConfig({
//   schema: "./db/schema.js",
//   out: "./drizzle",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: "postgresql://heeraAdmin:thisIs1h3P4ssw0rd@localhost:5432/heeraBills",
//     user: "heeraAdmin",
//     password: "thisIs1h3P4ssw0rd",
//     database: "heeraBills",
//   },
// });

export default defineConfig({
  schema: "./db/schema.js",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
