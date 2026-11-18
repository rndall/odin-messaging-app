import { usersQuerySchema, type UsersReturn } from "@workspace/shared"
import type { Response } from "express"

import { makeValidatedEndpoint } from "../utils/endpoint.ts"
import { findUsers } from "../utils/users.ts"

export const getUsers = makeValidatedEndpoint(
  { query: usersQuerySchema },
  async (_req, res: Response<UsersReturn[]>, { query }) => {
    const users = await findUsers(query)

    res.json(users)
  }
)
