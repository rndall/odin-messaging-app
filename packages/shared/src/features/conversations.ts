import z from "zod"

// GET /
export const conversationsResponseSchema = z.object({
  id: z.uuid(),
  type: z.enum(["direct", "group"]),
  name: z.string().nullable(),
})
export type ConversationsResponse = z.infer<typeof conversationsResponseSchema>

// POST /
export const startOrGetConvoBodySchema = z.object({
  toUserId: z.number().int().positive(),
})
export type StartOrGetConvoBody = z.infer<typeof startOrGetConvoBodySchema>

export const startOrGetConvoResponseSchema = z.object({
  id: z.string(),
  type: z.enum(["direct", "group"]),
  name: z.string().nullable(),
})
export type StartOrGetConvoResponse = z.infer<
  typeof startOrGetConvoResponseSchema
>
