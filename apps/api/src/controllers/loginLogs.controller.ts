import { db } from "../db/drizzleDB";
import { T_LoginLogs_Insert, login_logs_table } from "../db/schemas";

export const insertLoginLog = (values: T_LoginLogs_Insert) => db
.insert(login_logs_table)
.values(values)
.returning({
  login_id: login_logs_table.id
})
.then(res => res[0])