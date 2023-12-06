import { relations, sql } from "drizzle-orm";
import { PgColumnBuilderBase, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { dev_company_table } from "./devCompanies";
import { license_table } from "./licenses";

export type T_Pg_Columns = Record<string, PgColumnBuilderBase>

export const project_table = pgTable('project', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), //example: smart-agent

  //relations
  dev_company_id: integer('dev_company_id').notNull().references(() => dev_company_table.id, {
    onDelete: 'restrict',
    onUpdate: 'cascade'
  }),

  //defaults
  created_at: timestamp("created_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  status: text('status', { enum: ["Active"] }).default('Active').notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
});

export const project_relations = relations(project_table, ({ one, many }) => ({
  dev_company: one(dev_company_table, {
    fields: [project_table.dev_company_id],
    references: [dev_company_table.id],
  }),
  licenses: many(license_table),
}));

export const projectInsertZod = createInsertSchema(project_table);

export const projectSelectZod = createSelectSchema(project_table);

export type T_Project_Insert = z.infer<typeof projectInsertZod>;

export type T_Project_Select = z.infer<typeof projectSelectZod>;