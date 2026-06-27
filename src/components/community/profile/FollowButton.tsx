'use client'
import { useFollow } from '@/hooks/community/useFollow'
 
interface FollowButtonProps {
  userId: number
  isFollowing: boolean
}
 
export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const { toggle, isLoading } = useFollow(userId, false)
 
  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={isLoading}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
        isFollowing
          ? 'border-2 border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
      } disabled:opacity-50`}
    >
      {isLoading ? '...' : isFollowing ? 'Abonné ✓' : '+ Suivre'}
    </button>
  )
}