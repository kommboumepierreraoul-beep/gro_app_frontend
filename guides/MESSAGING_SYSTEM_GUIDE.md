# 📱 Guide du Système de Messagerie Complet

## Vue d'ensemble

Le système de messagerie est une architecture **Frontend-Backend** complète permettant aux utilisateurs de communiquer en temps réel via des conversations privées. Il utilise:

- **Backend**: Laravel avec REST API (Sanctum)
- **Frontend**: Next.js avec React Query pour la gestion d'état
- **Polling**: Mise à jour automatique toutes les 5-10 secondes (pas de WebSocket)

---

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Pages                  Composants              Hooks         │
│  ├─ /messages           ├─ ConversationList     ├─ useMessages│
│  └─ /messages/[id]      ├─ ChatWindow           └─ useConv... │
│                         └─ MessageInput                       │
├─────────────────────────────────────────────────────────────┤
│  Services                                                     │
│  └─ messageService.ts (REST client)                          │
├─────────────────────────────────────────────────────────────┤
│  State Management                                             │
│  └─ React Query + Zustand (community.store)                 │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Laravel)                       │
├─────────────────────────────────────────────────────────────┤
│  Routeur                    Controller                       │
│  └─ routes/api.php          └─ MessageController.php         │
│     POST /messages/convs        ├─ conversations()           │
│     POST /messages/convs/{id}   ├─ createOrFind()            │
│     GET  /messages/convs/{id}/m ├─ messages()                │
│     POST /messages/convs/{id}/m ├─ send()                    │
│     DEL  /messages/{id}         └─ deleteMessage()           │
├─────────────────────────────────────────────────────────────┤
│  Models                         Migrations                    │
│  ├─ Conversation                ├─ conversations table       │
│  ├─ Message                     ├─ messages table            │
│  └─ User (relation)             └─ conversation_user pivot   │
├─────────────────────────────────────────────────────────────┤
│  Database (MySQL)                                             │
│  └─ Storage: conversations, messages, conversation_user     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 Flux de Données Complet

### 1️⃣ **Charger les conversations (Page d'accueil)**

```
Frontend → GET /community/messages/conversations
           ↓
Backend  → MessageController::conversations()
           ├─ SELECT * FROM conversations WHERE user_id = current
           ├─ JOIN participants, lastMessage
           ├─ Calculer unread_count pour chaque
           └─ Paginer 20 par page
           ↓
Frontend ← JSON {data: [{id, name, participants[], last_message, unread_count}]}
           ↓
React Query → Cache + État local
           ↓
ConversationList → Affiche liste + badges "non lus"
```

### 2️⃣ **Ouvrir une conversation (Page /messages/[id])**

```
Frontend → GET /community/messages/conversations/{id}/messages?page=1
           ↓
Backend  → MessageController::messages()
           ├─ SELECT * FROM messages WHERE conversation_id = {id}
           ├─ ORDER BY created_at DESC
           ├─ Paginer 30 par page
           ├─ UPDATE conversation_user SET last_read_at = NOW()
           └─ Mark all as read
           ↓
Frontend ← JSON {data: {data: [messages], current_page, last_page}}
           ↓
React Query → useInfiniteQuery (permet scroll infini)
           ↓
ChatWindow → Affiche messages + avatar + timestamps
```

### 3️⃣ **Envoyer un message**

```
Utilisateur tape + clique Envoyer
           ↓
Frontend → FormData { content, media? }
           ↓
Frontend → POST /community/messages/conversations/{id}/messages
           ↓
Backend  → MessageController::send()
           ├─ Valider: content OU media (au moins l'un)
           ├─ Si media: upload vers Storage (public/community/messages)
           ├─ INSERT INTO messages (conversation_id, sender_id, content, media_url)
           ├─ UPDATE conversations SET updated_at = NOW()
           └─ Retourner message créé
           ↓
Frontend ← JSON {data: {id, content, media_url, sender, created_at}}
           ↓
React Query → Invalidate ["messages", convId]
           ↓
MessageList → Scroll au dernier message
           ↓
Polling backend → Autres users reçoivent via refetch auto (5s)
```

### 4️⃣ **Compter non-lus (Real-time)**

```
Polling toutes 10s:
         Frontend → GET /community/messages/conversations
                    ↓
         Backend  → Recalcul unread_count pour chaque conv
         Frontend ← Réponse avec nouveaux counts
                    ↓
         React Query → Update cache
                    ↓
         ConversationList → Badge "3" becomes "4"
                    ↓
         Zustand community.store → setUnreadMessages(total)
```

---

## 🎯 Types & Interfaces

### Frontend TypeScript (`message.service.ts`)

