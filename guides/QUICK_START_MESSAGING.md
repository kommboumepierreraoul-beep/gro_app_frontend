# 🚀 Guide Rapide - Messagerie GRO

## 🎯 5 Minutes pour Lancer la Messagerie

### Étape 1: Backend - Vérifier les Routes

✅ **Les routes existent déjà dans `routes/community/community.php`:**

```php
Route::prefix('messages')->group(function () {
    Route::get('/conversations',                      [MessageController::class, 'conversations']);
    Route::post('/conversations',                     [MessageController::class, 'createOrFind']);
    Route::get('/conversations/{id}/messages',        [MessageController::class, 'messages']);
    Route::post('/conversations/{id}/messages',       [MessageController::class, 'send']);
    Route::delete('/messages/{id}',                   [MessageController::class, 'deleteMessage']);
});
```

**À faire:**

```bash
# Terminal PHP
cd backend
php artisan migrate  # ✅ Crée les tables conversations, messages, conversation_user
php artisan serve    # Démarre le serveur (http://localhost:8000)
```

---

### Étape 2: Frontend - Importer les Composants

**Fichier:** `src/app/(community)/messages/page.tsx`

```tsx
"use client";
import { ConversationList } from "@/components/community/messages/ConversationList";

export default function MessagesPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[60vh]">
      <div className="p-4 border-b border-gray-100">
        <h1 className="font-bold text-gray-900">Messages</h1>
      </div>
      <ConversationList />
    </div>
  );
}
```

**Fichier:** `src/app/(community)/messages/[conversationId]/page.tsx`

```tsx
"use client";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService } from "@/services/community/message.service";
import { ChatWindow } from "@/components/community/messages/ChatWindow";
import { ConversationList } from "@/components/community/messages/ConversationList";
import { useAuthStore } from "@/store/auth.store";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const convId = Number(conversationId);
  const { user } = useAuthStore();

  const { data: convs } = useQuery({
    queryKey: ["conversations"],
    queryFn: messageService.getConversations,
  });

  const conv = convs?.data?.find((c: any) => c.id === convId);
  const participant = conv?.participants?.find((p: any) => p.id !== user?.id);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ height: "calc(100vh - 7rem)" }}
    >
      <div className="flex h-full">
        {/* Liste conversations — masquée sur mobile */}
        <div className="hidden md:block w-72 border-r border-gray-100 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
            Messages
          </div>
          <ConversationList activeId={convId} />
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <ChatWindow convId={convId} participant={participant} />
        </div>
      </div>
    </div>
  );
}
```

**À faire:**

```bash
# Terminal Node
cd frontend
npm run dev  # Démarre Next.js (http://localhost:3000)
```

---

### Étape 3: Tester

1. **Deux navigateurs (user1 vs user2):**
   - Navigateur 1: `http://localhost:3000/messages`
   - Navigateur 2: `http://localhost:3000/messages` (authentifié user2)

2. **Créer une conversation:**
   - User1 clique sur un utilisateur → Crée conversation
   - User2 reçoit auto (polling 10s)

3. **Envoyer un message:**
   - User1 type + Entrée
   - User2 reçoit auto (polling 5s)

---

## 🔴 Problèmes Courants & Fixes

| Problème                 | Cause                       | Fix                                |
| ------------------------ | --------------------------- | ---------------------------------- |
| "Messages ne charge pas" | Routes pas migrées          | `php artisan migrate`              |
| "Aucune conversation"    | Pas créée                   | Ouvrir depuis profil utilisateur   |
| "403 Accès refusé"       | User pas dans conversation  | Vérifier conversation.participants |
| "Badge non-lus = 0"      | last_read_at pas updaté     | Vérifier hook refetch 10s          |
| "CORS error"             | Backend pas permis frontend | `config/cors.php`                  |

---

## 📁 Structure des Fichiers

```
📦 Frontend
├─ src/
│  ├─ app/(community)/messages/
│  │  ├─ page.tsx                    ← Liste conversations
│  │  └─ [conversationId]/page.tsx   ← Chat détail
│  ├─ components/community/messages/
│  │  ├─ ConversationList.tsx        ← Affiche convs
│  │  ├─ ChatWindow.tsx              ← Affiche messages
│  │  ├─ MessageInput.tsx            ← Input texte
│  │  └─ MessageBubble.tsx           ← Message bubble
│  ├─ hooks/community/
│  │  └─ useMessage.ts               ← useConversations, useMessages
│  ├─ services/community/
│  │  └─ message.service.ts          ← REST client
│  └─ store/
│     └─ community.store.ts          ← Zustand state

📦 Backend
├─ app/Http/Controllers/Api/Community/
│  └─ MessageController.php          ← 5 endpoints
├─ app/Models/
│  ├─ Conversation.php
│  ├─ Message.php
│  └─ User.php
├─ database/migrations/
│  ├─ ..._create_conversations_table.php
│  ├─ ..._create_messages_table.php
│  └─ ..._create_conversation_user_table.php
└─ routes/
   └─ community/community.php        ← Déjà configuré
```

---

## 🛠️ Commands Utiles

```bash
# Backend
php artisan migrate --fresh     # Reset toutes les tables
php artisan tinker              # REPL pour tester
  # Dans tinker:
  > Conversation::with('participants', 'messages')->get()
  > Message::latest()->limit(10)->get()

# Frontend
npm run dev                      # Dev mode
npm run build                    # Prod build
npx shadcn-ui@latest add ...   # Ajouter composants

# Git
git status                       # Voir changements
git add .
git commit -m "feat: messaging system complete"
git push
```

---

## 📞 Support Rapide

**Si un composant ne marche pas:**

1. Vérifier la console (F12 → Console)
2. Vérifier Network (F12 → Network) pour erreurs API
3. Vérifier Backend logs: `tail -f storage/logs/laravel.log`
4. Lire le guide complet: `guides/MESSAGING_SYSTEM_GUIDE.md`

---

Bon développement! 🚀
