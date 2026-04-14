# ILOSIWAJU - e-commande

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

2. Lancer MongoDB (local ou Atlas), puis:

```bash
npm install
npm run dev
```

3. Initialiser les donnees (admin + produits):

```bash
curl -X POST http://localhost:3000/api/seed
```

## Identifiants admin (par defaut)

- Email: `admin@ilosiwaju.com`
- Mot de passe: `Admin1234!`

## Stack

- Next.js 16 + App Router
- Tailwind CSS
- Mongoose
- JWT en cookie HTTP-only
- Zustand (panier)
