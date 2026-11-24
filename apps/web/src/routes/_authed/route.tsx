import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { authQueries } from "@/features/auth/queries"
import { isAuthenticated } from "@/features/auth/utils"
import { conversationQueries } from "@/features/conversations/queries"
import { SidebarProvider } from "@workspace/ui/components/sidebar"

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
  context: () => ({
    meQueryOptions: authQueries.me(),
    conversationsQueryOptions: conversationQueries.list(),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.conversationsQueryOptions,
      staleTime: "static",
    })
    context.queryClient.query({
      ...context.meQueryOptions,
      staleTime: "static",
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider className="h-svh" open={true}>
      <AppSidebar />
      <main className="m-4 flex min-h-0 flex-1 flex-col bg-card shadow">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
