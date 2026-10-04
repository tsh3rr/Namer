import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
console.log("✓ Datenbank ist auf dem neuesten Stand");
client.close();
