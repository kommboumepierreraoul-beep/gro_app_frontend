"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Gavel,
  MapPin,
  MessageCircle,
  PackageCheck,
  Radio,
  ShoppingCart,
  Store,
  Users,
  WalletCards,
} from "lucide-react";
import { adminService, AdminUserInsights } from "@/services/admin.service";

const money = (value?: number | string | null) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const dateLabel = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "-";

function fullName(user?: Record<string, unknown>) {
  if (!user) return "Utilisateur";
  const firstname = typeof user.firstname === "string" ? user.firstname : "";
  const lastname = typeof user.lastname === "string" ? user.lastname : "";
  const email = typeof user.email === "string" ? user.email : "";
  return `${firstname} ${lastname}`.trim() || email || "Utilisateur";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black text-[#191c18]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3de] text-[#154212]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#5a6256]">{detail}</p>
    </div>
  );
}

function BarChart({
  data,
  series,
}: {
  data: AdminUserInsights["charts"]["monthly"];
  series: Array<{ key: keyof AdminUserInsights["charts"]["monthly"][number]; label: string; color: string }>;
}) {
  const max = Math.max(
    1,
    ...data.flatMap((item) => series.map((entry) => Number(item[entry.key] || 0))),
  );

  return (
    <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
            Graphique
          </p>
          <h2 className="text-xl font-black text-[#191c18]">Activite sur 6 mois</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {series.map((entry) => (
            <span key={String(entry.key)} className="inline-flex items-center gap-1 text-xs font-bold text-[#5a6256]">
              <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
              {entry.label}
            </span>
          ))}
        </div>
      </div>
      <div className="grid h-64 grid-cols-6 items-end gap-3 border-b border-l border-[#c2c9bb]/45 px-3 pb-3">
        {data.map((item) => (
          <div key={item.month} className="flex h-full flex-col justify-end gap-2">
            <div className="flex flex-1 items-end justify-center gap-1">
              {series.map((entry) => {
                const value = Number(item[entry.key] || 0);
                return (
                  <div
                    key={String(entry.key)}
                    title={`${entry.label}: ${value}`}
                    className="min-h-1 w-3 rounded-t"
                    style={{
                      height: `${Math.max(4, (value / max) * 100)}%`,
                      background: entry.color,
                    }}
                  />
                );
              })}
            </div>
            <p className="text-center text-xs font-black text-[#72796e]">{item.month}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusChart({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data || {});
  const total = entries.reduce((sum, [, value]) => sum + Number(value), 0) || 1;

  return (
    <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-[#191c18]">{title}</h3>
      <div className="mt-4 space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm font-bold text-[#72796e]">Aucune donnee.</p>
        ) : (
          entries.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-[#72796e]">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eaf3de]">
                <div
                  className="h-full rounded-full bg-[#154212]"
                  style={{ width: `${(Number(value) / total) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MiniMap({ points }: { points: AdminUserInsights["marketplace"]["map_points"] }) {
  return (
    <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
            Carte livraison
          </p>
          <h2 className="text-xl font-black text-[#191c18]">Points geolocalises</h2>
        </div>
        <MapPin className="h-6 w-6 text-[#154212]" />
      </div>
      <div className="relative mt-5 h-72 overflow-hidden rounded-2xl border border-[#c2c9bb]/45 bg-[#eef6e6]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,66,18,.08)_1px,transparent_1px),linear-gradient(rgba(21,66,18,.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
        {points.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center px-8 text-center text-sm font-bold text-[#5a6256]">
            Aucune coordonnee de livraison disponible pour cet utilisateur.
          </div>
        ) : (
          points.slice(0, 12).map((point, index) => (
            <div
              key={point.id}
              className="absolute flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#154212] text-xs font-black text-white shadow-lg"
              style={{
                left: `${12 + ((Math.abs(point.lng) * 19 + index * 11) % 76)}%`,
                top: `${12 + ((Math.abs(point.lat) * 23 + index * 9) % 70)}%`,
              }}
              title={`${point.label} - ${point.status}`}
            >
              {index + 1}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminUserInsightsPage() {
  const params = useParams();
  const id = Number(params.id);
  const [insights, setInsights] = useState<AdminUserInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await adminService.getUserInsights(id);
      setInsights(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Suivi utilisateur impossible a charger");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const user = insights?.user;
  const risks = insights?.summary.risk_flags;
  const riskCount =
    (risks?.suspended ? 1 : 0) +
    (risks?.publishing_blocked ? 1 : 0) +
    (risks?.open_disputes ? 1 : 0) +
    (risks?.pending_products ? 1 : 0);

  const stats = useMemo(() => {
    if (!insights) return [];
    return [
      {
        label: "Communaute",
        value: String(insights.summary.community_score),
        detail: `${insights.community.posts} posts, ${insights.community.comments} commentaires`,
        icon: MessageCircle,
      },
      {
        label: "Marketplace",
        value: String(insights.summary.marketplace_score),
        detail: `${insights.marketplace.buyer_orders} achats, ${insights.marketplace.seller_orders} ventes`,
        icon: Store,
      },
      {
        label: "Wallet",
        value: money(insights.finance.wallet?.balance),
        detail: `${insights.finance.transactions_pending} transaction(s) en attente`,
        icon: WalletCards,
      },
      {
        label: "Risques",
        value: String(riskCount),
        detail: `${insights.disputes.open} litige(s) ouvert(s)`,
        icon: AlertTriangle,
      },
    ];
  }, [insights, riskCount]);

  if (loading && !insights) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eaf3de] border-t-[#154212]" />
          <p className="mt-4 text-sm font-bold text-[#5a6256]">Chargement du suivi utilisateur...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        Utilisateur introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/system?resource=users"
        className="inline-flex items-center gap-2 text-sm font-black text-[#154212] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux utilisateurs
      </Link>

      <section className="rounded-2xl bg-[#154212] p-6 text-white shadow-xl sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#d8f6c0]">
              <Radio className="h-4 w-4" />
              Suivi utilisateur 360
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight">
              {fullName(user)}
            </h1>
            <p className="mt-2 text-sm font-semibold text-white/75">
              {user?.email} - role {user?.role || "-"} - statut {user?.status || "active"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
            <div className="rounded-xl bg-white/10 p-4">
              <Clock className="h-5 w-5 text-[#8bd918]" />
              <p className="mt-3 text-2xl font-black">{insights.summary.account_age_days}</p>
              <p className="text-xs font-bold text-white/70">jours sur AgriPulse</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <Users className="h-5 w-5 text-[#8bd918]" />
              <p className="mt-3 text-2xl font-black">{insights.community.followers}</p>
              <p className="text-xs font-bold text-white/70">abonnes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <BarChart
          data={insights.charts.monthly}
          series={[
            { key: "community_posts", label: "Posts", color: "#154212" },
            { key: "buyer_orders", label: "Achats", color: "#8bd918" },
            { key: "seller_orders", label: "Ventes", color: "#3467eb" },
            { key: "missions", label: "Missions", color: "#d97706" },
          ]}
        />
        <MiniMap points={insights.marketplace.map_points} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatusChart title="Statuts commandes" data={insights.charts.order_status} />
        <StatusChart title="Statuts produits" data={insights.charts.product_status} />
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-[#191c18]">Alertes</h3>
          <div className="mt-4 space-y-3">
            {[
              ["Compte suspendu", risks?.suspended],
              ["Publication bloquee", risks?.publishing_blocked],
              [`${risks?.open_disputes ?? 0} litige(s) ouvert(s)`, !!risks?.open_disputes],
              [`${risks?.pending_products ?? 0} produit(s) a valider`, !!risks?.pending_products],
            ].map(([label, active]) => (
              <div
                key={String(label)}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  active
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-[#c2c9bb]/45 bg-[#f9faf2] text-[#5a6256]"
                }`}
              >
                {active ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                <span className="text-sm font-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#191c18]">Communaute</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Posts" value={String(insights.community.posts)} detail="publications" icon={MessageCircle} />
            <StatCard label="Likes" value={String(insights.community.likes_given)} detail="likes donnes" icon={CheckCircle2} />
            <StatCard label="Messages" value={String(insights.community.messages)} detail="messagerie" icon={MessageCircle} />
          </div>
          <div className="mt-5 space-y-3">
            {insights.community.recent_posts.map((post) => (
              <div key={post.id} className="rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] p-4">
                <p className="font-black text-[#243420]">{post.title || post.type || "Publication"}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#5a6256]">{post.content || "-"}</p>
                <p className="mt-2 text-xs font-bold text-[#72796e]">{dateLabel(post.created_at)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#191c18]">Marketplace</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Produits" value={String(insights.marketplace.products_total)} detail={`${insights.marketplace.products_approved} approuves`} icon={Boxes} />
            <StatCard label="Revenus vendeur" value={money(insights.marketplace.seller_revenue)} detail={`${insights.marketplace.seller_orders} ventes`} icon={Banknote} />
            <StatCard label="Achats" value={String(insights.marketplace.buyer_orders)} detail={money(insights.marketplace.buyer_spent)} icon={ShoppingCart} />
            <StatCard label="Boutique" value={insights.marketplace.shop ? "Oui" : "Non"} detail={String(insights.marketplace.shop?.name || "Aucune boutique")} icon={Store} />
          </div>
          <div className="mt-5 space-y-3">
            {insights.marketplace.recent_orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-[#243420]">{order.order_number}</p>
                  <span className="rounded-full bg-[#eaf3de] px-2 py-1 text-xs font-black text-[#154212]">{order.status}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-[#5a6256]">{money(order.total_amount)} - {order.payment_status || "paiement"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#191c18]">Missions</h2>
          <div className="mt-4 space-y-3">
            <StatCard label="Publiees" value={String(insights.missions.authored_published)} detail={`${insights.missions.authored_total} creees`} icon={BriefcaseBusiness} />
            <StatCard label="Candidatures" value={String(insights.missions.applications_total)} detail={`${insights.missions.applications_accepted} acceptees`} icon={PackageCheck} />
          </div>
        </div>
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#191c18]">Finance</h2>
          <div className="mt-4 space-y-3">
            {insights.finance.recent_transactions.map((trx) => (
              <div key={trx.id} className="rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] p-4">
                <p className="font-black text-[#243420]">{trx.reference || trx.type}</p>
                <p className="text-sm font-bold text-[#154212]">{money(trx.amount)} - {trx.status}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#191c18]">Litiges</h2>
          <div className="mt-4 space-y-3">
            <StatCard label="Ouverts" value={String(insights.disputes.open)} detail={`${insights.disputes.as_client} client, ${insights.disputes.as_seller} vendeur`} icon={Gavel} />
            {insights.disputes.recent.map((dispute) => (
              <div key={dispute.id} className="rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] p-4">
                <p className="font-black text-[#243420]">{dispute.reason}</p>
                <p className="text-sm font-bold text-[#5a6256]">{dispute.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
