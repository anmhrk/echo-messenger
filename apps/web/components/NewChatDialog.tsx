'use client'

import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { PenBoxIcon, Search } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetcher } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { User } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function NewChatDialog() {
  const { getAuthToken, user } = useAuth()
  const token = getAuthToken()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debouncedSetter = useMemo(
    () => debounce((v: string) => setDebouncedQuery(v), 500),
    []
  )
  useEffect(() => {
    debouncedSetter(query)
    return () => debouncedSetter.cancel()
  }, [query, debouncedSetter])

  const search = useQuery<{ users: User[] }, { error?: string }>({
    queryKey: ['search-users', debouncedQuery],
    enabled: !!debouncedQuery && !!token && open,
    queryFn: async () =>
      fetcher(
        `/chat/search-users?query=${debouncedQuery}`,
        {
          method: 'GET',
        },
        token
      ),
    staleTime: 30_000,
  })

  const createChat = useMutation<
    { chatId?: string; error?: string },
    unknown,
    { targetUserId: string }
  >({
    mutationKey: ['create-chat'],
    mutationFn: async (payload) =>
      fetcher(
        '/chat/create',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        token
      ),
    onSuccess: (res) => {
      if (res?.error) {
        // If chat already exists, redirect to it
        if (res.chatId) {
          router.push(`/chats/${res.chatId}`)
          setOpen(false)
          setQuery('')
          setDebouncedQuery('')
        }
        toast.error(res.error)
        return
      }
      toast.success('Chat created')
      router.push(`/chats/${res.chatId}`)
      setOpen(false)
      setQuery('')
      setDebouncedQuery('')
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) {
          setQuery('')
          setDebouncedQuery('')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="New chat">
          <PenBoxIcon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a new chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search users by username"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              className="pl-8"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {search.isLoading ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : debouncedQuery ? (
              search.data && search.data.users.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {search.data.users.map((u) => (
                    <li key={u.id}>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          if (user?.username && u.username === user.username) {
                            toast.error('You cannot chat with yourself')
                            return
                          }
                          createChat.mutate({ targetUserId: u.id })
                        }}
                        className="w-full justify-start px-2"
                      >
                        @{u.username}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No users found
                </div>
              )
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Type to search users…
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
