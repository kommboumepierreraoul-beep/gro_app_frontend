// src/types/community.types.ts

export interface CommunityUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  avatar: string | null;
  role: "user" | "admin";
  bio?: string;
  headline?: string;
  location?: string;
  website?: string;
  banner?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  is_me: boolean;
  email_verified_at: string | null;
  created_at: string;
}

export type PostType = "text" | "image" | "video" | "announcement" | "shared";

export interface Post {
  id: number;
  content: string;
  type: PostType;
  media_urls: string[];
  author: Pick<
    CommunityUser,
    "id" | "firstname" | "lastname" | "avatar" | "headline" | "role"
  >;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_shared: boolean;
  shared_post?: Post;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  content: string;
  author: Pick<CommunityUser, "id" | "firstname" | "lastname" | "avatar">;
  post_id: number;
  parent_id?: number;
  likes_count: number;
  is_liked: boolean;
  replies?: Comment[];
  created_at: string;
}

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender: Pick<CommunityUser, "id" | "firstname" | "avatar">;
  conversation_id: number;
  status: MessageStatus;
  media_url?: string;
  is_mine: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  is_group: boolean;
  name?: string;
  participants: Pick<
    CommunityUser,
    "id" | "firstname" | "lastname" | "avatar"
  >[];
  last_message?: {
    content: string;
    sender: string;
    created_at: string;
  };
  unread_count: number;
  updated_at: string;
}

export type NotificationType =
  | "like_post"
  | "like_comment"
  | "comment"
  | "reply"
  | "follow"
  | "share"
  | "mention"
  | "announcement";

export interface Notification {
  id: number | string;
  type: NotificationType;
  actor: Pick<CommunityUser, "id" | "firstname" | "lastname" | "avatar">;
  post?: Pick<Post, "id" | "content">;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type AnnouncementCategory =
  | "job"
  | "event"
  | "news"
  | "training"
  | "other";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: AnnouncementCategory;
  cover_image?: string;
  author: Pick<CommunityUser, "id" | "firstname" | "lastname" | "avatar">;
  likes_count: number;
  is_liked: boolean;
  expires_at?: string;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
}
