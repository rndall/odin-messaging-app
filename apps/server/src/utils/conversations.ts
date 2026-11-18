import { conversations, db, usersToConversations } from "@workspace/db"

export const getOrCreateConversation = ({
  userId,
  recipientId,
  directKey,
}: {
  userId: number
  recipientId: number
  directKey: string
}) =>
  db.transaction(async (tx) => {
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
      columns: { id: true, name: true, type: true },
    })

    if (!existing) {
      throw new Error("Failed to load conversation")
    }

    return { conversation: existing, isNew: false }
  })
