import { z } from "zod";

export const loginZod = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
});

export type T_Login = z.infer<typeof loginZod>