"use client";

import { AdminResourcePanel } from "@/components/admin/AdminResourcePanel";

export default function AdminUsersPage() {
  return (
    <AdminResourcePanel
      resource="users"
      eyebrow="Comptes"
      title="Gestion des utilisateurs"
      subtitle="Suivez les comptes, roles, statuts, blocages et acces. Chaque utilisateur dispose aussi d'une fiche 360 pour analyser son activite communaute, marketplace, missions et finance."
      columns={[
        { key: "firstname", label: "Prenom" },
        { key: "lastname", label: "Nom" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "status", label: "Statut" },
        { key: "posts_count", label: "Posts" },
        { key: "orders_count", label: "Commandes" },
      ]}
      actions={[
        { key: "block", label: "Bloquer", tone: "red" },
        { key: "unblock", label: "Debloquer", tone: "green" },
        { key: "make-admin", label: "Admin", tone: "amber" },
        { key: "make-seller", label: "Vendeur" },
      ]}
      related={[
        {
          label: "Console CRUD",
          href: "/admin/system?resource=users",
          description: "Creation et edition avancee.",
        },
        {
          label: "Boutiques",
          href: "/admin/sellers",
          description: "Voir les vendeurs et shops.",
        },
        {
          label: "Transactions",
          href: "/admin/transactions",
          description: "Controle wallet et paiements.",
        },
      ]}
      detailHref={(record) => `/admin/users/${record.id}`}
    />
  );
}
