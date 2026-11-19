import type { Response } from "express"
import createHttpError from "http-errors"

import { db } from "@workspace/db"
import {
  startOrGetConvoBodySchema,
  type ConversationsResponse,
  type StartOrGetConvoResponse,
} from "@workspace/shared"
import { getDirectKey } from "@workspace/shared/utils"
import { getOrCreateConversation } from "../utils/conversations.ts"
import { makeValidatedEndpoint } from "../utils/endpoint.ts"

export const getConversations = makeValidatedEndpoint(
  {},
  async (req, res: Response<ConversationsResponse[]>) => {
    const user = req.user!

    const conversations = await db.query.conversations.findMany({
      columns: { id: true, type: true, name: true },
      where: { users: { id: user.id } },
    })

    res.json(conversations)
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

    const directKey = getDirectKey(user.id, recipient.id)

    const result = await getOrCreateConversation({
      userId: user.id,
      recipientId: recipient.id,
      directKey,
    })

    res.status(result.isNew ? 201 : 200).json(result.conversation)
  }
)
