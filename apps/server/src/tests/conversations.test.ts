import request from "supertest"

import { conversations, db, users, usersToConversations } from "@workspace/db"
import type { StartOrGetConvoResponse } from "@workspace/shared"
import { getDirectKey } from "@workspace/shared/utils"
import { app } from "../app.ts"
import { createUser, generateToken } from "../utils/auth.ts"

describe("Conversations", () => {
  beforeEach(async () => {
    await db.delete(usersToConversations)
    await db.delete(conversations)
    await db.delete(users)
  })

  afterAll(async () => {
    await db.$client.end()
  })

  describe("start or get route", () => {
    const seedUser = async (username: string) => {
      const user = await createUser({ username, password: "password123" })

      if (!user) throw new Error("Failed to create user")

      return user
    }

    const postConversation = (token: string, body: object) =>
      request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send(body)

    test("creates a new direct conversation", async () => {
      const sender = await seedUser("sender")
      const recipient = await seedUser("recipient")

      const res = await postConversation(generateToken(sender), {
        toUsername: "recipient",
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
      await seedUser("recipient")
      const token = generateToken(sender)

      const first = await postConversation(token, { toUsername: "recipient" })
      const second = await postConversation(token, { toUsername: "recipient" })

      expect(first.status).toBe(201)
      expect(second.status).toBe(200)
      expect(second.body).toStrictEqual(first.body)
      expect(await db.select().from(conversations)).toHaveLength(1)
      expect(await db.select().from(usersToConversations)).toHaveLength(2)
    })

    test("handles concurrent requests without duplicating the conversation", async () => {
      const sender = await seedUser("sender")
      await seedUser("recipient")
      const token = generateToken(sender)

      const [first, second] = await Promise.all([
        postConversation(token, { toUsername: "recipient" }),
        postConversation(token, { toUsername: "recipient" }),
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

      const first = await postConversation(generateToken(sender), {
        toUsername: "recipient",
      })
      const reverse = await postConversation(generateToken(recipient), {
        toUsername: "sender",
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

      const res = await postConversation(generateToken(sender), {
        toUsername: "ghost",
      })

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "User not found" })
    })

    test("returns 400 when starting a conversation with yourself", async () => {
      const sender = await seedUser("sender")

      const res = await postConversation(generateToken(sender), {
        toUsername: "sender",
      })

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(400)
      expect(res.body).toStrictEqual({
        message: "Cannot start a conversation with yourself",
      })
    })

    describe("body validation", () => {
      test.each([
        { description: "missing toUsername", body: {} },
        {
          description: "toUsername is not a string",
          body: { toUsername: 123 },
        },
      ])("returns 422 with $description", async ({ body }) => {
        const sender = await seedUser("sender")

        const res = await postConversation(generateToken(sender), body)

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(422)
      })
    })

    describe("authentication", () => {
      test.each([
        { description: "no token", authorization: undefined },
        { description: "invalid token", authorization: "Bearer invalid" },
      ])("returns 401 with $description", async ({ authorization }) => {
        await seedUser("sender")

        const res = await request(app)
          .post("/api/conversations")
          .set(authorization ? { Authorization: authorization } : {})
          .send({ toUsername: "recipient" })

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(401)
      })
    })
  })
})
