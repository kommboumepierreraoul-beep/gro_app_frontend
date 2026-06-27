"use client";

import { useState } from "react";
import { PostCard } from "../feed/PostCard";

export default function ProfilePosts() {
  const [posts] = useState([]);

  return (
    <div>
      <h3 className="font-bold text-lg mb-4">Posts</h3>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucun post</p>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
