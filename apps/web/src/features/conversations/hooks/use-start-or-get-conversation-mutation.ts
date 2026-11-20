import { useMutation } from "@tanstack/react-query"

import { startOrGetConvo } from "../api"
import { conversationQueries } from "../queries"

export function useStartOrGetConversationMutation() {
  return useMutation({
    mutationFn: startOrGetConvo,
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: conversationQueries.list().queryKey,
      })
    },
  })
}
