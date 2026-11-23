import request from "supertest"

import {
  conversations,
  db,
  messages,
  profileInfo,
  users,
  usersToConversations,
} from "@workspace/db"
import type {
  ConversationsResponse,
  StartOrGetConvoResponse,
} from "@workspace/shared"
import { getDirectKey } from "@workspace/shared/utils"
import { app } from "../app.ts"
import { createUser, generateToken } from "../utils/auth.ts"
import { describeUnauthorized } from "./utils/auth.ts"

describe("Conversations", () => {
  beforeEach(async () => {
    await db.delete(messages)
    await db.delete(usersToConversations)
    await db.delete(conversations)
    await db.delete(profileInfo)
    await db.delete(users)
  })

  afterAll(async () => {
    await db.$client.end()
  })

  const seedUser = async (username: string) => {
    const user = await createUser({ username, password: "password123" })

    if (!user) throw new Error("Failed to create user")

    return user
  }

  const startConversation = (token: string, body: object) =>
    request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token}`)
      .send(body)

  describe("get conversations route", () => {
    const getConversations = (token: string) =>
      request(app)
        .get("/api/conversations")
        .set("Authorization", `Bearer ${token}`)

    test("returns the user's conversations", async () => {
      const user = await seedUser("user")
      const otherUser = await seedUser("other")

      const token = generateToken(user)

      await startConversation(token, { toUserId: otherUser.id })

      const res = await getConversations(token)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect((res.body as ConversationsResponse[])[0]).toStrictEqual({
        id: expect.any(String),
        type: "direct",
        display: { title: "other", avatarUrl: null },
        lastMessage: null,
      })
    })

    test("returns an empty array when the user has no conversations", async () => {
      const user = await seedUser("user")

      const res = await getConversations(generateToken(user))

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([])
    })

    test("returns only conversations the user is a member of", async () => {
      const user = await seedUser("user")
      const alice = await seedUser("alice")
      const bob = await seedUser("bob")

      const aliceBob = await startConversation(generateToken(alice), {
        toUserId: bob.id,
      })
      const userAlice = await startConversation(generateToken(user), {
        toUserId: alice.id,
      })

      expect(aliceBob.status).toBe(201)
      expect(userAlice.status).toBe(201)

      const res = await getConversations(generateToken(user))

      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([
        {
          id: (userAlice.body as StartOrGetConvoResponse).id,
          type: "direct",
          display: { title: "alice", avatarUrl: null },
          lastMessage: null,
        },
      ])
    })

    test("returns group conversations with their name", async () => {
      const user = await seedUser("user")

      const [group] = await db
        .insert(conversations)
        .values({ type: "group", name: "Team" })
        .returning({ id: conversations.id })

      if (!group) throw new Error("Failed to create group")

      await db
        .insert(usersToConversations)
        .values({ conversationId: group.id, userId: user.id })

      const res = await getConversations(generateToken(user))

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([
        {
          id: group.id,
          type: "group",
          display: { title: "Team", avatarUrl: null },
          lastMessage: null,
        },
      ])
    })

    test("uses the other user's display name and avatar", async () => {
      const user = await seedUser("user")
      const other = await seedUser("other")

      await db.insert(profileInfo).values({
        userId: other.id,
        displayName: "Other Name",
        avatarUrl: "https://example.com/avatar.png",
      })

      await startConversation(generateToken(user), { toUserId: other.id })

      const res = await getConversations(generateToken(user))

      expect(res.body).toStrictEqual([
        {
          id: expect.any(String),
          type: "direct",
          display: {
            title: "Other Name",
            avatarUrl: "https://example.com/avatar.png",
          },
          lastMessage: null,
        },
      ])
    })

    test("returns the last message with ISO dates", async () => {
      const user = await seedUser("user")
      const other = await seedUser("other")

      const created = await startConversation(generateToken(user), {
        toUserId: other.id,
      })
      const conversationId = (created.body as StartOrGetConvoResponse).id
      const createdAt = new Date("2026-01-01T10:00:00.000Z")
      const editedAt = new Date("2026-01-02T10:00:00.000Z")

      await db.insert(messages).values({
        conversationId,
        senderId: other.id,
        content: "hello",
        createdAt,
        editedAt,
      })

      const res = await getConversations(generateToken(user))

      expect(res.body).toStrictEqual([
        {
          id: conversationId,
          type: "direct",
          display: { title: "other", avatarUrl: null },
          lastMessage: {
            senderId: other.id,
            content: "hello",
            createdAt: createdAt.toISOString(),
            editedAt: editedAt.toISOString(),
          },
        },
      ])
    })

    test("returns the newest message when several exist", async () => {
      const user = await seedUser("user")
      const other = await seedUser("other")

      const created = await startConversation(generateToken(user), {
        toUserId: other.id,
      })
      const conversationId = (created.body as StartOrGetConvoResponse).id
      const newestCreatedAt = new Date("2026-01-02T10:00:00.000Z")

      await db.insert(messages).values([
        {
          conversationId,
          senderId: other.id,
          content: "old",
          createdAt: new Date("2026-01-01T10:00:00.000Z"),
        },
        {
          conversationId,
          senderId: user.id,
          content: "new",
          createdAt: newestCreatedAt,
        },
      ])

      const res = await getConversations(generateToken(user))

      expect(res.body).toStrictEqual([
        {
          id: conversationId,
          type: "direct",
          display: { title: "other", avatarUrl: null },
          lastMessage: {
            senderId: user.id,
            content: "new",
            createdAt: newestCreatedAt.toISOString(),
            editedAt: null,
          },
        },
      ])
    })

    describeUnauthorized(() => request(app).get("/api/conversations"))
  })

  describe("start or get route", () => {
    test("creates a new direct conversation", async () => {
      const sender = await seedUser("sender")
      const recipient = await seedUser("recipient")

      const res = await startConversation(generateToken(sender), {
        toUserId: recipient.id,
      })

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(201)
      expect(res.body).toStrictEqual({
        id: expect.any(String),
        type: "direct",
        name: null,
      })

      const created = await db.query.conversations.findFirst({
        where: { directKey: getDirectKey(sender.id, recipient.id) },
      })
      expect(created?.id).toBe((res.body as StartOrGetConvoResponse).id)

      const members = await db.query.usersToConversations.findMany({
        where: { conversationId: created!.id },
      })

      expect(members.map((m) => m.userId).sort((a, b) => a - b)).toStrictEqual(
        [sender.id, recipient.id].sort((a, b) => a - b)
      )
    })

    test("returns the existing conversation on a repeat request", async () => {
      const sender = await seedUser("sender")
      const recipient = await seedUser("recipient")
      const token = generateToken(sender)

      const first = await startConversation(token, {
        toUserId: recipient.id,
      })
      const second = await startConversation(token, {
        toUserId: recipient.id,
      })

      expect(first.status).toBe(201)
      expect(second.status).toBe(200)
      expect(second.body).toStrictEqual(first.body)
      expect(await db.select().from(conversations)).toHaveLength(1)
      expect(await db.select().from(usersToConversations)).toHaveLength(2)
    })

    test("handles concurrent requests without duplicating the conversation", async () => {
      const sender = await seedUser("sender")
      const recipient = await seedUser("recipient")
      const token = generateToken(sender)

      const [first, second] = await Promise.all([
        startConversation(token, { toUserId: recipient.id }),
        startConversation(token, { toUserId: recipient.id }),
      ])

      expect([first.status, second.status].sort((a, b) => a - b)).toStrictEqual(
        [200, 201]
      )
      expect(second.body).toStrictEqual(first.body)
      expect(await db.select().from(conversations)).toHaveLength(1)
      expect(await db.select().from(usersToConversations)).toHaveLength(2)
    })

    test("returns the same conversation when the recipient starts it", async () => {
      const sender = await seedUser("sender")
      const recipient = await seedUser("recipient")

      const first = await startConversation(generateToken(sender), {
        toUserId: recipient.id,
      })
      const reverse = await startConversation(generateToken(recipient), {
        toUserId: sender.id,
      })

      expect(first.status).toBe(201)
      expect(reverse.status).toBe(200)
      expect((reverse.body as StartOrGetConvoResponse).id).toBe(
        (first.body as StartOrGetConvoResponse).id
      )
      expect(await db.select().from(conversations)).toHaveLength(1)
    })

    test("returns 404 when the recipient does not exist", async () => {
      const sender = await seedUser("sender")

      const res = await startConversation(generateToken(sender), {
        toUserId: 999999,
      })

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "User not found" })
    })

    test("returns 400 when starting a conversation with yourself", async () => {
      const sender = await seedUser("sender")

      const res = await startConversation(generateToken(sender), {
        toUserId: sender.id,
      })

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(400)
      expect(res.body).toStrictEqual({
        message: "Cannot start a conversation with yourself",
      })
    })

    describe("body validation", () => {
      test.each([
        { description: "missing toUserId", body: {} },
        {
          description: "toUserId is not a number",
          body: { toUserId: "recipient" },
        },
        { description: "toUserId is not positive", body: { toUserId: 0 } },
      ])("returns 422 with $description", async ({ body }) => {
        const sender = await seedUser("sender")

        const res = await startConversation(generateToken(sender), body)

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(422)
      })
    })

    describeUnauthorized(() =>
      request(app).post("/api/conversations").send({ toUserId: 1 })
    )
  })

  describe("get conversation route", () => {
    const getConversation = (token: string, conversationId: string) =>
      request(app)
        .get(`/api/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)

    test("returns a direct conversation by id", async () => {
      const user = await seedUser("user")
      const other = await seedUser("other")
      const created = await startConversation(generateToken(user), {
        toUserId: other.id,
      })
      const conversation = created.body as StartOrGetConvoResponse

      const res = await getConversation(generateToken(user), conversation.id)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        id: conversation.id,
        type: "direct",
        display: {
          title: "other",
          avatarUrl: null,
        },
      })
    })

    test("returns a group conversation with its name", async () => {
      const user = await seedUser("user")

      const group = await db.transaction(async (tx) => {
        const [group] = await tx
          .insert(conversations)
          .values({ type: "group", name: "Team" })
          .returning({ id: conversations.id })

        if (!group) throw new Error("Failed to create group")

        await tx.insert(usersToConversations).values({
          conversationId: group.id,
          userId: user.id,
        })

        return group
      })

      const res = await getConversation(generateToken(user), group.id)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        id: group.id,
        type: "group",
        display: {
          title: "Team",
          avatarUrl: null,
        },
      })
    })

    test("returns 404 when the conversation does not exist", async () => {
      const user = await seedUser("user")

      const res = await getConversation(
        generateToken(user),
        crypto.randomUUID()
      )

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "Conversation not found" })
    })

    test("returns 404 when the user is not a participant", async () => {
      const user = await seedUser("user")
      const participant1 = await seedUser("participant1")
      const participant2 = await seedUser("participant2")

      const created = await startConversation(generateToken(participant1), {
        toUserId: participant2.id,
      })
      const conversation = created.body as StartOrGetConvoResponse

      const res = await getConversation(generateToken(user), conversation.id)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "Conversation not found" })
    })

    test("returns 422 when the id is not a uuid", async () => {
      const user = await seedUser("user")

      const res = await getConversation(generateToken(user), "not-a-uuid")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(422)
    })

    describeUnauthorized(() =>
      request(app).get(`/api/conversations/${crypto.randomUUID()}`)
    )
  })
})
