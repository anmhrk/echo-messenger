import { verifyJwt } from './jwt'
import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.split(' ')[1]
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const payload = await verifyJwt(token)
  if (!payload) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', payload)
  await next()
})
