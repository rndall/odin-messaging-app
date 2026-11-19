import { queryOptions } from "@tanstack/react-query"
import { getConversations } from "./api"

export const conversationQueries = {
  all: () => ["conversations"],
  lists: () => [...conversationQueries.all(), "list"],
  list: () =>
    queryOptions({
      queryKey: [...conversationQueries.lists()],
      queryFn: getConversations,
    }),
}
