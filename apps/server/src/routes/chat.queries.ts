import { db } from '../db'
import { chatRoutes } from './chat'
import { eq, ilike, and, not } from 'drizzle-orm'
import { users as usersTable } from '../db/schema'

chatRoutes.get('/search-users', async (c) => {
  const { query } = c.req.query()
  if (!query) {
    return c.json({ error: 'Query is required' }, 400)
  }

  const user = c.get('user')
  const lowercaseQuery = query.toLowerCase()

  const users = await db
    .select()
    .from(usersTable)
    .where(
      and(
        ilike(usersTable.username, `%${lowercaseQuery}%`),
        not(eq(usersTable.id, user.id))
      )
    )
    .limit(20)

  return c.json(users)
})
