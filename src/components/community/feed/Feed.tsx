'use client'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PostCard } from './PostCard'
import { CreatePostCard } from './CreatePostCard'
import { useFeed } from '@/hooks/community/useFeed'
 
export function Feed() {
  const { posts, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeed()
 
  if (isLoading) {
    return (
      <div className="space-y-4">
        <CreatePostCard />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-2 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }
 
  return (
    <div className="space-y-4">
      <CreatePostCard />
 
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-semibold text-gray-700">Votre fil est vide</p>
          <p className="text-sm text-gray-400 mt-1">Suivez des personnes pour voir leurs publications ici.</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={
            <div className="text-center py-4 text-sm text-gray-400">
              Chargement...
            </div>
          }
          endMessage={
            <p className="text-center py-4 text-sm text-gray-300">
              Vous avez tout vu ! 
            </p>
          }
          className="space-y-4"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </InfiniteScroll>
      )}
    </div>
  )
}
 