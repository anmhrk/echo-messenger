'use client'

import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ChatListItem } from '@/lib/types'
import { ChatListResponseSchema } from '@/lib/types'
import Settings from './Settings'
import NewChatDialog from './NewChatDialog'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { fetcher } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { format, isThisYear, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { Skeleton } from './ui/skeleton'
import { usePathname } from 'next/navigation'

export default function ChatsList() {
  const [search, setSearch] = useState('')
  const pathname = usePathname()
  const chatId = pathname.split('/chats/')[1]
  const { user, getAuthToken } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['chats', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ChatListItem[]> => {
      const token = getAuthToken()
      const res = await fetcher(
        `/chat/all/${user!.id}`,
        {
          method: 'GET',
        },
        token
      )
      const parsed = ChatListResponseSchema.parse(res)
      return parsed.chats
    },
  })

  const chats = useMemo(() => {
    const list = data ?? []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((c) => {
      const name = c.otherParticipant?.username?.toLowerCase() ?? ''
      const last = c.latestMessage?.content?.toLowerCase() ?? ''
      return name.includes(q) || last.includes(q)
    })
  }, [data, search])

  function renderLastMessageTime(sentAt?: string) {
    if (!sentAt) return null
    const d = new Date(sentAt)
    if (isToday(d)) return format(d, 'p')
    if (isThisYear(d)) return format(d, 'MMM d')
    return format(d, 'MMM d, yyyy')
  }

  return (
    <div className="w-full md:w-1/4 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-zinc-800 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Link className="text-lg font-medium cursor-pointer" href="/chats">
          Chats
        </Link>
        <div className="flex items-center">
          <Settings />
          <NewChatDialog />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search your chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="gap-2 flex flex-col">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-13 w-full" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-center text-muted-foreground">
            No chats found. Create one to start chatting.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                className={cn(
                  'block rounded-lg hover:bg-accent',
                  chat.id === chatId && 'bg-primary/10 hover:bg-primary/10'
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={undefined}
                      alt={chat.otherParticipant?.username}
                    />
                    <AvatarFallback className="bg-primary/10 hover:bg-primary/10">
                      {chat.otherParticipant?.username
                        ?.slice(0, 1)
                        .toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate line-clamp-1">
                        {chat.otherParticipant?.username || 'Unknown User'}
                      </div>
                      <div className="text-xs text-muted-foreground ml-2 shrink-0">
                        {renderLastMessageTime(chat.latestMessage?.sentAt)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2 truncate">
                      {chat.latestMessage?.content || 'Say hello 👋'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
