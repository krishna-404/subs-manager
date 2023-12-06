import { relations, sql } from "drizzle-orm";
import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { dev_company_table } from "./devCompanies";
import { license_table } from "./licenses";

export const og_table = pgTable('og', {
  email: text('email').notNull().unique(),
  id: integer('id').notNull(),
  name: text('name').notNull(), //example: PM Agency

  //relations
  dev_company_id: integer('dev_company_id').notNull()
    .references(() => dev_company_table.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade'
    }
  ),

  //defaults
  created_at: timestamp("created_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  status: text('status', { enum: ["Active"] }).default('Active').notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
}, (table) => ({
  pk: primaryKey(table.dev_company_id, table.id),
}));

export const og_relations = relations(og_table, ({ one, many }) => ({
  dev_company: one(dev_company_table, {
    fields: [og_table.dev_company_id],
    references: [dev_company_table.id],
  }),
  licenses: many(license_table),
}));

const schemaCoersions = {
  email: z.string().email(),
};

export const ogInsertZod = createInsertSchema(og_table, schemaCoersions);
export const ogSelectZod = createSelectSchema(og_table, schemaCoersions);

export type T_Og_Insert = z.infer<typeof ogInsertZod>;
export type T_Og_Select = z.infer<typeof ogSelectZod>;