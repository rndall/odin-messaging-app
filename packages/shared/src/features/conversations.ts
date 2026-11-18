import z from "zod"

// POST /
export const startOrGetConvoBodySchema = z.object({
  toUsername: z.string().trim().nonempty(),
})
export type StartOrGetConvoBody = z.infer<typeof startOrGetConvoBodySchema>

export const startOrGetConvoResponseSchema = z.object({
  id: z.string(),
  type: z.enum(["direct", "group"]),
  name: z.string().nullable(),
})
export type StartOrGetConvoResponse = z.infer<
  typeof startOrGetConvoResponseSchema
>
