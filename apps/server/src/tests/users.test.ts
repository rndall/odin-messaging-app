import request from "supertest"

import { db, users } from "@workspace/db"
import { app } from "../app.ts"
import { generateToken } from "../utils/auth.ts"
import { describeUnauthorized } from "./utils/auth.ts"

describe("Users", () => {
  beforeEach(async () => {
    await db.delete(users)
  })

  afterAll(async () => {
    await db.$client.end()
  })

  const token = generateToken({ id: 1, username: "testuser" })

  const getUsers = () =>
    request(app).get("/api/users").set("Authorization", `Bearer ${token}`)

  describe("list route", () => {
    test("returns all users", async () => {
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

    test("returns empty array on no users", async () => {
      const res = await getUsers()

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([])
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
