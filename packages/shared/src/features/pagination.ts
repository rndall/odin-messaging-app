import z from "zod"

import { emptyToUndef, limitSchema } from "../utils.ts"

// Cursor Pagination
export const createCursorQuerySchema = (defaultLimit = 20) =>
  z.object({
    cursor: z.string().trim().optional(),
    limit: emptyToUndef(limitSchema.optional().default(defaultLimit)),
  })
export type CursorQueryInput = z.input<
  ReturnType<typeof createCursorQuerySchema>
>

export const cursorResponseSchema = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})
export type CursorResponse = z.infer<typeof cursorResponseSchema>
