import { useMutation } from "@tanstack/react-query"

import { register } from "../api"

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
  })
}
