import type {
  AIConversation,
  ChatResponse,
  ModerationResult,
  SendMessageResponse,
} from "@/types/ai.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.message ?? body?.error ?? `Erreur HTTP ${res.status}`;
    throw new APIError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export async function sendMessage(
  message: string,
  conversationId?: string,
): Promise<SendMessageResponse> {
  return fetchAPI<ChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      stream: false,
    }),
  });
}

export async function listConversations(page = 1): Promise<{
  data: AIConversation[];
  current_page: number;
  last_page: number;
}> {
  return fetchAPI(`/ai/conversations?page=${page}`);
}

export async function generateTags(
  content: string,
  maxTags = 5,
): Promise<string[]> {
  const res = await fetchAPI<{ tags: string[] }>("/ai/suggestions/tags", {
    method: "POST",
    body: JSON.stringify({ content, max: maxTags }),
  });
  return res.tags;
}

export async function summarizeThread(
  messages: { author: string; content: string }[],
): Promise<string> {
  const content = messages
    .map((message) => `${message.author}: ${message.content}`)
    .join("\n");

  const res = await fetchAPI<{ summary: string }>("/ai/suggestions/summarize", {
    method: "POST",
    body: JSON.stringify({ content, language: "fr" }),
  });

  return res.summary;
}

export async function improvePost(content: string): Promise<{
  original: string;
  improved: string;
}> {
  const res = await fetchAPI<{ improved: string }>("/ai/suggestions/improve", {
    method: "POST",
    body: JSON.stringify({ content, language: "fr" }),
  });

  return {
    original: content,
    improved: res.improved,
  };
}

export async function moderateContent(
  content: string,
): Promise<ModerationResult> {
  return fetchAPI("/ai/moderation/check", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
