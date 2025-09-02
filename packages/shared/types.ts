import { z } from 'zod'

export const ChatCreatedEventSchema = z.object({
  chatId: z.string(),
  participants: z.array(
    z.object({ id: z.string(), username: z.string().nullable(), image: z.string().nullable() })
  ),
})

export type ChatCreatedEvent = z.infer<typeof ChatCreatedEventSchema>

export const MessageCreatedEventSchema = z.object({
  chatId: z.string(),
  participantIds: z.array(z.string()),
  message: z.object({
    id: z.string(),
    content: z.string(),
    sentAt: z.string(), // ISO date string
    sender: z
      .object({
        id: z.string(),
        username: z.string().nullable(),
        image: z.string().nullable(),
      })
      .nullable(),
  }),
})

export type MessageCreatedEvent = z.infer<typeof MessageCreatedEventSchema>
