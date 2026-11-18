import { db } from "@workspace/db"
import type { UsersQuery } from "@workspace/shared"

export const findUsers = async ({ search, limit }: UsersQuery) => {
  const searchPattern = `%${search}%`

  const users = await db.query.users.findMany({
    columns: { id: true, username: true },
    with: { profileInfo: { columns: { displayName: true, avatarUrl: true } } },
    limit,
    orderBy: { id: "asc" },
    where: {
      ...(search && {
        OR: [
          {
            username: {
              ilike: searchPattern,
            },
          },
          { profileInfo: { displayName: { ilike: searchPattern } } },
        ],
      }),
    },
  })

  return users
}
