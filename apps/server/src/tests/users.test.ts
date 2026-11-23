import request from "supertest"

import {
  conversations,
  db,
  profileInfo,
  users,
  usersToConversations,
} from "@workspace/db"
import { app } from "../app.ts"
import { generateToken } from "../utils/auth.ts"
import { describeUnauthorized } from "./utils/auth.ts"

describe("Users", () => {
  let token: string

  beforeEach(async () => {
    await db.delete(usersToConversations)
    await db.delete(conversations)
    await db.delete(profileInfo)
    await db.delete(users)

    const [currentUser] = await db
      .insert(users)
      .values({ username: "currentUser", passwordHash: "hashedpassword" })
      .returning({ id: users.id, username: users.username })

    if (!currentUser) throw new Error("Failed to create user")

    token = generateToken(currentUser)
  })

  afterAll(async () => {
    await db.$client.end()
  })

  const getUsers = () =>
    request(app).get("/api/users").set("Authorization", `Bearer ${token}`)

  describe("list route", () => {
    test("returns all users except the current user", async () => {
      await db.insert(users).values([
        { username: "user1", passwordHash: "hashedpassword" },
        { username: "user2", passwordHash: "hashedpassword" },
      ])

      const res = await getUsers()

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject([
        { username: "user1" },
        { username: "user2" },
      ])
    })

    test("returns empty array when only the current user exists", async () => {
      const res = await getUsers()

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([])
    })

    test("excludes the current user from search results", async () => {
      await db.insert(users).values({
        username: "otherUser",
        passwordHash: "hashedpassword",
      })

      const res = await getUsers().query({ search: "user" })

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject([{ username: "otherUser" }])
    })

    describe("query", () => {
      test.each([
        {
          query: { search: "test" },
          response: [{ username: "testuser1" }, { username: "testuser2" }],
        },
        {
          query: { search: "james" },
          response: [],
        },
        {
          query: { limit: 2 },
          response: [{ username: "user1" }, { username: "user2" }],
        },
      ])("returns users matching search %s", async ({ query, response }) => {
        await db.insert(users).values([
          { username: "user1", passwordHash: "hashedpassword" },
          { username: "user2", passwordHash: "hashedpassword" },
          { username: "testuser1", passwordHash: "hashedpassword" },
          { username: "testuser2", passwordHash: "hashedpassword" },
        ])

        const res = await getUsers().query(query)

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject(response)
      })
    })

    describeUnauthorized(() => request(app).get("/api/users"))
  })
})
