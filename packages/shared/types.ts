import { z } from 'zod'

export const ChatCreatedEventSchema = z.object({
  chatId: z.string(),
  participants: z.array(z.object({ id: z.string(), username: z.string().nullable() })),
})

export type ChatCreatedEvent = z.infer<typeof ChatCreatedEventSchema>
