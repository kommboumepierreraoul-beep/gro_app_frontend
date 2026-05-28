# 🤖 CLAUDE.md - Instructions pour Assistants IA

**Projet:** GRO - Système de Messagerie  
**Statut:** ✅ COMPLET & PRODUCTION-READY  
**Dernière Maj:** 28/05/2026

---

## 🎯 Contexte Rapide

Le projet GRO possède un **système de messagerie complet** fonctionnant avec:

- **Frontend:** Next.js + React Query (polling 5-10s)
- **Backend:** Laravel Sanctum + REST API
- **Base de données:** MySQL (Conversations, Messages, Pivot)

Le système est **entièrement implémenté** et fonctionnel. Pas de WebSocket, juste du polling REST.

---

## 📁 Structure Clé

### Frontend (`frontend/`)

**Pages:**

- `src/app/(community)/messages/page.tsx` — Liste convs
- `src/app/(community)/messages/[conversationId]/page.tsx` — Chat détail

**Composants:**

- `src/components/community/messages/ConversationList.tsx` — Affiche convs
- `src/components/community/messages/ChatWindow.tsx` — Chat window
- `src/components/community/messages/MessageInput.tsx` — Input
- `src/components/community/messages/MessageBubble.tsx` — Bubble

**Services & Hooks:**

- `src/services/community/message.service.ts` — REST client (5 endpoints)
- `src/hooks/community/useMessage.ts` — useConversations, useMessages

**State:**

- `src/store/community.store.ts` — Zustand (unreadMessages, unreadNotifs)

### Backend (`backend/`)

**Controller:**

- `app/Http/Controllers/Api/Community/MessageController.php` — 5 méthodes

**Models:**

- `app/Models/Conversation.php` — Has messages, participants
- `app/Models/Message.php` — Soft deletes, relations
- `app/Models/User.php` — Relation messages

**Routes (déjà configurées):**

```php
// Dans routes/community/community.php
Route::prefix('messages')->group(function () {
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::post('/conversations', [MessageController::class, 'createOrFind']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'send']);
    Route::delete('/messages/{id}', [MessageController::class, 'deleteMessage']);
});
```

**Migrations:**

- `2026_05_20_132850_create_conversations_table.php`
- `2026_05_20_132900_create_messages_table.php`
- `2026_05_20_132901_create_conversation_user_table.php`

---

## 🔄 Flux de Données

```
User → Envoyer message
  ↓
ChatWindow.onSend()
  ↓
sendMessage.mutateAsync({ content })
  ↓
messageService.sendMessage()
  ↓
POST /api/community/messages/conversations/{id}/messages
  ↓
Backend: MessageController::send()
  ↓
INSERT INTO messages + UPDATE conversations.updated_at
  ↓
React Query: invalidateQueries(["messages", convId])
  ↓
useMessages(): refetch auto
  ↓
ChatWindow: messages updated + scroll bottom
```

---

## 🛠️ Commandes Essentielles

```bash
# Backend
cd backend
php artisan migrate              # Crée tables
php artisan serve                # Lance :8000
php artisan tinker               # REPL debug

# Frontend
cd frontend
npm run dev                       # Dev :3000
npm run build                     # Prod build

# Tests
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/community/messages/conversations
```

---

## 📋 Types TypeScript Clés

```typescript
interface ConversationParticipant {
  id: number;
  firstname: string;
  lastname: string;
  avatar: string | null;
}

interface Conversation {
  id: number;
  is_group: boolean;
  name: string | null;
  participants: ConversationParticipant[];
  last_message: { content; sender; created_at } | null;
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: number;
  content: string;
  media_url: string | null;
  status: "sent" | "delivered" | "read";
  is_mine: boolean;
  sender_id: number;
  sender: { id; firstname; avatar };
  conversation_id: number;
  created_at: string;
}
```

---

## 🐛 Problèmes Courants & Fixes

| Problème       | Cause                    | Fix                                  |
| -------------- | ------------------------ | ------------------------------------ |
| 404 routes     | Migrations pas exécutées | `php artisan migrate`                |
| 403 Access     | User pas participant     | Vérifier `conversation.participants` |
| Messages vides | Polling désactivé        | Vérifier `refetchInterval` > 0       |
| CORS error     | Domain non autorisé      | `config/cors.php`                    |
| Timeout        | Query N+1                | Optimiser relations Eloquent         |

---

## ✨ Améliorations Futures

- [ ] WebSocket au lieu de polling (socket.io)
- [ ] Pagination infinie (scroll)
- [ ] Upload média + compression
- [ ] Conversations de groupe
- [ ] Recherche full-text messages
- [ ] Notifs push
- [ ] Statuts livraison réels
- [ ] Typing indicator
- [ ] Read receipts

---

## 📚 Où Trouver les Guides

- **Démarrage:** `guides/QUICK_START_MESSAGING.md` (5 min)
- **Complet:** `guides/MESSAGING_SYSTEM_GUIDE.md` (20 min)
- **Débogage:** `guides/DEBUGGING_GUIDE.md` (10 min)
- **Index:** `guides/README_MESSAGERIE.md` (nav)

---

## ⚡ Pour Continuer

1. **Lancer localement:** Voir QUICK_START_MESSAGING.md
2. **Comprendre l'archi:** Lire MESSAGING_SYSTEM_GUIDE.md
3. **Debugger:** Utiliser DEBUGGING_GUIDE.md

Le système est **100% fonctionnel** et prêt pour:

- ✅ Development (ajout features)
- ✅ Production (déploiement)
- ✅ Maintenance (fixes bugs)

Bonne chance! 🚀
