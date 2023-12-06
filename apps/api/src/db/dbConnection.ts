import { sql } from "drizzle-orm";
import logger from "../configs/logger";
import { db } from "./drizzleDB";

export const dbConnection = () => db.execute(sql`SELECT * FROM information_schema.tables;`).then(
  (tables) => {
    // logger.debug(Object.keys(tables).join(', '));
    if (tables?.rowCount && tables.rowCount > 0){
      logger.info(`Connected to SQL Database`);
      return true
    }
    else {
      throw new Error("Database not connected.")
    }
  }
);