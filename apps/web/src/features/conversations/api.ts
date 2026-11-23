import z from "zod"

import { apiUrl, parseJson } from "@/utils/api"
import {
  conversationResponseSchema,
  conversationsResponseSchema,
  startOrGetConvoResponseSchema,
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
