import {
  loginReturnSchema,
  registerReturnSchema,
  type Login,
  type Register,
} from "@workspace/shared"

import { apiUrl, parseJson } from "@/utils/api"

export const login = async (body: Login) => {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return parseJson(res, loginReturnSchema)
}

export const register = async (body: Register) => {
  const res = await fetch(apiUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return parseJson(res, registerReturnSchema)
}
