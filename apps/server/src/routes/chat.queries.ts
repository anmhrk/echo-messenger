import { db } from '../db'
import { eq, ilike, and, not, inArray, desc } from 'drizzle-orm'
import { users as usersTable, chatParticipants, messages } from '../db/schema'
import { authMiddleware } from '../auth/middleware'
import { Hono } from 'hono'
import type { Variables } from '..'

export const chatQueries = new Hono<{ Variables: Variables }>()

chatQueries.use(authMiddleware)

chatQueries.get('/search-users', async (c) => {
  const query = c.req.query('query')
  if (!query) {
    return c.json({ error: 'Query is required' }, 400)
  }

  const user = c.get('user')
  const lowercaseQuery = query.toLowerCase()

  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
    })
    .from(usersTable)
    .where(
      and(
        ilike(usersTable.username, `%${lowercaseQuery}%`),
        not(eq(usersTable.id, user.id))
      )
    )
    .limit(20)

  return c.json({ users })
})

// Get all chats for the authenticated user
chatQueries.get('/all/:userId', async (c) => {
  const paramUserId = c.req.param('userId')
  const user = c.get('user')

  if (!paramUserId) {
    return c.json({ error: 'User ID is required' }, 400)
  }

  if (user.id !== paramUserId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  // First, collect all chat IDs the user participates in
  const userChatRows = await db
    .select({ chatId: chatParticipants.chatId })
    .from(chatParticipants)
    .where(eq(chatParticipants.userId, paramUserId))

  const chatIds = userChatRows.map((r) => r.chatId)

  if (chatIds.length === 0) {
    return c.json({ chats: [] })
  }

  // For each chat, fetch the other participant's basic info
  const otherParticipants = await db
    .select({
      chatId: chatParticipants.chatId,
      id: chatParticipants.userId,
      username: usersTable.username,
    })
    .from(chatParticipants)
    .innerJoin(usersTable, eq(usersTable.id, chatParticipants.userId))
    .where(
      and(
        inArray(chatParticipants.chatId, chatIds),
        not(eq(chatParticipants.userId, paramUserId))
      )
    )

  const otherByChat = new Map(
    otherParticipants.map((p) => [p.chatId, { id: p.id, username: p.username }])
  )

  // Fetch latest messages for these chats and keep only the most recent per chat
  const messageRows = await db
    .select({
      id: messages.id,
      content: messages.content,
      sentAt: messages.sentAt,
      chatId: messages.chatId,
      senderId: messages.senderId,
    })
    .from(messages)
    .where(inArray(messages.chatId, chatIds))
    .orderBy(desc(messages.sentAt))

  const latestByChat = new Map<string, (typeof messageRows)[number]>()
  for (const m of messageRows) {
    if (!latestByChat.has(m.chatId)) {
      latestByChat.set(m.chatId, m)
    }
  }

  const chats = chatIds.map((id) => {
    const other = otherByChat.get(id)
    const latest = latestByChat.get(id)
    return {
      id,
      otherParticipant: other ?? null,
      latestMessage: latest
        ? {
            id: latest.id,
            content: latest.content,
            sentAt: latest.sentAt,
            senderId: latest.senderId,
          }
        : undefined,
    }
  })

  // Sort chats by latest message time (descending)
  chats.sort((a, b) => {
    const aTime = a.latestMessage?.sentAt
      ? new Date(a.latestMessage.sentAt).getTime()
      : 0
    const bTime = b.latestMessage?.sentAt
      ? new Date(b.latestMessage.sentAt).getTime()
      : 0
    return bTime - aTime
  })

  return c.json({ chats })
})
