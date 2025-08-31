import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(Bun.env.JWT_SECRET)
const SALT_ROUNDS = 10

export type JwtPayload = {
  id: string
  username: string
  exp: number
}

export async function hashPassword(password: string) {
  return await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: SALT_ROUNDS,
  })
}

export async function verifyPassword(password: string, hash: string) {
  return await Bun.password.verify(password, hash)
}

export async function signJwt(payload: JwtPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30 days from now')
    .sign(JWT_SECRET)
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  })

  return payload as JwtPayload
}
