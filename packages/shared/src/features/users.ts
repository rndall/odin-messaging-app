import z from "zod"

import { emptyToUndef } from "../utils.ts"

// GET /
export const usersQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: emptyToUndef(
    z.coerce.number().int().min(1).max(100).default(10).optional()
  ),
})
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
