import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [usernameClient()],
  baseURL: import.meta.env.VITE_SERVER_URL,
})
