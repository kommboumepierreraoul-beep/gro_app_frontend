# 🐛 Debugging Configuration - Messagerie

## Console Logs Activés

Ajoute ce code dans `src/services/community/message.service.ts` pour les logs détaillés:

```typescript
// Après les imports
const DEBUG = true; // Set to false en prod

function log(context: string, data: any) {
  if (DEBUG) {
    console.log(`[MessageService] ${context}:`, data);
  }
}

function error(context: string, err: any) {
  console.error(`[MessageService] ERROR ${context}:`, err);
}
```

Puis utilise dans chaque méthode:

```typescript
async getConversations(): Promise<Conversation[]> {
  try {
    log("getConversations", "Calling API...");
    const res = await api.get("/community/messages/conversations");
    log("getConversations response", res.data);
    const raw = res.data?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  } catch (err) {
    error("getConversations", err);
    throw new Error(extractApiError(err));
  }
}
```

---

## Checklist de Débogage Visuelle

Ajoute un composant de debug dans le chat pour voir l'état en temps réel:

**Fichier:** `src/components/community/messages/DebugPanel.tsx`

```tsx
"use client";
export function DebugPanel({ convId, messages, user }: any) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 text-white p-3 rounded-lg text-xs font-mono overflow-y-auto max-h-96">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">DEBUG</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-red-400 hover:text-red-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-gray-300">
        <div>
          <span className="text-blue-400">convId:</span> {convId}
        </div>
        <div>
          <span className="text-blue-400">user.id:</span> {user?.id}
        </div>
        <div>
          <span className="text-blue-400">messages.length:</span>{" "}
          {messages.length}
        </div>
        <div>
          <span className="text-blue-400">Last message:</span>
          {messages[messages.length - 1]?.id ? (
            <>
              <div className="text-gray-400 ml-2">
                ID: {messages[messages.length - 1]?.id}
              </div>
              <div className="text-gray-400 ml-2">
                Content:{" "}
                {messages[messages.length - 1]?.content?.substring(0, 30)}...
              </div>
            </>
          ) : (
            <span className="text-gray-500"> (aucun)</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

Puis dans `ChatWindow.tsx`:

```tsx
import { DebugPanel } from "./DebugPanel";

// Dans le return:
<>
  {/* ... existing code ... */}
  {process.env.NODE_ENV === "development" && (
    <DebugPanel convId={convId} messages={messages} user={user} />
  )}
</>;
```

---

## Network Inspection API

Ouvre **DevTools → Network → XHR/Fetch** et cherche:

### ✅ Appel réussi GET /community/messages/conversations

```json
Response:
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": null,
        "is_group": false,
        "participants": [
          { "id": 1, "firstname": "John", "lastname": "Doe", "avatar": null }
        ],
        "last_message": {
          "content": "Hello!",
          "sender": "John",
          "created_at": "2026-05-28T10:30:00Z"
        },
        "unread_count": 0,
        "updated_at": "2026-05-28T10:30:00Z"
      }
    ],
    "current_page": 1,
    "last_page": 1
  }
}
```

### ✅ Appel réussi GET /community/messages/conversations/{id}/messages

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "content": "Hello!",
        "media_url": null,
        "status": "sent",
        "is_mine": true,
        "sender_id": 1,
        "sender": { "id": 1, "firstname": "John", "avatar": null },
        "conversation_id": 1,
        "created_at": "2026-05-28T10:30:00Z"
      }
    ],
    "current_page": 1,
    "last_page": 1,
    "per_page": 30,
    "total": 1
  }
}
```

### ❌ Erreur 403 Accès refusé

```json
{
  "success": false,
  "message": "Accès refusé."
}
```

**Fix:** Vérifier que l'utilisateur authentifié est participant de la conversation.

---

## Backend Database Inspection

**Terminal PHP:**

```bash
cd backend
php artisan tinker
```

**Dans Tinker:**

```php
# Voir toutes les conversations
Conversation::with('participants', 'messages')->get();

# Voir les participants d'une conversation
Conversation::find(1)->participants->pluck('firstname', 'id');

# Voir les messages d'une conversation
Conversation::find(1)->messages()->orderBy('created_at', 'desc')->limit(5)->get();

# Vérifier last_read_at pour un user
$conv = Conversation::find(1);
$pivot = $conv->participants()->where('user_id', 1)->first()?->pivot;
$pivot?->last_read_at;

# Compter les non-lus
$conv->unreadCountFor(1);

# Créer une conversation test
$u1 = User::find(1);
$u2 = User::find(2);
$conv = Conversation::create(['is_group' => false]);
$conv->participants()->attach([$u1->id, $u2->id]);
$conv->messages()->create([
    'sender_id' => $u1->id,
    'content' => 'Test message',
    'status' => 'sent'
]);
```

---

## React Query DevTools

Installe React Query DevTools pour inspecter le cache:

```bash
npm install @tanstack/react-query-devtools
```

Ajoute à `src/app/layout.tsx`:

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </body>
    </html>
  );
}
```

Puis ouvre: **DevTools → React Query** pour voir cache en temps réel.

---

## Performance Monitoring

Ajoute des mesures de temps:

```typescript
// Dans message.service.ts
async getConversations(): Promise<Conversation[]> {
  const start = performance.now();
  try {
    const res = await api.get("/community/messages/conversations");
    const end = performance.now();
    console.log(`[Perf] getConversations: ${(end - start).toFixed(2)}ms`);
    // ...
  } catch (err) {
    // ...
  }
}
```

Idéal: **< 200ms** pour une requête API.

---

## Test avec cURL

**Terminal:**

```bash
# Récupérer token (après login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR..."

# Lister conversations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/community/messages/conversations

# Créer/trouver conversation avec user 2
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2}' \
  http://localhost:8000/api/community/messages/conversations

# Envoyer message
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "content=Hello" \
  http://localhost:8000/api/community/messages/conversations/1/messages

# Afficher logs backend
tail -f storage/logs/laravel.log | grep -i "message\|error"
```

---

## Common Errors Reference

| Error            | Meaning                    | Fix                      |
| ---------------- | -------------------------- | ------------------------ |
| 401 Unauthorized | Token expiré/invalide      | Re-login                 |
| 403 Forbidden    | User pas dans conversation | Vérifier participants    |
| 404 Not Found    | Endpoint invalide          | Vérifier URL route       |
| 422 Validation   | Données invalides          | Vérifier FormData        |
| 500 Server Error | Bug backend                | Voir logs laravel.log    |
| CORS error       | Domain non autorisé        | Vérifier config/cors.php |
| Timeout          | API trop slow              | Checker queries N+1      |

---

Utilisez ce guide pour déboguer rapidement! 🚀
