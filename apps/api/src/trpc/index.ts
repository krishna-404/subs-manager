import { TRPCError, initTRPC } from '@trpc/server';
import { authenticateReq } from '../services/authenticateReq.service';
import { Context } from './router';

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(async ({ next, ctx }) => {
  try {
    const user = await authenticateReq(ctx.req.cookies.access_token, ctx.req.headers['user-agent']);

    const adminUserIds = [3];
    const isTeziAdmin = adminUserIds.includes(user.user_id) ? true : false;
    return next({
      ctx: {
        isTeziAdmin,
        user,
      },
    });
  } catch (error: any) {
    throw new TRPCError({
      code: error.message
    });
  };
});

const isTeziAdmin = t.middleware(({ next, ctx }) => {
  // @ts-ignore
  if (!ctx.isTeziAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
    });
  };
  return next();
});

export const middleware = t.middleware;
export const protectedProcedure = t.procedure.use(isAuthed);
export const publicProcedure = t.procedure;
export const teziAdminProcedure = t.procedure.use(isAuthed).use(isTeziAdmin);//.use(isTeziAdmin);
export const router = t.router;