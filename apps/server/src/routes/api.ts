import { Router } from "express"

import { authRouter } from "./auth.ts"

export const apiRouter: Router = Router()

apiRouter.use("/auth", authRouter)
