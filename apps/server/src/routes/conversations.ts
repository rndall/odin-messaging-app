import { Router } from "express"
import { startOrGetConvo } from "../controllers/conversations.ts"

export const conversationsRouter: Router = Router()

conversationsRouter.post("/", startOrGetConvo)
