"use client";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender: any;
    isOwn: boolean;
    createdAt: string;
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          message.isOwn ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        <p>{message.content}</p>
        <p
          className={`text-xs ${message.isOwn ? "text-blue-100" : "text-gray-500"} mt-1`}
        >
          {message.createdAt}
        </p>
      </div>
    </div>
  );
}
