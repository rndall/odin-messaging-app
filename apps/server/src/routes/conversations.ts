import { Router } from "express"

import {
  getConversation,
  getConversations,
  startOrGetConvo,
} from "../controllers/conversations.ts"

export const conversationsRouter: Router = Router()

conversationsRouter.get("/", getConversations)
conversationsRouter.post("/", startOrGetConvo)
conversationsRouter.get("/:conversationId", getConversation)
