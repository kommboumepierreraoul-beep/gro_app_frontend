# Guide Complet — Intégration de l'IA DeepSeek dans une App Communautaire

> **Stack :** Next.js 14 (App Router) · Laravel 11 · DeepSeek API  
> **Auteur :** Guide technique — Juin 2026

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Prérequis et configuration initiale](#2-prérequis-et-configuration-initiale)
3. [Configuration de l'API DeepSeek](#3-configuration-de-lapi-deepseek)
4. [Backend Laravel — Mise en place](#4-backend-laravel--mise-en-place)
5. [Frontend Next.js — Mise en place](#5-frontend-nextjs--mise-en-place)
6. [Fonctionnalités IA pour App Communautaire](#6-fonctionnalités-ia-pour-app-communautaire)
7. [Gestion des coûts et des limites](#7-gestion-des-coûts-et-des-limites)
8. [Sécurité et bonnes pratiques](#8-sécurité-et-bonnes-pratiques)
9. [Tests et débogage](#9-tests-et-débogage)
10. [Déploiement en production](#10-déploiement-en-production)

---

## 1. Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 14)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Chat IA     │  │  Modération  │  │  Résumé de posts       │ │
│  │  Component   │  │  Auto        │  │  & Suggestions tags    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘ │
│         └─────────────────┴──────────────────────┘               │
│                            │ API REST / SSE                       │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                    BACKEND (Laravel 11)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Gateway Layer                     │   │
│  │  AuthMiddleware · RateLimiter · CacheMiddleware          │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│  ┌───────────────┐  ┌───────┴────────┐  ┌────────────────────┐  │
│  │ DeepSeekService│  │ ConversationSvc│  │ ModerationService  │  │
│  └───────┬───────┘  └───────┬────────┘  └────────┬───────────┘  │
│          └──────────────────┴───────────────────-┘              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │       Database (MySQL) · Cache (Redis) · Queue            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬──────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┼──────────────────────────────────┐
│                     DeepSeek API                               │
│   /v1/chat/completions  ·  Streaming SSE  ·  Models            │
│   deepseek-chat  ·  deepseek-reasoner                          │
└────────────────────────────────────────────────────────────────┘
```

### Modèles DeepSeek disponibles

| Modèle | Usage recommandé | Prix approx. |
|--------|-----------------|--------------|
| `deepseek-chat` | Chat, résumés, tags, suggestions | Très bas |
| `deepseek-reasoner` | Modération complexe, analyse | Modéré |

---

## 2. Prérequis et configuration initiale

### Versions requises

```bash
# Backend
PHP >= 8.2
Laravel >= 11.x
Composer >= 2.x
Redis (cache + queues)
MySQL >= 8.0

# Frontend
Node.js >= 20.x
Next.js >= 14.x
pnpm >= 9.x (recommandé)
```

### Structure des dossiers du projet

```
community-app/
├── backend/                   # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AI/
│   │   │   │   │   ├── ChatController.php
│   │   │   │   │   ├── ModerationController.php
│   │   │   │   │   └── SuggestionController.php
│   │   ├── Services/
│   │   │   ├── AI/
│   │   │   │   ├── DeepSeekService.php
│   │   │   │   ├── ConversationService.php
│   │   │   │   └── ModerationService.php
│   │   ├── Models/
│   │   │   ├── AiConversation.php
│   │   │   └── AiMessage.php
│   │   └── Jobs/
│   │       └── ProcessModerationJob.php
│   └── database/migrations/
│
└── frontend/                  # Next.js 14
    ├── app/
    │   ├── (community)/
    │   │   ├── feed/
    │   │   └── chat-ai/
    │   └── api/               # Route Handlers Next.js
    │       └── ai/
    ├── components/
    │   └── ai/
    │       ├── ChatInterface.tsx
    │       ├── MessageBubble.tsx
    │       └── SuggestionPanel.tsx
    └── lib/
        └── ai-client.ts
```

---

## 3. Configuration de l'API DeepSeek

### Obtenir la clé API

1. Aller sur [platform.deepseek.com](https://platform.deepseek.com)
2. Créer un compte et accéder à **API Keys**
3. Générer une nouvelle clé
4. Recharger des crédits (le service est pay-as-you-go)

### Variables d'environnement

**`backend/.env`**
```env
# DeepSeek API
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_DEFAULT_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=2048
DEEPSEEK_TEMPERATURE=0.7

# Cache
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Rate limiting IA
AI_RATE_LIMIT_PER_MINUTE=20
AI_RATE_LIMIT_PER_DAY=500
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
# Ne jamais exposer la clé DeepSeek côté client !
```

---

## 4. Backend Laravel — Mise en place

### 4.1 Installation des dépendances

```bash
cd backend

# Client HTTP pour DeepSeek
composer require guzzlehttp/guzzle

# Pour le streaming SSE
composer require symfony/http-foundation

# Rate limiting avancé
composer require spatie/laravel-rate-limited-job-middleware
```

### 4.2 Service principal DeepSeek

**`app/Services/AI/DeepSeekService.php`**

```php
<?php

namespace App\Services\AI;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DeepSeekService
{
    private Client $client;
    private string $apiKey;
    private string $baseUrl;
    private string $defaultModel;

    public function __construct()
    {
        $this->apiKey = config('services.deepseek.api_key');
        $this->baseUrl = config('services.deepseek.base_url', 'https://api.deepseek.com/v1');
        $this->defaultModel = config('services.deepseek.default_model', 'deepseek-chat');

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 60,
            'headers'  => [
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ],
        ]);
    }

    /**
     * Envoi d'un message simple (non-streaming)
     */
    public function chat(array $messages, array $options = []): array
    {
        $payload = array_merge([
            'model'       => $this->defaultModel,
            'messages'    => $messages,
            'max_tokens'  => config('services.deepseek.max_tokens', 2048),
            'temperature' => config('services.deepseek.temperature', 0.7),
        ], $options);

        try {
            $response = $this->client->post('/chat/completions', [
                'json' => $payload,
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'content' => $data['choices'][0]['message']['content'] ?? '',
                'usage'   => $data['usage'] ?? [],
                'model'   => $data['model'] ?? $this->defaultModel,
            ];
        } catch (RequestException $e) {
            Log::error('DeepSeek API Error', [
                'message' => $e->getMessage(),
                'code'    => $e->getCode(),
            ]);

            return [
                'success' => false,
                'error'   => 'Erreur de communication avec le service IA.',
                'code'    => $e->getCode(),
            ];
        }
    }

    /**
     * Streaming SSE — génère les tokens en temps réel
     */
    public function chatStream(array $messages, callable $onChunk, array $options = []): void
    {
        $payload = array_merge([
            'model'    => $this->defaultModel,
            'messages' => $messages,
            'stream'   => true,
        ], $options);

        try {
            $response = $this->client->post('/chat/completions', [
                'json'   => $payload,
                'stream' => true,
            ]);

            $body = $response->getBody();

            while (!$body->eof()) {
                $line = $this->readLine($body);

                if (str_starts_with($line, 'data: ')) {
                    $data = substr($line, 6);

                    if ($data === '[DONE]') {
                        break;
                    }

                    $chunk = json_decode($data, true);
                    $content = $chunk['choices'][0]['delta']['content'] ?? '';

                    if ($content) {
                        $onChunk($content);
                    }
                }
            }
        } catch (RequestException $e) {
            Log::error('DeepSeek Stream Error', ['message' => $e->getMessage()]);
            $onChunk('[ERREUR: Service IA indisponible]');
        }
    }

    /**
     * Modération de contenu
     */
    public function moderateContent(string $content): array
    {
        $cacheKey = 'moderation_' . md5($content);

        return Cache::remember($cacheKey, 3600, function () use ($content) {
            $result = $this->chat([
                [
                    'role'    => 'system',
                    'content' => "Tu es un système de modération pour une communauté en ligne. "
                        . "Analyse le texte suivant et réponds UNIQUEMENT en JSON valide avec ces champs: "
                        . "{\"is_safe\": bool, \"score\": float (0-1), \"categories\": [], \"reason\": string}. "
                        . "Catégories possibles: hate_speech, harassment, spam, misinformation, adult_content.",
                ],
                [
                    'role'    => 'user',
                    'content' => "Contenu à analyser:\n\n{$content}",
                ],
            ], [
                'model'       => 'deepseek-chat',
                'temperature' => 0.1,
                'max_tokens'  => 256,
            ]);

            if (!$result['success']) {
                return ['is_safe' => true, 'score' => 0, 'categories' => [], 'reason' => 'Erreur modération'];
            }

            // Nettoyage du JSON (DeepSeek peut ajouter des balises markdown)
            $json = preg_replace('/```json\n?|\n?```/', '', $result['content']);
            return json_decode(trim($json), true) ?? ['is_safe' => true, 'score' => 0];
        });
    }

    /**
     * Génération de tags pour un post
     */
    public function generateTags(string $postContent, int $maxTags = 5): array
    {
        $result = $this->chat([
            [
                'role'    => 'system',
                'content' => "Tu génères des tags pertinents pour des posts de communauté. "
                    . "Réponds UNIQUEMENT avec un tableau JSON de strings. Exemple: [\"tag1\", \"tag2\"]",
            ],
            [
                'role'    => 'user',
                'content' => "Génère {$maxTags} tags pour ce post:\n\n{$postContent}",
            ],
        ], ['temperature' => 0.3]);

        if (!$result['success']) {
            return [];
        }

        $tags = json_decode($result['content'], true);
        return is_array($tags) ? array_slice($tags, 0, $maxTags) : [];
    }

    /**
     * Résumé d'une discussion
     */
    public function summarizeThread(array $messages): string
    {
        $thread = collect($messages)->map(fn($m) => "{$m['author']}: {$m['content']}")->join("\n");

        $result = $this->chat([
            [
                'role'    => 'system',
                'content' => "Tu résumes des discussions de communauté en 2-3 phrases claires et neutres.",
            ],
            [
                'role'    => 'user',
                'content' => "Résume cette discussion:\n\n{$thread}",
            ],
        ], ['max_tokens' => 512]);

        return $result['success'] ? $result['content'] : 'Résumé indisponible.';
    }

    private function readLine($stream): string
    {
        $line = '';
        while (!$stream->eof()) {
            $char = $stream->read(1);
            if ($char === "\n") break;
            $line .= $char;
        }
        return rtrim($line, "\r");
    }
}
```

### 4.3 Configuration du service

**`config/services.php`** — ajouter :
```php
'deepseek' => [
    'api_key'       => env('DEEPSEEK_API_KEY'),
    'base_url'      => env('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
    'default_model' => env('DEEPSEEK_DEFAULT_MODEL', 'deepseek-chat'),
    'max_tokens'    => env('DEEPSEEK_MAX_TOKENS', 2048),
    'temperature'   => env('DEEPSEEK_TEMPERATURE', 0.7),
],
```

### 4.4 Service de conversation (historique)

**`app/Services/AI/ConversationService.php`**

```php
<?php

namespace App\Services\AI;

use App\Models\AiConversation;
use App\Models\AiMessage;
use Illuminate\Support\Str;

class ConversationService
{
    private string $systemPrompt = "Tu es l'assistant IA de notre communauté. "
        . "Tu aides les membres à trouver des informations, à rédiger des posts, "
        . "et à naviguer dans la communauté. Sois amical, concis et utile. "
        . "Ne partage pas d'informations sensibles d'autres membres.";

    public function __construct(private DeepSeekService $deepSeek)
    {
    }

    public function getOrCreateConversation(int $userId, ?string $sessionId = null): AiConversation
    {
        if ($sessionId) {
            $conversation = AiConversation::where('user_id', $userId)
                ->where('session_id', $sessionId)
                ->first();

            if ($conversation) return $conversation;
        }

        return AiConversation::create([
            'user_id'    => $userId,
            'session_id' => $sessionId ?? Str::uuid(),
        ]);
    }

    public function sendMessage(int $userId, string $userMessage, string $sessionId): array
    {
        $conversation = $this->getOrCreateConversation($userId, $sessionId);

        // Sauvegarde du message utilisateur
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'user',
            'content'         => $userMessage,
        ]);

        // Construction du contexte (20 derniers messages)
        $history = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->reverse()
            ->map(fn($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();

        $messages = array_merge(
            [['role' => 'system', 'content' => $this->systemPrompt]],
            $history
        );

        $result = $this->deepSeek->chat($messages);

        if ($result['success']) {
            AiMessage::create([
                'conversation_id' => $conversation->id,
                'role'            => 'assistant',
                'content'         => $result['content'],
                'tokens_used'     => $result['usage']['total_tokens'] ?? 0,
            ]);
        }

        return $result;
    }
}
```

### 4.5 Migrations

```bash
php artisan make:migration create_ai_conversations_table
php artisan make:migration create_ai_messages_table
```

**Migration conversations :**
```php
Schema::create('ai_conversations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('session_id')->unique();
    $table->string('title')->nullable();
    $table->timestamps();
    $table->index(['user_id', 'created_at']);
});
```

**Migration messages :**
```php
Schema::create('ai_messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
    $table->enum('role', ['user', 'assistant', 'system']);
    $table->text('content');
    $table->unsignedInteger('tokens_used')->default(0);
    $table->timestamps();
    $table->index(['conversation_id', 'created_at']);
});
```

### 4.6 Controllers API

**`app/Http/Controllers/Api/AI/ChatController.php`**

```php
<?php

namespace App\Http\Controllers\Api\AI;

use App\Http\Controllers\Controller;
use App\Services\AI\ConversationService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    public function __construct(private ConversationService $conversationService)
    {
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:4000',
            'session_id' => 'required|string|uuid',
        ]);

        $result = $this->conversationService->sendMessage(
            auth()->id(),
            $request->message,
            $request->session_id
        );

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 503);
        }

        return response()->json([
            'content'    => $result['content'],
            'session_id' => $request->session_id,
        ]);
    }

    /**
     * Endpoint SSE pour le streaming
     */
    public function stream(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:4000',
            'session_id' => 'required|string|uuid',
        ]);

        $messages = [
            ['role' => 'system', 'content' => 'Tu es l\'assistant de la communauté.'],
            ['role' => 'user', 'content' => $request->message],
        ];

        return new StreamedResponse(function () use ($messages) {
            $this->conversationService->deepSeek->chatStream(
                $messages,
                function (string $chunk) {
                    echo "data: " . json_encode(['content' => $chunk]) . "\n\n";
                    ob_flush();
                    flush();
                }
            );
            echo "data: [DONE]\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
```

**`app/Http/Controllers/Api/AI/SuggestionController.php`**

```php
<?php

namespace App\Http\Controllers\Api\AI;

use App\Http\Controllers\Controller;
use App\Services\AI\DeepSeekService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SuggestionController extends Controller
{
    public function __construct(private DeepSeekService $deepSeek)
    {
    }

    public function generateTags(Request $request)
    {
        $request->validate(['content' => 'required|string|min:20|max:5000']);

        $cacheKey = 'tags_' . md5($request->content);
        $tags = Cache::remember($cacheKey, 1800, fn() =>
            $this->deepSeek->generateTags($request->content)
        );

        return response()->json(['tags' => $tags]);
    }

    public function summarizeThread(Request $request)
    {
        $request->validate([
            'messages' => 'required|array|min:2',
            'messages.*.author'  => 'required|string',
            'messages.*.content' => 'required|string',
        ]);

        $summary = $this->deepSeek->summarizeThread($request->messages);

        return response()->json(['summary' => $summary]);
    }

    public function improvePost(Request $request)
    {
        $request->validate(['content' => 'required|string|min:10|max:5000']);

        $result = $this->deepSeek->chat([
            ['role' => 'system', 'content' => 'Tu améliores la clarté et la lisibilité de posts communautaires. Conserve le sens original.'],
            ['role' => 'user', 'content' => "Améliore ce post:\n\n{$request->content}"],
        ], ['max_tokens' => 1024]);

        return response()->json([
            'improved' => $result['success'] ? $result['content'] : $request->content,
        ]);
    }
}
```

### 4.7 Routes API

**`routes/api.php`**

```php
use App\Http\Controllers\Api\AI\ChatController;
use App\Http\Controllers\Api\AI\ModerationController;
use App\Http\Controllers\Api\AI\SuggestionController;

Route::middleware(['auth:sanctum', 'throttle:ai'])->prefix('ai')->group(function () {
    // Chat IA
    Route::post('/chat', [ChatController::class, 'sendMessage']);
    Route::get('/chat/stream', [ChatController::class, 'stream']);

    // Suggestions et outils
    Route::post('/tags', [SuggestionController::class, 'generateTags']);
    Route::post('/summarize', [SuggestionController::class, 'summarizeThread']);
    Route::post('/improve-post', [SuggestionController::class, 'improvePost']);

    // Modération (admin uniquement)
    Route::middleware('can:moderate')->group(function () {
        Route::post('/moderate', [ModerationController::class, 'check']);
    });
});
```

**Rate limiter dans `AppServiceProvider` :**
```php
RateLimiter::for('ai', function (Request $request) {
    return [
        Limit::perMinute(20)->by($request->user()->id),
        Limit::perDay(500)->by($request->user()->id),
    ];
});
```

---

## 5. Frontend Next.js — Mise en place

### 5.1 Installation des dépendances

```bash
cd frontend
pnpm add @tanstack/react-query axios uuid
pnpm add -D @types/uuid
```

### 5.2 Client API

**`lib/ai-client.ts`**

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const aiClient = {
  /**
   * Envoyer un message (réponse complète)
   */
  sendMessage: async (message: string, sessionId: string) => {
    const { data } = await apiClient.post('/ai/chat', { message, session_id: sessionId });
    return data as { content: string; session_id: string };
  },

  /**
   * Streaming SSE
   */
  streamMessage: (
    message: string,
    sessionId: string,
    onChunk: (chunk: string) => void,
    onDone: () => void
  ): EventSource => {
    const params = new URLSearchParams({ message, session_id: sessionId });
    const token = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '';

    const url = `${process.env.NEXT_PUBLIC_API_URL}/ai/chat/stream?${params}`;
    const es = new EventSource(url, { withCredentials: true });

    es.onmessage = (event) => {
      if (event.data === '[DONE]') {
        es.close();
        onDone();
        return;
      }
      const parsed = JSON.parse(event.data);
      onChunk(parsed.content ?? '');
    };

    es.onerror = () => { es.close(); onDone(); };

    return es;
  },

  /**
   * Générer des tags pour un post
   */
  generateTags: async (content: string): Promise<string[]> => {
    const { data } = await apiClient.post('/ai/tags', { content });
    return data.tags ?? [];
  },

  /**
   * Résumer une discussion
   */
  summarizeThread: async (messages: { author: string; content: string }[]): Promise<string> => {
    const { data } = await apiClient.post('/ai/summarize', { messages });
    return data.summary ?? '';
  },

  /**
   * Améliorer un post
   */
  improvePost: async (content: string): Promise<string> => {
    const { data } = await apiClient.post('/ai/improve-post', { content });
    return data.improved ?? content;
  },
};
```

### 5.3 Hook personnalisé useAIChat

**`hooks/useAIChat.ts`**

```typescript
import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { aiClient, ChatMessage } from '@/lib/ai-client';

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const esRef = useRef<EventSource | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Ajouter un message assistant vide pour le streaming
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    esRef.current = aiClient.streamMessage(
      content,
      sessionId,
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      },
      () => setIsLoading(false)
    );
  }, [sessionId, isLoading]);

  const clearConversation = useCallback(() => {
    esRef.current?.close();
    setMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, clearConversation, sessionId };
}
```

### 5.4 Composant Chat IA

**`components/ai/ChatInterface.tsx`**

```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import { MessageBubble } from './MessageBubble';
import { Bot, Send, Trash2, Loader2 } from 'lucide-react';

export function ChatInterface() {
  const { messages, isLoading, sendMessage, clearConversation } = useAIChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Assistant Communauté</h2>
            <p className="text-xs text-blue-100">Propulsé par DeepSeek IA</p>
          </div>
        </div>
        <button
          onClick={clearConversation}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
          title="Nouvelle conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Comment puis-je vous aider ?</p>
            <p className="text-sm mt-1">Posez-moi une question sur la communauté</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 5.5 Composant TagSuggester

**`components/ai/TagSuggester.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { aiClient } from '@/lib/ai-client';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface TagSuggesterProps {
  content: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSuggester({ content, selectedTags, onTagsChange }: TagSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = async () => {
    if (content.length < 20) return;
    setIsLoading(true);
    try {
      const tags = await aiClient.generateTags(content);
      setSuggestions(tags.filter((t) => !selectedTags.includes(t)));
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    onTagsChange([...selectedTags, tag]);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={getSuggestions}
        disabled={isLoading || content.length < 20}
        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-40"
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        Suggérer des tags avec l'IA
      </button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="px-3 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full hover:bg-purple-100 transition"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 6. Fonctionnalités IA pour App Communautaire

### Récapitulatif des fonctionnalités

| Fonctionnalité | Endpoint | Modèle | Cache |
|----------------|----------|--------|-------|
| Chat assistant | `POST /ai/chat` | deepseek-chat | Non |
| Streaming chat | `GET /ai/chat/stream` | deepseek-chat | Non |
| Suggestion de tags | `POST /ai/tags` | deepseek-chat | 30 min |
| Résumé de fil | `POST /ai/summarize` | deepseek-chat | 1h |
| Amélioration de post | `POST /ai/improve-post` | deepseek-chat | Non |
| Modération | `POST /ai/moderate` | deepseek-chat | 1h |

### 6.1 Modération automatique

Intégrer dans l'Observer de Post :

```php
// app/Observers/PostObserver.php
class PostObserver
{
    public function creating(Post $post): void
    {
        // Modération asynchrone pour ne pas bloquer
        ProcessModerationJob::dispatch($post)->afterCommit();
    }
}

// app/Jobs/ProcessModerationJob.php
class ProcessModerationJob implements ShouldQueue
{
    public function handle(DeepSeekService $deepSeek): void
    {
        $result = $deepSeek->moderateContent($this->post->content);

        if (!$result['is_safe'] && $result['score'] > 0.8) {
            $this->post->update(['status' => 'pending_review', 'moderation_flags' => $result['categories']]);
            // Notifier les modérateurs
            Notification::send(User::moderators()->get(), new ContentFlaggedNotification($this->post));
        }
    }
}
```

---

## 7. Gestion des coûts et des limites

### Stratégies d'optimisation

```php
// 1. Cache agressif pour les requêtes répétées
Cache::remember("ai_tags_{$hash}", 3600, fn() => $deepSeek->generateTags($content));

// 2. Truncate le contenu long avant envoi
$truncated = Str::limit($content, 2000);

// 3. Limiter l'historique de conversation
$history = $conversation->messages()->latest()->limit(10)->get()->reverse();

// 4. Rate limiting par utilisateur
RateLimiter::for('ai', fn($req) => [
    Limit::perMinute(10)->by($req->user()->id),
    Limit::perDay(200)->by($req->user()->id),
]);
```

### Suivi de consommation

```php
// Tracker les tokens utilisés par user
AiMessage::create([
    'tokens_used' => $result['usage']['total_tokens'] ?? 0,
    // ...
]);

// Dashboard admin : consommation mensuelle
$monthlyUsage = AiMessage::whereMonth('created_at', now()->month)
    ->sum('tokens_used');
```

---

## 8. Sécurité et bonnes pratiques

### Règles absolues

```
✅ La clé API DeepSeek n'est JAMAIS exposée côté client
✅ Toutes les requêtes IA passent par le backend Laravel
✅ Authentification Sanctum obligatoire sur tous les endpoints /ai/*
✅ Validation stricte des inputs (longueur, contenu)
✅ Rate limiting par utilisateur et par IP
✅ Logs de toutes les erreurs API
✅ Timeout configuré (60s max)
```

### Validation avancée des inputs

```php
// Dans les FormRequests
class ChatRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'message'    => ['required', 'string', 'min:1', 'max:4000',
                             new NoSensitiveDataRule(), // Règle custom
                             new NoPromptInjectionRule()],
            'session_id' => ['required', 'uuid'],
        ];
    }
}
```

### Protection contre les prompt injections

```php
// app/Rules/NoPromptInjectionRule.php
class NoPromptInjectionRule implements ValidationRule
{
    private array $patterns = [
        '/ignore (all |previous |above )?instructions/i',
        '/you are now/i',
        '/act as/i',
        '/jailbreak/i',
        '/DAN mode/i',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        foreach ($this->patterns as $pattern) {
            if (preg_match($pattern, $value)) {
                $fail('Message invalide détecté.');
                return;
            }
        }
    }
}
```

---

## 9. Tests et débogage

### Tests unitaires Laravel

```php
// tests/Unit/DeepSeekServiceTest.php
class DeepSeekServiceTest extends TestCase
{
    public function test_chat_returns_success_response()
    {
        Http::fake([
            'api.deepseek.com/*' => Http::response([
                'choices' => [['message' => ['content' => 'Bonjour!']]],
                'usage'   => ['total_tokens' => 10],
            ], 200),
        ]);

        $service = new DeepSeekService();
        $result = $service->chat([['role' => 'user', 'content' => 'Bonjour']]);

        $this->assertTrue($result['success']);
        $this->assertEquals('Bonjour!', $result['content']);
    }

    public function test_moderation_flags_hate_speech()
    {
        // Mock de la réponse DeepSeek
        Http::fake(['api.deepseek.com/*' => Http::response([
            'choices' => [['message' => ['content' =>
                '{"is_safe": false, "score": 0.95, "categories": ["hate_speech"], "reason": "Contenu haineux"}'
            ]]],
            'usage' => ['total_tokens' => 50],
        ])]);

        $service = new DeepSeekService();
        $result = $service->moderateContent('Texte problématique');

        $this->assertFalse($result['is_safe']);
        $this->assertContains('hate_speech', $result['categories']);
    }
}
```

### Test manuel de l'API avec cURL

```bash
# Test du chat
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour, comment ça marche?", "session_id": "550e8400-e29b-41d4-a716-446655440000"}'

# Test des tags
curl -X POST http://localhost:8000/api/ai/tags \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"content": "Je cherche des conseils pour débuter en photographie..."}'
```

### Debug du streaming SSE

```javascript
// Console du navigateur
const es = new EventSource('/api/ai/chat/stream?message=test&session_id=xxx', {
  withCredentials: true
});
es.onmessage = (e) => console.log('Chunk:', e.data);
es.onerror = (e) => console.error('Erreur SSE:', e);
```

---

## 10. Déploiement en production

### Checklist production

```bash
# Backend Laravel
php artisan config:cache
php artisan route:cache
php artisan queue:work --queue=ai-moderation &  # Worker pour les jobs de modération

# Variables d'environnement de production
APP_ENV=production
APP_DEBUG=false
DEEPSEEK_API_KEY=sk-prod-xxxx
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

# Next.js
pnpm build
pnpm start
```

### Configuration Nginx pour le SSE

```nginx
location /api/ai/chat/stream {
    proxy_pass         http://laravel-backend;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_buffering    off;          # CRITIQUE pour SSE
    proxy_cache        off;
    proxy_read_timeout 300s;
    chunked_transfer_encoding on;
    add_header         X-Accel-Buffering no;
}
```

### Monitoring

```php
// Alertes si taux d'erreur > 5%
// Dans AppServiceProvider ou un middleware
if ($result['code'] === 429) {
    // Quota DeepSeek dépassé — alerter l'équipe
    Log::critical('DeepSeek rate limit atteint');
    Cache::put('ai_service_degraded', true, 300);
}
```

---

## Résumé des commandes essentielles

```bash
# Backend — installation complète
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan queue:work &

# Frontend — installation complète  
cd frontend
pnpm install
cp .env.local.example .env.local
pnpm dev

# Tests
cd backend && php artisan test --filter=DeepSeek
```

---

*Guide rédigé pour la stack Next.js 14 + Laravel 11 + DeepSeek API — Juin 2026*