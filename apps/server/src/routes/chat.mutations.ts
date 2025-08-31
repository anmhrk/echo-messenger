import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { chatParticipants, chats } from '../db/schema'
import { chatRoutes } from './chat'

chatRoutes.post('/create', async (c) => {
  const { targetUserId } = await c.req.json()
  if (!targetUserId) {
    return c.json({ error: 'Target user ID is required' }, 400)
  }

  const user = c.get('user')

  const existingChat = await db
    .select()
    .from(chatParticipants)
    .where(
      and(
        eq(chatParticipants.userId, user.id),
        eq(chatParticipants.userId, targetUserId)
      )
    )

  if (existingChat) {
    return c.json({ error: 'Chat already exists with this user' }, 400)
  }

  await db.transaction(async (tx) => {
    const chatId = crypto.randomUUID()

    await tx.insert(chats).values({
      id: chatId,
    })

    const bothUsers = [user.id, targetUserId]
    await tx.insert(chatParticipants).values(
      bothUsers.map((userId) => ({
        chatId,
        userId,
      }))
    )
  })
})
