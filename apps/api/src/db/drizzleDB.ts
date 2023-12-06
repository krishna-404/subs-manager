import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import envConfig from "../configs/envConfig";
import * as schema from './schemas';

const pool = new Pool({
  database: envConfig.DB_NAME,
  host: envConfig.DB_HOST,
  password: envConfig.DB_PASS,
  port: envConfig.DB_PORT,
  user: envConfig.DB_USER,
});
 
export const db = drizzle(pool, {logger: false, schema});