```typescript
// Participant dans une conversation
interface ConversationParticipant {
  id: number;
  firstname: string;
  lastname: string;
  avatar: string | null;
}

// Dernier message (pour preview liste)
interface LastMessage {
  content: string;
  sender: string;
  created_at: string;
}

// Conversation = regroupement de messages entre users
interface Conversation {
  id: number;
  is_group: boolean; // Pour future scalabilité
  name: string | null; // Nom du groupe (null si privée)
  participants: ConversationParticipant[];
  last_message: LastMessage | null;
  unread_count: number; // Nombre de messages non lus
  updated_at: string; // Pour trier
}

// Message = unité d'échange
interface Message {
  id: number;
  content: string;
  media_url: string | null; // URL vers image/vidéo
  status: "sent" | "delivered" | "read";
  is_mine: boolean; // Pour affichage alignement
  sender_id: number;
  sender: {
    id: number;
    firstname: string;
    avatar: string | null;
  };
  conversation_id: number;
  created_at: string;
}

// Réponse API paginée
interface PaginatedMessages {
  data: Message[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
```

---

## 🔧 Services & Hooks

### `messageService` - Client REST

**Fichier**: `src/services/community/message.service.ts`

```typescript
// ✅ Récupérer les conversations
await messageService.getConversations()
  → GET /community/messages/conversations
  ← Conversation[]

// ✅ Créer ou retrouver une conversation 1-on-1
await messageService.createOrFindConversation(userId: number)
  → POST /community/messages/conversations {user_id}
  ← Conversation

// ✅ Charger les messages d'une conversation
await messageService.getMessages(convId, page?)
  → GET /community/messages/conversations/{id}/messages?page=1
  ← PaginatedMessages

// ✅ Envoyer un message (texte + média optionnel)
await messageService.sendMessage(convId, content, media?)
  → POST /community/messages/conversations/{id}/messages (FormData)
  ← Message

// ✅ Supprimer un message
await messageService.deleteMessage(messageId)
  → DELETE /community/messages/messages/{id}
  ← void

// ✅ Polling manuel (remplace WebSocket)
const stopPolling = messageService.pollMessages(
  convId,
  (newMessages) => { /* update UI */ },
  5000  // intervalle en ms
)
stopPolling() // arrête le polling
```

### `useConversations` Hook

**Fichier**: `src/hooks/community/useMessage.ts`

```typescript
const { data, isLoading } = useConversations();

// data.data.data = Conversation[]
// refetch auto toutes les 10s
// Met à jour community.store.unreadMessages
```

### `useMessages` Hook

**Fichier**: `src/hooks/community/useMessage.ts`

```typescript
const {
  messages, // Message[] (combiné de toutes les pages)
  isLoading, // loading initial
  hasNextPage, // pour scroll infini
  fetchNextPage, // charger plus
  sendMessage, // mutation pour envoyer
} = useMessages(conversationId);

// sendMessage.mutateAsync({ content })
// Auto-refetch après envoi
// refetch auto toutes les 5s
```

---

## 🎨 Composants Frontend

### `ConversationList.tsx`

- **Lieu**: `src/components/community/messages/ConversationList.tsx`
- **Props**: `activeId?: number` (highlight active)
- **Affiche**: Liste conversations avec avatar, dernier message, badge non-lus
- **Actions**: Click = navigate vers `/messages/{id}`

```tsx
<ConversationList activeId={conversationId} />
```

### `ChatWindow.tsx`

- **Lieu**: `src/components/community/messages/ChatWindow.tsx`
- **Props**: `convId: number`, `participant?: {avatar, firstname, lastname}`
- **Affiche**: Messages avec scroll auto, header participante, input
- **Actions**: Envoyer = appel `sendMessage.mutateAsync()`

```tsx
<ChatWindow convId={convId} participant={otherUser} />
```

### `MessageInput.tsx`

- **Lieu**: `src/components/community/messages/MessageInput.tsx`
- **Props**: `onSend: (content) => void`, `isLoading: boolean`
- **Affiche**: Input texte + bouton envoyer + upload optionnel
- **Actions**: Enter = envoyer, gérer disabled pendant chargement

### `ConversationItem.tsx` (Deprecated)

- ⚠️ Ne pas utiliser - préférer `ConversationList`

---

## 🚀 Backend (Laravel)

### Models

#### `Conversation.php`

```php
class Conversation extends Model {
  public function participants(): BelongsToMany {
    return $this->belongsToMany(User::class)
      ->withPivot('last_read_at')
      ->withTimestamps();
  }

  public function lastMessage(): HasOne {
    return $this->hasOne(Message::class)->latestOfMany();
  }

  public function unreadCountFor(int $userId): int {
    // Compte messages non lus depuis last_read_at
  }
}
```

#### `Message.php`

