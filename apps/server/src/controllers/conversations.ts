import type { Response } from "express"
import createHttpError from "http-errors"

import { db } from "@workspace/db"
import {
  conversationParamsSchema,
  createCursorQuerySchema,
  messageCursorSchema,
  startOrGetConvoBodySchema,
  type ConversationResponse,
  type ConversationsResponse,
  type MessagesResponse,
  type StartOrGetConvoResponse,
} from "@workspace/shared"
import {
  findConversationById,
  findConversations,
  getDisplay,
  getOrCreateConversation,
} from "../utils/conversations.ts"
import { decodeCursor, encodeCursor } from "../utils/cursor.ts"
import { makeValidatedEndpoint } from "../utils/endpoint.ts"

export const getConversations = makeValidatedEndpoint(
  {},
  async (req, res: Response<ConversationsResponse[]>) => {
    res.json(await findConversations(req.user!.id))
  }
)

export const startOrGetConvo = makeValidatedEndpoint(
  { body: startOrGetConvoBodySchema },
  async (req, res: Response<StartOrGetConvoResponse>, { body }) => {
    const user = req.user!
    const { toUserId } = body

    const recipient = await db.query.users.findFirst({
      where: {
        id: toUserId,
      },
      columns: {
        id: true,
      },
    })

    if (!recipient) {
      throw createHttpError(404, "User not found")
    }

    if (recipient.id === user.id) {
      throw createHttpError(400, "Cannot start a conversation with yourself")
    }

    const result = await getOrCreateConversation({
      userId: user.id,
      recipientId: recipient.id,
    })

    res.status(result.isNew ? 201 : 200).json(result.conversation)
  }
)

export const getConversation = makeValidatedEndpoint(
  {
    params: conversationParamsSchema,
  },
  async (req, res: Response<ConversationResponse>, { params }) => {
    const conversation = await findConversationById({
      conversationId: params.conversationId,
      userId: req.user!.id,
    })

    if (!conversation) {
      throw createHttpError(404, "Conversation not found")
    }

    res.json({
      id: conversation.id,
      type: conversation.type,
      display: getDisplay(conversation),
    })
  }
)

export const getConversationMessages = makeValidatedEndpoint(
  {
    params: conversationParamsSchema,
    query: createCursorQuerySchema(50),
  },
  async (req, res: Response<MessagesResponse>, { params, query }) => {
    const conversation = await db.query.conversations.findFirst({
      columns: { id: true },
      where: {
        id: params.conversationId,
        users: { id: req.user!.id },
      },
    })

    if (!conversation) {
      throw createHttpError(404, "Conversation not found")
    }

    const { cursor, limit } = query
    let cursorValue

    if (cursor) {
      cursorValue = decodeCursor(cursor, messageCursorSchema)
    }

    const messages = await db.query.messages.findMany({
      columns: {
        id: true,
        content: true,
        createdAt: true,
        editedAt: true,
      },
      where: {
        conversationId: params.conversationId,
        conversation: { users: { id: req.user!.id } },
        ...(cursorValue && {
          OR: [
            { createdAt: { lt: cursorValue.createdAt } },
            {
              createdAt: { eq: cursorValue.createdAt },
              id: { lt: cursorValue.id },
            },
          ],
        }),
      },
      with: {
        sender: {
          columns: {
            id: true,
            username: true,
          },
          with: {
            profileInfo: {
              columns: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      limit: limit + 1,
      orderBy: { createdAt: "desc", id: "desc" },
    })

    const hasMore = messages.length > limit
    const page = messages.slice(0, limit)
    const nextCursor = hasMore ? encodeCursor(page.at(-1)) : null

    res.json({
      data: page.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        editedAt: item.editedAt?.toISOString() ?? null,
      })),
      pagination: { hasMore, nextCursor },
    })
  }
)
