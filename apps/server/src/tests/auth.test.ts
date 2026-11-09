import { db, users } from "@workspace/db"
import { registerReturnSchema } from "@workspace/shared"
import request from "supertest"

import { app } from "../app.ts"
import { createUser } from "../utils/auth.ts"

describe("Auth", () => {
  beforeEach(async () => {
    await db.delete(users)
  })

  afterAll(async () => {
    await db.$client.end()
  })

  describe("register route", () => {
    test("should register a new user", async () => {
      const username = "testuser"

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username,
          password: "password",
          confirmPassword: "password",
        })
        .set("Accept", "application/json")

      const parsedBody = registerReturnSchema.parse(res.body)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(201)
      expect(parsedBody).toStrictEqual({
        message: expect.any(String),
        user: {
          id: expect.any(Number),
          username,
        },
      })

      const user = await db.query.users.findFirst({
        where: {
          username,
        },
      })

      expect(user?.id).toBe(parsedBody.user.id)
    })

    test("should not register a user with an existing username", async () => {
      await db.insert(users).values({
        username: "testuser",
        passwordHash: "hashedpassword",
      })

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: "testuser",
          password: "password123",
          confirmPassword: "password123",
        })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(409)
      expect(res.body).toMatchObject({
        message: "Username already taken",
      })
    })

    describe("body validation", () => {
      test.each([
        {
          description: "missing username",
          body: {
            password: "password123",
            confirmPassword: "password123",
          },
        },
        {
          description: "missing password",
          body: {
            username: "testuser",
            confirmPassword: "password123",
          },
        },
        {
          description: "missing confirmPassword",
          body: {
            username: "testuser",
            password: "password123",
          },
        },
        {
          description: "username is not a string",
          body: {
            username: 123,
            password: "password123",
            confirmPassword: "password123",
          },
        },
        {
          description: "password is not a string",
          body: {
            username: "testuser",
            password: 123,
            confirmPassword: 123,
          },
        },
        {
          description: "passwords don't match",
          body: {
            username: "testuser",
            password: "password123",
            confirmPassword: "password1234",
          },
        },
      ])("return 422 with $description", async ({ body }) => {
        const res = await request(app)
          .post("/api/auth/register")
          .send(body)
          .set("Accept", "application/json")

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(422)
      })
    })
  })

  describe("login route", () => {
    const userCredentials = { username: "testuser", password: "password123" }
    const seedUser = () => createUser(userCredentials)

    test("returns correct user and token", async () => {
      const user = await seedUser()

      const res = await request(app)
        .post("/api/auth/login")
        .send(userCredentials)
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: expect.any(String),
        user: {
          id: user?.id,
          username: userCredentials.username,
        },
        token: expect.any(String),
      })
    })

    test.each([
      { ...userCredentials, username: "wrongusername" },
      { ...userCredentials, password: "wrongpassword" },
    ])("returns 401 on invalid credentials", async (body) => {
      await seedUser()

      const res = await request(app)
        .post("/api/auth/login")
        .send(body)
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(401)
      expect(res.body).toStrictEqual({
        message: "Invalid credentials",
      })
    })
  })
})
