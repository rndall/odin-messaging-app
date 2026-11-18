import { sql } from "drizzle-orm"
import { reset, seed } from "drizzle-seed"

import { getDirectKey } from "@workspace/shared/utils"
import * as schema from "./drizzle/schema.ts"
import { db } from "./index.ts"

// password123
const PASSWORD_HASH =
  "$2a$12$BDBCQVuGmdqt5xcEv0YffOtMCPsBiNCd6LpYBYcq5CIGYwiy65eRa"

const USER_COUNT = 10

const messageContents = [
  "Hey! How are you?",
  "I'm doing great, thanks for asking!",
  "That's good to hear. What's been going on?",
  "Not much, just wanted to catch up!",
]

async function main() {
  await reset(db, schema)

  await seed(db, {
    users: schema.users,
    profileInfo: schema.profileInfo,
  }).refine((f) => ({
    users: {
      count: USER_COUNT,
      columns: {
        username: f.firstName({ isUnique: true }),
        passwordHash: f.default({ defaultValue: PASSWORD_HASH }),
      },
    },
    profileInfo: {
      count: USER_COUNT,
      columns: {
        displayName: f.weightedRandom([
          { weight: 0.7, value: f.fullName() },
          { weight: 0.3, value: f.default({ defaultValue: null }) },
        ]),
        bio: f.weightedRandom([
          { weight: 0.5, value: f.loremIpsum() },
          { weight: 0.5, value: f.default({ defaultValue: null }) },
        ]),
        avatarUrl: f.weightedRandom([
          {
            weight: 0.5,
            value: f.default({
              defaultValue:
                "https://i.pinimg.com/originals/a9/e1/a7/a9e1a7f7eb2a27071a68a706c11cd6a0.jpg",
            }),
          },
          { weight: 0.5, value: f.default({ defaultValue: null }) },
        ]),
      },
    },
  }))

  await db.update(schema.users).set({
    username: sql`lower(${schema.users.username})`,
  })

  const users = await db.query.users.findMany({ orderBy: { id: "asc" } })

  // Chain of adjacent pairs: (1,2), (2,3), ...
  const userPairs = users.flatMap((user, i) => {
    const next = users[i + 1]
    return next ? [[user.id, next.id] as const] : []
  })

  await db.transaction(async (tx) => {
    for (const [firstUserId, secondUserId] of userPairs) {
      const [conversation] = await tx
        .insert(schema.conversations)
        .values({
          type: "direct",
          directKey: getDirectKey(firstUserId, secondUserId),
        })
        .returning()

      if (!conversation) throw new Error("Failed to insert conversation")

      await tx.insert(schema.usersToConversations).values([
        { conversationId: conversation.id, userId: firstUserId },
        { conversationId: conversation.id, userId: secondUserId },
      ])

      const senders = [firstUserId, secondUserId, firstUserId, secondUserId]

      await tx.insert(schema.messages).values(
        messageContents.map((content, messageIndex) => {
          const createdAt = new Date(
            Date.now() - (messageContents.length - messageIndex) * 60_000
          )

          return {
            content,
            senderId: senders[messageIndex],
            conversationId: conversation.id,
            createdAt,
            editedAt:
              messageIndex === 2
                ? new Date(createdAt.getTime() + 15_000)
                : null,
          }
        })
      )
    }
  })
}

await main()
