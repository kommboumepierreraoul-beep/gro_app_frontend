"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ConversationItemProps {
  conversation: {
    id: number;
    participantName: string;
    participantAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline?: boolean;
    isGroup?: boolean;
  };
}

export default function ConversationItem({
  conversation,
}: ConversationItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/messages/${conversation.id}`;

  const initials = conversation.participantName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-3 text-decoration-none transition-all duration-150 ${
        isActive ? "active-conversation" : ""
      }`}
      style={{
        borderBottom: "1px solid rgba(194,201,187,0.3)",
        background: isActive ? "rgba(21,66,18,0.05)" : "transparent",
        borderLeft: isActive ? "3px solid #154212" : "3px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(21,66,18,0.03)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "";
        }
      }}
    >
      {/* Avatar / Initiales */}
      <div className="relative flex-shrink-0">
        {conversation.participantAvatar ? (
          <img
            src={conversation.participantAvatar}
            alt={conversation.participantName}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm"
            style={{
              background: conversation.isGroup
                ? "linear-gradient(135deg, #2d5a27, #154212)"
                : "linear-gradient(135deg, #bcf0ae, #a1d494)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: conversation.isGroup ? "#bcf0ae" : "#23501e",
            }}
          >
            {conversation.isGroup ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ) : (
              initials
            )}
          </div>
        )}

        {/* Indicateur en ligne */}
        {conversation.isOnline && !conversation.isGroup && (
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: "#4ade80", borderColor: "#f9faf2" }}
          />
        )}

        {/* Badge non lu */}
        {conversation.unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-white rounded-full flex items-center justify-center text-[9px] font-bold px-1 border-2 shadow-sm"
            style={{ background: "#154212", borderColor: "#f9faf2" }}
          >
            {conversation.unreadCount > 99
              ? "99+"
              : conversation.unreadCount > 9
                ? "9+"
                : conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Informations conversation */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-1">
          <span
            className="text-sm truncate"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: conversation.unreadCount > 0 ? 700 : 600,
              color: "#191c18",
            }}
          >
            {conversation.participantName}
            {conversation.isGroup && (
              <span
                className="text-[10px] font-normal ml-1.5"
                style={{ color: "#72796e" }}
              >
                • Groupe
              </span>
            )}
          </span>
          <span
            className="text-[10px] sm:text-[11px] flex-shrink-0"
            style={{ color: "#72796e" }}
          >
            {conversation.lastMessageTime}
          </span>
        </div>

        <p
          className="text-xs truncate mt-0.5"
          style={{
            color: conversation.unreadCount > 0 ? "#154212" : "#72796e",
            fontWeight: conversation.unreadCount > 0 ? 500 : 400,
          }}
        >
          {conversation.lastMessage || "Aucun message"}
        </p>
      </div>

      <style jsx>{`
        .active-conversation {
          background: rgba(21, 66, 18, 0.05);
          border-left: 3px solid #154212;
        }

        @media (max-width: 640px) {
          .active-conversation {
            background: rgba(21, 66, 18, 0.08);
          }
        }
      `}</style>
    </Link>
  );
}
