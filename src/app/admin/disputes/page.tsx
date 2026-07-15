"use client";

import { AdminResourcePanel } from "@/components/admin/AdminResourcePanel";

export default function AdminDisputesPage() {
  return (
    <AdminResourcePanel
      resource="disputes"
      eyebrow="Arbitrage"
      title="Gestion des litiges"
      subtitle="Suivez les conflits client-vendeur, escaladez les cas sensibles, investiguez puis resolvez les litiges depuis l'espace admin."
      columns={[
        { key: "order.order_number", label: "Commande" },
        { key: "user.email", label: "Client" },
        { key: "seller.email", label: "Vendeur" },
        { key: "reason", label: "Motif" },
        { key: "refund_amount", label: "Remboursement" },
        { key: "status", label: "Statut" },
      ]}
      actions={[
        { key: "investigate", label: "Investiguer" },
        { key: "escalate", label: "Escalader", tone: "amber" },
        { key: "resolve", label: "Resoudre", tone: "green" },
        { key: "close", label: "Cloturer" },
      ]}
      related={[
        {
          label: "Commandes",
          href: "/admin/system?resource=orders",
          description: "Verifier la commande liee.",
        },
        {
          label: "Transactions",
          href: "/admin/transactions",
          description: "Controle remboursement.",
        },
        {
          label: "Console CRUD",
          href: "/admin/system?resource=disputes",
          description: "Edition avancee litiges.",
        },
      ]}
      detailHref={(record) => `/admin/disputes/${record.id}`}
    />
  );
}
