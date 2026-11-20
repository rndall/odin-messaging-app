import z from "zod"

export const conversationTypes = ["direct", "group"] as const
export type ConversationType = (typeof conversationTypes)[number]

// GET /
export const conversationsResponseSchema = z.object({
  id: z.uuid(),
  type: z.enum(conversationTypes),
  display: z.object({
    title: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  lastMessage: z
    .object({
      senderId: z.number().int().positive(),
      content: z.string(),
      createdAt: z.string(),
      editedAt: z.string().nullable(),
    })
    .nullable(),
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
