"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Gavel,
  LayoutGrid,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  WalletCards,
} from "lucide-react";
import {
  ActivityLog,
  adminService,
  AnalyticsData,
  PendingProduct,
} from "@/services/admin.service";

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
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "Date inconnue";

function KpiCard({
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

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, activitiesRes, pendingRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getActivityLog(12),
        adminService.getPendingProducts(),
      ]);
      setAnalytics(analyticsRes.data || null);
      setActivities(activitiesRes.data || []);
      setPendingProducts(
        (pendingRes.data || []).filter(
          (product: PendingProduct) =>
            !product.approval_status || product.approval_status === "pending",
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error("Chargement du centre admin impossible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(load, 0);
    const interval = window.setInterval(load, 30000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [load]);

  const overview = analytics?.overview;

  const kpis = useMemo(
    () => [
      {
        label: "Utilisateurs",
        value: String(overview?.users_total ?? analytics?.active_users ?? 0),
        detail: `${overview?.active_users ?? 0} actifs, ${overview?.admins_total ?? 0} admins`,
        icon: Users,
      },
      {
        label: "Marketplace",
        value: String(overview?.products_total ?? 0),
        detail: `${overview?.pending_approvals ?? 0} produits a valider`,
        icon: Boxes,
      },
      {
        label: "Commandes",
        value: String(overview?.orders_total ?? analytics?.total_purchases ?? 0),
        detail: `${overview?.orders_active ?? 0} en cours de traitement`,
        icon: ShoppingCart,
      },
      {
        label: "Revenus",
        value: money(overview?.total_sales ?? analytics?.total_sales),
        detail: `${overview?.sales_growth ?? 0}% par rapport au mois precedent`,
        icon: Banknote,
      },
    ],
    [analytics, overview],
  );

  const modules = [
    {
      title: "Utilisateurs",
      description: "CRUD complet, roles, blocage, deblocage et suspension.",
      href: "/admin/system?resource=users",
      icon: Users,
      metric: `${overview?.users_total ?? 0} comptes`,
    },
    {
      title: "Marketplace",
      description: "Produits, categories, boutiques, validations et mise en avant.",
      href: "/admin/system?resource=products",
      icon: Store,
      metric: `${overview?.shops_active ?? 0} boutiques actives`,
    },
    {
      title: "Missions",
      description: "Offres, categories, candidatures, suspension et publication.",
      href: "/admin/system?resource=missions",
      icon: BriefcaseBusiness,
      metric: `${overview?.missions_published ?? 0} publiees`,
    },
    {
      title: "Commandes",
      description: "Statuts, paiement a la livraison, livraison et finalisation.",
      href: "/admin/system?resource=orders",
      icon: ClipboardList,
      metric: `${overview?.orders_cash_on_delivery ?? 0} COD`,
    },
    {
      title: "Finance",
      description: "Wallets, depots, retraits, transactions et rapprochement.",
      href: "/admin/system?resource=transactions",
      icon: WalletCards,
      metric: `${overview?.pending_deposits ?? 0} depots en attente`,
    },
    {
      title: "Litiges",
      description: "Escalade, investigation, resolution et cloture.",
      href: "/admin/system?resource=disputes",
      icon: Gavel,
      metric: `${overview?.disputes_open ?? 0} ouverts`,
    },
  ];

  const alerts = [
    {
      label: "Produits a approuver",
      value: pendingProducts.length,
      href: "/admin/system?resource=products&status=pending",
      icon: PackageCheck,
    },
    {
      label: "Candidatures missions",
      value: overview?.mission_applications_pending ?? 0,
      href: "/admin/system?resource=mission-applications&status=pending",
      icon: BadgeCheck,
    },
    {
      label: "Transactions en attente",
      value: (overview?.pending_deposits ?? 0) + (overview?.pending_withdrawals ?? 0),
      href: "/admin/system?resource=transactions&status=pending",
      icon: WalletCards,
    },
    {
      label: "Litiges escalades",
      value: overview?.disputes_escalated ?? 0,
      href: "/admin/system?resource=disputes&status=escalated",
      icon: AlertTriangle,
    },
  ];

  if (loading && !analytics) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eaf3de] border-t-[#154212]" />
          <p className="mt-4 text-sm font-bold text-[#5a6256]">
            Initialisation du back-office...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#154212] p-6 text-white shadow-xl sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#d8f6c0]">
              <ShieldCheck className="h-4 w-4" />
              Administration AgriPulse
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Centre de controle complet de la plateforme
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/75">
              Gere les comptes, roles, boutiques, produits, missions, commandes,
              paiements, litiges, moderation et donnees operationnelles depuis
              une console unique.
            </p>
          </div>
          <Link
            href="/admin/system"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8bd918] px-5 py-3 text-sm font-black text-[#10220d] transition hover:bg-[#a8ee32]"
          >
            Ouvrir la console CRUD <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
                Modules administrables
              </p>
              <h2 className="mt-1 text-xl font-black text-[#191c18]">
                CRUD et actions metier
              </h2>
            </div>
            <LayoutGrid className="h-6 w-6 text-[#154212]" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] p-4 transition hover:border-[#154212]/45 hover:bg-[#f2f7ea]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3de] text-[#154212]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#154212]">
                      {module.metric}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-black text-[#191c18]">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-5 text-[#5a6256]">
                    {module.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
              Alertes admin
            </p>
            <h2 className="mt-1 text-xl font-black text-[#191c18]">
              A traiter maintenant
            </h2>
            <div className="mt-5 space-y-3">
              {alerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <Link
                    key={alert.label}
                    href={alert.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#c2c9bb]/45 bg-[#fffef8] p-4 hover:bg-[#f2f7ea]"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-[#154212]" />
                      <span className="text-sm font-black text-[#243420]">
                        {alert.label}
                      </span>
                    </div>
                    <span className="rounded-full bg-[#154212] px-3 py-1 text-xs font-black text-white">
                      {alert.value}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#72796e]">
              Activite systeme
            </p>
            <div className="mt-5 space-y-4">
              {activities.length === 0 ? (
                <div className="rounded-xl bg-[#f6f7f0] p-4 text-sm font-bold text-[#72796e]">
                  Aucune activite recente.
                </div>
              ) : (
                activities.slice(0, 7).map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#154212]" />
                    <div>
                      <p className="line-clamp-2 text-sm font-bold text-[#243420]">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#72796e]">
                        {activity.category || "Systeme"} -{" "}
                        {dateLabel(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
