import { useMutation } from "@tanstack/react-query"

import { login } from "../api"
import { setToken } from "../utils"

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      setToken(token)
    },
  })
}