```php
class Message extends Model {
  use SoftDeletes; // Permet "soft delete"

  public function sender(): BelongsTo {
    return $this->belongsTo(User::class, 'sender_id');
  }

  public function conversation(): BelongsTo {
    return $this->belongsTo(Conversation::class);
  }
}
```

### Controller - `MessageController.php`

#### Routes (à ajouter dans `routes/api.php`)

```php
Route::middleware('auth:sanctum')->group(function () {
  // GET - Liste mes conversations
  Route::get('/community/messages/conversations',
    [MessageController::class, 'conversations']);

  // POST - Créer/retrouver conversation privée
  Route::post('/community/messages/conversations',
    [MessageController::class, 'createOrFind']);

  // GET - Charger messages d'une conv
  Route::get('/community/messages/conversations/{conversationId}/messages',
    [MessageController::class, 'messages']);

  // POST - Envoyer un message
  Route::post('/community/messages/conversations/{conversationId}/messages',
    [MessageController::class, 'send']);

  // DELETE - Supprimer un message
  Route::delete('/community/messages/messages/{messageId}',
    [MessageController::class, 'deleteMessage']);
});
```

#### Méthodes principales

```php
// 1. conversations() - Liste mes conversations
// IN:  Authenticated user
// OUT: {success, data: {data: [], current_page, last_page}}

// 2. createOrFind(user_id) - Créer ou retrouver conv privée
// IN:  {user_id: 123}
// OUT: {success, data: Conversation}

// 3. messages(convId, page) - Charger messages
// IN:  conversationId (URL), page (query)
// OUT: {success, data: {data: [], current_page, last_page}}
//      ⚠️ Side effect: UPDATE last_read_at

// 4. send(convId, content?, media?) - Envoyer message
// IN:  FormData {content, media}
// OUT: {success, data: Message} - Status 201

// 5. deleteMessage(messageId) - Supprimer
// IN:  messageId (URL)
// OUT: {success, message: "..."}
```

---

## 🐛 Débogage & Troubleshooting

### ❌ Problème: Messages ne s'affichent pas

**Diagnostique**:

```bash
# 1. Backend - Vérifier logs
tail -f storage/logs/laravel.log

# 2. Vérifier la réponse API
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/community/messages/conversations/{id}/messages

# 3. Frontend - Console browser
console.log("Messages:", messages)
console.log("Conversation ID:", convId)
```

**Causes communes**:

- ❌ `convId` est `undefined` → Vérifier `params.id` dans page.tsx
- ❌ User ne fait pas partie de la conversation → Backend retourne 403
- ❌ React Query cache stale → Force refetch: `queryClient.invalidateQueries()`

**Fix**:

```typescript
// src/app/(community)/messages/[conversationId]/page.tsx
const { id } = use(params); // ✅ Doit être unpacked
const convId = Number(id); // ✅ Convertir en nombre
console.log("Conv ID:", convId); // Debug
```

---

### ❌ Problème: Non-lus pas comptés

**Diagnostique**:

```php
// Backend - Vérifier pivot
$conv = Conversation::find(1);
$pivot = $conv->participants()
  ->where('user_id', Auth::id())
  ->first()?->pivot;

dd($pivot->last_read_at);  // Doit être recent

// Recalculer
$unread = $conv->unreadCountFor(Auth::id());
dd($unread); // Doit être > 0
```

**Causes communes**:

- ❌ `last_read_at` n'est jamais updaté → Controller `messages()` pas appelé
- ❌ Timestamps pivot `timestamps()` manquants dans migration
- ❌ Polling interval trop long → Les nouveaux messages arrivent trop tard

**Fix**:

```php
// Vérifier dans MessageController::messages()
$conversation->participants()
  ->updateExistingPivot($user->id, ['last_read_at' => now()]);
```

---

### ❌ Problème: Upload média échoue

**Diagnostique**:

```typescript
// Frontend - Vérifier FormData
const formData = new FormData();
formData.append("content", content);
if (media) formData.append("media", media);

console.log("FormData:", formData); // Voir contenu
```

**Causes communes**:

- ❌ Fichier trop gros (max 20MB)
- ❌ Type MIME non autorisé (jpg, png, gif, mp4 only)
- ❌ Storage disk non configuré → `Storage::url()` vide

**Fix**:

```php
// config/filesystems.php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

---

### ❌ Problème: Polling ne met pas à jour

**Diagnostique**:

```typescript
// Frontend - Vérifier refetchInterval
const { data } = useConversations();
// refetchInterval: 10_000 = toutes les 10 secondes

