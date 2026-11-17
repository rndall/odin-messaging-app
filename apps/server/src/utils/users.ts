import { db } from "@workspace/db"
import type { UsersQuery } from "@workspace/shared"

export const findUsers = async ({ search }: UsersQuery) => {
  const searchPattern = `%${search}%`

  const users = await db.query.users.findMany({
    columns: { id: true, username: true },
    with: { profileInfo: { columns: { displayName: true, avatarUrl: true } } },
    orderBy: { username: "asc" },
    ...(search && {
      where: {
        OR: [
          {
            username: {
              ilike: searchPattern,
            },
          },
          { profileInfo: { displayName: { ilike: searchPattern } } },
        ],
      },
    }),
  })

  return users
}
