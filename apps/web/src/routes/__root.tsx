import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
  }
)

function RootComponent() {
  return (
    <div className="container mx-auto min-h-svh px-4">
      <Outlet />
    </div>
  )
}
