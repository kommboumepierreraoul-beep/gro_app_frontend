"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Ban,
  Check,
  Edit3,
  Eye,
  Filter,
  PlayCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  AdminPagination,
  AdminResource,
  adminService,
} from "@/services/admin.service";

export type AdminRecord = Record<string, unknown> & { id: number };

export type AdminPanelAction = {
  key: string;
  label: string;
  tone?: "green" | "red" | "amber";
};

export type AdminPanelConfig = {
  resource: AdminResource;
  title: string;
  subtitle: string;
  eyebrow?: string;
  columns: Array<{ key: string; label: string }>;
  actions?: AdminPanelAction[];
  statusOptions?: Array<{ label: string; value: string }>;
  related?: Array<{ label: string; href: string; description: string }>;
  detailHref?: (record: AdminRecord) => string | null;
};

const defaultStatusOptions = [
  { label: "Tous", value: "all" },
  { label: "Actif", value: "active" },
  { label: "Suspendu", value: "suspended" },
  { label: "En attente", value: "pending" },
  { label: "Approuve", value: "approved" },
  { label: "Rejete", value: "rejected" },
  { label: "Publie", value: "published" },
  { label: "Complete", value: "completed" },
  { label: "Escalade", value: "escalated" },
];

function getValue(record: AdminRecord, key: string) {
  return key.split(".").reduce<unknown>((value, part) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[part];
  }, record);
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (typeof value === "number") return value.toLocaleString("fr-FR");
  if (typeof value === "object") return "Objet";
  return String(value);
}

function badgeClass(value: unknown) {
  const text = String(value || "").toLowerCase();
  if (["active", "approved", "completed", "paid", "published"].includes(text)) {
    return "bg-[#eaf3de] text-[#154212]";
  }
  if (["pending", "preparing", "shipping", "review", "escalated"].includes(text)) {
    return "bg-amber-50 text-amber-700";
  }
  if (["rejected", "suspended", "cancelled", "closed"].includes(text)) {
    return "bg-red-50 text-red-700";
  }
  return "bg-[#f2f4ed] text-[#5a6256]";
}

export function AdminResourcePanel({
  resource,
  title,
  subtitle,
  eyebrow = "Administration",
  columns,
  actions = [],
  statusOptions = defaultStatusOptions,
  related = [],
  detailHref,
}: AdminPanelConfig) {
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | undefined>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.systemList<AdminRecord>(resource, {
        page,
        limit: 20,
        search,
        status,
      });
      setRecords(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error(error);
      toast.error("Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, [page, resource, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 200);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const summary = useMemo(() => {
    const total = pagination?.total ?? records.length;
    const visible = records.length;
    const flagged = records.filter((record) => {
      const value =
        getValue(record, "status") ?? getValue(record, "approval_status") ?? "";
      return ["pending", "suspended", "rejected", "escalated"].includes(
        String(value).toLowerCase(),
      );
    }).length;
    return { total, visible, flagged };
  }, [pagination?.total, records]);

  const runAction = async (record: AdminRecord, action: AdminPanelAction) => {
    const body: Record<string, unknown> = {};
    if (action.key === "reject") {
      const reason = window.prompt("Raison du rejet :");
      if (reason === null) return;
      body.reason = reason;
    }
    if (action.key === "resolve") {
      const resolution = window.prompt("Resolution :");
      if (resolution === null) return;
      body.resolution = resolution;
    }

    try {
      setBusyId(record.id);
      await adminService.systemAction(resource, record.id, action.key, body);
      toast.success("Action executee");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (record: AdminRecord) => {
    if (!window.confirm("Confirmer la suppression definitive ?")) return;
    try {
      setBusyId(record.id);
      await adminService.systemDelete(resource, record.id);
      toast.success("Element supprime");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-[#154212] p-6 text-white shadow-xl sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8f6c0]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">{title}</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
              {subtitle}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-black">{summary.total}</p>
              <p className="text-xs font-bold text-white/70">Total</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-black">{summary.visible}</p>
              <p className="text-xs font-bold text-white/70">Affiches</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-black">{summary.flagged}</p>
              <p className="text-xs font-bold text-white/70">A surveiller</p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="grid gap-3 md:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-4 shadow-sm transition hover:bg-[#f2f7ea]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-[#191c18]">{item.label}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#5a6256]">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#154212]" />
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72796e]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Rechercher..."
                className="h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#154212] sm:w-80"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72796e]" />
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] pl-9 pr-3 text-sm font-black outline-none focus:border-[#154212]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#154212] px-4 py-2 text-sm font-black text-white hover:bg-[#0f3210]"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#c2c9bb]/45 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#c2c9bb]/45">
            <thead className="bg-[#f6f7f0]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-[#72796e]">
                  ID
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-[#72796e]"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.14em] text-[#72796e]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c9bb]/35">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-10 text-center text-sm font-black text-[#72796e]"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-10 text-center text-sm font-black text-[#72796e]"
                  >
                    Aucun element trouve.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-[#fbfcf7]">
                    <td className="px-4 py-3 text-sm font-black text-[#154212]">
                      #{record.id}
                    </td>
                    {columns.map((column) => {
                      const value = getValue(record, column.key);
                      const isStatus = column.key.includes("status");
                      return (
                        <td
                          key={column.key}
                          className="max-w-[240px] px-4 py-3 text-sm font-semibold text-[#243420]"
                        >
                          {isStatus ? (
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-black ${badgeClass(value)}`}
                            >
                              {formatValue(value)}
                            </span>
                          ) : (
                            <span className="line-clamp-2">{formatValue(value)}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <div className="flex min-w-max justify-end gap-2">
                        {detailHref?.(record) && (
                          <Link
                            href={detailHref(record) || "#"}
                            className="rounded-lg border border-[#c2c9bb]/45 p-2 text-[#154212] hover:bg-[#eaf3de]"
                            title="Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/system?resource=${resource}`}
                          className="rounded-lg border border-[#c2c9bb]/45 p-2 text-[#154212] hover:bg-[#eaf3de]"
                          title="Modifier dans la console"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        {actions.slice(0, 4).map((action) => (
                          <button
                            key={action.key}
                            onClick={() => runAction(record, action)}
                            disabled={busyId === record.id}
                            className={`rounded-lg border p-2 disabled:opacity-50 ${
                              action.tone === "red"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : action.tone === "amber"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : action.tone === "green"
                                    ? "border-[#b7e48b] bg-[#eaf3de] text-[#154212]"
                                    : "border-[#c2c9bb]/45 text-[#243420] hover:bg-[#f2f7ea]"
                            }`}
                            title={action.label}
                          >
                            {action.tone === "red" ? (
                              <Ban className="h-4 w-4" />
                            ) : action.tone === "green" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </button>
                        ))}
                        <button
                          onClick={() => remove(record)}
                          disabled={busyId === record.id}
                          className="rounded-lg border border-red-200 bg-white p-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#c2c9bb]/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-[#5a6256]">
            Page {pagination?.current_page ?? page} / {pagination?.last_page ?? 1}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-[#c2c9bb]/45 px-4 py-2 text-sm font-black text-[#243420] disabled:opacity-50"
            >
              Precedent
            </button>
            <button
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination?.last_page ?? current + 1, current + 1),
                )
              }
              disabled={!!pagination && page >= pagination.last_page}
              className="rounded-xl border border-[#c2c9bb]/45 px-4 py-2 text-sm font-black text-[#243420] disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
