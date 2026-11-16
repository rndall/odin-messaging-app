import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { isAuthenticated } from "@/features/auth/utils"
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
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider open={true}>
      <AppSidebar />
      <main className="flex flex-1 flex-col p-4">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
