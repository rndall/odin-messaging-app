import { defineRelations } from "drizzle-orm"
import {
  index,
  integer,
  primaryKey,
  snakeCase,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const users = snakeCase.table("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 32 }).notNull().unique(),
  passwordHash: text().notNull(),
})

export const profileInfo = snakeCase.table(
  "profile_info",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    displayName: varchar({ length: 128 }),
    avatarUrl: text(),
    bio: varchar({ length: 250 }),
    userId: integer()
      .unique()
      .notNull()
      .references(() => users.id),
  },
  (t) => [index("profile_info_user_id_idx").on(t.userId)]
)

export const messages = snakeCase.table(
  "messages",
  {
    id: uuid().primaryKey().defaultRandom(),
    content: varchar({ length: 250 }).notNull(),
    senderId: integer()
      .notNull()
      .references(() => users.id),
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    editedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index("messages_conversation_id_idx").on(t.conversationId, t.createdAt),
  ]
)

export const conversations = snakeCase.table("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 128 }).notNull(),
})

export const usersToConversations = snakeCase.table(
  "users_to_conversations",
  {
    userId: integer()
      .notNull()
      .references(() => users.id),
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.conversationId] }),
    index("users_to_conversations_user_id_idx").on(t.userId),
    index("users_to_conversations_conversation_id_idx").on(t.conversationId),
    index("users_to_conversations_composite_idx").on(
      t.userId,
      t.conversationId
    ),
  ]
)

export const relations = defineRelations(
  {
    users,
    profileInfo,
    messages,
    conversations,
    usersToConversations,
  },
  (r) => ({
    users: {
      profileInfo: r.one.profileInfo({
        from: r.users.id,
        to: r.profileInfo.userId,
        optional: false,
      }),
      conversations: r.many.conversations({
        from: r.users.id.through(r.usersToConversations.userId),
        to: r.conversations.id.through(r.usersToConversations.conversationId),
      }),
      messages: r.many.messages(),
    },
    messages: {
      sender: r.one.users({
        from: r.messages.senderId,
        to: r.users.id,
        optional: false,
      }),
      conversation: r.one.conversations({
        from: r.messages.conversationId,
        to: r.conversations.id,
        optional: false,
      }),
    },
    conversations: {
      users: r.many.users(),
      messages: r.many.messages(),
    },
  })
)
