'use client'

import {
  LogOutIcon,
  Moon,
  Settings2,
  Sun,
  TrashIcon,
  UserIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <Moon className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem>
          <UserIcon className="size-5" />
          <span>User Settings</span>
        </DropdownMenuItem> */}
        <DropdownMenuItem onClick={signOut}>
          <LogOutIcon className="size-5" />
          <span>Sign out</span>
        </DropdownMenuItem>
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <TrashIcon className="size-5" />
          <span>Delete account</span>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
