import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/drizzleDB";
import { ogInsertZod, ogSelectZod, og_table } from "../db/schemas";
import { protectedProcedure, router } from "../trpc";
import exclude from "../utils/exclude";

export const ogController = router({
  countAndMaxUpdatedAt: protectedProcedure
    .query(() => db
      .select({
        count: sql<number>`cast(count(${og_table.id}) as int)`,
        max_updated_at: sql<string>`max(${og_table.updated_at})`
      })
      .from(og_table)
      .where(eq(og_table.status, 'Active'))
      .then(res => res[0])
    ),
  create: protectedProcedure
    .input(ogInsertZod)
    .mutation(({input}) => db
      .insert(og_table)
      .values(input)
      .returning()
      .then(res => res[0])
    ),
  delete: protectedProcedure
    .input(z.object({
      id: z.number().positive(),
      dev_company_id: z.number().positive()
    }))
    .mutation(({input}) => db
      .delete(og_table)
      .where(and(eq(og_table.dev_company_id, input.dev_company_id), eq(og_table.id, input.id)))
      .returning()
      .then(res => res[0])
    ),
  getById: protectedProcedure
    .input(z.object({
      id: z.number().positive(),
      dev_company_id: z.number().positive()
    }))
    .query(({input}) => db
      .select()
      .from(og_table)
      .where(and(eq(og_table.dev_company_id, input.dev_company_id), eq(og_table.id, input.id)))
      .then(res => res[0])
    ),
  getList: protectedProcedure
    .query(() => db
      .select()
      .from(og_table)
      .where(eq(og_table.status, 'Active'))
    ),
  getMaxOgId: protectedProcedure
    .input(z.object({dev_company_id: z.number().positive()}))
    .query(({input}) => db
      .select({
        maxOgId: sql<number>`max(${og_table.id})`
      })
      .from(og_table)
      .where(eq(og_table.dev_company_id, input.dev_company_id))
      .then(res => (res[0].maxOgId ? res[0] : { maxOgId: 0}))
    ),
  update: protectedProcedure
    .input(ogSelectZod.partial({
      created_at: true,
      name: true,
      status: true,
      updated_at: true
    }))
    .mutation(({input}) => db
      .update(og_table)
      .set({
        ...(exclude(input, ['id', 'dev_company_id'])),
        updated_at: new Date().toISOString()
      })
      .where(and(eq(og_table.dev_company_id, input.dev_company_id), eq(og_table.id, input.id)))
      .returning()
      .then(res => res[0])
    )
})