import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  image: string | null
  className?: string
}

export default function UserAvatar({ image, className }: UserAvatarProps) {
  return (
    <Avatar className={cn('h-9 w-9', className)}>
      <AvatarImage src={image ?? undefined} alt="User avatar" />
      <AvatarFallback className="bg-primary/20 relative">
        <UserIcon />
      </AvatarFallback>
    </Avatar>
  )
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      className="absolute top-0.5 size-10"
      viewBox="0 0 24 24"
    >
      <path
        className="fill-current opacity-70 dark:opacity-90"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  )
}
