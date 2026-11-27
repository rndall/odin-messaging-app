import type { Server as HTTPServer } from "node:http"
import { Server, type Socket as SocketIOSocket } from "socket.io"

import { db } from "@workspace/db"
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@workspace/shared"
import { authenticateSocket } from "../middlewares/socket.ts"

export type Socket = SocketIOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

export const setupSocket = (server: HTTPServer): SocketServer => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: ["https://hoppscotch.io", "http://localhost:5173"],
    },
  })

  io.use(authenticateSocket)

  io.on("connection", (socket) => {
    socket.on("joinConversation", async (conversationId) => {
      const conversation = await db.query.conversations.findFirst({
        where: { id: conversationId },
      })

      if (!conversation) return

      console.log(
        socket.data.user.username,
        "JOINING CONVERSATION:",
        conversationId
      )
      await socket.join(conversationId)
    })

    socket.on("sendMessage", ({ content, conversationId }) => {
      console.log({ content })
      io.to(conversationId).emit("newMessage", {
        id: "a46722ed-1e91-431d-a236-6ed300211a38",
        content,
        createdAt: "2026-11-24T08:52:04.628Z",
        editedAt: null,
        sender: {
          id: 2,
          username: "joylyn",
          profileInfo: { displayName: "Cerrone Muzzy", avatarUrl: null },
        },
      })
    })
    console.log("CONNECTED:", socket.id)
  })

  return io
}
