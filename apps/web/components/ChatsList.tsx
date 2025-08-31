'use client'

import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { useState } from 'react'
import type { Chat } from '@/lib/types'
import Settings from './Settings'
import NewChatDialog from './NewChatDialog'
import Link from 'next/link'

export default function ChatsList() {
  const [search, setSearch] = useState('')
  const chats: Chat[] = []

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
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-center text-muted-foreground">
            No chats found. Create one to start chatting.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {chats.map((chat) => (
              <div key={chat.id}>{chat.name}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
