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

export const ChatLatestMessageSchema = z
  .object({
    id: z.string(),
    content: z.string(),
    // Dates are serialized to ISO strings from the server
    sentAt: z.string(),
    senderId: z.string(),
  })
  .loose()

export const ChatListItemSchema = z.object({
  id: z.string(),
  otherParticipant: z
    .object({ id: z.string(), username: z.string() })
    .nullable(),
  latestMessage: ChatLatestMessageSchema.optional(),
})

export const ChatListResponseSchema = z.object({
  chats: z.array(ChatListItemSchema),
})

export type ChatListItem = z.infer<typeof ChatListItemSchema>
