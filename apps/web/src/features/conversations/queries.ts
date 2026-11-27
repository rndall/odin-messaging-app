import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

import {
  getConversation,
  getConversationMessages,
  getConversations,
} from "./api"

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
  messages: (conversationId: string) =>
    infiniteQueryOptions({
      queryKey: [
        ...conversationQueries.detail(conversationId).queryKey,
        "messages",
      ],
      queryFn: ({ pageParam }) =>
        getConversationMessages({
          conversationId,
          cursor: pageParam,
        }),
      initialPageParam: "",
      getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
      staleTime: Infinity,
    }),
}
