import createHttpError from "http-errors"

import { db } from "@workspace/db"
import {
  startOrGetConvoBodySchema,
  type StartOrGetConvoResponse,
} from "@workspace/shared"
import { getDirectKey } from "@workspace/shared/utils"
import type { Response } from "express"
import { getOrCreateConversation } from "../utils/conversations.ts"
import { makeValidatedEndpoint } from "../utils/endpoint.ts"

export const startOrGetConvo = makeValidatedEndpoint(
  { body: startOrGetConvoBodySchema },
  async (req, res: Response<StartOrGetConvoResponse>, { body }) => {
    const user = req.user!
    const { toUsername } = body

    const recipient = await db.query.users.findFirst({
      where: {
        username: toUsername,
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
