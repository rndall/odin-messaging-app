import { SidebarMenuButtonLink } from "@/components/link-button"
import { getDateDistance } from "@/utils/date"
import type { ConversationsResponse } from "@workspace/shared"
import { getFirstTwoInitials } from "@workspace/shared/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

export default function NavConversations({
  conversations,
}: {
  conversations: ConversationsResponse[]
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {conversations.map((conversation) => (
          <SidebarMenuItem key={conversation.id}>
            <SidebarMenuButtonLink
              size="xl"
              to="/$conversationId"
              params={{ conversationId: conversation.id }}
              activeProps={{ "data-active": true }}
            >
              <Avatar size="lg">
                <AvatarImage
                  src={conversation.display.avatarUrl ?? undefined}
                  alt={conversation.display.title}
                />
                <AvatarFallback>
                  {getFirstTwoInitials(conversation.display.title)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 leading-tight">
                <span className="truncate">{conversation.display.title}</span>
                <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                  <span className="truncate">
                    {conversation.lastMessage?.content}
                  </span>
                  {conversation.lastMessage?.createdAt && (
                    <span className="shrink-0">
                      ·{" "}
                      {getDateDistance(
                        new Date(conversation.lastMessage.createdAt),
                        new Date()
                      )}
                    </span>
                  )}
                </div>
              </div>
            </SidebarMenuButtonLink>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
