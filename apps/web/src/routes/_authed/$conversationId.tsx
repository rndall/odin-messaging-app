import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/$conversationId")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/$conversationId"!</div>
}
