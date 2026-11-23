import { queryOptions } from "@tanstack/react-query"

import { getConversation, getConversations } from "./api"

export const conversationQueries = {
  all: () => ["conversations"],
  lists: () => [...conversationQueries.all(), "list"],
  list: () =>
    queryOptions({
      queryKey: [...conversationQueries.lists()],
      queryFn: getConversations,
    }),
  details: () => [...conversationQueries.all(), "detail"],
  detail: (conversationId: string) =>
    queryOptions({
      queryKey: [...conversationQueries.details(), conversationId],
      queryFn: () => getConversation(conversationId),
    }),
}
