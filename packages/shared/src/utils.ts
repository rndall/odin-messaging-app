import z, { ZodType } from "zod"

import type { UsersReturn } from "./features/users.ts"

export const emptyToUndef = <T extends ZodType>(schema: T) =>
  z.preprocess((v) => v || undefined, schema)

export const getDirectKey = (a: number, b: number) =>
  `${Math.min(a, b)}:${Math.max(a, b)}`

export const getUserText = (user: Omit<UsersReturn, "id">): string =>
  user.profileInfo?.displayName || user.username

export const getFirstTwoInitials = (name: string) => {
  const [first, second] = name.trim().split(/\s+/)

  if (!first) return ""

  if (!second) {
    return first.slice(0, 2).toUpperCase()
  }

  return (first.charAt(0) + second.charAt(0)).toUpperCase()
}
