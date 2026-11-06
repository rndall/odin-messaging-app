import { defineRelations } from "drizzle-orm"
import {
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

export const profileInfo = snakeCase.table("profile_info", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  displayName: varchar({ length: 128 }),
  avatarUrl: text(),
  bio: varchar({ length: 250 }),
  userId: integer().references(() => users.id),
})

export const messages = snakeCase.table("messages", {
  id: uuid().primaryKey().defaultRandom(),
  content: varchar({ length: 250 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  editedAt: timestamp({ withTimezone: true }),
})

export const conversations = snakeCase.table("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 128 }).notNull(),
})

export const usersToMessages = snakeCase.table(
  "users_to_messages",
  {
    userId: integer()
      .notNull()
      .references(() => users.id),
    messageId: uuid()
      .notNull()
      .references(() => messages.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.messageId] })]
)

export const messagesToConversations = snakeCase.table(
  "messages_to_conversations",
  {
    messageId: uuid()
      .notNull()
      .references(() => messages.id),
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id),
  },
  (t) => [primaryKey({ columns: [t.messageId, t.conversationId] })]
)

export const relations = defineRelations(
  {
    users,
    profileInfo,
    messages,
    conversations,
    usersToMessages,
    messagesToConversations,
  },
  (r) => ({
    users: {
      profileInfo: r.one.profileInfo({
        from: r.users.id,
        to: r.profileInfo.userId,
        optional: false,
      }),
      messages: r.many.messages(),
    },
    messages: {
      users: r.many.users({
        from: r.messages.id.through(r.usersToMessages.messageId),
        to: r.users.id.through(r.usersToMessages.userId),
      }),
      conversations: r.many.conversations({
        from: r.messages.id.through(r.messagesToConversations.messageId),
        to: r.conversations.id.through(
          r.messagesToConversations.conversationId
        ),
      }),
    },
    conversations: {
      messages: r.many.messages(),
    },
  })
)
