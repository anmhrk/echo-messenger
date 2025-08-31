import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetcher(
  endpoint: string,
  options: RequestInit,
  token?: string
) {
  return fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      // if token is provided meaning this is an authenticated request, add it to the headers
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  }).then((res) => res.json())
}
