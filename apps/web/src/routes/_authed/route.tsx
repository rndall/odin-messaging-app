import { createFileRoute, redirect } from "@tanstack/react-router"

import { isAuthenticated } from "@/features/auth/utils"

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
})
