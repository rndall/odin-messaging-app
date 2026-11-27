import { createFileRoute } from "@tanstack/react-router"

import ConversationHeader from "@/features/conversations/components/conversation-header"
import ConversationInput from "@/features/conversations/components/conversation-input"
import ConversationMessages from "@/features/conversations/components/conversation-messages"
import { conversationQueries } from "@/features/conversations/queries"
import { socket } from "@/lib/socket"
import type { ServerToClientEvents } from "@workspace/shared"
import { useEffect } from "react"

export const Route = createFileRoute("/_authed/$conversationId")({
  context: ({ params }) => ({
    conversationQueryOptions: conversationQueries.detail(params.conversationId),
    messagesQueryOptions: conversationQueries.messages(params.conversationId),
  }),
  loader: async ({ context }) => {
    context.queryClient.query({
      ...context.conversationQueryOptions,
      staleTime: "static",
    })
    context.queryClient.infiniteQuery({
      ...context.messagesQueryOptions,
      staleTime: "static",
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { conversationId } = Route.useParams()
  useEffect(() => {
    const joinConversation = () => {
      socket.emit("joinConversation", conversationId)
    }

    if (socket.connected) joinConversation()
    socket.on("connect", joinConversation)

    return () => {
      socket.off("connect", joinConversation)
    }
  }, [conversationId])

  useEffect(() => {
    const onNewMessage: ServerToClientEvents["newMessage"] = (message) => {
      console.log("NEW MESSAGE:", message)
    }

    socket.on("newMessage", onNewMessage)

    return () => {
      socket.off("newMessage", onNewMessage)
    }
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ConversationHeader />
      <ConversationMessages />
      <ConversationInput />
    </div>
  )
}
