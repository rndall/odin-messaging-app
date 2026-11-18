import type { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"
import jwt from "jsonwebtoken"
import z from "zod"

import { authUserReturnSchema } from "@workspace/shared"
import { env } from "../env.ts"

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(" ")[1]

  if (!token) throw createHttpError(401)

  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      throw createHttpError(401, err.message)
    }

    const result = authUserReturnSchema.safeParse(decoded)

    if (!result.success) {
      return res.status(401).json({
        message: "Invalid token payload",
        errors: z.flattenError(result.error),
      })
    }

    req.user = result.data

    next()
  })
}
