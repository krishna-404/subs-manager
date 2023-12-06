import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./drizzleDB";
 
migrate(db, { migrationsFolder: "apps/api/src/db/migrations" });