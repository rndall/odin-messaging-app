import { Router } from "express"

import { authRouter } from "./auth.ts"
import { usersRouter } from "./users.ts"

export const apiRouter: Router = Router()

apiRouter.use("/auth", authRouter)
apiRouter.use("/users", usersRouter)
