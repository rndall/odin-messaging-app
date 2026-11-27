import z from "zod"
import { cursorResponseSchema } from "./pagination.ts"

export const conversationTypes = ["direct", "group"] as const
export type ConversationType = (typeof conversationTypes)[number]

// GET /
export const conversationsResponseSchema = z.object({
  id: z.uuid(),
  type: z.enum(conversationTypes),
  display: z.object({
    title: z.string(),
    avatarUrl: z.url().nullable(),
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
  type: z.enum(conversationTypes),
  name: z.string().nullable(),
})
export type StartOrGetConvoResponse = z.infer<
  typeof startOrGetConvoResponseSchema
>

// GET /:conversationId
export const conversationParamsSchema = z.object({
  conversationId: z.uuid(),
})
export type ConversationParams = z.infer<typeof conversationParamsSchema>

export const conversationResponseSchema = z.object({
  id: z.string(),
  type: z.enum(conversationTypes),
  display: z.object({
    title: z.string(),
    avatarUrl: z.url().nullable(),
  }),
})
export type ConversationResponse = z.infer<typeof conversationResponseSchema>

// GET /:conversationId/messages
export const messageCursorSchema = z.object({
  id: z.uuid(),
  createdAt: z.coerce.date(),
})
export type MessageCursor = z.infer<typeof messageCursorSchema>

export const messagesSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  createdAt: z.string(),
  editedAt: z.string().nullable(),
  sender: z.object({
    id: z.number().int().positive(),
    username: z.string(),
    profileInfo: z
      .object({
        displayName: z.string().nullable(),
        avatarUrl: z.url().nullable(),
      })
      .nullable(),
  }),
})
export type Messages = z.infer<typeof messagesSchema>

export const messagesResponseSchema = z.object({
  data: z.array(messagesSchema),
  pagination: cursorResponseSchema,
})
export type MessagesResponse = z.infer<typeof messagesResponseSchema>

export const sendMessageBodySchema = z.object({
  conversationId: z.uuid(),
  content: z.string().trim().min(1).max(250),
})
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>

export const newMessageSchema = z.object({
  conversationId: z.uuid(),
  content: z.string(),
  senderId: z.number().int().positive(),
})
export type NewMessage = z.infer<typeof newMessageSchema>
