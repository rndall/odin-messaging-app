import type { Response } from "express"
import createHttpError from "http-errors"

import { db } from "@workspace/db"
import {
  startOrGetConvoBodySchema,
  type ConversationsResponse,
  type StartOrGetConvoResponse,
} from "@workspace/shared"
import {
  findConversations,
  getOrCreateConversation,
} from "../utils/conversations.ts"
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
