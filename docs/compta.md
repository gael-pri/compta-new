# Compta - Application de comptabilite personnelle

## Presentation

Application web de suivi budgetaire personnel permettant de gerer les revenus, charges, achats et aides au mois le mois, avec une vue annuelle aggregee. Construite sur la base du systeme ArgoStack avec Directus comme backend/BaaS.

---

## Stack technique

| Couche      | Technologies                                          |
|-------------|-------------------------------------------------------|
| Frontend    | React 18, TypeScript, Vite, Chart.js, Lucide React    |
| Backend     | Directus (BaaS / CMS headless)                        |
| Base de donnees | PostgreSQL 15 (dediee Directus)                   |
| DevOps      | Docker, GitHub Actions, VPS (staging + production)    |
| Architecture | Hexagonale (ports/adapters)                          |

### Ports (dev)

| Service     | Port  |
|-------------|-------|
| Frontend    | 60001 |
| PostgreSQL  | 60004 |
| Directus    | 60005 |

---

## Architecture frontend

L'application suit une architecture hexagonale avec separation stricte entre la logique metier et les adaptateurs d'API.

```
frontend/src/
  core/
    types/          # Interfaces TypeScript (BudgetEntry, Organisme, Prevision, etc.)
    ports/          # Interfaces abstraites (BudgetPort, OrganismePort, PrevisionPort)
    backend/        # Factory : selection de l'adaptateur selon le provider
  adapters/
    directus/       # Implementation Directus SDK (budget, organisme, prevision, auth, user)
    graphql/        # Adaptateur GraphQL (legacy ArgoStack)
    supabase/       # Adaptateur Supabase (legacy)
    xano/           # Adaptateur Xano (legacy)
  components/
    budget/         # BudgetTable, BudgetForm, BudgetSummary, BudgetChart
    authentication/ # AccountParameters, Login, SignUp, ResetPassword, UserCrud
    ui/             # AlertManager, DatePicker, FileUploader
  pages/
    BudgetDashboard.tsx   # Vue mensuelle
    BudgetAnnuel.tsx      # Vue annuelle
    Parameters.tsx        # Parametres (organismes, previsions, profil, admin)
    Login.tsx, Signup.tsx  # Pages publiques
  hooks/
    useBudget.ts    # Hook CRUD budget + summary
    useAuth.ts      # Hook authentification
    useUsers.ts     # Hook gestion utilisateurs
  layouts/
    DashboardLayout.tsx   # Layout protege avec sidebar
    AuthLayout.tsx        # Layout pages publiques
```

---

## Modele de donnees (Directus)

### Collection `budget`

| Champ         | Type      | Description                                |
|---------------|-----------|--------------------------------------------|
| id            | integer   | PK auto-increment                          |
| type          | string    | `revenu`, `charges`, `achat`, `aide`       |
| organisme     | string    | Nom (legacy, conserve pour compatibilite)  |
| organisme_id  | M2O       | Relation vers collection `organisme`       |
| montant       | float     | Montant en euros                           |
| mois          | integer   | Mois (1-12)                                |
| annee         | integer   | Annee                                      |
| note          | string?   | Detail libre (S1, S2, apl, etc.)           |
| statut        | string?   | `valide`, `en_attente`, `annule`           |
| date_created  | timestamp | Auto                                       |
| date_updated  | timestamp | Auto                                       |

### Collection `organisme`

| Champ | Type   | Description                          |
|-------|--------|--------------------------------------|
| id    | integer | PK auto-increment                   |
| nom   | string  | Nom de l'organisme                  |
| type  | string  | Type lie (`revenu`, `charges`, etc.) |

Organismes predefinis :
- **Charges** : Loyer, EDF, Free, Saur, Macif, Mutuel, Essence, Autre
- **Achats** : Alre bio, Biocoop, Autre courses
- **Revenus** : Gael, Enora
- **Aides** : Caf

### Collection `prevision`

| Champ        | Type    | Description                            |
|--------------|---------|----------------------------------------|
| id           | integer | PK auto-increment                      |
| type         | string  | Type de budget                         |
| organisme_id | M2O     | Relation vers organisme                |
| note         | string? | Detail (S1, mensuel, etc.)             |
| montant      | float   | Montant previsionnel moyen             |

