import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"

import { getFirstTwoInitials } from "@workspace/shared/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

const route = getRouteApi("/_authed/$conversationId")

export default function ConversationHeader() {
  const context = route.useRouteContext()

  const { data: conversation } = useSuspenseQuery(
    context.conversationQueryOptions
  )

  return (
    <div className="p-4 shadow-md">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={conversation.display.avatarUrl ?? undefined} />
          <AvatarFallback>
            {getFirstTwoInitials(conversation.display.title)}
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold">{conversation.display.title}</div>
      </div>
    </div>
  )
}
