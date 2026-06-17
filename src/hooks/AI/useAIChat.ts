/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback, useEffect, useRef } from "react";
import { aiService } from "@/services/Ai/ai.service";
import { ChatRequest, AIConversation, AIMessage } from "@/types/ai.types";
import { tokenService } from "@/lib/auth-token";

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<AIConversation | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    last_page: 1,
  });

  // ✅ Éviter les appels multiples
  const hasLoaded = useRef(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleAuthError = useCallback(() => {
    tokenService.remove();
    setError("Session expirée. Veuillez vous reconnecter.");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  }, []);

  const handleError = useCallback(
    (err: any, fallback: string) => {
      if (err?.response?.status === 401) {
        handleAuthError();
      } else {
        setError(err?.response?.data?.message ?? err?.message ?? fallback);
      }
    },
    [handleAuthError],
  );

  // ── Chat ────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (request: ChatRequest) => {
      if (!tokenService.get()) {
        const msg = "Non authentifié. Veuillez vous connecter.";
        setError(msg);
        throw new Error(msg);
      }

      setLoading(true);
      setError(null);
      try {
        return await aiService.chat(request);
      } catch (err: any) {
        handleError(err, "Erreur lors de l'envoi du message");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // ── Tags ────────────────────────────────────────────────────────────────────

  const generateTags = useCallback(
    async (content: string, max = 5): Promise<string[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await aiService.generateTags(content, max);
        return response.tags;
      } catch (err: any) {
        handleError(err, "Erreur lors de la génération des tags");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // ── Résumé ──────────────────────────────────────────────────────────────────

  const summarize = useCallback(
    async (content: string, language = "fr"): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const response = await aiService.summarizeContent({
          content,
          language,
        });
        return response.summary;
      } catch (err: any) {
        handleError(err, "Erreur lors du résumé");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // ── Amélioration ────────────────────────────────────────────────────────────

  const improveText = useCallback(
    async (content: string, language = "fr"): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        const response = await aiService.improveText({ content, language });
        return response.improved;
      } catch (err: any) {
        handleError(err, "Erreur lors de l'amélioration du texte");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  // ── Conversations ────────────────────────────────────────────────────────────

  const loadConversations = useCallback(
    async (page = 1) => {
      if (!tokenService.get()) {
        console.log("❌ Pas de token, impossible de charger les conversations");
        return { data: [] };
      }

      setLoading(true);
      setError(null);
      try {
        console.log("📚 Chargement des conversations...");
        const response = await aiService.getConversations(page);
        console.log("📚 Conversations chargées:", response.data.length);

        setConversations(response.data);
        setPagination({
          current_page: response.current_page,
          total: response.total,
          last_page: response.last_page,
        });
        return response;
      } catch (err: any) {
        console.error("❌ Erreur chargement conversations:", err);
        if (![404, 405].includes(err?.response?.status)) {
          handleError(err, "Erreur lors du chargement des conversations");
        }
        return { data: [] };
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const loadConversation = useCallback(
    async (id: string): Promise<AIConversation> => {
      setLoading(true);
      setError(null);
      try {
        console.log("📚 Chargement conversation:", id);
        const conversation = await aiService.getConversation(id);
        setCurrentConversation(conversation);
        return conversation;
      } catch (err: any) {
        handleError(err, "Erreur lors du chargement de la conversation");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await aiService.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (currentConversation?.id === id) {
          setCurrentConversation(null);
        }
      } catch (err: any) {
        handleError(err, "Erreur lors de la suppression");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentConversation, handleError],
  );

  // ── Auto-chargement (CORRIGÉ) ─────────────────────────────────────────────

  useEffect(() => {
    if (tokenService.get() && !hasLoaded.current) {
      hasLoaded.current = true;
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    conversations,
    currentConversation,
    pagination,
    sendMessage,
    generateTags,
    summarize,
    improveText,
    loadConversations,
    loadConversation,
    deleteConversation,
    clearError,
  };
}
