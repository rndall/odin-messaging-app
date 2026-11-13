import { createFileRoute, redirect } from "@tanstack/react-router"

import { isAuthenticated } from "@/features/auth/utils"

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({
        to: "/",
      })
    }
  },
})
