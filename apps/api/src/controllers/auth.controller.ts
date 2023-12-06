import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";
import envConfig from "../configs/envConfig";
import { db } from "../db/drizzleDB";
import { loginZod, userInsertZod, userSelectZod, user_table } from "../db/schemas";
import { idOnlyZod } from "../db/schemas/primaryKeyZod";
import { getUserLicense } from "../services/getUserLicense.service";
import { getAccessToken } from "../services/token.service";
import { protectedProcedure, publicProcedure, router, teziAdminProcedure } from "../trpc";
import { encryptPassword, isPasswordMatch } from "../utils/encryption";
import exclude from "../utils/exclude";
import { getIpAddress } from "../utils/getIpAddress";
import { uaParser } from "../utils/uaParser";
import { insertLoginLog } from "./loginLogs.controller";

const { password, ...nonPwCols } = getTableColumns(user_table);

export const authController = router({
  signup: publicProcedure
    .input(userInsertZod)
    .mutation(async ({input}) => {
      // hash the password before 
      input.password = await encryptPassword(input.password);

      return db
        .insert(user_table)
        .values(input)
        .returning(nonPwCols)
        .then(res => res[0])
  }),
  delete: teziAdminProcedure
    .input(idOnlyZod)
    .mutation(({input}) => db
      .delete(user_table)
      .where(eq(user_table.id, input.id))
      .returning(nonPwCols)
      .then(res => res[0])
    ),
  login: publicProcedure
    .input(loginZod)
    .mutation(async ({ctx, input}) => {
      // check if input is email or phone-number
        let inputType = z.string().email().safeParse(input.emailOrPhone).success 
          ? 'email' as const
          : z.coerce.number().safeParse(input.emailOrPhone).success && 'mobile_number' as const;
        

        if(!inputType) throw new TRPCError({
          code: "BAD_REQUEST",
          message: 'Please enter valid email or Mobile Number.'
        });

      // get user from database
        const userObj = await db.query.user_table.findFirst({
          columns: {
            created_at: false,
            status: false,
            updated_at: false,
          },
          where: and(
            eq(user_table[inputType], input.emailOrPhone),
            eq(user_table.status, 'Active')
          )
        });

      // check password for user
        const isMatch = userObj && await isPasswordMatch(input.password, userObj.password)

        const ua = ctx.req.headers["user-agent"];
        const { parserResults, uaTokenItems } = uaParser(ua);
        const ip_address = getIpAddress(ctx.req);

        const loginLogEntryObj = {
          ...uaTokenItems,
          browser_version: parserResults.browser.version,
          ip_address,
          mobile_number: userObj?.mobile_number || (inputType === 'mobile_number' ? Number(input.emailOrPhone) : null),
          os_version: parserResults.os.version,
          ua: ua,
          user_email: userObj?.email || (inputType === 'email' ? input.emailOrPhone : null),
          user_id: userObj?.id,
        };

        if(!userObj || !isMatch) {
          insertLoginLog({
            ...loginLogEntryObj,
            status: !userObj ? 'No User' : 'Password Mismatch',
          });
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid credentials.'
          })
        };

      // get ownergroupid & include user-obj
        const licenseObj = await getUserLicense(inputType, input.emailOrPhone, envConfig.SUBSMANAGER_PROJECT_ID);

        const { login_id } = await insertLoginLog({
          ...loginLogEntryObj,
          og_id: licenseObj?.og_id,
          status: 'success'
        });
        
        
      // return user with auth-token
        return {
          ...(exclude(userObj, ['password'])),
          ...licenseObj,
          token: getAccessToken({
              login_id,
              user_id: userObj.id,
              ua: uaTokenItems,
              ...licenseObj
            })
        };
    }),
  logout: publicProcedure
    .query(() => console.log('logout succesfull')
    ),
  getById: protectedProcedure
    .input(z.object({id: z.number()}))
    .query(({input}) => db
      .select(nonPwCols)
      .from(user_table)
      .where(eq(user_table.id, input.id))
      .then(res => res[0])
    ),
  getList: protectedProcedure
    .query(() => db
      .select(nonPwCols)
      .from(user_table)
      .where(eq(user_table.status, 'Active'))
    ),
  update: protectedProcedure
    .input(userSelectZod)
    .mutation(({input}) => db
      .update(user_table)
      .set({
        ...(exclude(input, ['id'])),
        updated_at: new Date().toISOString()
      })
      .where(eq(user_table.id, input.id))
      .returning(nonPwCols)
      .then(res => res[0])
    )
});