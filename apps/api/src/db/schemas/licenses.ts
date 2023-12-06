import { relations, sql } from "drizzle-orm";
import { bigint, date, foreignKey, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { dev_company_table } from "./devCompanies";
import { og_table } from "./ownerGroups";
import { project_table } from "./projects";
import { user_table } from "./users";

export const license_table = pgTable('license', {
  email: text('email'),
  // emailVerificationDetails: json
  end_date: date('end_date').notNull(),
  id: uuid('uuid1').primaryKey(), //license id
  mobile_number: bigint('mobile_number', { mode: 'number'}),
  // mobileNumberVerificationDetails: json
  start_date: date('start_date').notNull(),

  //relations
  dev_company_id: integer('dev_company_id').notNull().references(() => dev_company_table.id), //example: teziapp
  project_id: integer('project_id').notNull().references(() => project_table.id, {
    onDelete: 'restrict',
    onUpdate: 'cascade'
  }), //example: smart-agent
  og_id: integer('og_id').notNull(), // example: 1

  //defaults
  created_at: timestamp("created_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  status: text('status', { enum: ["Active"] }).default('Active').notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
}, (t) => ({
  ogReference: foreignKey({
    columns: [t.dev_company_id, t.og_id],
    foreignColumns: [og_table.dev_company_id, og_table.id]
  }).onDelete('restrict').onUpdate('cascade')
}));

export const licenses_relations = relations(license_table, ({ one }) => ({
  dev_company: one(dev_company_table, {
    fields: [license_table.dev_company_id],
    references: [dev_company_table.id]
  }),
  project: one(project_table, {
    fields: [license_table.project_id],
    references: [project_table.id]
  }),
  og: one(og_table, {
    fields: [license_table.dev_company_id, license_table.og_id],
    references: [og_table.dev_company_id, og_table.id]
  }),
  user_by_email: one(user_table, {
    fields: [license_table.email],
    references: [user_table.email],
    relationName: 'user_licenses_by_email'
  }),
  user_by_mobile: one(user_table, {
    fields: [license_table.mobile_number],
    references: [user_table.mobile_number],
    relationName: 'user_licenses_by_mobile'
  })
}));

export const licenseInsertZod = createInsertSchema(license_table, {
    mobile_number: z.coerce.number()
  })
  // .refine(
  //   schema => {
  //     console.log(schema.email, schema.mobile_number);
  //     return Boolean(schema.email || schema.mobile_number);
  //   }, 
  //   {
  //     message: 'Need one of Email or Mobile Number.',
  //     path: ['mobile_number'] //--> cant use ['email', 'mob_no'] as that resolves as email.mob_no hence using superRefine.
  //   }
  // )
  .superRefine(({email, mobile_number}, ctx) => {
    if (!email && !mobile_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'string',
        message: 'Need either Email or Mobile Number.',
        path: ['email'],
        received: 'null',

      });

      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'number',
        message: 'Need either Email or Mobile Number.',
        path: ['mobile_number'],
        received: 'null',

      });
    }
  });

export const licenseSelectZod = createSelectSchema(license_table, {
    mobile_number: z.coerce.number()
  })
  .superRefine(({email, mobile_number}, ctx) => {
    if (!email && !mobile_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'string',
        message: 'Need either Email or Mobile Number.',
        path: ['email'],
        received: 'null',

      });

      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: 'number',
        message: 'Need either Email or Mobile Number.',
        path: ['mobile_number'],
        received: 'null',

      });
    }
  });

export type T_License_Insert = z.infer<typeof licenseInsertZod>;
export type T_License_Select = z.infer<typeof licenseSelectZod>;