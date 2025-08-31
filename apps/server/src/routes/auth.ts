import { Hono } from 'hono'
import { db } from '../db'
import { users } from '../db/schema'
import { hashPassword, signJwt, verifyPassword } from '../auth/jwt'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../auth/middleware'
import type { Variables } from '..'

export const authRoutes = new Hono<{
  Variables: Variables
}>()

authRoutes.post('/login', async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400)
  }

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  })

  if (!user) {
    return c.json({ error: 'Invalid username or password' }, 401)
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash)

  if (!isPasswordValid) {
    return c.json({ error: 'Invalid username or password' }, 401)
  }

  const token = await signJwt({
    id: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  })

  return c.json({ token })
})

authRoutes.post('/register', async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400)
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  })

  if (existingUser) {
    return c.json({ error: 'Username already exists' }, 400)
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    passwordHash: await hashPassword(password),
  }

  await db.insert(users).values(user)

  const token = await signJwt({
    id: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  })

  return c.json({ token })
})

authRoutes.get('/token', authMiddleware, async (c) => {
  const payload = c.get('user')
  if (!payload) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({ payload })
})
