# Guide: Affichage des Avatars (Photos de Profil)

## Vue d'ensemble

Ce guide explique comment afficher les photos de profil (avatars) correctement dans l'application.

## Le Composant Avatar

**Localisation**: `src/components/community/shared/Avatar.tsx`

### Props

```tsx
interface AvatarProps {
  src?: string | null; // URL de l'image (relative ou absolue)
  firstname?: string; // Nom pour afficher en fallback
  size?: "xs" | "sm" | "md" | "lg" | "xl"; // Taille de l'avatar
  className?: string; // Classes CSS supplémentaires
}
```

### Tailles Disponibles

| Size | Pixel |
| ---- | ----- |
| `xs` | 24px  |
| `sm` | 32px  |
| `md` | 40px  |
| `lg` | 56px  |
| `xl` | 96px  |

## Utilisation

### Cas d'Usage Basique

```tsx
import { Avatar } from "@/components/community/shared/Avatar";
import { useAuthStore } from "@/store/auth.store";

export function MyComponent() {
  const { user } = useAuthStore();

  return <Avatar src={user?.avatar} firstname={user?.firstname} size="md" />;
}
```

### Cas d'Usage: Profil d'Auteur

```tsx
import { Avatar } from "@/components/community/shared/Avatar";

export function PostHeader({ author }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={author.avatar} firstname={author.firstname} size="lg" />
      <div>
        <h3>
          {author.firstname} {author.lastname}
        </h3>
      </div>
    </div>
  );
}
```

### Cas d'Usage: Commentaires

```tsx
export function CommentCard({ comment }) {
  return (
    <div className="flex gap-3">
      <Avatar
        src={comment.author.avatar}
        firstname={comment.author.firstname}
        size="sm"
      />
      <div>
        <p className="font-semibold">{comment.author.firstname}</p>
        <p>{comment.content}</p>
      </div>
    </div>
  );
}
```

### Cas d'Usage: Barre de Navigation

```tsx
export function NavBar() {
  const { user } = useAuthStore();

  return (
    <nav>
      <Avatar
        src={user?.avatar}
        firstname={user?.firstname}
        size="sm"
        className="ring-2 ring-green-300"
      />
    </nav>
  );
}
```

## Formats d'URL Supportés

Le composant Avatar supporte tous ces formats:

```tsx
// ✅ URLs relatives (avec slash)
<Avatar src="/storage/avatars/user-1.jpg" />

// ✅ URLs relatives (sans slash)
<Avatar src="storage/avatars/user-1.jpg" />

// ✅ URLs absolutes (HTTP)
<Avatar src="https://example.com/avatar.jpg" />

// ✅ URLs absolutes (HTTP local)
<Avatar src="http://localhost:8000/storage/avatars/user-1.jpg" />

// ✅ Valeurs nulles/undefined (affiche les initiales)
<Avatar src={null} firstname="Jean" />
<Avatar src={undefined} firstname="Jean" />
```

## Comportement de Fallback

Quand aucune image n'est disponible:

```tsx
// Affiche les initiales avec un gradient de fond
<Avatar
  src={null}
  firstname="Jean Dupont" // Affichera "J"
  size="md"
/>

// Styles du fallback:
// - Fond: gradient bleu-purple
// - Forme: cercle
// - Texte: première lettre en blanc gras
```

## Gestion des Erreurs

Le composant gère automatiquement:

```tsx
// ✅ Image non trouvée → affiche les initiales
// ✅ URL invalide → affiche les initiales
// ✅ Erreur réseau → affiche les initiales
// ✅ Format image non supporté → affiche les initiales
```

## Hook Utilitaire (Optionnel)

Pour construire manuellement une URL d'avatar:

```tsx
import { useAvatarUrl } from "@/hooks/community/useAvatarUrl";

export function MyComponent({ avatarPath }) {
  const fullUrl = useAvatarUrl(avatarPath);

  return <img src={fullUrl} alt="avatar" />;
}
```

## Points Clés

✅ **NE JAMAIS** construire l'URL d'avatar manuellement
✅ **TOUJOURS** passer directement `user.avatar` ou `author.avatar`
✅ **LE COMPOSANT** gère la construction d'URL internement
✅ **LES INITIALES** sont le fallback automatique

## Architecture

```
User Data (API)
    ↓
    avatar: "/storage/avatars/user-1.jpg"
    ↓
<Avatar src={user.avatar} ... />
    ↓
    Avatar Component
        ↓
        Détecte si c'est relative ou absolue
        ↓
        Ajoute le NEXT_PUBLIC_API_URL si nécessaire
        ↓
        Affiche l'image OU les initiales
```

## Variables d'Environnement

Le composant utilise: `NEXT_PUBLIC_API_URL`

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Dépannage

### Les avatars n's'affichent pas?

1. Vérifier que `NEXT_PUBLIC_API_URL` est défini
2. Vérifier que `user.avatar` n'est pas null
3. Vérifier que l'image existe sur le serveur
4. Vérifier la console pour les erreurs

### Les initiales s'affichent à la place?

- Normal! C'est un fallback
- Vérifier le chemin de l'image
- Vérifier que le fichier image existe
- Vérifier les permissions d'accès

## Exemples Complets

### Profile Page

```tsx
import { Avatar } from "@/components/community/shared/Avatar";
import { useProfile } from "@/hooks/useProfile";

export function ProfilePage({ userId }) {
  const { profile } = useProfile(userId);

  return (
    <div className="profile-header">
      <Avatar src={profile?.avatar} firstname={profile?.firstname} size="xl" />
      <h1>
        {profile?.firstname} {profile?.lastname}
      </h1>
    </div>
  );
}
```

### User List

```tsx
export function UserList({ users }) {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-3">
          <Avatar src={user.avatar} firstname={user.firstname} size="sm" />
          <span>
            {user.firstname} {user.lastname}
          </span>
        </div>
      ))}
    </div>
  );
}
```
