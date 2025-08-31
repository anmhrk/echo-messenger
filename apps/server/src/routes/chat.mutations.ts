import { inArray, sql } from 'drizzle-orm'
import { db } from '../db'
import { chatParticipants, chats, users } from '../db/schema'
import { Hono } from 'hono'
import type { Variables } from '..'
import { authMiddleware } from '../auth/middleware'
import { emitNewChat } from '../ws'

export const chatMutations = new Hono<{ Variables: Variables }>()

chatMutations.use(authMiddleware)

chatMutations.post('/create', async (c) => {
  const { targetUserId } = await c.req.json()
  if (!targetUserId) {
    return c.json({ error: 'Target user ID is required' }, 400)
  }

  const user = c.get('user')

  // Check if a chat already exists containing both participants
  const existing = await db
    .select({ chatId: chatParticipants.chatId })
    .from(chatParticipants)
    .where(inArray(chatParticipants.userId, [user.id, targetUserId]))
    .groupBy(chatParticipants.chatId)
    .having(sql`count(*) = 2`)
    .limit(1)

  if (existing.length > 0) {
    return c.json(
      {
        error: 'Chat already exists with this user',
        chatId: existing[0].chatId,
      },
      400
    )
  }

  const chatId = crypto.randomUUID()

  await db.transaction(async (tx) => {
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

  // Fetch minimal participant info (id, username) for event payload
  const participants = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(inArray(users.id, [user.id, targetUserId]))

  // Broadcast new chat event to all connected clients
  emitNewChat({ chatId, participants })

  return c.json({ chatId })
})
