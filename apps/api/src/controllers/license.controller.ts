import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/drizzleDB";
import { licenseInsertZod, licenseSelectZod, license_table } from "../db/schemas";
import { getActiveLicCount, zodgetActiveLicCountSchema } from "../services/licenses.service";
import { protectedProcedure, router, teziAdminProcedure } from "../trpc";
import exclude from "../utils/exclude";

export const licenseController = router({
  create: teziAdminProcedure
    .input(licenseInsertZod)
    .mutation(({input}) => db
      .insert(license_table)
      .values(input)
      .returning()
      .then(res => res[0])
    ),
  delete: teziAdminProcedure
    .input(z.object({id: z.string()}))
    .mutation(({input}) => db
      .delete(license_table)
      .where(eq(license_table.id, input.id))
      .returning()
      .then(res => res[0])
    ),
  getActiveLicCount: protectedProcedure
    .input(zodgetActiveLicCountSchema)
    .query(getActiveLicCount),
  getById: protectedProcedure
    .input(z.object({id: z.string()}))
    .query(({input}) => db
      .select()
      .from(license_table)
      .where(eq(license_table.id, input.id))
      .then(res => res[0])
    ),
  getList: protectedProcedure
    .query(() => db
      .select()
      .from(license_table)
      .where(eq(license_table.status, 'Active'))
    ),
  update: teziAdminProcedure
    .input(licenseSelectZod)
    .mutation(({input}) => db
      .update(license_table)
      .set({
        ...(exclude(input, ['id'])),
        updated_at: new Date().toISOString()
      })
      .where(eq(license_table.id, input.id))
      .returning()
      .then(res => res[0])
    )
});