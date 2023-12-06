import { Config } from 'drizzle-kit';
import envConfig from './src/configs/envConfig';

export default {
  schema: './src/db/schemas',
  driver: 'pg',
  dbCredentials: {
    database: envConfig.DB_NAME,
    host: envConfig.DB_HOST,
    password: envConfig.DB_PASS,
    port: envConfig.DB_PORT,
    user: envConfig.DB_USER,
  },
  out: './src/db/migrations',
  // tablesFilter: dev_company_table
} satisfies Config