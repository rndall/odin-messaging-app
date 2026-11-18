import type { users } from "@workspace/db"

export type User = Pick<typeof users.$inferSelect, "id" | "username">
