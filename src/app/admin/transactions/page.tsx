"use client";

import { AdminResourcePanel } from "@/components/admin/AdminResourcePanel";

export default function AdminTransactionsPage() {
  return (
    <AdminResourcePanel
      resource="transactions"
      eyebrow="Finance"
      title="Gestion des transactions"
      subtitle="Controlez les depots, retraits, paiements wallet, references NotchPay et transactions en attente avant validation."
      columns={[
        { key: "reference", label: "Reference" },
        { key: "user.email", label: "Utilisateur" },
        { key: "type", label: "Type" },
        { key: "amount", label: "Montant" },
        { key: "status", label: "Statut" },
        { key: "created_at", label: "Date" },
      ]}
      actions={[
        { key: "complete", label: "Valider", tone: "green" },
        { key: "reject", label: "Rejeter", tone: "red" },
        { key: "pending", label: "Remettre attente" },
      ]}
      related={[
        {
          label: "Wallets",
          href: "/admin/system?resource=wallets",
          description: "Soldes utilisateurs.",
        },
        {
          label: "Commandes",
          href: "/admin/system?resource=orders",
          description: "Paiements commandes.",
        },
        {
          label: "Utilisateurs",
          href: "/admin/users",
          description: "Suivi financier par user.",
        },
      ]}
    />
  );
}
