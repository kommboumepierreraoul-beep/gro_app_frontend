"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Ban,
  Check,
  PackageCheck,
  Save,
  Star,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

type ProductRecord = Record<string, unknown> & {
  id: number;
  name?: string;
  description?: string;
  price?: number | string;
  stock_quantity?: number | string;
  status?: string;
  approval_status?: string;
  rejection_reason?: string | null;
  shop?: { name?: string; status?: string };
  category?: { name?: string };
};

export default function AdminProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    status: "",
    approval_status: "",
    rejection_reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.systemGet<ProductRecord>("products", id);
      const data = response.data;
      setProduct(data);
      setForm({
        name: String(data.name || ""),
        description: String(data.description || ""),
        price: String(data.price || ""),
        stock_quantity: String(data.stock_quantity || ""),
        status: String(data.status || ""),
        approval_status: String(data.approval_status || ""),
        rejection_reason: String(data.rejection_reason || ""),
      });
    } catch (error) {
      console.error(error);
      toast.error("Produit introuvable");
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
      setSaving(true);
      await adminService.systemUpdate("products", id, {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : undefined,
      });
      toast.success("Produit mis a jour");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Mise a jour impossible");
    } finally {
      setSaving(false);
    }
  };

  const action = async (name: string, payload: Record<string, unknown> = {}) => {
    try {
      await adminService.systemAction("products", id, name, payload);
      toast.success("Action executee");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Action impossible");
    }
  };

  if (loading && !product) {
    return <div className="rounded-2xl bg-white p-8 font-black text-[#5a6256]">Chargement...</div>;
  }

  if (!product) {
    return <div className="rounded-2xl bg-red-50 p-8 font-black text-red-700">Produit introuvable.</div>;
  }

  return (
    <div className="space-y-5">
      <Link href="/admin/catalog" className="inline-flex items-center gap-2 text-sm font-black text-[#154212] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Retour catalogue
      </Link>

      <section className="rounded-2xl bg-[#154212] p-6 text-white shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8f6c0]">Produit marketplace</p>
        <h1 className="mt-3 text-3xl font-black">{product.name || `Produit #${product.id}`}</h1>
        <p className="mt-2 text-sm font-semibold text-white/75">
          {product.shop?.name || "Boutique inconnue"} - {product.category?.name || "Sans categorie"}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#191c18]">Edition admin</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["name", "Nom"],
              ["price", "Prix"],
              ["stock_quantity", "Stock"],
              ["status", "Statut"],
              ["approval_status", "Approbation"],
              ["rejection_reason", "Raison rejet"],
            ].map(([key, label]) => (
              <label key={key}>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">{label}</span>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 text-sm font-semibold outline-none focus:border-[#154212]"
                />
              </label>
            ))}
            <label className="md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={5}
                className="mt-1 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#154212]"
              />
            </label>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#154212] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
        </div>

        <aside className="space-y-3">
          <button onClick={() => action("approve")} className="flex w-full items-center gap-2 rounded-xl bg-[#eaf3de] px-4 py-3 font-black text-[#154212]">
            <Check className="h-4 w-4" /> Approuver
          </button>
          <button
            onClick={() => {
              const reason = window.prompt("Raison du rejet :");
              if (reason !== null) action("reject", { reason });
            }}
            className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-3 font-black text-red-700"
          >
            <Ban className="h-4 w-4" /> Rejeter
          </button>
          <button onClick={() => action("feature")} className="flex w-full items-center gap-2 rounded-xl border border-[#c2c9bb]/45 bg-white px-4 py-3 font-black text-[#243420]">
            <Star className="h-4 w-4" /> Mettre en avant
          </button>
          <button onClick={() => action("archive")} className="flex w-full items-center gap-2 rounded-xl border border-[#c2c9bb]/45 bg-white px-4 py-3 font-black text-[#243420]">
            <PackageCheck className="h-4 w-4" /> Archiver
          </button>
        </aside>
      </section>
    </div>
  );
}
