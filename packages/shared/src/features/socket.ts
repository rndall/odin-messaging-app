import type { AuthUserReturn } from "./auth.ts"
import type {
  ConversationParams,
  Messages,
  SendMessageBody,
} from "./conversations.ts"

export interface ServerToClientEvents {
  newMessage: (message: Messages) => void
}

export interface ClientToServerEvents {
  sendMessage: (body: SendMessageBody) => void
  joinConversation: (
    conversationId: ConversationParams["conversationId"]
  ) => void
}

export interface InterServerEvents {}

export interface SocketData {
  user: AuthUserReturn
}
