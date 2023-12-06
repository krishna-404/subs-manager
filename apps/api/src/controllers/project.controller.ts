import { eq, getTableColumns, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/drizzleDB";
import { projectInsertZod, projectSelectZod, project_table } from "../db/schemas";
import { protectedProcedure, router } from "../trpc";
import exclude from "../utils/exclude";
import { zodCustomFindFirstSchema } from "../utils/zodCustomSelectSchema";

export const projectController = router({
  countAndMaxUpdatedAt: protectedProcedure
    .query(() => db
      .select({
        count: sql<number>`cast(count(${project_table.id}) as int)`,
        max_updated_at: sql<string>`max(${project_table.updated_at})`
      })
      .from(project_table)
      .where(eq(project_table.status, 'Active'))
      .then(res => res[0])
    ),
  create: protectedProcedure
    .input(projectInsertZod)
    .mutation(({input}) => db.insert(project_table).values(input).returning()
      .then(insertedProject => insertedProject[0])),
  delete: protectedProcedure
    .input(z.object({id: z.number().positive()}))
    .mutation(({input}) => db
      .delete(project_table)
      .where(eq(project_table.id, input.id))
      .returning()
      .then(res => res[0])
    ),
  getById: protectedProcedure
    .input(z.object({id: z.number().positive()}))
    .query(({input}) => db
      .select()
      .from(project_table)
      .where(eq(project_table.id, input.id))
      .then(res => res[0])
    ),
  findFirst: protectedProcedure
    .input(zodCustomFindFirstSchema(Object.keys(getTableColumns(project_table))))
    // @ts-ignore
    .query(({input}) => db.query.project_table.findFirst({
      columns: {},
      with:{
        dev_company: {
          columns: {
            id: true,
            name: true
          }
        }
      }
    })),
  getList: protectedProcedure
    .query(() => db
      .select()
      .from(project_table)
      .where(eq(project_table.status, 'Active'))
    ),
  update: protectedProcedure
    .input(projectSelectZod.partial({
      created_at: true,
      dev_company_id: true,
      name: true,
      og_id: true,
      status: true,
      updated_at: true
    }))
    .mutation(({input}) => db
      .update(project_table)
      .set({
        ...(exclude(input, ['id'])),
        updated_at: new Date().toISOString()
      })
      .where(eq(project_table.id, input.id))
      .returning()
      .then(res => res[0])
    )
});