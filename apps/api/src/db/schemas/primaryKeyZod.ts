import { z } from "zod";

export const idOnlyZod = z.object({id: z.number().positive()});