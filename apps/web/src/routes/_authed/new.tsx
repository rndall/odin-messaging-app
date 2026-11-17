import { createFileRoute } from "@tanstack/react-router"

import UserSearch from "@/features/users/components/user-search"

export const Route = createFileRoute("/_authed/new")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <UserSearch />
    </div>
  )
}
