import { Router } from "express"

import { getMe, login, register } from "../controllers/auth.ts"
import { authenticate } from "../middlewares/auth.ts"

export const authRouter: Router = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.get("/me", authenticate, getMe)
