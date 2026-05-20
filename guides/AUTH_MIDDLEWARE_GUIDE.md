# Comprendre le Middleware d’Authentification — Next.js + Laravel

---

# Introduction

Le middleware est un mécanisme qui permet de contrôler
l’accès aux pages d’une application avant qu’elles
ne soient affichées à l’utilisateur.

Dans une architecture utilisant :

- Next.js comme frontend ;
- Laravel comme backend API ;

le middleware agit comme un gardien de sécurité.

Il décide si l’utilisateur peut accéder
à une page ou non.

---

# Idée Générale

Le middleware fonctionne comme une barrière
placée entre :

```text
Utilisateur → Middleware → Application
```

Avant d’ouvrir une page, le middleware vérifie :

- si l’utilisateur est connecté ;
- si le token est valide ;
- si la route est autorisée.

---

# Fonctionnement Global

Le fonctionnement suit généralement ce cycle :

```text
1. L’utilisateur demande une page
2. Le middleware intercepte la requête
3. Le middleware récupère le token
4. Le middleware analyse la route demandée
5. Le middleware vérifie l’authentification
6. Le middleware décide :
   - autoriser l’accès
   - ou rediriger
7. La requête continue vers la page
```

---

# Exemple Simplifié

## Cas 1 — Utilisateur non connecté

L’utilisateur essaie d’accéder à :

```text
/dashboard
```

Le middleware :

- détecte que la route est protégée ;
- cherche le token ;
- ne trouve aucun token.

Résultat :

```text
Redirection vers /login
```

---

## Cas 2 — Utilisateur connecté

L’utilisateur possède un token valide.

Le middleware :

- vérifie le token ;
- autorise l’accès.

Résultat :

```text
Accès au dashboard
```

---

# Rôle Principal du Middleware

Le middleware sert principalement à :

- protéger les pages privées ;
- empêcher les accès non autorisés ;
- gérer les redirections ;
- vérifier les sessions ;
- améliorer la sécurité globale.

---

# Routes Publiques et Privées

Le middleware distingue généralement
deux types de routes.

---

## Routes Publiques

Accessibles sans connexion.

Exemples :

```text
/login
/register
/forgot-password
```

---

## Routes Protégées

Accessibles uniquement après authentification.

Exemples :

```text
/dashboard
/profile
/settings
```

---

# Gestion du Token

Le middleware utilise souvent un token
d’authentification.

Ce token est généralement :

- généré par Laravel ;
- stocké dans un cookie sécurisé.

Le middleware lit ce token
pour savoir si l’utilisateur est connecté.

---

# Vérification avec Laravel

Dans certains systèmes,
le middleware peut contacter Laravel
pour vérifier si le token est encore valide.

Laravel peut alors :

- accepter le token ;
- refuser le token ;
- retourner les informations utilisateur.

---

# Les Redirections

Le middleware peut rediriger automatiquement
les utilisateurs.

---

## Exemple

### Utilisateur non connecté

```text
/dashboard → /login
```

---

### Utilisateur déjà connecté

```text
/login → /dashboard
```

---

# Pourquoi le Middleware est Important

Sans middleware :

- n’importe qui pourrait accéder aux pages privées ;
- les routes ne seraient pas protégées ;
- la sécurité serait faible.

Le middleware centralise toute la logique
de protection de l’application.

---

# Avantages

Le middleware permet :

- une meilleure sécurité ;
- une gestion centralisée ;
- un contrôle automatique des accès ;
- une meilleure expérience utilisateur ;
- une architecture plus propre.

---

# Architecture Générale

```text
Frontend Next.js
        ↓
Middleware
        ↓
Validation du Token
        ↓
Laravel API
        ↓
Réponse
```

---

# Résumé Final

Le middleware est une couche de contrôle
placée avant les pages de l’application.

Son objectif principal est de :

- vérifier l’utilisateur ;
- protéger les routes ;
- contrôler les accès ;
- gérer les redirections ;
- sécuriser le système.

Dans une application Next.js + Laravel,
le middleware constitue l’un des éléments
les plus importants du système d’authentification.