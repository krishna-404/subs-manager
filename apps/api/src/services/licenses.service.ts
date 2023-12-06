import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/drizzleDB";
import { license_table } from "../db/schemas";

export const zodgetActiveLicCountSchema = z.object({og_id: z.number(), project_id: z.number()});
type T_getActiveLicCountInput = z.infer<typeof zodgetActiveLicCountSchema>;

export const getActiveLicCount = ({input}: {input: T_getActiveLicCountInput}) => db
  .select({
    activeLicCount: sql<number>`cast(count (${license_table.id}) as int)`
  })
  .from(license_table)
  .where(and(
    eq(license_table.project_id, input.project_id),
    eq(license_table.og_id, input.og_id),
    eq(license_table.status, 'Active')
  ))
  .then(res => res[0] || {});