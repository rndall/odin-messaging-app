import { db, users } from "@workspace/db"
import type { Login, Register } from "@workspace/shared"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { env } from "../env.ts"

type User = Pick<typeof users.$inferSelect, "id" | "username">

export const generateToken = (user: User) => jwt.sign(user, env.JWT_SECRET)

export const createUser = async ({
  username,
  password,
}: Omit<Register, "confirmPassword">) => {
  const passwordHash = await bcrypt.hash(password, 10)

  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .onConflictDoNothing({ target: users.username })
    .returning({ id: users.id, username: users.username })

  return user
}

export const loginUser = async ({ username, password }: Login) => {
  const user = await db.query.users.findFirst({
    where: {
      username,
    },
  })

  const isValid = user && (await bcrypt.compare(password, user.passwordHash))

  if (!isValid) return

  return { id: user.id, username: user.username }
}
