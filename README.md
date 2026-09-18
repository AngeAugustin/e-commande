# Chez Dossou - Yovo · Restaurant "Manger Sain" - e-commande

Application fullstack Next.js (App Router) pour un restaurant local:

- Front office client sans compte (menu, panier, checkout, suivi)
- Back office admin securise (login, produits CRUD, commandes, stats)
- MongoDB + Mongoose
- UI premium minimaliste avec Tailwind + Framer Motion

## Demarrage local

1. Copier les variables:

```bash
cp .env.example .env.local
```

2. Renseigner un `JWT_SECRET` fort et des identifiants admin uniques dans `.env.local`.

3. Lancer MongoDB (local ou Atlas), puis:

```bash
npm install
npm run dev
```

4. Initialiser les donnees (admin + produits):

```bash
curl -X POST http://localhost:3000/api/seed
```

En production, le seed est bloque sauf si `SEED_SECRET` est defini et envoye via l'en-tete `x-seed-secret`.

## Stack

- Next.js 16 + App Router
- Tailwind CSS
- Mongoose
- JWT en cookie HTTP-only
- Zustand (panier)
