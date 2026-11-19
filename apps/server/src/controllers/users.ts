import { usersQuerySchema, type UsersReturn } from "@workspace/shared"
import type { Response } from "express"

import { makeValidatedEndpoint } from "../utils/endpoint.ts"
import { findOtherUsers } from "../utils/users.ts"

export const getUsers = makeValidatedEndpoint(
  { query: usersQuerySchema },
  async (req, res: Response<UsersReturn[]>, { query }) => {
    const users = await findOtherUsers({
      ...query,
      currentUserId: req.user!.id,
    })

    res.json(users)
  }
)
