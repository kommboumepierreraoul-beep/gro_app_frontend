"use client";

import { AdminResourcePanel } from "@/components/admin/AdminResourcePanel";

export default function AdminCatalogPage() {
  return (
    <AdminResourcePanel
      resource="products"
      eyebrow="Marketplace"
      title="Gestion du catalogue"
      subtitle="Controlez les produits de la marketplace, les statuts de publication, les validations admin, les rejets et la mise en avant."
      columns={[
        { key: "name", label: "Produit" },
        { key: "shop.name", label: "Boutique" },
        { key: "category.name", label: "Categorie" },
        { key: "price", label: "Prix" },
        { key: "approval_status", label: "Approbation" },
        { key: "status", label: "Statut" },
      ]}
      actions={[
        { key: "approve", label: "Approuver", tone: "green" },
        { key: "reject", label: "Rejeter", tone: "red" },
        { key: "feature", label: "Mettre en avant", tone: "amber" },
        { key: "archive", label: "Archiver" },
      ]}
      related={[
        {
          label: "Categories",
          href: "/admin/system?resource=categories",
          description: "CRUD categories produits.",
        },
        {
          label: "Boutiques",
          href: "/admin/sellers",
          description: "Suivre les vendeurs.",
        },
        {
          label: "Commandes",
          href: "/admin/system?resource=orders",
          description: "Controle livraison et paiement.",
        },
      ]}
      detailHref={(record) => `/admin/product/${record.id}`}
    />
  );
}
