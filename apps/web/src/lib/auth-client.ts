import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [usernameClient()],
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
})

// use the auth client typed user instead of generic user from better-auth
// so that it includes username fields in the type
// same user will come from getSession too because both server auth config and auth client use the same plugins
type AuthClient = typeof authClient
type SessionReturn = ReturnType<AuthClient['useSession']>
type AuthData = NonNullable<SessionReturn>['data']
export type User = NonNullable<AuthData>['user']
