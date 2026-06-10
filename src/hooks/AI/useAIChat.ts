// hooks/useAIChat.ts
"use client";

import { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  sendMessage,
  streamMessage,
  APIError,
} from "@/lib/ai-client";

import type { ChatMessage } from "@/types/ai";

interface UseAIChatOptions {
  /** Active le streaming SSE */
  streaming?: boolean;

  /** Session existante */
  initialSessionId?: string;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;

  sendUserMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  retryLastMessage: () => Promise<void>;
}

/**
 * Hook principal du chat IA
 */
export function useAIChat(
  options: UseAIChatOptions = {},
): UseAIChatReturn {

  const {
    streaming = true,
    initialSessionId,
  } = options;

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string>(
    () => initialSessionId ?? uuidv4(),
  );

  // ─────────────────────────────────────────────
  // REFS
  // ─────────────────────────────────────────────

  const cancelStreamRef = useRef<(() => void) | null>(null);

  const lastMessageRef = useRef<string>("");

  // ─────────────────────────────────────────────
  // HANDLER : DIRECT RESPONSE
  // ─────────────────────────────────────────────

  async function handleDirectResponse(
    content: string,
  ): Promise<void> {

    try {
      const res = await sendMessage(
        content,
        sessionId,
      );

      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: res.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        assistantMsg,
      ]);
    } catch (err) {

      const message =
        err instanceof APIError
          ? err.message
          : "Une erreur inattendue s'est produite.";

      setError(message);

    } finally {
      setIsLoading(false);
    }
  }

  // ─────────────────────────────────────────────
  // HANDLER : STREAMING RESPONSE
  // ─────────────────────────────────────────────

  async function handleStreamingResponse(
    content: string,
  ): Promise<void> {

    return new Promise((resolve) => {

      const assistantMsgId = uuidv4();

      // Message assistant vide
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [
        ...prev,
        assistantMsg,
      ]);

      cancelStreamRef.current = streamMessage(

        content,
        sessionId,

        // ───────────────────────────
        // onChunk
        // ───────────────────────────

        (chunk) => {

          setMessages((prev) => {

            return prev.map((msg) => {

              if (msg.id !== assistantMsgId) {
                return msg;
              }

              return {
                ...msg,
                content: msg.content + chunk,
              };
            });
          });
        },

        // ───────────────────────────
        // onDone
        // ───────────────────────────

        () => {

          setMessages((prev) => {

            return prev.map((msg) => {

              if (msg.id !== assistantMsgId) {
                return msg;
              }

              return {
                ...msg,
                isStreaming: false,
              };
            });
          });

          setIsLoading(false);

          resolve();
        },

        // ───────────────────────────
        // onError
        // ───────────────────────────

        (err) => {

          setError(err.message);

          setMessages((prev) => {

            return prev.map((msg) => {

              if (msg.id !== assistantMsgId) {
                return msg;
              }

              return {
                ...msg,
                isStreaming: false,
              };
            });
          });

          setIsLoading(false);

          resolve();
        },
      );
    });
  }

  // ─────────────────────────────────────────────
  // SEND MESSAGE
  // ─────────────────────────────────────────────

  const sendUserMessage = useCallback(
    async (content: string) => {

      if (!content.trim()) return;

      if (isLoading) return;

      // Annule stream précédent
      cancelStreamRef.current?.();

      setError(null);

      setIsLoading(true);

      lastMessageRef.current = content;

      // Message user
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [
        ...prev,
        userMsg,
      ]);

      if (streaming) {

        await handleStreamingResponse(content);

      } else {

        await handleDirectResponse(content);
      }
    },
    [
      isLoading,
      streaming,
      sessionId,
    ],
  );

  // ─────────────────────────────────────────────
  // CLEAR CONVERSATION
  // ─────────────────────────────────────────────

  const clearConversation = useCallback(() => {

    cancelStreamRef.current?.();

    setMessages([]);

    setError(null);

    setIsLoading(false);

    setSessionId(uuidv4());

    lastMessageRef.current = "";

  }, []);

  // ─────────────────────────────────────────────
  // RETRY LAST MESSAGE
  // ─────────────────────────────────────────────

  const retryLastMessage = useCallback(
    async () => {

      if (!lastMessageRef.current) {
        return;
      }

      // Supprime les 2 derniers messages
      setMessages((prev) => {

        const filtered = [...prev];

        // assistant
        if (
          filtered[filtered.length - 1]?.role ===
          "assistant"
        ) {
          filtered.pop();
        }

        // user
        if (
          filtered[filtered.length - 1]?.role ===
          "user"
        ) {
          filtered.pop();
        }

        return filtered;
      });

      setError(null);

      await sendUserMessage(
        lastMessageRef.current,
      );
    },
    [sendUserMessage],
  );

  // ─────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────

  return {
    messages,
    isLoading,
    error,
    sessionId,

    sendUserMessage,

    clearConversation,

    retryLastMessage,
  };
}
