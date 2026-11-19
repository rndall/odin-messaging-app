import { useMutation } from "@tanstack/react-query"

import { startOrGetConvo } from "../api"

export function useStartOrGetConversationMutation() {
  return useMutation({
    mutationFn: startOrGetConvo,
  })
}
