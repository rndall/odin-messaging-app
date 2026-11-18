import { sql } from "drizzle-orm"
import { reset, seed } from "drizzle-seed"

import * as schema from "./drizzle/schema.ts"
import { db } from "./index.ts"

// password123
const PASSWORD_HASH =
  "$2a$12$BDBCQVuGmdqt5xcEv0YffOtMCPsBiNCd6LpYBYcq5CIGYwiy65eRa"

async function main() {
  await reset(db, schema)

  const messageContents = [
    "Hey! How are you?",
    "I'm doing great, thanks for asking!",
    "That's good to hear. What's been going on?",
    "Not much, just wanted to catch up!",
  ]

  await seed(db, {
    users: schema.users,
    profileInfo: schema.profileInfo,
    conversations: schema.conversations,
  }).refine((f) => ({
    users: {
      columns: {
        username: f.firstName({ isUnique: true }),
        passwordHash: f.default({ defaultValue: PASSWORD_HASH }),
      },
    },
    profileInfo: {
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
          {
            weight: 0.5,
            value: f.default({ defaultValue: null }),
          },
        ]),
      },
    },
    conversations: {
      count: 9,
      columns: {
        type: f.default({ defaultValue: "direct" }),
        name: f.default({ defaultValue: null }),
      },
    },
  }))

  await db.update(schema.users).set({
    username: sql`lower(${schema.users.username})`,
  })

  const users = await db.query.users.findMany({ orderBy: { id: "asc" } })
  const conversations = await db.query.conversations.findMany({
    orderBy: { id: "asc" },
  })

  // Create pairs of users for direct conversations
  const userPairs = users
    .slice(0, -1)
    .map((user, index) => [user.id, users[index + 1].id] as const)

  // Add participants to each conversation
  const participants = conversations.flatMap((conversation, index) => [
    {
      userId: userPairs[index][0],
      conversationId: conversation.id,
    },
    {
      userId: userPairs[index][1],
      conversationId: conversation.id,
    },
  ])

  await db.insert(schema.usersToConversations).values(participants)

  // Seed messages
  const messages = conversations.flatMap((conversation, index) => {
    const [firstUserId, secondUserId] = userPairs[index]

    const senders = [firstUserId, secondUserId, firstUserId, secondUserId]

    return messageContents.map((content, messageIndex) => {
      const createdAt = new Date(
        Date.now() - (messageContents.length - messageIndex) * 60_000
      )

      return {
        content,
        senderId: senders[messageIndex],
        conversationId: conversation.id,
        createdAt,
        editedAt:
          messageIndex === 2 ? new Date(createdAt.getTime() + 15_000) : null,
      }
    })
  })

  await db.insert(schema.messages).values(messages)
}

await main()
