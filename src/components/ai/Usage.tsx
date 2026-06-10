/**
 * Exemples d'intégration de GROAssistant
 * 
 * Ce fichier montre les 3 façons d'utiliser le composant.
 * Choisissez celle qui correspond à votre cas d'usage.
 */

import GROAssistant from "@/components/ai/GROAssistant";

// ─── Exemple 1 : Bouton flottant (recommandé pour le feed) ────────────────────
// Un bouton 🌿 fixe en bas à droite qui ouvre l'assistant en overlay.
// Parfait pour ne pas perturber l'interface principale.

export function FeedWithFloatingAssistant() {
  const handleCreatePost = (content: string) => {
    // Redirige le contenu généré vers votre CreatePostCard
    console.log("Contenu pour le post :", content);
    // Exemple : openCreatePostModal(content)
  };

  return (
    <div>
      {/* Votre feed normal ici */}
      <main>{/* ... PostCard, etc. */}</main>

      {/* L'assistant s'affiche par-dessus le feed */}
      <GROAssistant mode="floating" onCreatePost={handleCreatePost} />
    </div>
  );
}

// ─── Exemple 2 : Panneau latéral (sidebar) ───────────────────────────────────
// Intégré dans un layout deux colonnes, à côté du feed.
// Idéal pour une page dédiée "Espace IA" ou dans la sidebar droite.

export function LayoutWithSidebarAssistant() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, height: "100vh" }}>
      <main style={{ overflowY: "auto" }}>
        {/* Feed, posts, etc. */}
      </main>

      <aside style={{ height: "100vh", position: "sticky", top: 0, padding: "16px 0" }}>
        <GROAssistant mode="panel" />
      </aside>
    </div>
  );
}

// ─── Exemple 3 : Page dédiée /assistant ──────────────────────────────────────
// Une page complète pour l'assistant, accessible via la navigation GRO.

export default function AssistantPage() {
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px", height: "calc(100vh - 80px)" }}>
      <GROAssistant mode="panel" />
    </div>
  );
}