import z from "zod"

// GET /
export const usersQuerySchema = z.object({
  search: z.string().trim().optional(),
})
export type UsersQuery = z.infer<typeof usersQuerySchema>

export const usersReturnSchema = z.object({
  id: z.number().positive(),
  username: z.string(),
  profileInfo: z.object({
    displayName: z.string().nullable(),
    avatarUrl: z.url().nullable(),
  }),
})
export type UsersReturn = z.infer<typeof usersReturnSchema>
