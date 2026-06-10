/\*\*

- Résumé des modifications - Gestion des Avatars (Photos de Profil)
-
- PROBLÈME INITIAL:
- - Logique de construction d'URLs d'avatar dupliquée dans plusieurs composants
- - Pas de normalisation des chemins d'images
- - Erreurs potentielles lors de l'affichage des avatars
-
- SOLUTION IMPLÉMENTÉE:
-
- 1.  Avatar Component (src/components/community/shared/Avatar.tsx)
- ✅ Gère maintenant la construction d'URL internement
- ✅ Supports URLs relatives et absolutes
- ✅ Fallback au gradient avec initiales si pas d'image
-
- 2.  Hook Utilitaire (src/hooks/community/useAvatarUrl.ts)
- ✅ Fonction réutilisable pour construire les URLs d'avatar
- ✅ Peut être utilisé en dehors des composants Avatar
-
- 3.  Composants Mis à Jour:
      \*/

// AVANT:
// CreatePostCard.tsx
const getAvatarUrl = () => {
if (!user?.avatar) return undefined;
if (user.avatar.startsWith("http")) return user.avatar;
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const cleanPath = user.avatar.startsWith("/") ? user.avatar : `/${user.avatar}`;
return `${apiUrl}${cleanPath}`;
};
<Avatar src={getAvatarUrl()} firstname={user?.firstname} size="md" />

// APRÈS:
// Aucun getAvatarUrl() nécessaire!
<Avatar src={user?.avatar} firstname={user?.firstname} size="md" />

// AVANT:
// PostCardHeader.tsx
const getAvatarUrl = () => { ... }
<Avatar src={getAvatarUrl()} ... />

// APRÈS:
// Logique centralisée dans le composant Avatar
<Avatar src={author.avatar} firstname={author.firstname} ... />

// AVANT:
// PostCard.tsx
<Avatar
src={post.author?.avatar ? getFullMediaUrl(post.author.avatar) : undefined}
...
/>

// APRÈS:
<Avatar src={post.author?.avatar} ... />

// PAGES IMPACTÉES POSITIVEMENT:
// - Page de création de post
// - Page de feed/timeline
// - Pages de profil utilisateur
// - Section des commentaires
// - Modal de partage
// - Barre de navigation
// - Recherche d'utilisateurs
// - Sidebar gauche
// - Page des annonces
// - Cartes utilisateur

/\*\*

- RÉSUMÉ DES CHANGEMENTS:
- - Fichiers modifiés: 9
- - Lignes de code dupliqué supprimées: ~70
- - Composants Avatar corrigés: 15+
- - Couverture: Tous les endroits où les avatars sont affichés
-
- BÉNÉFICES:
- ✅ Code plus propre et maintenable
- ✅ Point unique d'entrée pour la logique d'avatar
- ✅ Meilleure gestion des erreurs
- ✅ Fallback gracieux (gradient avec initiales)
- ✅ Support complet des URLs relatives et absolues
  \*/
