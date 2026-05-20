# Frontend Auth — Next.js + Tailwind CSS
# Guide complet + structure du projet

=======================================================================
## 1. INITIALISATION DU PROJET
=======================================================================

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend
npm install axios js-cookie zustand react-hot-toast
npm install -D @types/js-cookie
```

Packages installés :
- axios        → appels API vers Laravel
- js-cookie    → stocker le token Sanctum
- zustand      → state management global (user, token)
- react-hot-toast → notifications toast

=======================================================================
## 2. STRUCTURE DES FICHIERS
=======================================================================

```
src/
├── app/
│   ├── layout.tsx                  ← Layout racine (ToastProvider)
│   ├── page.tsx                    ← Redirection vers /login
│   ├── (auth)/                     ← Groupe de routes auth (sans navbar)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   └── (dashboard)/                ← Groupe protégé (avec navbar)
│       ├── layout.tsx              ← ProtectedLayout
│       └── dashboard/page.tsx
│
├── components/
│   ├── ui/
│   │   ├── Input.tsx               ← Champ input réutilisable
│   │   ├── Button.tsx              ← Bouton réutilisable
│   │   ├── OtpInput.tsx            ← 6 champs OTP séparés
│   │   └── Alert.tsx               ← Messages succès/erreur
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ForgotPasswordForm.tsx
│       ├── ResetPasswordForm.tsx
│       └── VerifyEmailForm.tsx
│
├── lib/
│   ├── axios.ts                    ← Instance Axios configurée
│   └── utils.ts                    ← Fonctions utilitaires
│
├── services/
│   └── auth.service.ts             ← Toutes les fonctions API auth
│
├── store/
│   └── auth.store.ts               ← Zustand store (user + token)
│
├── hooks/
│   └── useAuth.ts                  ← Hook personnalisé
│
└── middleware.ts                   ← Protection des routes Next.js
```

=======================================================================
## 3. VARIABLES D'ENVIRONNEMENT
=======================================================================

Créez le fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```