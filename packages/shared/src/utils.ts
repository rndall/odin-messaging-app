import z, { ZodType } from "zod"

export const emptyToUndef = <T extends ZodType>(schema: T) =>
  z.preprocess((v) => v || undefined, schema)

export const getDirectKey = (a: number, b: number) =>
  `${Math.min(a, b)}:${Math.max(a, b)}`
