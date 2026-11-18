import { Router } from "express"

import { authenticate } from "../middlewares/auth.ts"
import { authRouter } from "./auth.ts"
import { conversationsRouter } from "./conversations.ts"
import { usersRouter } from "./users.ts"

export const apiRouter: Router = Router()

apiRouter.use("/auth", authRouter)
apiRouter.use(authenticate)
apiRouter.use("/conversations", conversationsRouter)
apiRouter.use("/users", usersRouter)
