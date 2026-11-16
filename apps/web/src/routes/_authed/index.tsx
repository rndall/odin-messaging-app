import { createFileRoute } from "@tanstack/react-router"

import EmptyChatSelect from "@/components/empty-chat-select"

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <EmptyChatSelect />
    </div>
  )
}