Les previsions servent a pre-remplir les mois restants de l'annee avec des entrees `en_attente`.

---

## Fonctionnalites

### Vue mensuelle (`/dashboard`)
- Navigation mois par mois avec fleches
- Filtre par type (revenus, charges, achats, aides)
- 4 cartes de resume avec totaux + indicateur de tendance vs mois precedent
- Carte solde (revenus + aides - charges - achats)
- 4 tableaux separes : Revenus, Aides, Achats, Charges
- Clic sur l'icone statut pour basculer valide/en_attente
- Achats tries par note (S1, S2... puis le reste)
- Graphiques : repartition par type (bar), evolution mensuelle (bar charges + ligne courses), equilibre revenus Gael/Enora
- Formulaire modal ajout/edition avec selection organisme + bouton creation rapide

### Vue annuelle (`/dashboard/annuel`)
- Navigation par annee
- Memes cartes de resume (totaux annuels)
- Tableaux aggreges par organisme avec colonnes : Statut, Type, Organisme, Note, Entrees, Mensuel (moyenne), Total
- Achats detailles par note (S1-S5 + Autre)
- Graphiques annuels : repartition, evolution par mois, courbe courses mensuelle

### Parametres (`/dashboard/parameters`)
- **Onglet Organismes** : CRUD inline, classes par type, edition/creation/suppression
- **Onglet Previsions** : CRUD + bouton "Appliquer les previsions" (cree/met a jour les entrees `en_attente` pour les mois restants)
- **Onglet Mon profil** : edition infos utilisateur, photo, mot de passe
- **Onglet Admin Profiles** : gestion des utilisateurs (CRUD)

### Authentification
- Login / Signup / Forgot password / Reset password / Verify account
- Authentification Directus (email + password, tokens JWT)
- Routes protegees via `PrivateRoute`

---

## Deploiement

### Environnements

| Env        | Contenu                                       | Chemin VPS                          |
|------------|-----------------------------------------------|-------------------------------------|
| Production | Frontend + PostgreSQL + Directus              | `/srv/projets/production/compta-new`|
| Staging    | Frontend seul (pointe sur Directus de prod)   | `/srv/projets/staging/compta-new`   |

### CI/CD (GitHub Actions)

- **Push sur `staging`** : build image Docker frontend, deploy sur VPS staging
- **Push sur `production`** : build image Docker frontend, deploy sur VPS production (+ Directus + DB)
- Images poussees sur GitHub Container Registry (ghcr.io)

### Docker

- **Dev** : `docker-compose.dev.yml` — frontend (Vite dev server), PostgreSQL, Directus
- **Prod** : `vps/production/docker-compose.yml` — frontend (Vite preview), PostgreSQL, Directus
- **Staging** : `vps/staging/docker-compose.yml` — frontend seul

### Migration initiale

Un dump PostgreSQL de la base Directus locale est fourni (`vps/production/directus_dump.sql`) pour initialiser la production avec toutes les collections, donnees et configuration Directus.

---

## Variables d'environnement

| Variable               | Description                          |
|------------------------|--------------------------------------|
| `VITE_BACKEND_PROVIDER`| Provider actif (`directus`)          |
| `VITE_DIRECTUS_URL`   | URL publique de Directus              |
| `POSTGRES_USER`        | User PostgreSQL Directus             |
| `POSTGRES_PASSWORD`    | Password PostgreSQL Directus         |
| `POSTGRES_DB`          | Nom de la base Directus              |
| `DIRECTUS_ADMIN_EMAIL` | Email admin Directus                 |
| `DIRECTUS_ADMIN_PASSWORD`| Password admin Directus            |
| `DIRECTUS_KEY`         | Cle Directus (prod)                  |
| `DIRECTUS_SECRET`      | Secret Directus (prod)               |
| `EMAIL_TRANSPORT`      | Transport email (mailgun)            |
| `EMAIL_MAILGUN_*`      | Configuration Mailgun                |
