import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import type { QueryClientProvider } from "@tanstack/react-query"
import type { RouterProvider } from "@tanstack/react-router"
import "@workspace/ui/globals.css"

import { ThemeProvider } from "@/components/theme-provider.tsx"
import type { router } from "./lib/router"
import type { queryClient } from "./lib/query-client"

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
