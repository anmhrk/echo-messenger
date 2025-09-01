'use client'

import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash.debounce'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { PenBoxIcon, Search } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { User } from '@/lib/auth-client'

export default function NewChatDialog({ user }: { user: User }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debouncedSetter = useMemo(() => debounce((v: string) => setDebouncedQuery(v), 500), [])
  useEffect(() => {
    debouncedSetter(query)
    return () => debouncedSetter.cancel()
  }, [query, debouncedSetter])

  const {
    data: searchUsers,
    isLoading,
    error: searchError,
  } = useQuery(
    trpc.chatQueries.searchUsers.queryOptions(
      {
        query: debouncedQuery,
      },
      {
        enabled: !!debouncedQuery && open,
        staleTime: 30_000,
      }
    )
  )

  const createChat = useMutation(
    trpc.chatMutations.createChat.mutationOptions({
      onSuccess: (data) => {
        if (data?.chatId) {
          router.push(`/chats/${data.chatId}`)
          setOpen(false)
          setQuery('')
          setDebouncedQuery('')
        }
      },
    })
  )

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
            <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
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
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : debouncedQuery ? (
              searchUsers && searchUsers.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {searchUsers.map((u) => (
                    <li key={u.id}>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          if (u.username === user.username) {
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
              ) : searchError ? (
                <div className="text-muted-foreground p-3 text-center text-sm">
                  {searchError.message}
                </div>
              ) : (
                <div className="text-muted-foreground p-3 text-center text-sm">
                  No users found for &quot;{debouncedQuery}&quot;
                </div>
              )
            ) : (
              <div className="text-muted-foreground p-3 text-center text-sm">
                Type to search users…
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
