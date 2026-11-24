import z from "zod"

import { apiUrl, parseJson } from "@/utils/api"
import {
  conversationResponseSchema,
  conversationsResponseSchema,
  messagesResponseSchema,
  startOrGetConvoResponseSchema,
  type ConversationParams,
  type CursorQueryInput,
  type StartOrGetConvoBody,
} from "@workspace/shared"
import { getToken } from "../auth/utils"

export const getConversations = async () => {
  const res = await fetch(apiUrl("/conversations"), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })
  return parseJson(res, z.array(conversationsResponseSchema))
}

export const startOrGetConvo = async (body: StartOrGetConvoBody) => {
  const res = await fetch(apiUrl("/conversations"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  })
  return parseJson(res, startOrGetConvoResponseSchema)
}

export const getConversation = async (conversationId: string) => {
  const res = await fetch(apiUrl(`/conversations/${conversationId}`), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })
  return parseJson(res, conversationResponseSchema)
}

export const getConversationMessages = async ({
  conversationId,
  ...query
}: ConversationParams & CursorQueryInput) => {
  const res = await fetch(
    apiUrl(`/conversations/${conversationId}/messages`, query),
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  )
  return parseJson(res, messagesResponseSchema)
}
