# 📚 Guides de Messagerie - Table des Matières

Bienvenue! Ce répertoire contient la documentation complète du système de messagerie GRO.

---

## 🎯 Par Où Commencer?

### 👤 Je suis **nouveau** sur le projet

→ **Lire:** [QUICK_START_MESSAGING.md](./QUICK_START_MESSAGING.md)  
⏱️ **Temps:** 5 minutes  
📌 **Contenu:** Installer, lancer, tester

---

### 🔧 Je veux **comprendre** l'architecture

→ **Lire:** [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md)  
⏱️ **Temps:** 20 minutes  
📌 **Contenu:** Architecture, types, services, composants, backend

---

### 🐛 Le système **ne fonctionne pas**

→ **Lire:** [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)  
⏱️ **Temps:** 10 minutes (par problème)  
📌 **Contenu:** Logs, DevTools, cURL, database inspection

---

### ✅ Je veux **vérifier** que tout existe

→ **Lire:** [SYSTEM_VERIFICATION.md](./SYSTEM_VERIFICATION.md)  
⏱️ **Temps:** 3 minutes  
📌 **Contenu:** Checklist, status système, points d'intégration

---

## 📖 Les 4 Guides

| Guide                                                    | Description                      | Audience     | Durée  |
| -------------------------------------------------------- | -------------------------------- | ------------ | ------ |
| [QUICK_START_MESSAGING.md](./QUICK_START_MESSAGING.md)   | Démarrage rapide en 5 min        | Débutants    | 5 min  |
| [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md) | Documentation technique complète | Développeurs | 20 min |
| [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)               | Troubleshooting & inspection     | DevOps/Debug | 10 min |
| [SYSTEM_VERIFICATION.md](./SYSTEM_VERIFICATION.md)       | Checklist & status               | Leads        | 3 min  |

---

## 🗺️ Structure du Système

```
📦 Messagerie GRO
│
├─ Frontend (Next.js)
│  ├─ Pages: /messages, /messages/[id]
│  ├─ Composants: ConversationList, ChatWindow, MessageInput
│  ├─ Services: messageService (REST)
│  ├─ Hooks: useConversations, useMessages
│  └─ Store: useCommunityStore (Zustand)
│
└─ Backend (Laravel)
   ├─ Controller: MessageController
   ├─ Models: Conversation, Message, User
   ├─ Routes: 5 endpoints API
   ├─ Migrations: 3 tables
   └─ Database: conversations, messages, conversation_user
```

---

## 🚀 Quick Commands

```bash
# Backend
cd backend && php artisan migrate && php artisan serve

# Frontend
cd frontend && npm run dev

# Tests
# Ouvrir http://localhost:3000/messages
```

---

## 🆘 Besoins Immédiats?

### ❌ Message: "Routes pas trouvées"

→ Backend: `php artisan migrate` dans [QUICK_START_MESSAGING.md](./QUICK_START_MESSAGING.md)

### ❌ Message: "Aucune conversation"

→ Vérifier database dans [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)

### ❌ Message: "403 Access Denied"

→ Permissions dans [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)

### ✅ Tout fonctionne?

→ Félicitations! Le système est prêt. Voir [SYSTEM_VERIFICATION.md](./SYSTEM_VERIFICATION.md) pour les améliorations futures.

---

## 📞 Support Rapide

1. **Lire** le guide approprié (ci-dessus)
2. **Chercher** ton problème dans la table des matières
3. **Suivre** les étapes de fix
4. Si encore bloqué → Demander au lead

---

## 📝 Fichiers Associés

### Frontend

- `src/app/(community)/messages/page.tsx`
- `src/app/(community)/messages/[conversationId]/page.tsx`
- `src/components/community/messages/`
- `src/services/community/message.service.ts`
- `src/hooks/community/useMessage.ts`
- `src/store/community.store.ts`

### Backend

- `app/Http/Controllers/Api/Community/MessageController.php`
- `app/Models/Conversation.php`
- `app/Models/Message.php`
- `routes/community/community.php`
- `database/migrations/`

---

## 🎓 Learning Path

1. **Jour 1:** Lire [QUICK_START_MESSAGING.md](./QUICK_START_MESSAGING.md) + lancer localement
2. **Jour 2:** Lire [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md) + comprendre l'archi
3. **Jour 3:** Modifier/étendre le système
4. **Si bug:** Lire [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)

---

## ✨ Status

✅ **COMPLET** — Le système est entièrement implémenté et prêt à l'emploi.

Dernière mise à jour: **28/05/2026**

---

Bonne chance! 🚀
