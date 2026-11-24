import { createFileRoute } from "@tanstack/react-router"

import ConversationHeader from "@/features/conversations/components/conversation-header"
import ConversationMessages from "@/features/conversations/components/conversation-messages"
import { conversationQueries } from "@/features/conversations/queries"

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
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ConversationHeader />
      <ConversationMessages />
    </div>
  )
}
