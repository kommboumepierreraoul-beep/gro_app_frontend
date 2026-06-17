/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useStreamingChat.ts

import { useState, useCallback, useRef } from "react";
import { ChatRequest } from "@/types/ai.types";
import { tokenService } from "@/lib/auth-token";

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamMessage = useCallback(
    async (request: ChatRequest, onChunk?: (chunk: string) => void) => {
      setIsStreaming(true);
      setStreamingContent("");
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        // Récupérer le token via tokenService (comme dans votre axios)
        const token = tokenService.get();

        console.log("🔑 Token présent:", !!token);

        if (!token) {
          console.error("❌ Pas de token");
          setError("Non authentifié. Veuillez vous reconnecter.");
          setIsStreaming(false);
          throw new Error("No authentication token found");
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/ai/chat`;
        console.log("📡 Streaming vers:", url);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Utilise le token de tokenService
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ ...request, stream: true }),
          signal: abortControllerRef.current.signal,
        });

        console.log("📡 Statut réponse:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Erreur réponse:", errorText.substring(0, 200));

          if (response.status === 401) {
            tokenService.remove();
            setError("Session expirée. Redirection...");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
          } else {
            setError(`Erreur ${response.status}`);
          }

          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No reader available");

        let buffer = "";
        let fullContent = "";
        let currentConversationId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith("event: meta")) {
              const nextLine = lines[i + 1];
              if (nextLine?.startsWith("data: ")) {
                try {
                  const data = JSON.parse(nextLine.substring(6));
                  if (data.conversation_id) {
                    currentConversationId = data.conversation_id;
                    setConversationId(currentConversationId);
                    console.log(
                      "📝 ID Conversation reçu:",
                      currentConversationId,
                    );
                  }
                } catch (e) {
                  console.warn("Erreur parsing meta:", e);
                }
                i++;
              }
            } else if (line.startsWith("data: ")) {
              const dataContent = line.substring(6);
              if (dataContent !== "{}" && dataContent !== "[DONE]") {
                try {
                  const parsed = JSON.parse(dataContent);
                  if (parsed.token) {
                    fullContent += parsed.token;
                    setStreamingContent(fullContent);
                    onChunk?.(parsed.token);
                  }
                } catch (e) {
                  // Ignorer les erreurs de parsing
                }
              } else if (dataContent === "[DONE]") {
                console.log("✅ Streaming terminé");
                break;
              }
            }
          }
        }

        console.log("✅ Message complet reçu, longueur:", fullContent.length);

        return {
          content: fullContent,
          conversationId: currentConversationId || conversationId,
        };
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("⏹️ Streaming annulé");
          return null;
        }

        console.error("❌ Erreur streaming:", error);
        setError(error.message || "Erreur lors du streaming");
        throw error;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [conversationId],
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const resetStreaming = useCallback(() => {
    setStreamingContent("");
    setConversationId(null);
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    streamingContent,
    conversationId,
    error,
    streamMessage,
    stopStreaming,
    resetStreaming,
  };
}
