import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
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
    conversationsQueryOptions: conversationQueries.list(),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.conversationsQueryOptions,
      staleTime: "static",
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider open={true}>
      <AppSidebar />
      <main className="m-4 flex flex-1 flex-col bg-card shadow">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
