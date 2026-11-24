import { Router } from "express"

import {
  getConversation,
  getConversationMessages,
  getConversations,
  startOrGetConvo,
} from "../controllers/conversations.ts"

export const conversationsRouter: Router = Router()

conversationsRouter.get("/", getConversations)
conversationsRouter.post("/", startOrGetConvo)
conversationsRouter.get("/:conversationId", getConversation)
conversationsRouter.get("/:conversationId/messages", getConversationMessages)
