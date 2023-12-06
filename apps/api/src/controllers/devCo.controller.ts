import { eq } from "drizzle-orm";
import { db } from "../db/drizzleDB";
import { devCoInsertZod, devCoSelectZod, dev_company_table } from "../db/schemas";
import { idOnlyZod } from "../db/schemas/primaryKeyZod";
import { router, teziAdminProcedure } from "../trpc";
import exclude from "../utils/exclude";

export const devCompanyController = router({
  create: teziAdminProcedure
    .input(devCoInsertZod)
    .mutation(({input}) => 
      db.insert(dev_company_table).values(input).returning()
        .then(insertedRes => insertedRes[0])
    ),
  delete: teziAdminProcedure
    .input(idOnlyZod)
    .mutation(({input}) => 
      db.delete(dev_company_table).where(eq(dev_company_table.id, input.id)).returning()
        .then(devCompany => devCompany[0])
    ),
  getById: teziAdminProcedure
    .input(idOnlyZod)
    .query(({input}) => db.select().from(dev_company_table).where(eq(dev_company_table.id, input.id))
      .then(devCompany => devCompany[0])
    ),
  getList: teziAdminProcedure
    .query(() => db
      .select()
      .from(dev_company_table)
      .where(eq(dev_company_table.status, 'Active'))
    ),
  update: teziAdminProcedure
    .input(devCoSelectZod.partial({
      status: true,
      created_at: true,
      updated_at: true,
    }))
    .mutation(({input}) => db
      .update(dev_company_table)
      .set({
        ...(exclude(input, ['id'])),
        updated_at: new Date().toISOString()
      })
      .where(eq(dev_company_table.id, input.id))
      .returning()
      .then(devCompany => devCompany[0])
    )
});