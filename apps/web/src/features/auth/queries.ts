import { queryOptions } from "@tanstack/react-query"

import { getMe } from "./api"

export const authQueries = {
  all: () => ["auth"],
  me: () =>
    queryOptions({
      queryKey: [...authQueries.all(), "me"],
      queryFn: getMe,
      staleTime: "static",
    }),
}
