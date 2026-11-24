import createHttpError from "http-errors"
import type { z, ZodType } from "zod"

export const encodeCursor = <T>(payload: T) =>
  Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url")

export const decodeCursor = <T extends ZodType>(
  cursor: string,
  cursorSchema: T
): z.output<T> => {
  try {
    const value: unknown = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8")
    )
    return cursorSchema.parse(value)
  } catch (err) {
    console.warn(err)
    throw createHttpError(400, "Invalid cursor")
  }
}
