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
import { fetcher } from '@/lib/utils'
import Cookies from 'js-cookie'

const authSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type AuthFormData = z.infer<typeof authSchema>

export default function AuthPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const onSubmit: SubmitHandler<AuthFormData> = async (data) => {
    try {
      setIsLoading(true)

      const res = await fetcher(isLogin ? '/auth/login' : '/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (res.error) {
        toast.error(res.error)
        return
      }

      Cookies.set('token', res.token)
      router.push('/chats')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to login')
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
          <CardTitle className="text-2xl font-semibold">
            {isLogin ? 'Log in to your account' : 'Create an account'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                {...register('username')}
                className="w-full rounded-md"
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="w-full rounded-md"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-500/80 transition-colors font-semibold py-3 mt-6"
            >
              {isLoading
                ? isLogin
                  ? 'Logging in...'
                  : 'Creating account...'
                : isLogin
                  ? 'Log in'
                  : 'Create account'}
            </Button>
          </form>

          <p className="text-left text-xs">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register' : 'Log in'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
