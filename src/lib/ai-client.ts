// lib/ai-client.ts

import type {
  SendMessageResponse,
  AIConversation,
  ModerationResult,
} from "@/types/ai.types";

/**
 * Client centralisé pour toutes les requêtes vers l'API IA Laravel.
 *
 * La clé DeepSeek n'est JAMAIS exposée ici.
 * Toutes les requêtes transitent par le backend Laravel.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

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
      // Le token XSRF est géré automatiquement via les cookies avec Sanctum
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

// ──────────────────────────────────────────────────────────────────
// Chat
// ──────────────────────────────────────────────────────────────────

/**
 * Envoie un message et attend la réponse complète.
 */
export async function sendMessage(
  message: string,
  sessionId: string,
): Promise<SendMessageResponse> {
  return fetchAPI<SendMessageResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

/**
 * Ouvre un flux SSE pour le streaming de réponse.
 * Retourne une fonction d'annulation (close).
 *
 * @param onChunk  Appelé pour chaque token reçu
 * @param onDone   Appelé quand le stream est terminé
 * @param onError  Appelé en cas d'erreur
 * @returns        Fonction pour fermer le stream manuellement
 */
export function streamMessage(
  message: string,
  sessionId: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError?: (error: Error) => void,
): () => void {
  const params = new URLSearchParams({
    message,
    session_id: sessionId,
  });

  const url = `${BASE_URL}/ai/chat/stream?${params.toString()}`;
  const es = new EventSource(url, { withCredentials: true });

  es.onmessage = (event: MessageEvent<string>) => {
    try {
      if (event.data === "[DONE]") {
        es.close();
        onDone();
        return;
      }

      const data = JSON.parse(event.data)
      if (data.done) {
        es.close();
        onDone();
        return;
      }

      if (data.content) {
        onChunk(data.content);
      }
    } catch {
      // Ignore les lignes de keep-alive mal formées
    }
  };

  es.onerror = () => {
    es.close();
    onError?.(new Error("Connexion au stream interrompue"));
    onDone();
  };

  // Retourne une fonction d'annulation
  return () => es.close();
}

// ──────────────────────────────────────────────────────────────────
// Conversations
// ──────────────────────────────────────────────────────────────────

export async function startConversation(): Promise<{
  session_id: string;
  id: number;
}> {
  return fetchAPI("/ai/conversations", { method: "POST" });
}

export async function listConversations(page = 1): Promise<{
  data: AIConversation[];
  current_page: number;
  last_page: number;
}> {
  return fetchAPI(`/ai/conversations?page=${page}`);
}

// ──────────────────────────────────────────────────────────────────
// Suggestions / Outils de rédaction
// ──────────────────────────────────────────────────────────────────

/**
 * Génère des tags pour un contenu donné.
 */
export async function generateTags(
  content: string,
  maxTags = 5,
): Promise<string[]> {
  const res = await fetchAPI<{ tags: string[] }>("/ai/tags", {
    method: "POST",
    body: JSON.stringify({ content, max_tags: maxTags }),
  });
  return res.tags;
}

/**
 * Résume un fil de discussion.
 */
export async function summarizeThread(
  messages: { author: string; content: string }[],
): Promise<string> {
  const res = await fetchAPI<{ summary: string }>("/ai/summarize", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
  return res.summary;
}

/**
 * Améliore la rédaction d'un post.
 */
export async function improvePost(
  content: string,
): Promise<{ original: string; improved: string }> {
  return fetchAPI("/ai/improve-post", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

/**
 * Lance une modération manuelle (admin uniquement).
 */
export async function moderateContent(
  content: string,
): Promise<ModerationResult> {
  return fetchAPI("/ai/moderate", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
