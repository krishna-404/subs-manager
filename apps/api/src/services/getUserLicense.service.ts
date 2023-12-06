import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/drizzleDB";
import { license_table } from "../db/schemas";

export const getUserLicense = (
  userCheckType: 'email' | 'mobile_number', 
  userCheckValue: string | number, 
  project_id: number
) => db.query.license_table.findFirst({
  columns: {
    og_id: true,
    end_date: true,
    status: true
  },
  where: and(
    eq(license_table[userCheckType], userCheckValue),
    
    // lte(license_table.end_date, format(new Date(), 'yyyy-MM-dd')),
    // eq(license_table.status, 'Active'),
    eq(license_table.project_id, project_id),
  ),
  orderBy: (desc(license_table.start_date)),
}).then((res) => (res && {
  og_id: res?.og_id,
  subscription_end_date: res?.end_date,
  subscription_status: res?.status
}))