import 'server-only'

import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'
import { z } from 'zod'
import { fetcher } from '@/lib/utils'
import { TOKEN_COOKIE } from '@/lib/constants'
import { type User, JwtPayloadSchema } from '@/lib/types'

const TokenVerifyResponse = z
  .object({
    valid: z.boolean(),
  })
  .loose()

export async function getServerUser(): Promise<User> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value
  if (!token) return null

  try {
    const res = await fetcher(
      '/auth/token',
      {
        method: 'GET',
      },
      token
    )

    const parsed = TokenVerifyResponse.safeParse(res)
    if (!parsed.success || !parsed.data.valid) return null

    const decoded = decodeJwt(token)
    const payload = JwtPayloadSchema.safeParse(decoded)
    if (!payload.success) return null

    return { id: payload.data.id, username: payload.data.username }
  } catch {
    return null
  }
}
