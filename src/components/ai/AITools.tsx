// components/ai/AITools.tsx

"use client";

import React, { useState } from "react";
import { useAIChat } from "@/hooks/AI/useAIChat";
import {
  TagIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export function AITools() {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [improved, setImproved] = useState("");
  const [activeTab, setActiveTab] = useState<"tags" | "summary" | "improve">(
    "tags",
  );
  const { generateTags, summarize, improveText, loading } = useAIChat();

  const handleGenerateTags = async () => {
    if (!content.trim()) return;
    const result = await generateTags(content);
    setTags(result);
  };

  const handleSummarize = async () => {
    if (!content.trim()) return;
    const result = await summarize(content);
    setSummary(result);
  };

  const handleImprove = async () => {
    if (!content.trim()) return;
    const result = await improveText(content);
    setImproved(result);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Outils IA</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("tags")}
          className={`flex items-center gap-2 px-4 py-2 transition ${
            activeTab === "tags"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <TagIcon className="w-5 h-5" />
          Tags
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 transition ${
            activeTab === "summary"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <DocumentTextIcon className="w-5 h-5" />
          Résumé
        </button>
        <button
          onClick={() => setActiveTab("improve")}
          className={`flex items-center gap-2 px-4 py-2 transition ${
            activeTab === "improve"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <PencilSquareIcon className="w-5 h-5" />
          Amélioration
        </button>
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Entrez votre texte ici..."
        className="w-full bg-gray-700 text-white rounded-lg p-3 min-h-[150px] mb-4"
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        {activeTab === "tags" && (
          <button
            onClick={handleGenerateTags}
            disabled={loading || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded"
          >
            Générer des tags
          </button>
        )}
        {activeTab === "summary" && (
          <button
            onClick={handleSummarize}
            disabled={loading || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded"
          >
            Générer un résumé
          </button>
        )}
        {activeTab === "improve" && (
          <button
            onClick={handleImprove}
            disabled={loading || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded"
          >
            Améliorer le texte
          </button>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="mt-4 text-gray-400 animate-pulse">
          Traitement en cours...
        </div>
      )}

      {activeTab === "tags" && tags.length > 0 && !loading && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Tags générés :
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === "summary" && summary && !loading && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Résumé :</h3>
          <p className="text-white">{summary}</p>
        </div>
      )}

      {activeTab === "improve" && improved && !loading && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Version améliorée :
          </h3>
          <p className="text-white">{improved}</p>
        </div>
      )}
    </div>
  );
}
