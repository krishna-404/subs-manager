import { relations, sql } from "drizzle-orm";
import { bigint, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { license_table } from "./licenses";
import { login_logs_table } from "./loginLogs";


export const user_table = pgTable('user', {
  email: text('email').unique(),
  id: serial('id').primaryKey(),
  mobile_number: bigint('mobile_number', { mode: 'number'}).unique(),
  name: text('name').notNull(),
  og_email: text('og_email'),
  password: text('password').notNull(),
  role: text('role').$type<'Admin' | 'Owner' | 'Maintainer'>().notNull().default('Maintainer'),
  short_name: text('short_name'),

  //defaults
  created_at: timestamp("created_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
  status: text('status', { enum: ["Active"] }).default('Active').notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string'}).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
});

export const user_relations = relations(user_table, ({ many }) => ({
  licenses_by_email: many(license_table, {relationName: 'user_licenses_by_email'}),
  licenses_by_mobile: many(license_table, { relationName: 'user_licenses_by_mobile'}),
  loginLogs: many(login_logs_table)
}));

const schemaCoersions = {
  email: z.string().email().nullish(),
  mobile_number: z.coerce.number().nullish(),
  og_email: z.string().email().nullish(),
  role: z.enum(['Admin', 'Owner', 'Maintainer'])
};

export const userInsertZod= createInsertSchema(user_table, schemaCoersions)
  .extend({confirm: z.string()})
  .refine(({confirm, password}) => confirm === password, {
    message: 'Passwords dont match',
    path: ['confirm']
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

export const userSelectZod= createSelectSchema(user_table, schemaCoersions)
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

export type T_User_Insert = z.infer<typeof userInsertZod>;
export type T_User_Select = z.infer<typeof userSelectZod>;