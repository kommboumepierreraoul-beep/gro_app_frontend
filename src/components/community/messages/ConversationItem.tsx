"use client";
import Link from "next/link";

export default function ConversationItem({
  conversation,
}: {
  conversation: any;
}) {
  const initials = conversation.participantName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-3 px-3.5 py-3 text-decoration-none transition-colors"
      style={{ borderTop: "1px solid rgba(194,201,187,0.3)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(21,66,18,0.04)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <div
        className="relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
        style={{
          background: "linear-gradient(135deg, #bcf0ae, #a1d494)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: "#23501e",
        }}
      >
        {initials}
        {conversation.isOnline && (
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: "#4ade80", borderColor: "#f9faf2" }}
          />
        )}
        {conversation.unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-white rounded-full flex items-center justify-center text-[9px] font-bold px-1 border-2"
            style={{ background: "#154212", borderColor: "#f9faf2" }}
          >
            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span
            className="text-sm font-semibold truncate"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#191c18",
            }}
          >
            {conversation.participantName}
          </span>
          <span
            className="text-[10px] flex-shrink-0 ml-2"
            style={{ color: "#72796e" }}
          >
            {conversation.lastMessageTime}
          </span>
        </div>
        <p
          className="text-xs truncate mt-0.5"
          style={{
            color: conversation.unreadCount > 0 ? "#154212" : "#42493e",
            fontWeight: conversation.unreadCount > 0 ? 500 : 400,
          }}
        >
          {conversation.lastMessage}
        </p>
      </div>
    </Link>
  );
}
