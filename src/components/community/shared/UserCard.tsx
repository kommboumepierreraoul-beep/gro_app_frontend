
("use client");
import Link from "next/link";
import { Avatar } from "./Avatar";
import { CommunityUser } from "@/types/community.types";

interface UserCardProps {
  user: CommunityUser;
  extra?: React.ReactNode;
}

export function UserCard({ user, extra }: UserCardProps) {
  return (
    <div className="flex items-center gap-3">
      <Link href={`/profile/${user.id}`}>
        <Avatar src={user.avatar} firstname={user.firstname} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${user.id}`}
          className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition truncate block"
        >
          {user.firstname} {user.lastname}
        </Link>
        {user.headline && (
          <p className="text-xs text-gray-500 truncate">{user.headline}</p>
        )}
      </div>
      {extra}
    </div>
  );
}