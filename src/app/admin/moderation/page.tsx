"use client";

import { useEffect, useState } from "react";
import { useModeration } from "@/hooks/moderation/useModeration";
import { Card } from "@/components/ui/Card";
import { ModerationBadge } from "@/components/moderation/ModerationBadge";
import { ModerationScores } from "@/components/moderation/ModerationScores";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  FileText,
  Eye,
  ChevronRight,
  Activity,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";

export default function ModerationDashboard() {
  const { getStats, loading, error } = useModeration();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getStats();
    if (data) {
      setStats(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#2d5a27", borderTopColor: "transparent" }}
          />
          <p
            className="text-sm"
            style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
          >
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <XCircle size={32} style={{ color: "#b91c1c" }} />
          <p
            className="font-medium"
            style={{ color: "#b91c1c", fontFamily: "'Inter', sans-serif" }}
          >
            Erreur de chargement
          </p>
          <p
            className="text-sm"
            style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
          >
            {error}
          </p>
          <button
            onClick={loadStats}
            className="mt-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              color: "#2d5a27",
              background: "rgba(45,90,39,0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(45,90,39,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(45,90,39,0.08)";
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Statistiques globales
  const overallStats = [
    {
      label: "En attente",
      value: stats.overall?.total_pending || 0,
      icon: Clock,
      color: "#b45309",
      bg: "rgba(251,191,36,0.12)",
      status: "pending" as const,
    },
    {
      label: "En révision",
      value: stats.overall?.total_review || 0,
      icon: AlertCircle,
      color: "#c2410c",
      bg: "rgba(249,115,22,0.12)",
      status: "review" as const,
    },
    {
      label: "Approuvés",
      value: stats.overall?.total_approved || 0,
      icon: CheckCircle,
      color: "#15803d",
      bg: "rgba(34,197,94,0.12)",
      status: "approved" as const,
    },
    {
      label: "Rejetés",
      value: stats.overall?.total_rejected || 0,
      icon: XCircle,
      color: "#b91c1c",
      bg: "rgba(239,68,68,0.12)",
      status: "rejected" as const,
    },
  ];

  // Décisions par type
  const decisionStats = [
    {
      label: "Décisions IA",
      value: stats.audit?.ai_decisions || 0,
      icon: Zap,
      color: "#2d5a27",
      bg: "rgba(45,90,39,0.08)",
    },
    {
      label: "Décisions Modérateurs",
      value: stats.audit?.moderator_decisions || 0,
      icon: Users,
      color: "#1a56db",
      bg: "rgba(26,86,219,0.08)",
    },
    {
      label: "Décisions Système",
      value: stats.audit?.system_decisions || 0,
      icon: Shield,
      color: "#6b7280",
      bg: "rgba(107,114,128,0.08)",
    },
  ];

  // Contenu par type
  const contentTypeStats = [
    {
      label: "Publications",
      icon: FileText,
      total: stats.posts?.total || 0,
      pending: stats.posts?.pending || 0,
      review: stats.posts?.review || 0,
      approved: stats.posts?.approved || 0,
      rejected: stats.posts?.rejected || 0,
      link: "/admin/moderation/queue/posts",
    },
    {
      label: "Commentaires",
      icon: MessageSquare,
      total: stats.comments?.total || 0,
      pending: stats.comments?.pending || 0,
      review: stats.comments?.review || 0,
      approved: stats.comments?.approved || 0,
      rejected: stats.comments?.rejected || 0,
      link: "/admin/moderation/queue/comments",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      total: stats.messages?.total || 0,
      pending: stats.messages?.pending || 0,
      review: stats.messages?.review || 0,
      approved: stats.messages?.approved || 0,
      rejected: stats.messages?.rejected || 0,
      link: "/admin/moderation/queue/messages",
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              color: "#191c18",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            📊 Dashboard Modération
          </h1>
          <p
            className="text-sm"
            style={{
              color: "#72796e",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Vue d'ensemble de l'activité de modération
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              color: "#2d5a27",
              background: "rgba(45,90,39,0.08)",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(45,90,39,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(45,90,39,0.08)";
            }}
          >
            <Activity size={16} />
            Actualiser
          </button>
          <Link
            href="/admin/moderation/audit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              color: "#42493e",
              background: "rgba(194,201,187,0.15)",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.15)";
            }}
          >
            <Eye size={16} />
            Audit Log
          </Link>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {overallStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 transition-all hover:shadow-md"
            style={{
              background: stat.bg,
              border: "1px solid rgba(194,201,187,0.2)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: "#42493e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color: "#191c18",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
              <ModerationBadge
                status={stat.status}
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Décisions & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {decisionStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4"
            style={{
              background: "rgba(249,250,242,0.8)",
              border: "1px solid rgba(194,201,187,0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: stat.bg }}
              >
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "#42493e",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-xl font-bold"
                  style={{
                    color: "#191c18",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contenu par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {contentTypeStats.map((type) => (
          <Link
            key={type.label}
            href={type.link}
            className="block rounded-2xl p-4 transition-all hover:shadow-md group"
            style={{
              background: "rgba(249,250,242,0.8)",
              border: "1px solid rgba(194,201,187,0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <type.icon size={18} style={{ color: "#2d5a27" }} />
                <span
                  className="font-medium"
                  style={{
                    color: "#191c18",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {type.label}
                </span>
              </div>
              <ChevronRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
                style={{ color: "#72796e" }}
              />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-xs" style={{ color: "#72796e" }}>
                  Total
                </span>
                <p className="font-semibold" style={{ color: "#191c18" }}>
                  {type.total}
                </p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "#72796e" }}>
                  En attente
                </span>
                <p className="font-semibold" style={{ color: "#b45309" }}>
                  {type.pending}
                </p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "#72796e" }}>
                  En révision
                </span>
                <p className="font-semibold" style={{ color: "#c2410c" }}>
                  {type.review}
                </p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "#72796e" }}>
                  Approuvés
                </span>
                <p className="font-semibold" style={{ color: "#15803d" }}>
                  {type.approved}
                </p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "#72796e" }}>
                  Rejetés
                </span>
                <p className="font-semibold" style={{ color: "#b91c1c" }}>
                  {type.rejected}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Scores moyens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(249,250,242,0.8)",
            border: "1px solid rgba(194,201,187,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} style={{ color: "#2d5a27" }} />
            <h3
              className="font-semibold"
              style={{
                color: "#191c18",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Scores moyens - Publications
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Toxicité</span>
              <span style={{ color: "#191c18" }}>
                {(stats.posts?.avg_toxicity * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Spam</span>
              <span style={{ color: "#191c18" }}>
                {(stats.posts?.avg_spam * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Haine</span>
              <span style={{ color: "#191c18" }}>
                {(stats.posts?.avg_hate * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Violence</span>
              <span style={{ color: "#191c18" }}>
                {(stats.posts?.avg_violence * 100 || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(249,250,242,0.8)",
            border: "1px solid rgba(194,201,187,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} style={{ color: "#2d5a27" }} />
            <h3
              className="font-semibold"
              style={{
                color: "#191c18",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Scores moyens - Commentaires
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Toxicité</span>
              <span style={{ color: "#191c18" }}>
                {(stats.comments?.avg_toxicity * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Spam</span>
              <span style={{ color: "#191c18" }}>
                {(stats.comments?.avg_spam * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Haine</span>
              <span style={{ color: "#191c18" }}>
                {(stats.comments?.avg_hate * 100 || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#42493e" }}>Violence</span>
              <span style={{ color: "#191c18" }}>
                {(stats.comments?.avg_violence * 100 || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
