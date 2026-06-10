# Diagnostic: L'avatar ne s'affiche pas

## ✅ Checklist de Diagnostic

### 1. Vérifier la Variable d'Environnement

```bash
# ❓ Vérifier votre fichier .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
# OU
NEXT_PUBLIC_API_URL=http://192.168.x.x:8000
# OU
NEXT_PUBLIC_API_URL=https://api.votredomaine.com
```

**Comment vérifier:**

- Ouvrir `frontend/.env.local`
- Chercher `NEXT_PUBLIC_API_URL`
- Si absent: **C'est le problème!** → Ajouter la ligne correcte
- Si présent: Vérifier que l'URL est accessible

### 2. Vérifier les Données de l'Utilisateur

**Dans la Console du Navigateur (F12):**

```javascript
// Vérifier les données du store
const user = useAuthStore.getState().user;
console.log("User data:", user);
console.log("Avatar path:", user?.avatar);
```

Chercher:

- ✅ `user.avatar` existe?
- ✅ `user.avatar` n'est pas null/undefined?
- ✅ Format: `/storage/avatars/...` ou `storage/avatars/...`?

### 3. Vérifier la Console

**Ouvrir la Console (F12 → Console):**

Chercher les logs:

```
Avatar URL Debug: {
  input: "/storage/avatars/user-1.jpg",
  apiUrl: "http://localhost:8000",
  cleanPath: "/storage/avatars/user-1.jpg",
  fullUrl: "http://localhost:8000/storage/avatars/user-1.jpg"
}
```

- ✅ Les logs s'affichent?
- ✅ L'URL construite semble correcte?
- ❌ Erreurs réseau (404, CORS)?

### 4. Vérifier la Route de l'Image

**Dans le navigateur, coller directement l'URL:**

```
http://localhost:8000/storage/avatars/user-1.jpg
```

Résultats possibles:

- ✅ **200 OK**: Image s'affiche → Problème est ailleurs
- ❌ **404 Not Found**: Image n'existe pas → Vérifier le chemin backend
- ❌ **CORS Error**: Problème de configuration CORS → Vérifier backend `cors.php`
- ❌ **Connection Refused**: Serveur n'est pas lancé

### 5. Vérifier le Stockage Backend

**Depuis le terminal backend:**

```bash
# Vérifier que le dossier existe
ls -la storage/app/public/avatars/

# Ou sur Windows
dir backend\storage\app\public\avatars\
```

Chercher:

- ✅ Dossier existe?
- ✅ Images dans le dossier?
- ✅ Permissions correctes?

### 6. Vérifier la Base de Données

```sql
-- Vérifier que avatar_path est rempli
SELECT id, firstname, avatar_path FROM users LIMIT 1;

-- Devrait afficher quelque chose comme:
-- id: 1
-- firstname: "Jean"
-- avatar_path: "/storage/avatars/user-1.jpg"
```

## 🔧 Solutions Courantes

### Solution 1: NEXT_PUBLIC_API_URL Manquante

```bash
# Créer/mettre à jour .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local

# Puis redémarrer le serveur Next.js
npm run dev
```

### Solution 2: Serveur Backend Non Lancé

```bash
cd backend
php artisan serve
# Devrait écouter sur http://localhost:8000
```

### Solution 3: Images Manquantes sur Serveur

```bash
# Copier les images de test
cp -r ~/images/* backend/storage/app/public/avatars/

# Ou créer une image de test
touch backend/storage/app/public/avatars/test.jpg
```

### Solution 4: CORS Non Configuré

```php
// backend/config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

### Solution 5: Permission Fichiers

```bash
# S'assurer que Laravel peut lire/écrire
chmod -R 755 backend/storage
chmod -R 755 backend/public/storage

# Créer le symlink de stockage s'il n'existe pas
cd backend
php artisan storage:link
```

## 📝 Utiliser le Composant Debug

```tsx
import { AvatarDebug } from "@/components/community/shared/AvatarDebug";

export function TestPage() {
  const { user } = useAuthStore();

  return <AvatarDebug src={user?.avatar} firstname={user?.firstname} />;
}
```

Ce composant affichera:

- ✅ La valeur reçue
- ✅ L'URL construite
- ✅ Les logs de debug

## 🐛 Logs Détaillés à Regarder

**Dans F12 → Console, chercher:**

```
✅ "Avatar URL Debug:" → La logique fonctionne
❌ Network Error → Problème réseau/CORS
❌ 404 Not Found → Image n'existe pas
❌ "Cannot read property 'startsWith'" → Bug dans le code
```

## 📞 Ordre de Vérification Recommandé

1. **NEXT_PUBLIC_API_URL existe?** → Console/Network
2. **Backend lancé?** → Terminal
3. **Image accessible directement?** → Browser URL bar
4. **Données utilisateur correctes?** → Console JavaScript
5. **Pas d'erreur CORS?** → Console → Network tab
6. **Permissions fichiers?** → Terminal (ls/dir)

## ✨ Une Fois Corrigé

L'avatar s'affichera correctement:

- Sur la page de création de post
- Sur le feed
- Dans les commentaires
- Dans la barre de navigation
- Partout!

## 📚 Fichiers Pertinents

- `frontend/.env.local` - Configuration
- `frontend/src/components/community/shared/Avatar.tsx` - Composant
- `backend/config/cors.php` - Configuration CORS
- `backend/storage/app/public/avatars/` - Dossier des images
- `backend/public/storage/` - Symlink de stockage

---

**Besoin d'aide?** Vérifier les logs console d'abord! 🔍
