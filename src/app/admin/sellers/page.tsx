"use client";

import { AdminResourcePanel } from "@/components/admin/AdminResourcePanel";

export default function AdminSellersPage() {
  return (
    <AdminResourcePanel
      resource="shops"
      eyebrow="Vendeurs"
      title="Gestion des boutiques"
      subtitle="Supervisez les boutiques, leurs proprietaires, les suspensions, l'activite catalogue et le suivi fournisseur."
      columns={[
        { key: "name", label: "Boutique" },
        { key: "user.email", label: "Proprietaire" },
        { key: "city", label: "Ville" },
        { key: "phone", label: "Telephone" },
        { key: "products_count", label: "Produits" },
        { key: "status", label: "Statut" },
      ]}
      actions={[
        { key: "approve", label: "Approuver", tone: "green" },
        { key: "reject", label: "Rejeter", tone: "red" },
        { key: "activate", label: "Activer", tone: "green" },
        { key: "suspend", label: "Suspendre", tone: "red" },
      ]}
      related={[
        {
          label: "Produits",
          href: "/admin/catalog",
          description: "Catalogue des vendeurs.",
        },
        {
          label: "Commandes",
          href: "/admin/system?resource=orders",
          description: "Suivi livraison fournisseur.",
        },
        {
          label: "Utilisateurs",
          href: "/admin/users",
          description: "Roles et comptes vendeurs.",
        },
      ]}
    />
  );
}
