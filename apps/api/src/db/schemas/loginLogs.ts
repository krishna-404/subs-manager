import { sql } from "drizzle-orm";
import { bigint, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user_table } from "./users";

export const login_logs_table = pgTable('login_logs', {
  browser_name: text('browser_name'),
  browser_version: text('browser_version'),
  cpu_architecture: text('cpu_architecture'),
  device_model: text('device_model'),
  device_type: text('device_type'),
  device_vendor: text('device_vendor'),
  engine_name: text('engine_name'),
  engine_version: text('engine_version'),
  id: serial('id').primaryKey(),
  ip_address: text('ip_address'),
  mobile_number: bigint('mobile_number', {mode: 'number'}),
  og_id: integer('og_id'),
  os_name: text('os_name'),
  os_version: text('os_version'),
  ua: text('ua'),
  user_email: text('user_email'),
  
  // relations
  user_id: integer('user_id').references(() => user_table.id, { onUpdate: 'no action', onDelete: 'no action'}),

  //defaults
  created_at: timestamp("created_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  status: text('status').notNull(),
});

export const loginLogsInsertZod = createInsertSchema(login_logs_table);
export const loginLogsSelectZod = createSelectSchema(login_logs_table);

export type T_LoginLogs_Insert = z.infer<typeof loginLogsInsertZod>;
export type T_LoginLogs_Select = z.infer<typeof loginLogsSelectZod>;