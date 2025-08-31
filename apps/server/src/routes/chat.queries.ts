import { db } from '../db'
import { eq, ilike, and, not } from 'drizzle-orm'
import { users as usersTable } from '../db/schema'
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
