import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"

import NavConversations from "@/features/conversations/components/nav-conversations"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@workspace/ui/components/sidebar"
import ChatHeader from "./chat-header"

const route = getRouteApi("/_authed")

export function AppSidebar() {
  const context = route.useRouteContext()
  const { data: conversations } = useSuspenseQuery(
    context.conversationsQueryOptions
  )

  return (
    <Sidebar>
      <SidebarHeader>
        <ChatHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavConversations conversations={conversations} />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
