import { db } from "@workspace/db"
import type { UsersQuery } from "@workspace/shared"

interface FindOtherUsersParams extends UsersQuery {
  currentUserId: number
}

export const findOtherUsers = async ({
  search,
  limit,
  currentUserId,
}: FindOtherUsersParams) => {
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

      NOT: { id: currentUserId },
    },
  })

  return users
}
