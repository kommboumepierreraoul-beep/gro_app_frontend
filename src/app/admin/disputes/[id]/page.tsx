"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Flag, Gavel, Save, X } from "lucide-react";
import { adminService } from "@/services/admin.service";

type DisputeRecord = Record<string, unknown> & {
  id: number;
  reason?: string;
  description?: string;
  status?: string;
  admin_notes?: string;
  resolution?: string;
  refund_amount?: number | string;
  user?: { email?: string; firstname?: string; lastname?: string };
  seller?: { email?: string; firstname?: string; lastname?: string };
  order?: { order_number?: string; total_amount?: number | string; status?: string };
};

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [dispute, setDispute] = useState<DisputeRecord | null>(null);
  const [form, setForm] = useState({
    status: "",
    admin_notes: "",
    resolution: "",
    refund_amount: "",
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.systemGet<DisputeRecord>("disputes", id);
      const data = response.data;
      setDispute(data);
      setForm({
        status: String(data.status || ""),
        admin_notes: String(data.admin_notes || ""),
        resolution: String(data.resolution || ""),
        refund_amount: String(data.refund_amount || ""),
      });
    } catch (error) {
      console.error(error);
      toast.error("Litige introuvable");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const save = async () => {
    try {
      await adminService.systemUpdate("disputes", id, {
        ...form,
        refund_amount: form.refund_amount ? Number(form.refund_amount) : undefined,
      });
      toast.success("Litige mis a jour");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Mise a jour impossible");
    }
  };

  const action = async (name: string) => {
    const body: Record<string, unknown> = {};
    if (name === "resolve") {
      const resolution = window.prompt("Resolution :");
      if (resolution === null) return;
      body.resolution = resolution;
    }
    try {
      await adminService.systemAction("disputes", id, name, body);
      toast.success("Action executee");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Action impossible");
    }
  };

  if (loading && !dispute) {
    return <div className="rounded-2xl bg-white p-8 font-black text-[#5a6256]">Chargement...</div>;
  }

  if (!dispute) {
    return <div className="rounded-2xl bg-red-50 p-8 font-black text-red-700">Litige introuvable.</div>;
  }

  return (
    <div className="space-y-5">
      <Link href="/admin/disputes" className="inline-flex items-center gap-2 text-sm font-black text-[#154212] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Retour litiges
      </Link>

      <section className="rounded-2xl bg-[#154212] p-6 text-white shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8f6c0]">Arbitrage admin</p>
        <h1 className="mt-3 text-3xl font-black">Litige #{dispute.id}</h1>
        <p className="mt-2 text-sm font-semibold text-white/75">
          {dispute.order?.order_number || "Commande inconnue"} - {dispute.reason || "Motif non renseigne"}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#191c18]">Dossier</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-[#f6f7f0] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">Client</p>
              <p className="mt-1 font-black text-[#243420]">{dispute.user?.email || "-"}</p>
            </div>
            <div className="rounded-xl bg-[#f6f7f0] p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">Vendeur</p>
              <p className="mt-1 font-black text-[#243420]">{dispute.seller?.email || "-"}</p>
            </div>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">Statut</span>
              <input value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 text-sm font-semibold outline-none focus:border-[#154212]" />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">Remboursement</span>
              <input value={form.refund_amount} onChange={(event) => setForm((prev) => ({ ...prev, refund_amount: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 text-sm font-semibold outline-none focus:border-[#154212]" />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">Notes admin</span>
              <textarea value={form.admin_notes} onChange={(event) => setForm((prev) => ({ ...prev, admin_notes: event.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#154212]" />
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">Resolution</span>
              <textarea value={form.resolution} onChange={(event) => setForm((prev) => ({ ...prev, resolution: event.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#154212]" />
            </label>
          </div>
          <button onClick={save} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#154212] px-4 py-2 text-sm font-black text-white">
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
        </div>

        <aside className="space-y-3">
          <button onClick={() => action("investigate")} className="flex w-full items-center gap-2 rounded-xl border border-[#c2c9bb]/45 bg-white px-4 py-3 font-black text-[#243420]">
            <Gavel className="h-4 w-4" /> Investiguer
          </button>
          <button onClick={() => action("escalate")} className="flex w-full items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 font-black text-amber-700">
            <Flag className="h-4 w-4" /> Escalader
          </button>
          <button onClick={() => action("resolve")} className="flex w-full items-center gap-2 rounded-xl bg-[#eaf3de] px-4 py-3 font-black text-[#154212]">
            <Check className="h-4 w-4" /> Resoudre
          </button>
          <button onClick={() => action("close")} className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-3 font-black text-red-700">
            <X className="h-4 w-4" /> Cloturer
          </button>
        </aside>
      </section>
    </div>
  );
}
