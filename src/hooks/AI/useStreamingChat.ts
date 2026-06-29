/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback, useRef } from "react";
import { ChatRequest } from "@/types/ai.types";
import { aiService } from "@/services/Ai/ai.service";

export function useStreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamMessage = useCallback(
    async (
      request: ChatRequest,
      onChunk?: (chunk: string) => void,
    ): Promise<{ content: string; conversationId: string | null } | null> => {
      setIsStreaming(true);
      setStreamingContent("");
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const { url, headers, body } = aiService.getStreamConfig(request);

        console.log("📡 Streaming vers:", url);
        console.log(
          "📡 Request body:",
          JSON.stringify(JSON.parse(body), null, 2),
        );

        const response = await fetch(url, {
          method: "POST",
          headers,
          body,
          signal: abortControllerRef.current.signal,
        });

        console.log("📡 Statut réponse:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Erreur réponse:", errorText.substring(0, 500));

          if (response.status === 401) {
            setError("Session expirée. Redirection en cours…");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
          } else {
            setError(
              `Erreur ${response.status}: ${errorText.substring(0, 100)}`,
            );
          }
          throw new Error(
            `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
          );
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("Pas de flux disponible");

        let buffer = "";
        let fullContent = "";
        let currentConversationId: string | null = null;
        let isDone = false;

        while (!isDone) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("📡 Fin du flux (done)");
            break;
          }

          // ✅ Décoder le chunk et l'ajouter au buffer
          buffer += decoder.decode(value, { stream: true });

          // ✅ Séparer les lignes
          const lines = buffer.split("\n");

          // ✅ Garder le dernier fragment qui pourrait être incomplet
          buffer = lines.pop() || "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (!line) continue;

            console.log("📡 Ligne brute:", line);

            // ✅ Gérer event: meta
            if (line.startsWith("event: meta")) {
              const nextLine = lines[i + 1]?.trim();
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
                  console.warn("⚠️ Erreur parsing meta:", e);
                }
                i++; // Sauter la ligne data
              }
              continue;
            }

            // ✅ Gérer event: done
            if (line.startsWith("event: done")) {
              console.log("✅ Event done reçu");
              isDone = true;
              break;
            }

            // ✅ Gérer event: error
            if (line.startsWith("event: error")) {
              const nextLine = lines[i + 1]?.trim();
              if (nextLine?.startsWith("data: ")) {
                try {
                  const data = JSON.parse(nextLine.substring(6));
                  const errorMsg = data.error || "Erreur lors du streaming";
                  setError(errorMsg);
                  console.error("❌ Erreur stream:", errorMsg);
                } catch (e) {
                  setError("Erreur lors du streaming");
                }
                i++;
              }
              isDone = true;
              break;
            }

            // ✅ Gérer data: {...}
            if (line.startsWith("data: ")) {
              const dataContent = line.substring(6);

              if (dataContent === "{}" || dataContent === "[DONE]") {
                console.log("📡 Keepalive ou DONE:", dataContent);
                continue;
              }

              try {
                const parsed = JSON.parse(dataContent);
                console.log("📦 Parsed data:", parsed);

                if (parsed.token) {
                  fullContent += parsed.token;
                  setStreamingContent(fullContent);
                  onChunk?.(parsed.token);
                  console.log("📦 Token reçu:", parsed.token.substring(0, 20));
                }
              } catch (e) {
                console.warn("⚠️ Erreur parsing data:", dataContent, e);
              }
            }
          }
        }

        console.log("✅ Streaming terminé, contenu total:", fullContent.length);

        return {
          content: fullContent,
          conversationId: currentConversationId ?? conversationId,
        };
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("⏹️ Streaming annulé");
          return null;
        }
        console.error("❌ Erreur streaming:", err);
        setError(err.message ?? "Erreur lors du streaming");
        throw err;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [conversationId],
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
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
