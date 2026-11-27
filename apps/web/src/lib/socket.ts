import { io, type Socket } from "socket.io-client"

import { env } from "@/env"
import { getToken } from "@/features/auth/utils"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@workspace/shared"

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  env.VITE_SOCKET_URL,
  {
    auth: (cb) => {
      cb({ token: getToken() })
    },
  }
)

socket.on("connect_error", (err) => {
  console.log(err instanceof Error)
  console.log(err.message)
})
