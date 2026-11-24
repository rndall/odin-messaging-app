import z from "zod"

import { emptyToUndef, limitSchema } from "../utils.ts"

// GET /
export const usersQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: emptyToUndef(limitSchema.optional().default(10)),
})
export type UsersQueryInput = z.input<typeof usersQuerySchema>
export type UsersQuery = z.infer<typeof usersQuerySchema>

export const usersReturnSchema = z.object({
  id: z.number().positive(),
  username: z.string(),
  profileInfo: z
    .object({
      displayName: z.string().nullable(),
      avatarUrl: z.url().nullable(),
    })
    .nullable(),
})
export type UsersReturn = z.infer<typeof usersReturnSchema>