// Vérifier manuellement
queryClient.refetchQueries({ queryKey: ["conversations"] });
```

**Causes communes**:

- ❌ `refetchInterval: 0` désactive le polling
- ❌ Page en arrière-plan → React Query suspend par défaut
- ❌ Token expiré → 401 silencieux

**Fix**:

```typescript
// Forcer le polling même en arrière-plan
return useQuery({
  queryKey: ["conversations"],
  queryFn: messageService.getConversations,
  refetchInterval: 10_000,
  refetchIntervalInBackground: true, // ✅ Important
});
```

---

### ❌ Problème: Erreur 403 "Accès refusé"

**Diagnostique**:

```typescript
// Frontend - Vérifier user dans conversation
const conv = convs?.data.find((c) => c.id === convId);
const isParticipant = conv?.participants.some((p) => p.id === user?.id);

console.log("Participants:", conv?.participants);
console.log("Current user:", user?.id);
console.log("Is participant:", isParticipant);
```

**Causes communes**:

- ❌ User pas dans `conversation.participants`
- ❌ Conversation supprimée
- ❌ Token Sanctum invalide

**Fix**:

```php
// Backend - Ajouter debug
if (!$conversation->participants->contains($user->id)) {
    Log::debug("User not in conversation", [
        'user_id' => $user->id,
        'conv_id' => $conversationId,
        'participants' => $conversation->participants->pluck('id')
    ]);
    return response()->json(..., 403);
}
```

---

### ❌ Problème: Messages dupliqués ou manquants

**Diagnostique**:

```typescript
// Frontend - Vérifier structure React Query
const { data } = useMessages(convId);
console.log("Pages:", data?.pages); // Doit avoir multiple pages
const allMessages = data?.pages
  .flatMap((p) => p.data.data) // ✅ .data.data.data ?
  .reverse();
console.log("All messages:", allMessages);
```

**Causes communes**:

- ❌ Structure `.data.data.data` vs `.data.data` inconsistente
- ❌ Pagination mal configurée (page param pas passé)
- ❌ Soft delete pas géré (messages supprimés toujours retournés)

**Fix**:

```typescript
// Normaliser la réponse
const pages = data?.pages || [];
const allMessages = pages
  .flatMap((p: any) => p.data?.data || p.data || [])
  .filter((msg: Message) => msg.id) // Remove nulls
  .reverse();
```

---

## 🔍 Checklist de Déploiement

- [ ] Routes API déclarées dans `routes/api.php`
- [ ] Migrations exécutées: `php artisan migrate`
- [ ] Storage symlink créé: `php artisan storage:link`
- [ ] Sanctum token valide (pas expiré)
- [ ] CORS configuré pour frontend domain
- [ ] Media upload disk configuré (public)
- [ ] React Query refetchInterval > 0
- [ ] Composants importés correctement
- [ ] TypeScript types correspondent au backend
- [ ] Tests des perms: user1 peut-il voir messages user2?

---

## 📚 Fichiers Clés

| Fichier            | Rôle               | Path                                                       |
| ------------------ | ------------------ | ---------------------------------------------------------- |
| Service            | REST Client        | `src/services/community/message.service.ts`                |
| Hook               | Query logic        | `src/hooks/community/useMessage.ts`                        |
| ConversationList   | Affiche convs      | `src/components/community/messages/ConversationList.tsx`   |
| ChatWindow         | Affiche messages   | `src/components/community/messages/ChatWindow.tsx`         |
| MessageInput       | Entrée utilisateur | `src/components/community/messages/MessageInput.tsx`       |
| Controller         | Logic backend      | `app/Http/Controllers/api/community/MessageController.php` |
| Conversation Model | DB schema          | `app/Models/Conversation.php`                              |
| Message Model      | DB schema          | `app/Models/Message.php`                                   |
| Migrations         | Tables             | `database/migrations/2026_05_20_*.php`                     |

---

## 🎓 Flux d'Intégration Rapide

**Pour intégrer le système dans une page:**

```tsx
// Page /messages - Affiche liste
import { ConversationList } from "@/components/community/messages/ConversationList";

export default function MessagesPage() {
  return <ConversationList />;
}

// Page /messages/[id] - Chat
import { ChatWindow } from "@/components/community/messages/ChatWindow";
import { ConversationList } from "@/components/community/messages/ConversationList";

export default function ChatPage({ params }) {
  const convId = Number(params.id);
  return (
    <div className="flex">
      <ConversationList activeId={convId} />
      <ChatWindow convId={convId} />
    </div>
  );
}
```

---

## 🚀 Améliorations Futures

- [ ] Vraie pagination infinie (scroll load more)
- [ ] WebSocket au lieu de polling (performance)
- [ ] Typage strict des erreurs API
- [ ] Recherche full-text dans messages
- [ ] Conversations de groupe
- [ ] Réactions aux messages
- [ ] Statuts de livraison (sent → delivered → read)
- [ ] Notifications push
- [ ] Compression média avant upload
