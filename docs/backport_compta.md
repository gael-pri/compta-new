# Backport Compta - Plan de migration

> App de compta perso basee sur ArgoStack avec Directus comme provider.
> Design moderne, from scratch, sans les pages par defaut d'ArgoStack.

---

## 1. Stack technique

| Service     | Port  | Description                    |
|-------------|-------|--------------------------------|
| Backend     | 60000 | Node.js Express + Apollo       |
| Frontend    | 60001 | React 18 + Vite + TailwindCSS  |
| PostgreSQL  | 60002 | BDD backend                    |
| Adminer     | 60003 | Admin BDD                      |
| PG Directus | 60004 | BDD dediee Directus            |
| Directus    | 60005 | CMS / BaaS (provider principal)|

- **Provider** : `directus` (`VITE_BACKEND_PROVIDER=directus`)
- **Dev** : `docker-compose.dev.yml`
- **Architecture** : hexagonale (ports/adapters)

---

## 2. Donnees Supabase `stphil_budget`

### Schema

| Champ       | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| id          | integer   | PK auto-increment                                |
| created_at  | timestamp | Date de creation                                 |
| type        | string    | `achat`, `aide`, `charges`, `revenu`             |
| organisme   | string    | Source/destination (loyer, bio, caf, gael, etc.) |
| montant     | number    | Montant en euros                                 |
| mois        | integer   | Mois (1-12)                                      |
| annee       | integer   | Annee (2025, 2026)                               |
| note        | string?   | Detail libre (S1, apl, participe, swile, etc.)   |
| statut      | string?   | `valide` ou null                                 |

### Volumetrie

- **217 lignes** (189 en 2025, 28 en 2026)
- **4 types** : achat (60), charges (82), aide (24), revenu (49)
- **13 organismes** : bio, caf, loyer, edf, free, saur, gael, enora, autre, essence, macif, mutuelle

---

## 3. Pages de l'application

> On supprime toutes les anciennes pages ArgoStack (Home landing, Features, etc.)
> On repart sur un design moderne et epure.

### Pages publiques

| Route              | Page           | Description                     |
|--------------------|----------------|---------------------------------|
| `/login`           | Login          | Connexion (existant, adapte)    |
| `/signup`          | Signup         | Inscription (existant, adapte)  |
| `/forgot-password` | ForgotPassword | Reset password (existant)       |
| `/reset-password`  | ResetPassword  | Reset avec token (existant)     |
| `/verify-account`  | VerifyAccount  | Verification email (existant)   |

### Pages protegees (dashboard)

| Route                       | Page            | Description                          |
|-----------------------------|-----------------|--------------------------------------|
| `/` (redirect `/dashboard`) | -               | Redirect vers dashboard              |
| `/dashboard`                | Budget          | Vue mensuelle du budget (page index) |
| `/dashboard/annuel`         | BudgetAnnuel    | Vue annuelle                         |
| `/dashboard/account`        | AccountParams   | Parametres du compte                 |

### Design moderne

- **Sidebar** minimaliste avec icones (lucide-react)
- **Cards** avec ombres douces, border-radius genereux
- **Palette** : tons neutres (slate/gray) + accent couleur pour les categories budget
- **Typo** : Manrope / Plus Jakarta Sans (deja en place)
- **Responsive** : sidebar collapse en mobile

---

## 4. Plan d'implementation

### Phase 1 : Setup Directus + Migration (CURRENT)

1. Lancer `docker-compose.dev.yml`
2. Creer la collection `budget` dans Directus via l'API admin
3. Migrer les 217 lignes de Supabase vers Directus (script)
4. Verifier les donnees dans Adminer / Directus admin

### Phase 2 : Nettoyage + Nouveau design

5. Supprimer les anciennes pages (Home ArgoStack, ComponentList, ComponentsDetails, Users)
6. Nouveau `App.tsx` : redirect `/` vers `/dashboard`, routes simplifiees
7. Nouveau `DashboardLayout` : sidebar moderne + content area
8. Nouveau `LeftMenu` : icones budget, annuel, compte
9. Nouvelles variables CSS : palette compta

### Phase 3 : Port + Adapter Budget

10. `core/types/budget.ts` : types BudgetEntry, BudgetFilters, BudgetSummary
11. `core/ports/budget.port.ts` : interface CRUD + getSummary
12. `adapters/directus/budget.adapter.ts` : implementation Directus SDK
13. `hooks/useBudget.ts` : hook React
14. Enregistrer dans `core/backend/index.ts`

### Phase 4 : Pages Budget

15. `BudgetSummary` : 4 cards (revenus, charges, achats, aides) + solde
16. `BudgetTable` : tableau filtrable/triable avec actions CRUD
17. `BudgetForm` : modal ajout/edition avec autocompletion organisme
18. Page Dashboard Budget : assemblage des composants
19. Vue annuelle (optionnel phase suivante)

### Phase 5 : Polish

20. Charts (Chart.js) : repartition par type, evolution mensuelle
21. Export CSV
22. Charges recurrentes : pre-remplissage mensuel

---

## 5. Fichiers a creer

```
frontend/src/core/types/budget.ts
frontend/src/core/ports/budget.port.ts
frontend/src/adapters/directus/budget.adapter.ts
frontend/src/hooks/useBudget.ts
frontend/src/pages/BudgetDashboard.tsx
frontend/src/components/budget/BudgetTable.tsx
frontend/src/components/budget/BudgetForm.tsx
frontend/src/components/budget/BudgetSummary.tsx
scripts/migrate-supabase-to-directus.ts
```

## 6. Fichiers a modifier

```
.env                                        -> ports 60000+, PROJECT_NAME=compta
frontend/.env                               -> idem
directus/.env                               -> idem
frontend/src/App.tsx                        -> nouvelles routes, redirect /
frontend/src/layouts/DashboardLayout.tsx     -> nouveau design
frontend/src/layouts/molecules/LeftMenu/     -> nouveau menu
frontend/src/core/backend/index.ts          -> ajouter budget port
frontend/src/styles/global.css              -> nouvelle palette
```

## 7. Fichiers a supprimer

```
frontend/src/pages/Home.tsx                 -> landing ArgoStack
frontend/src/pages/Users.tsx                -> page admin users
frontend/src/layouts/molecules/Dashboard/ComponentList.tsx
frontend/src/layouts/molecules/Dashboard/ComponentsDetails.tsx
frontend/src/styles/modules/Home.module.css
frontend/src/styles/modules/MainLayout.module.css
frontend/src/layouts/MainLayout.tsx
```
