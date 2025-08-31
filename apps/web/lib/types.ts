import { z } from 'zod'

export type User = {
  id: string
  username: string
}

export type AuthResult = { ok: true } | { ok: false; error: string }

export const TokenResponseSchema = z
  .object({
    valid: z.boolean(),
  })
  .loose()

export const JwtPayloadSchema = z.object({
  id: z.string(),
  username: z.string(),
  exp: z.number(),
})

export type JwtPayload = z.infer<typeof JwtPayloadSchema>

export type Chat = {
  id: number
  name: string
}
