"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { moderationService } from "@/services/moderation/moderation.service";
import type { ModerationStatus } from "@/types/moderation";

type QueueType = "posts" | "comments" | "messages";

const queueMeta = {
  posts: {
    label: "Publications",
    icon: FileText,
    description: "File de validation connectee au backend.",
  },
  comments: {
    label: "Commentaires",
    icon: MessageSquare,
    description: "Le backend actuel ne publie pas encore cette file.",
  },
  messages: {
    label: "Messages",
    icon: MessageSquare,
    description: "Le backend actuel ne publie pas encore cette file.",
  },
} satisfies Record<QueueType, { label: string; icon: typeof FileText; description: string }>;

function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.posts?.data)) return payload.posts.data;
  return [];
}

function extractMeta(payload: any) {
  const paginator = payload?.data?.data ? payload.data : payload?.data;
  return {
    currentPage: Number(paginator?.current_page ?? 1),
    lastPage: Number(paginator?.last_page ?? 1),
    total: Number(paginator?.total ?? extractItems(payload).length),
  };
}

function moderationOf(item: any) {
  return item?.moderation ?? item?.moderation_post ?? item?.moderation_data ?? {};
}

function statusStyle(status: ModerationStatus | string) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    case "review":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function AdminModerationQueuePage() {
  const params = useParams<{ type: string }>();
  const type = (params.type || "posts") as QueueType;
  const meta = queueMeta[type];
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const isSupported = type === "posts";
  const Icon = meta?.icon ?? ShieldAlert;

  const loadQueue = useCallback(async () => {
    if (!isSupported) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await moderationService.getQueuePosts({ page, per_page: 12 });
      setItems(extractItems(response));
      setPagination(extractMeta(response));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Erreur chargement file moderation");
    } finally {
      setLoading(false);
    }
  }, [isSupported, page]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const title = useMemo(() => meta?.label ?? "File inconnue", [meta]);

  const moderate = async (postId: number, action: "approve" | "reject" | "review") => {
    const reason =
      action === "approve"
        ? undefined
        : window.prompt(action === "reject" ? "Raison du rejet :" : "Note de revision :");

    if (reason === null) return;

    try {
      setActionId(postId);
      await moderationService.moderatePost(postId, { action, reason: reason?.trim() || undefined });
      toast.success(action === "approve" ? "Publication approuvee" : "Decision enregistree");
      await loadQueue();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Action de moderation impossible");
    } finally {
      setActionId(null);
    }
  };

  const reanalyze = async (postId: number) => {
    try {
      setActionId(postId);
      await moderationService.reanalyzePost(postId);
      toast.success("Reanalyse lancee");
      await loadQueue();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Reanalyse impossible");
    } finally {
      setActionId(null);
    }
  };

  if (!meta) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <UnsupportedQueue title="File inconnue" description="Cette file de moderation n'existe pas." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/moderation"
            className="mt-1 rounded-xl border border-[#c2c9bb]/45 bg-white p-2 text-[#42493e] transition hover:bg-[#eef3ea]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-[#2d5a27]" />
              <h1 className="text-2xl font-black text-[#191c18]">Moderation - {title}</h1>
            </div>
            <p className="mt-1 text-sm text-[#72796e]">{meta.description}</p>
          </div>
        </div>
        {isSupported ? (
          <button
            type="button"
            onClick={loadQueue}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d5a27]"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        ) : null}
      </div>

      {!isSupported ? (
        <UnsupportedQueue title={title} description={meta.description} />
      ) : loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#c2c9bb]/30 bg-white/75">
          <Loader2 className="h-7 w-7 animate-spin text-[#2d5a27]" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#c2c9bb]/30 bg-white/75 p-10 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <h2 className="text-lg font-black text-[#191c18]">File vide</h2>
          <p className="mt-1 text-sm text-[#72796e]">Aucune publication en attente ou en revision.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-2xl border border-[#c2c9bb]/30 bg-white/75 px-4 py-3 text-sm font-bold text-[#42493e]">
            {pagination.total} element{pagination.total > 1 ? "s" : ""} a traiter
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {items.map((item) => {
              const moderation = moderationOf(item);
              const status = moderation?.status ?? item?.moderation_status ?? "pending";
              const titleText = item?.title ?? item?.name ?? `Publication #${item?.id}`;
              const content = item?.content ?? item?.body ?? item?.description ?? "Aucun contenu texte.";
              const author = item?.author
                ? `${item.author.firstname ?? ""} ${item.author.lastname ?? ""}`.trim() || item.author.email
                : "Auteur inconnu";

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#c2c9bb]/35 bg-white/85 p-4 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black text-[#191c18]">{titleText}</h2>
                      <p className="mt-1 text-xs font-semibold text-[#72796e]">{author}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyle(status)}`}>
                      {status}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-4 rounded-xl bg-[#f9fbf5] p-3 text-sm leading-6 text-[#42493e]">
                    {content}
                  </p>

                  {moderation?.reason ? (
                    <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {moderation.reason}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => moderate(item.id, "approve")}
                      disabled={actionId === item.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approuver
                    </button>
                    <button
                      type="button"
                      onClick={() => moderate(item.id, "review")}
                      disabled={actionId === item.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Revoir
                    </button>
                    <button
                      type="button"
                      onClick={() => moderate(item.id, "reject")}
                      disabled={actionId === item.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-800 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeter
                    </button>
                    <button
                      type="button"
                      onClick={() => reanalyze(item.id)}
                      disabled={actionId === item.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#c2c9bb]/50 bg-white px-3 py-2 text-xs font-bold text-[#42493e] transition hover:bg-[#eef3ea] disabled:opacity-60"
                    >
                      {actionId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Reanalyser
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#c2c9bb]/30 bg-white/75 px-4 py-3">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={pagination.currentPage <= 1}
              className="rounded-xl border border-[#c2c9bb]/45 px-4 py-2 text-sm font-bold text-[#42493e] disabled:opacity-50"
            >
              Precedent
            </button>
            <span className="text-sm font-bold text-[#72796e]">
              Page {pagination.currentPage} / {pagination.lastPage}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(pagination.lastPage, value + 1))}
              disabled={pagination.currentPage >= pagination.lastPage}
              className="rounded-xl border border-[#c2c9bb]/45 px-4 py-2 text-sm font-bold text-[#42493e] disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function UnsupportedQueue({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#c2c9bb]/35 bg-white/80 p-8 text-center shadow-sm">
      <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-[#c2410c]" />
      <h2 className="text-lg font-black text-[#191c18]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#72796e]">{description}</p>
      <Link
        href="/admin/moderation"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d5a27]"
      >
        Retour moderation
      </Link>
    </div>
  );
}
