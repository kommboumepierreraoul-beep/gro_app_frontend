/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export default function CommentCard({ comment }: { comment: any }) {
  return (
    <div className="flex gap-2 items-start bg-white rounded-lg p-3 shadow-sm">
      <div className="bg-gray-200 w-8 h-8 rounded-full flex-shrink-0 "></div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{comment.author?.name}</p>
        <p className="text-sm">{comment.content}</p>
        <p className="text-xs text-gray-500 mt-1">{comment.createdAt}</p>
      </div>
    </div>
  );
}
