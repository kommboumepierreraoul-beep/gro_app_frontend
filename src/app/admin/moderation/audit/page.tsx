"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Download,
  FileClock,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { moderationService } from "@/services/moderation/moderation.service";

function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
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

function labelFor(action: string) {
  switch (action) {
    case "approve":
    case "approved":
      return "Approuve";
    case "reject":
    case "rejected":
      return "Rejete";
    case "review":
      return "Revision";
    default:
      return action || "Action";
  }
}

export default function AdminModerationAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadAudit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await moderationService.getAuditLogs({ page, per_page: 20 });
      setLogs(extractItems(response));
      setPagination(extractMeta(response));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Erreur chargement audit moderation");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const exportAudit = async () => {
    try {
      setExporting(true);
      const response = await moderationService.exportAuditLogs({ limit: 1000 });
      const blob = response instanceof Blob
        ? response
        : new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-moderation-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Export audit telecharge");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Export audit impossible");
    } finally {
      setExporting(false);
    }
  };

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
              <FileClock className="h-5 w-5 text-[#154212]" />
              <h1 className="text-2xl font-black text-[#191c18]">Audit moderation</h1>
            </div>
            <p className="mt-1 text-sm text-[#72796e]">
              Historique des decisions prises sur les publications moderees.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadAudit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c2c9bb]/45 bg-white px-4 py-2.5 text-sm font-bold text-[#42493e] transition hover:bg-[#eef3ea]"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
          <button
            type="button"
            onClick={exportAudit}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#154212] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#154212] disabled:opacity-60"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exporter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#c2c9bb]/30 bg-white/75">
          <Loader2 className="h-7 w-7 animate-spin text-[#154212]" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-[#c2c9bb]/30 bg-white/75 p-10 text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <h2 className="text-lg font-black text-[#191c18]">Aucun audit</h2>
          <p className="mt-1 text-sm text-[#72796e]">Aucune decision de moderation enregistree.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#c2c9bb]/35 bg-white/85 shadow-sm">
            <div className="grid grid-cols-12 gap-3 border-b border-[#c2c9bb]/30 bg-[#f9fbf5] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">
              <span className="col-span-3">Action</span>
              <span className="col-span-3">Moderateur</span>
              <span className="col-span-3">Contenu</span>
              <span className="col-span-3">Date</span>
            </div>
            <div className="divide-y divide-[#c2c9bb]/25">
              {logs.map((log) => {
                const actor = log.actor
                  ? `${log.actor.firstname ?? ""} ${log.actor.lastname ?? ""}`.trim()
                  : log.actor_type ?? "systeme";
                return (
                  <div
                    key={log.id}
                    className="grid grid-cols-1 gap-2 px-4 py-4 text-sm text-[#42493e] sm:grid-cols-12 sm:gap-3"
                  >
                    <div className="sm:col-span-3">
                      <span className="rounded-full bg-[#eaf3de] px-3 py-1 text-xs font-black text-[#154212]">
                        {labelFor(log.action)}
                      </span>
                    </div>
                    <div className="font-semibold text-[#191c18] sm:col-span-3">{actor || "systeme"}</div>
                    <div className="sm:col-span-3">#{log.moderatable_id}</div>
                    <div className="text-[#72796e] sm:col-span-3">
                      {log.created_at ? new Date(log.created_at).toLocaleString("fr-FR") : "-"}
                    </div>
                    {log.payload?.reason ? (
                      <div className="rounded-xl bg-[#f9fbf5] p-3 text-[#5c6258] sm:col-span-12">
                        {log.payload.reason}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
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
