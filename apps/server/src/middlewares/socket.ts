import type { ExtendedError } from "socket.io"

import type { Socket } from "../lib/socket.ts"
import { verifyToken } from "../utils/auth.ts"

export const authenticateSocket = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const { token } = socket.handshake.auth as { token?: unknown }

  if (typeof token !== "string") {
    return next(new Error("not authorized"))
  }

  const user = verifyToken(token)

  if (!user) {
    return next(new Error("not authorized"))
  }

  socket.data.user = user
  next()
}
