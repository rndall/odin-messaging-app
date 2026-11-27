import type { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"

import { verifyToken } from "../utils/auth.ts"

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(" ")[1]

  if (!token) throw createHttpError(401)

  const user = verifyToken(token)

  if (!user) throw createHttpError(401, "Invalid token")

  req.user = user

  next()
}
