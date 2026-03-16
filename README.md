# Compta

Application de comptabilite personnelle — suivi budgetaire mensuel et annuel.

![Staging](https://github.com/gael-pri/compta-new/actions/workflows/staging.yml/badge.svg)
![Production](https://github.com/gael-pri/compta-new/actions/workflows/production.yml/badge.svg)

## Stack

| Couche   | Technologies                                       |
|----------|-----------------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Chart.js, Lucide React  |
| Backend  | Directus (BaaS headless)                             |
| DB       | PostgreSQL 15                                        |
| DevOps   | Docker, GitHub Actions, VPS                          |

Architecture hexagonale (ports/adapters) — le frontend peut changer de provider (Directus, Supabase, GraphQL, Xano) via une variable d'environnement.

## Fonctionnalites

- **Vue mensuelle** : 4 tableaux (revenus, aides, achats, charges), cartes de resume avec tendance, graphiques
- **Vue annuelle** : totaux aggreges par organisme, moyenne mensuelle, detail achats par semaine
- **Parametres** : gestion organismes, previsions auto-remplissage, profil, admin utilisateurs
- **Authentification** : login, signup, reset password, verification email via Directus

## Dev

```bash
# Lancer l'environnement de dev
docker compose -f docker-compose.dev.yml up -d --build

# Rebuild un conteneur
docker compose -f docker-compose.dev.yml up -d --build frontend
```

| Service    | URL                     |
|------------|-------------------------|
| Frontend   | http://localhost:60001   |
| Directus   | http://localhost:60005   |
| PostgreSQL | localhost:60004          |

## Deploiement

Le CI/CD est gere par GitHub Actions :
- Push sur `staging` → build + deploy frontend sur VPS staging
- Push sur `production` → build + deploy frontend + Directus + DB sur VPS production

Les images Docker sont stockees sur GitHub Container Registry (ghcr.io).

## Documentation

- [Description detaillee du projet](docs/compta.md)
- [Plan de migration depuis ArgoStack](docs/backport_compta.md)
- [Audit de securite](docs/security.md)
