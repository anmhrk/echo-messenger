import 'server-only'
import { authClient } from './auth-client'
import { headers } from 'next/headers'

export async function getUser() {
  const session = await authClient.getSession({ fetchOptions: { headers: await headers() } })

  if (!session || !session.data) {
    return null
  }

  return session.data.user
}
