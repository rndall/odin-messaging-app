import z, { ZodType } from "zod"

export const emptyToUndef = <T extends ZodType>(schema: T) =>
  z.preprocess((v) => v || undefined, schema)
