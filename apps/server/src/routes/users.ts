import { Router } from "express"
import { getUsers } from "../controllers/users.ts"

export const usersRouter: Router = Router()

usersRouter.get("/", getUsers)
