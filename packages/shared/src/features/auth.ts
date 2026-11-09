import z from "zod"

// POST /register
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required.")
      .max(32, "Username must be at most 32 characters."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type Register = z.infer<typeof registerSchema>

export const registerReturnSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
  }),
})
export type RegisterReturn = z.infer<typeof registerReturnSchema>

// POST /login
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
})
export type Login = z.infer<typeof loginSchema>
