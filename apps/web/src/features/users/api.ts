import z from "zod"

import { apiUrl, parseJson } from "@/utils/api"
import { usersReturnSchema, type UsersQuery } from "@workspace/shared"

export const getUsers = async (query: UsersQuery) => {
  const res = await fetch(apiUrl("/users", query))
  return parseJson(res, z.array(usersReturnSchema))
}
