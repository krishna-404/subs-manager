import { and, eq, getOperators } from "drizzle-orm";
import { ZodRawShape, ZodTypeAny, z } from "zod";

const getObjectSingleValue = <K extends string[], V extends ZodTypeAny>(
  keys: K, 
  value: V
) => keys.reduce<ZodRawShape>((acc, key) => ({...acc, [key]: value}), {})

const operators = Object.keys(getOperators())

const whereArray= z.tuple([
  z.enum([operators[0], ...operators.slice(1)]),
  z.string(),
  z.union([z.string(), z.number()])
])

const zodCustomSelectNoWith = <K extends string[]>(tableColumns: K) => z.object({
  columns: z.object(
      getObjectSingleValue(tableColumns, z.boolean().optional())
    ).optional(),
  // limit: z.number().positive().optional(),
  where: z.tuple([
    z.enum([operators[0], ...operators.slice(1)]),
    z.union([z.string(),  whereArray]),
    z.union([z.union([z.string(), z.number()]), whereArray])
  ]).optional(),
  // with: z.record().optional()
});

export const zodCustomFindFirstSchema = <K extends string[]>(
  tableColumns: K
) => zodCustomSelectNoWith(tableColumns)
      .extend({with: z.record(zodCustomSelectNoWith(tableColumns)).optional()});

export const inputToFindFirstSchema = (
  input: z.infer<ReturnType<typeof zodCustomFindFirstSchema>>,
  t: any
): any => ({
  columns: input.columns,
  ...(input.where && {
    where: input.where[0] === 'and'
      ? and(
        // @ts-ignore
          t[input.where[1]],
          // @ts-ignore
          input.where[1]
        )
      : input.where[0] === 'or'
      // @ts-ignore
        ? or(
          // @ts-ignore
          t[input.where[1]],
          input.where[1]
        )
        : input.where[0] === 'eq' && eq(
          // @ts-ignore
          t[input.where[1]],
          input.where[1]
        )
  }),
  ...(input.with && {
    with: input.with
  })
})