import 'server-only'

import { cookies } from 'next/headers'
import { fetcher } from '@/lib/utils'
import { TOKEN_COOKIE } from '@/lib/constants'
import { TokenResponseSchema } from '@/lib/types'

export async function checkAuth() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value
  if (!token) return false

  try {
    const res = await fetcher(
      '/auth/token',
      {
        method: 'GET',
      },
      token
    )

    const parsed = TokenResponseSchema.safeParse(res)
    if (!parsed.success || !parsed.data.valid) return false

    return true
  } catch {
    return false
  }
}
