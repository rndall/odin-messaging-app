import { conversations, db, usersToConversations } from "@workspace/db"
import type { ConversationsResponse } from "@workspace/shared"
import { getDirectKey, getUserText } from "@workspace/shared/utils"

const conversationColumns = {
  id: true,
  type: true,
  name: true,
} as const

const findConversationRows = (userId: number) =>
  db.query.conversations.findMany({
    columns: conversationColumns,
    where: { users: { id: userId } },
    with: {
      users: {
        where: { id: { ne: userId } },
        columns: { username: true },
        with: {
          profileInfo: { columns: { displayName: true, avatarUrl: true } },
        },
      },
      messages: {
        columns: {
          senderId: true,
          content: true,
          createdAt: true,
          editedAt: true,
        },
        orderBy: {
          createdAt: "desc",
          id: "desc",
        },
        limit: 1,
      },
    },
  })

type ConversationRow = NonNullable<
  Awaited<ReturnType<typeof findConversationById>>
>

export const getDisplay = (conversation: ConversationRow) => {
  if (conversation.type === "group") {
    return {
      title:
        conversation.name ??
        conversation.users.map((user) => getUserText(user)).join(", "),
      avatarUrl: null,
    }
  }

  const otherUser = conversation.users[0]
  if (!otherUser)
    throw new Error("Direct conversation must have exactly one other user")

  return {
    title: getUserText(otherUser),
    avatarUrl: otherUser.profileInfo?.avatarUrl ?? null,
  }
}

export const findConversations = async (
  userId: number
): Promise<ConversationsResponse[]> => {
  const conversations = await findConversationRows(userId)

  return conversations.map((conversation) => {
    const message = conversation.messages[0] ?? null

    return {
      id: conversation.id,
      type: conversation.type,
      display: getDisplay(conversation),
      lastMessage: message
        ? {
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
            editedAt: message.editedAt?.toISOString() ?? null,
          }
        : null,
    }
  })
}

export const findConversationById = async ({
  conversationId,
  userId,
}: {
  conversationId: string
  userId: number
}) =>
  db.query.conversations.findFirst({
    where: { id: conversationId, users: { id: userId } },
    columns: conversationColumns,
    with: {
      users: {
        where: { id: { ne: userId } },
        columns: { username: true },
        with: {
          profileInfo: { columns: { displayName: true, avatarUrl: true } },
        },
      },
    },
  })

export const getOrCreateConversation = ({
  userId,
  recipientId,
}: {
  userId: number
  recipientId: number
}) => {
  const directKey = getDirectKey(userId, recipientId)

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(conversations)
      .values([{ type: "direct", directKey }])
      .onConflictDoNothing({ target: conversations.directKey })
      .returning({
        id: conversations.id,
        type: conversations.type,
        name: conversations.name,
      })

    if (created) {
      await tx.insert(usersToConversations).values([
        { conversationId: created.id, userId },
        { conversationId: created.id, userId: recipientId },
      ])

      return { conversation: created, isNew: true }
    }

    const existing = await tx.query.conversations.findFirst({
      where: { directKey },
      columns: conversationColumns,
    })

    if (!existing) {
      throw new Error("Failed to load conversation")
    }

    return { conversation: existing, isNew: false }
  })
}
