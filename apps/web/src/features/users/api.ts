import z from "zod"

import { apiUrl, parseJson } from "@/utils/api"
import { usersReturnSchema, type UsersQuery } from "@workspace/shared"
import { getToken } from "../auth/utils"

export const getUsers = async (query: UsersQuery) => {
  const res = await fetch(apiUrl("/users", query), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  return parseJson(res, z.array(usersReturnSchema))
}
