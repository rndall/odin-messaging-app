import { createFileRoute } from "@tanstack/react-router"

import ConversationHeader from "@/features/conversations/components/conversation-header"
import { conversationQueries } from "@/features/conversations/queries"

export const Route = createFileRoute("/_authed/$conversationId")({
  context: ({ params }) => ({
    conversationQueryOptions: conversationQueries.detail(params.conversationId),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.conversationQueryOptions,
      staleTime: "static",
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="pt-4">
      <ConversationHeader />
    </div>
  )
}
