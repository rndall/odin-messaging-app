import { Router } from "express"

import { login, register } from "../controllers/auth.ts"

export const authRouter: Router = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
