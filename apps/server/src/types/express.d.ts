import type { AuthUserReturn } from "@workspace/shared"

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserReturn
    }
  }
}

export {}
