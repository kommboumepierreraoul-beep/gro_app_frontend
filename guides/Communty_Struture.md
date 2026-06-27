# Module Community — Structure complète
# Réseau social style LinkedIn — Next.js + Tailwind CSS

=======================================================================
## STRUCTURE DES FICHIERS
=======================================================================

```
src/
├── app/
│   └── (community)/
│       ├── layout.tsx                    ← Layout principal (Navbar + sidebar)
│       ├── community/
│       │   └── page.tsx                  ← Feed principal
│       ├── profile/
│       │   ├── page.tsx                  ← Mon profil
│       │   └── [id]/page.tsx             ← Profil d'un autre utilisateur
│       ├── messages/
│       │   ├── page.tsx                  ← Liste des conversations
│       │   └── [conversationId]/page.tsx ← Conversation ouverte
│       ├── notifications/
│       │   └── page.tsx                  ← Centre de notifications
│       ├── announcements/
│       │   └── page.tsx                  ← Annonces/Offres
│       ├── search/
│       │   └── page.tsx                  ← Recherche globale
│       └── settings/
│           ├── page.tsx                  ← Paramètres généraux
│           ├── profile/page.tsx          ← Éditer le profil
│           ├── privacy/page.tsx          ← Confidentialité
│           ├── notifications/page.tsx    ← Préférences notifications
│           └── account/page.tsx          ← Compte & sécurité
│
├── components/
│   └── community/
│       ├── layout/
│       │   ├── CommunityNavbar.tsx       ← Barre de navigation supérieure
│       │   ├── LeftSidebar.tsx           ← Sidebar gauche (profil résumé + nav)
│       │   ├── RightSidebar.tsx          ← Sidebar droite (suggestions, tendances)
│       │   └── MobileBottomNav.tsx       ← Navigation mobile bas d'écran
│       │
│       ├── feed/
│       │   ├── Feed.tsx                  ← Liste des posts
│       │   ├── PostCard.tsx              ← Carte d'un post
│       │   ├── CreatePostModal.tsx       ← Modal création de post
│       │   ├── PostActions.tsx           ← Like, Commentaire, Partage
│       │   ├── CommentSection.tsx        ← Section commentaires
│       │   ├── CommentCard.tsx           ← Un commentaire
│       │   └── ShareModal.tsx            ← Modal partage
│       │
│       ├── messages/
│       │   ├── ConversationList.tsx      ← Liste des conversations
│       │   ├── ConversationItem.tsx      ← Item de conversation
│       │   ├── ChatWindow.tsx            ← Fenêtre de chat
│       │   ├── MessageBubble.tsx         ← Bulle de message
│       │   └── MessageInput.tsx          ← Champ de saisie message
│       │
│       ├── profile/
│       │   ├── ProfileHeader.tsx         ← Bannière + avatar + infos
│       │   ├── ProfileStats.tsx          ← Statistiques (posts, followers...)
│       │   ├── ProfileAbout.tsx          ← Section À propos
│       │   ├── ProfilePosts.tsx          ← Posts de l'utilisateur
│       │   └── FollowButton.tsx          ← Bouton Suivre/Ne plus suivre
│       │
│       ├── announcements/
│       │   ├── AnnouncementCard.tsx      ← Carte d'annonce
│       │   └── CreateAnnouncementModal.tsx
│       │
│       ├── notifications/
│       │   ├── NotificationItem.tsx      ← Item de notification
│       │   └── NotificationBadge.tsx     ← Badge compteur
│       │
│       └── shared/
│           ├── Avatar.tsx                ← Avatar utilisateur
│           ├── UserCard.tsx              ← Mini carte utilisateur
│           └── MediaUploader.tsx         ← Upload image/vidéo pour posts
│
├── services/
│   ├── post.service.ts                   ← API posts
│   ├── comment.service.ts                ← API commentaires
│   ├── message.service.ts                ← API messages
│   ├── follow.service.ts                 ← API follow/unfollow
│   ├── notification.service.ts           ← API notifications
│   └── announcement.service.ts          ← API annonces
│
├── hooks/
│   ├── useFeed.ts                        ← Hook feed + pagination
│   ├── useMessages.ts                    ← Hook messages temps réel
│   ├── useNotifications.ts               ← Hook notifications
│   └── useFollow.ts                      ← Hook follow
│
└── types/
    └── community.types.ts                ← Tous les types TypeScript
```

=======================================================================
## PACKAGES À INSTALLER
=======================================================================

```bash
npm install socket.io-client                # Messages temps réel
npm install @tanstack/react-query           # Fetching + cache des données
npm install react-infinite-scroll-component # Infinite scroll du feed
npm install date-fns                        # Formatage des dates
npm install emoji-picker-react              # Picker emoji pour les messages
npm install react-dropzone                  # Upload fichiers drag & drop
```

=======================================================================
## ROUTES API LARAVEL À CRÉER (backend)
=======================================================================

```
POST   /api/posts                    → Créer un post
GET    /api/posts                    → Feed paginé
GET    /api/posts/{id}               → Un post
DELETE /api/posts/{id}               → Supprimer
POST   /api/posts/{id}/like          → Liker/unliker
POST   /api/posts/{id}/share         → Partager
GET    /api/posts/{id}/comments      → Commentaires
POST   /api/posts/{id}/comments      → Ajouter commentaire
DELETE /api/comments/{id}            → Supprimer commentaire
POST   /api/comments/{id}/like       → Liker commentaire

GET    /api/conversations            → Mes conversations
POST   /api/conversations            → Créer une conversation
GET    /api/conversations/{id}/messages → Messages
POST   /api/conversations/{id}/messages → Envoyer message

GET    /api/users/{id}               → Profil utilisateur
POST   /api/users/{id}/follow        → Suivre
DELETE /api/users/{id}/follow        → Ne plus suivre
GET    /api/users/{id}/followers     → Abonnés
GET    /api/users/{id}/following     → Abonnements

GET    /api/notifications            → Mes notifications
PUT    /api/notifications/read-all   → Tout marquer lu
PUT    /api/notifications/{id}/read  → Marquer lu

GET    /api/announcements            → Liste annonces
POST   /api/announcements            → Créer annonce
```