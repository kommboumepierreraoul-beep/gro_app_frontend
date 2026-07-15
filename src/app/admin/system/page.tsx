"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Ban,
  Check,
  ChevronDown,
  Edit3,
  Eye,
  FilePlus2,
  Filter,
  PlayCircle,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  AdminPagination,
  AdminResource,
  adminService,
} from "@/services/admin.service";

type AdminRecord = Record<string, unknown> & { id: number };

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "date" | "boolean";
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
};

type ResourceConfig = {
  key: AdminResource;
  label: string;
  description: string;
  titleField: string;
  columns: Array<{ key: string; label: string }>;
  fields: FieldConfig[];
  actions: Array<{ key: string; label: string; tone?: "green" | "red" | "amber" }>;
  canCreate?: boolean;
};

const statusOptions = [
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

const resources: ResourceConfig[] = [
  {
    key: "users",
    label: "Utilisateurs",
    description: "Comptes, roles, blocage, deblocage et droits.",
    titleField: "email",
    columns: [
      { key: "firstname", label: "Prenom" },
      { key: "lastname", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Statut" },
    ],
    fields: [
      { key: "firstname", label: "Prenom", required: true },
      { key: "lastname", label: "Nom", required: true },
      { key: "email", label: "Email", required: true },
      { key: "phone", label: "Telephone" },
      {
        key: "role",
        label: "Role",
        type: "select",
        options: [
          { label: "Utilisateur", value: "user" },
          { label: "Vendeur", value: "seller" },
          { label: "Admin", value: "admin" },
        ],
      },
      {
        key: "status",
        label: "Statut",
        type: "select",
        options: [
          { label: "Actif", value: "active" },
          { label: "Suspendu", value: "suspended" },
        ],
      },
      { key: "password", label: "Mot de passe", type: "text" },
    ],
    actions: [
      { key: "block", label: "Bloquer", tone: "red" },
      { key: "unblock", label: "Debloquer", tone: "green" },
      { key: "make-admin", label: "Admin", tone: "amber" },
      { key: "make-seller", label: "Vendeur" },
      { key: "make-user", label: "User" },
    ],
    canCreate: true,
  },
  {
    key: "shops",
    label: "Boutiques",
    description: "Boutiques vendeurs, suspension et activation.",
    titleField: "name",
    columns: [
      { key: "name", label: "Boutique" },
      { key: "user.email", label: "Proprietaire" },
      { key: "city", label: "Ville" },
      { key: "status", label: "Statut" },
      { key: "products_count", label: "Produits" },
    ],
    fields: [
      { key: "user_id", label: "ID proprietaire", type: "number", required: true },
      { key: "name", label: "Nom", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "address", label: "Adresse" },
      { key: "city", label: "Ville" },
      { key: "phone", label: "Telephone" },
      {
        key: "status",
        label: "Statut",
        type: "select",
        options: [
          { label: "Actif", value: "active" },
          { label: "Suspendu", value: "suspended" },
          { label: "Inactif", value: "inactive" },
        ],
      },
    ],
    actions: [
      { key: "approve", label: "Approuver", tone: "green" },
      { key: "reject", label: "Rejeter", tone: "red" },
      { key: "activate", label: "Activer", tone: "green" },
      { key: "suspend", label: "Suspendre", tone: "red" },
    ],
    canCreate: true,
  },
  {
    key: "products",
    label: "Produits",
    description: "Catalogue marketplace, validation, rejet et mise en avant.",
    titleField: "name",
    columns: [
      { key: "name", label: "Produit" },
      { key: "shop.name", label: "Boutique" },
      { key: "category.name", label: "Categorie" },
      { key: "price", label: "Prix" },
      { key: "approval_status", label: "Approbation" },
      { key: "status", label: "Statut" },
    ],
    fields: [
      { key: "shop_id", label: "ID boutique", type: "number", required: true },
      { key: "category_id", label: "ID categorie", type: "number" },
      { key: "name", label: "Nom", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "price", label: "Prix", type: "number", required: true },
      { key: "stock_quantity", label: "Stock", type: "number" },
      {
        key: "approval_status",
        label: "Approbation",
        type: "select",
        options: [
          { label: "En attente", value: "pending" },
          { label: "Approuve", value: "approved" },
          { label: "Rejete", value: "rejected" },
        ],
      },
      { key: "status", label: "Statut" },
    ],
    actions: [
      { key: "approve", label: "Approuver", tone: "green" },
      { key: "reject", label: "Rejeter", tone: "red" },
      { key: "feature", label: "Mettre en avant", tone: "amber" },
      { key: "unfeature", label: "Retirer avant" },
      { key: "archive", label: "Archiver" },
    ],
    canCreate: true,
  },
  {
    key: "categories",
    label: "Categories",
    description: "Categories de la marketplace.",
    titleField: "name",
    columns: [
      { key: "name", label: "Nom" },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description" },
    ],
    fields: [
      { key: "name", label: "Nom", required: true },
      { key: "description", label: "Description", type: "textarea" },
    ],
    actions: [],
    canCreate: true,
  },
  {
    key: "missions",
    label: "Missions",
    description: "Offres, publication, suspension et cloture.",
    titleField: "title",
    columns: [
      { key: "title", label: "Mission" },
      { key: "author.email", label: "Auteur" },
      { key: "category.name", label: "Categorie" },
      { key: "status", label: "Statut" },
      { key: "applications_count", label: "Candidatures" },
    ],
    fields: [
      { key: "author_id", label: "ID auteur", type: "number", required: true },
      { key: "category_id", label: "ID categorie", type: "number" },
      { key: "title", label: "Titre", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "desired_profile", label: "Profil recherche", type: "textarea" },
      { key: "location_label", label: "Lieu" },
      { key: "remuneration_amount", label: "Remuneration", type: "number" },
      { key: "status", label: "Statut" },
    ],
    actions: [
      { key: "publish", label: "Publier", tone: "green" },
      { key: "suspend", label: "Suspendre", tone: "red" },
      { key: "complete", label: "Terminer", tone: "green" },
      { key: "archive", label: "Archiver" },
      { key: "cancel", label: "Annuler", tone: "red" },
    ],
    canCreate: true,
  },
  {
    key: "mission-categories",
    label: "Categories missions",
    description: "Taxonomie des missions.",
    titleField: "name",
    columns: [
      { key: "name", label: "Nom" },
      { key: "slug", label: "Slug" },
      { key: "active", label: "Actif" },
      { key: "missions_count", label: "Missions" },
    ],
    fields: [
      { key: "name", label: "Nom", required: true },
      { key: "slug", label: "Slug" },
      { key: "icon", label: "Icone" },
      { key: "color", label: "Couleur" },
      { key: "sort_order", label: "Ordre", type: "number" },
      { key: "active", label: "Actif", type: "boolean" },
    ],
    actions: [],
    canCreate: true,
  },
  {
    key: "mission-applications",
    label: "Candidatures",
    description: "Gestion des postulants aux missions.",
    titleField: "motivation",
    columns: [
      { key: "mission.title", label: "Mission" },
      { key: "applicant.email", label: "Candidat" },
      { key: "method", label: "Canal" },
      { key: "status", label: "Statut" },
    ],
    fields: [
      { key: "status", label: "Statut" },
      { key: "author_note", label: "Note auteur", type: "textarea" },
      { key: "rejection_reason", label: "Raison rejet", type: "textarea" },
    ],
    actions: [
      { key: "accept", label: "Accepter", tone: "green" },
      { key: "reject", label: "Rejeter", tone: "red" },
      { key: "confirm", label: "Confirmer", tone: "green" },
      { key: "withdraw", label: "Retirer" },
    ],
  },
  {
    key: "orders",
    label: "Commandes",
    description: "Suivi livraison, statuts et paiements.",
    titleField: "order_number",
    columns: [
      { key: "order_number", label: "Commande" },
      { key: "user.email", label: "Client" },
      { key: "shop.name", label: "Boutique" },
      { key: "total_amount", label: "Total" },
      { key: "status", label: "Statut" },
      { key: "payment_status", label: "Paiement" },
    ],
    fields: [
      { key: "status", label: "Statut" },
      { key: "payment_status", label: "Statut paiement" },
      { key: "payment_method", label: "Methode paiement" },
      { key: "shipping_address", label: "Adresse", type: "textarea" },
    ],
    actions: [
      { key: "mark-paid", label: "Marquer payee", tone: "green" },
      { key: "prepare", label: "Preparation" },
      { key: "ship", label: "Expedier" },
      { key: "deliver", label: "Livree", tone: "green" },
      { key: "complete", label: "Finaliser", tone: "green" },
      { key: "cancel", label: "Annuler", tone: "red" },
    ],
  },
  {
    key: "wallets",
    label: "Wallets",
    description: "Soldes utilisateurs et devises.",
    titleField: "user.email",
    columns: [
      { key: "user.email", label: "Utilisateur" },
      { key: "balance", label: "Solde" },
      { key: "total_credited", label: "Credite" },
      { key: "total_debited", label: "Debite" },
      { key: "currency", label: "Devise" },
    ],
    fields: [
      { key: "balance", label: "Solde", type: "number" },
      { key: "currency", label: "Devise" },
    ],
    actions: [],
  },
  {
    key: "transactions",
    label: "Transactions",
    description: "Depots, retraits et paiements wallet.",
    titleField: "reference",
    columns: [
      { key: "reference", label: "Reference" },
      { key: "user.email", label: "Utilisateur" },
      { key: "type", label: "Type" },
      { key: "amount", label: "Montant" },
      { key: "status", label: "Statut" },
    ],
    fields: [
      { key: "status", label: "Statut" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "reference", label: "Reference" },
    ],
    actions: [
      { key: "complete", label: "Valider", tone: "green" },
      { key: "reject", label: "Rejeter", tone: "red" },
      { key: "pending", label: "Remettre attente" },
    ],
  },
  {
    key: "disputes",
    label: "Litiges",
    description: "Arbitrage, investigation et resolution.",
    titleField: "reason",
    columns: [
      { key: "order.order_number", label: "Commande" },
      { key: "user.email", label: "Client" },
      { key: "seller.email", label: "Vendeur" },
      { key: "reason", label: "Motif" },
      { key: "status", label: "Statut" },
    ],
    fields: [
      { key: "status", label: "Statut" },
      { key: "admin_notes", label: "Notes admin", type: "textarea" },
      { key: "resolution", label: "Resolution", type: "textarea" },
      { key: "refund_amount", label: "Remboursement", type: "number" },
    ],
    actions: [
      { key: "investigate", label: "Investiguer" },
      { key: "escalate", label: "Escalader", tone: "amber" },
      { key: "resolve", label: "Resoudre", tone: "green" },
      { key: "close", label: "Cloturer" },
    ],
  },
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
  if (Array.isArray(value)) return `${value.length} element(s)`;
  if (typeof value === "object") return "Objet";
  return String(value);
}

function toPayload(fields: FieldConfig[], form: Record<string, string>) {
  return fields.reduce<Record<string, unknown>>((payload, field) => {
    const raw = form[field.key];
    if (raw === undefined || raw === "") return payload;
    if (field.type === "number") payload[field.key] = Number(raw);
    else if (field.type === "boolean") payload[field.key] = raw === "true";
    else payload[field.key] = raw;
    return payload;
  }, {});
}

export default function AdminSystemPage() {
  const searchParams = useSearchParams();
  const initialResource = (searchParams.get("resource") as AdminResource) || "users";
  const initialStatus = searchParams.get("status") || "all";

  const [resource, setResource] = useState<AdminResource>(
    resources.some((item) => item.key === initialResource) ? initialResource : "users",
  );
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | undefined>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const config = useMemo(
    () => resources.find((item) => item.key === resource) || resources[0],
    [resource],
  );

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
      toast.error("Chargement des donnees admin impossible");
    } finally {
      setLoading(false);
    }
  }, [page, resource, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 200);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({});
  };

  const openEdit = (record: AdminRecord) => {
    setEditing(record);
    setCreating(false);
    const next: Record<string, string> = {};
    config.fields.forEach((field) => {
      const value = getValue(record, field.key);
      if (value !== undefined && value !== null && typeof value !== "object") {
        next[field.key] = String(value);
      }
    });
    setForm(next);
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setForm({});
  };

  const submitForm = async () => {
    try {
      const payload = toPayload(config.fields, form);
      if (editing) {
        await adminService.systemUpdate(config.key, editing.id, payload);
        toast.success("Ressource mise a jour");
      } else {
        await adminService.systemCreate(config.key, payload);
        toast.success("Ressource creee");
      }
      closeForm();
      load();
    } catch (error) {
      console.error(error);
      toast.error("Operation impossible");
    }
  };

  const removeRecord = async (record: AdminRecord) => {
    if (!window.confirm("Confirmer la suppression definitive ?")) return;
    try {
      setBusyId(record.id);
      await adminService.systemDelete(config.key, record.id);
      toast.success("Ressource supprimee");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  const runAction = async (record: AdminRecord, action: string) => {
    const body: Record<string, unknown> = {};
    if (action === "reject") {
      const reason = window.prompt("Raison du rejet :");
      if (reason === null) return;
      body.reason = reason;
    }
    if (action === "resolve") {
      const resolution = window.prompt("Resolution du litige :");
      if (resolution === null) return;
      body.resolution = resolution;
    }

    try {
      setBusyId(record.id);
      await adminService.systemAction(config.key, record.id, action, body);
      toast.success("Action executee");
      load();
    } catch (error) {
      console.error(error);
      toast.error("Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf3de] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#154212]">
              <ShieldCheck className="h-4 w-4" />
              Console CRUD
            </div>
            <h1 className="mt-3 text-2xl font-black text-[#191c18]">
              Administration complete AgriPulse
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-[#5a6256]">
              Selectionne un module, filtre les donnees, modifie les enregistrements
              et lance les actions metier sans quitter l’espace admin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-[#c2c9bb]/45 bg-white px-4 py-2 text-sm font-black text-[#243420] hover:bg-[#f2f7ea]"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
            {config.canCreate && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-[#154212] px-4 py-2 text-sm font-black text-white hover:bg-[#0f3210]"
              >
                <FilePlus2 className="h-4 w-4" />
                Nouveau
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-3 shadow-sm">
          <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
            Modules
          </p>
          <div className="space-y-1">
            {resources.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setResource(item.key);
                  setPage(1);
                  setStatus("all");
                  closeForm();
                }}
                className={`w-full rounded-xl px-3 py-3 text-left transition ${
                  item.key === resource
                    ? "bg-[#154212] text-white"
                    : "text-[#243420] hover:bg-[#f2f7ea]"
                }`}
              >
                <span className="block text-sm font-black">{item.label}</span>
                <span
                  className={`mt-1 block text-xs font-semibold ${
                    item.key === resource ? "text-white/70" : "text-[#72796e]"
                  }`}
                >
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#191c18]">{config.label}</h2>
                <p className="text-sm font-semibold text-[#5a6256]">
                  {pagination?.total ?? records.length} element(s)
                </p>
              </div>
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
                    className="h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] pl-9 pr-3 text-sm font-semibold outline-none focus:border-[#154212] sm:w-72"
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
                    className="h-11 rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] pl-9 pr-8 text-sm font-black outline-none focus:border-[#154212]"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72796e]" />
                </div>
              </div>
            </div>
          </div>

          {(creating || editing) && (
            <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-black text-[#191c18]">
                  {editing ? "Modifier" : "Creer"} - {config.label}
                </h3>
                <button
                  onClick={closeForm}
                  className="rounded-xl border border-[#c2c9bb]/45 p-2 text-[#5a6256] hover:bg-[#f2f7ea]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {config.fields.map((field) => (
                  <label
                    key={field.key}
                    className={field.type === "textarea" ? "md:col-span-2" : ""}
                  >
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">
                      {field.label}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        value={form[field.key] || ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]: event.target.value,
                          }))
                        }
                        rows={4}
                        className="mt-1 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#154212]"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={form[field.key] || ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]: event.target.value,
                          }))
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 text-sm font-semibold outline-none focus:border-[#154212]"
                      >
                        <option value="">Choisir</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <select
                        value={form[field.key] || ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]: event.target.value,
                          }))
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 text-sm font-semibold outline-none focus:border-[#154212]"
                      >
                        <option value="">Choisir</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={form[field.key] || ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.key]: event.target.value,
                          }))
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] px-3 text-sm font-semibold outline-none focus:border-[#154212]"
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={closeForm}
                  className="rounded-xl border border-[#c2c9bb]/45 px-4 py-2 text-sm font-black text-[#5a6256] hover:bg-[#f2f7ea]"
                >
                  Annuler
                </button>
                <button
                  onClick={submitForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#154212] px-4 py-2 text-sm font-black text-white hover:bg-[#0f3210]"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-[#c2c9bb]/45 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#c2c9bb]/45">
                <thead className="bg-[#f6f7f0]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-[#72796e]">
                      ID
                    </th>
                    {config.columns.map((column) => (
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
                        colSpan={config.columns.length + 2}
                        className="px-4 py-10 text-center text-sm font-black text-[#72796e]"
                      >
                        Chargement...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={config.columns.length + 2}
                        className="px-4 py-10 text-center text-sm font-black text-[#72796e]"
                      >
                        Aucun enregistrement.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-[#fbfcf7]">
                        <td className="px-4 py-3 text-sm font-black text-[#154212]">
                          #{record.id}
                        </td>
                        {config.columns.map((column) => (
                          <td
                            key={column.key}
                            className="max-w-[220px] px-4 py-3 text-sm font-semibold text-[#243420]"
                          >
                            <span className="line-clamp-2">
                              {formatValue(getValue(record, column.key))}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex min-w-max justify-end gap-2">
                            <button
                              onClick={() => openEdit(record)}
                              className="rounded-lg border border-[#c2c9bb]/45 p-2 text-[#154212] hover:bg-[#eaf3de]"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            {config.key === "users" && (
                              <Link
                                href={`/admin/users/${record.id}`}
                                className="rounded-lg border border-[#c2c9bb]/45 p-2 text-[#154212] hover:bg-[#eaf3de]"
                                title="Suivi complet"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            )}
                            {config.actions.slice(0, 4).map((action) => (
                              <button
                                key={action.key}
                                onClick={() => runAction(record, action.key)}
                                disabled={busyId === record.id}
                                className={`rounded-lg border p-2 text-xs font-black disabled:opacity-50 ${
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
                              onClick={() => removeRecord(record)}
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
          </div>
        </main>
      </section>
    </div>
  );
}
