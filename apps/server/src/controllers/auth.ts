import { loginSchema, registerSchema } from "@workspace/shared"
import createHttpError from "http-errors"

import { createUser, generateToken, loginUser } from "../utils/auth.ts"
import { makeValidatedEndpoint } from "../utils/endpoint.ts"

export const register = makeValidatedEndpoint(
  { body: registerSchema },
  async (req, res) => {
    const { username, password } = req.body

    const user = await createUser({ username, password })

    if (!user) {
      throw createHttpError(409, "Username already taken")
    }

    res.status(201).json({ message: "User created successfully", user })
  }
)

export const login = makeValidatedEndpoint(
  { body: loginSchema },
  async (req, res) => {
    const { username, password } = req.body

    const user = await loginUser({ username, password })

    if (!user) {
      throw createHttpError(401, "Invalid credentials")
    }

    const token = generateToken(user)

    res.json({ message: "Login successful", user, token })
  }
)
