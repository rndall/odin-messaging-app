import { usersQuerySchema, type UsersReturn } from "@workspace/shared"
import type { Response } from "express"

import { makeValidatedEndpoint } from "../utils/endpoint.ts"
import { findUsers } from "../utils/users.ts"

export const getUsers = makeValidatedEndpoint(
  { query: usersQuerySchema },
  async (req, res: Response<UsersReturn[]>) => {
    const users = await findUsers(req.query)

    res.json(users)
  }
)
