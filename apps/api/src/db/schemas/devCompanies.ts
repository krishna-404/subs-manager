import { relations, sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { license_table } from "./licenses";
import { project_table } from "./projects";

export const dev_company_table = pgTable('dev_company', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), //example: teziapp

  //defaults
  created_at: timestamp("created_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  status: text('status', { enum: ["Active"] }).default('Active').notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
});

export const dev_company_relations = relations(dev_company_table, ({ many }) => ({
  licenses: many(license_table),
  projects: many(project_table)
}));

export const devCoInsertZod = createInsertSchema(dev_company_table);

export const devCoSelectZod = createSelectSchema(dev_company_table);

export type T_DevCo_Insert = z.infer<typeof devCoInsertZod>;

export type T_DevCo_Select = z.infer<typeof devCoSelectZod>;