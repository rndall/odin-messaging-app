import { db, users } from "@workspace/db"
import request from "supertest"

import { app } from "../app.ts"

describe("Users", () => {
  beforeEach(async () => {
    await db.delete(users)
  })

  afterAll(async () => {
    await db.$client.end()
  })

  describe("list route", () => {
    test("returns all users", async () => {
      await db.insert(users).values([
        { username: "user1", passwordHash: "hashedpassword" },
        { username: "user2", passwordHash: "hashedpassword" },
      ])

      const res = await request(app).get("/api/users")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject([
        { username: "user1" },
        { username: "user2" },
      ])
    })

    test("returns empty array on no users", async () => {
      const res = await request(app).get("/api/users")

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

        const res = await request(app).get("/api/users").query(query)

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject(response)
      })
    })
  })
})
