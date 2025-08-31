'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

const loginSchema = z.object({
  usernameOrEmail: z.string().min(4, 'Username or email must be at least 4 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true)

    try {
      if (data.usernameOrEmail.includes('@')) {
        await authClient.signIn.email({
          email: data.usernameOrEmail,
          password: data.password,
        })
      } else {
        await authClient.signIn.username({
          username: data.usernameOrEmail,
          password: data.password,
        })
      }

      router.push('/chats')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 max-w-md w-full">
      <Button variant="outline" className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span>Back</span>
        </Link>
      </Button>
      <Card className="w-full max-w-2xl rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Log in to your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium mb-2">
                Username or Email
              </label>
              <Input
                id="usernameOrEmail"
                type="text"
                {...register('usernameOrEmail')}
                className="w-full rounded-md"
              />
              {errors.usernameOrEmail && (
                <p className="text-red-400 text-sm mt-1">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="w-full rounded-md"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-500/80 transition-colors font-semibold py-3 mt-6"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <p className="text-left text-xs">
            Don't have an account?{' '}
            <Link
              className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
              href="/signup"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
