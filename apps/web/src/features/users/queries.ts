import { queryOptions } from "@tanstack/react-query"

import type { UsersQueryInput } from "@workspace/shared"
import { getUsers } from "./api"

export const userQueries = {
  all: () => ["users"],
  lists: () => [...userQueries.all(), "list"],
  list: (query: UsersQueryInput) =>
    queryOptions({
      queryKey: [...userQueries.lists(), query],
      queryFn: () => getUsers(query),
    }),
}
