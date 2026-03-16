# ArgoStack - Documentation Technique

> Ce fichier sert de contexte pour toute IA travaillant sur le projet ArgoStack.
> Il documente l'architecture, les entites, les API, les composants et l'infrastructure.

---

## 1. Vue d'ensemble

**ArgoStack** est un starter full-stack et DevOps-ready compose de :

- **Backend** : Node.js, Express, TypeORM, Apollo Server (GraphQL), TypeGraphQL
- **Frontend** : React 18, TypeScript, Vite, Apollo Client, TailwindCSS
- **Base de donnees** : PostgreSQL 15, Adminer
- **CMS** : Directus (optionnel, integre)
- **DevOps** : Docker, GitHub Actions CI/CD, VPS (staging + production)
- **Emails** : Mailgun (verification, reset password)
- **Uploads** : Multer (images de profil)

**Architecture cle** : le frontend utilise une **architecture hexagonale** (ports/adapters) permettant de switcher le backend provider a runtime entre `graphql`, `supabase`, `xano` et `directus`.

---

## 2. Structure du projet

```
argostack/
├── backend/
│   └── src/
│       ├── index.ts              # Point d'entree serveur Express + Apollo
│       ├── ormconfig.ts          # Configuration TypeORM (PostgreSQL)
│       ├── entities/             # User, Profile, Feature (TypeORM + TypeGraphQL)
│       ├── inputs/               # CreateUserInput, UpdateUserInput, CreateAccountInput, UpdateProfileInput
│       ├── models/               # UserModel, ProfileModel (couche d'acces donnees)
│       ├── resolvers/            # GraphQL resolvers (Users, Profiles, Features)
│       ├── routes/               # REST routes (health, auth, email, uploads, directus)
│       ├── services/             # userService
│       ├── types/                # MyContext, AuthPayload
│       ├── utils/                # validators, mailgun, getUser
│       ├── modules/uploads/      # uploadProfileImage (multer config)
│       ├── lib/                  # directusClient
│       └── seed/                 # featureSeed
├── frontend/
│   └── src/
│       ├── main.tsx              # Point d'entree React (providers)
│       ├── App.tsx               # Routes publiques et protegees
│       ├── core/                 # Ports (AuthPort, UserPort, FeaturePort, ComponentPort) + types + backend factory
│       ├── adapters/             # Implementations : graphql/, supabase/, xano/, directus/
│       ├── components/           # Composants UI et auth (Login, SignUp, ForgotPassword, ResetPassword, AccountParameters)
│       ├── context/              # AuthContext, AlertContext, UserContext
│       ├── hooks/                # useAuth, useUsers, useFeatures, useComponents
│       ├── graphql/              # Queries et mutations GraphQL
│       ├── layouts/              # MainLayout, DashboardLayout, LeftMenu
│       ├── pages/                # Home, Login, Signup, ForgotPassword, ResetPassword, VerifyAccount, Dashboard
│       ├── lib/                  # apolloClient, supabaseClient, directusClient, xanoClient, authManager
│       ├── styles/               # Presets (buttons, inputs, wrappers, typography), tokens (colors, spacing), CSS modules
│       └── config/               # api.ts (provider config)
├── vps/
│   ├── staging/docker-compose.yml
│   └── production/docker-compose.yml
├── docker-compose.dev.yml
├── .github/workflows/            # staging.yml, production.yml
└── docs/
```

---

## 3. Backend - Entites

### User (`backend/src/entities/User.ts`)

| Champ              | Type       | Notes                          |
|--------------------|------------|--------------------------------|
| id                 | number     | PrimaryGeneratedColumn, GraphQL ID |
| profileId          | uuid       | FK vers Profile, nullable      |
| profile            | Profile    | OneToOne relation               |
| firstName          | string(20) |                                |
| lastName           | string(20) |                                |
| username           | string(20) | nullable                       |
| description        | text       |                                |
| email              | string(50) |                                |
| password           | string(250)| Non expose en GraphQL          |
| image              | string(250)| nullable                       |
| birthday           | Date       | nullable                       |
| gender             | string     | nullable                       |
| created_at         | Date       | default: CURRENT_TIMESTAMP     |
| role               | text       |                                |
| passwordResetToken | varchar(250)| nullable                      |
| passwordResetExpiry| timestamp  | nullable                       |
| emailVerified      | boolean    | default: false                 |
| emailVerifyToken   | varchar(250)| nullable                      |

### Profile (`backend/src/entities/Profile.ts`)

| Champ      | Type   | Notes                      |
|------------|--------|----------------------------|
| id         | uuid   | PrimaryGeneratedColumn     |
| username   | string | nullable                   |
| firstName  | string | nullable                   |
| lastName   | string | nullable                   |
| description| text   | nullable                   |
| avatar_url | string | nullable                   |
| birthday   | Date   | nullable                   |
| gender     | string | nullable                   |
| updated_at | Date   | nullable                   |
| created_at | Date   | default: CURRENT_TIMESTAMP |

### Feature (`backend/src/entities/Feature.ts`)

| Champ       | Type   | Notes    |
|-------------|--------|----------|
| id          | number | PK       |
| icon        | string | nullable |
| title       | string | nullable |
| description | string | nullable |
| category    | string | nullable |

---

## 4. Backend - API GraphQL

### Queries

| Resolver          | Query           | Args              | Retour            | Auth |
|-------------------|-----------------|-------------------|-------------------|------|
| UsersQueries      | `getAllUsers`    | -                 | `[User]`          | Oui  |
| UsersQueries      | `getUserById`   | `id: Float`       | `User?`           | Oui  |
| UsersQueries      | `me`            | -                 | `User?`           | Cookie JWT |
| ProfilesQueries   | `profile`       | `id: String`      | `Profile?`        | Non  |
| ProfilesQueries   | `myProfile`     | -                 | `Profile?`        | Oui  |
| FeaturesQueries   | `features`      | -                 | `[Feature]`       | Non  |
| FeaturesQueries   | `feature`       | `id: Int`         | `Feature?`        | Non  |

### Mutations

| Resolver          | Mutation         | Args                    | Retour        | Notes |
|-------------------|------------------|-------------------------|---------------|-------|
| UsersMutations    | `login`          | `email, password`       | `AuthPayload` | Set cookie JWT 24h |
| UsersMutations    | `logout`         | -                       | `Boolean`     | Clear cookie |
| UsersMutations    | `createUser`     | `CreateUserInput`       | `User`        | Validation email + password |
| UsersMutations    | `updateUser`     | `UpdateUserInput`       | `User`        | Admin ou self |
| UsersMutations    | `deleteUser`     | `id: Int`               | `Boolean`     | Admin ou self |
| UsersMutations    | `createAccount`  | `CreateAccountInput`    | `User`        | Cree Profile + envoie email verif |
| ProfilesMutations | `updateProfile`  | `UpdateProfileInput`    | `Profile`     | Auth requise |
| FeaturesMutations | `createFeature`  | `icon, title, desc, cat`| `Feature`     | |
| FeaturesMutations | `updateFeature`  | `id, icon?, title?, ...`| `Feature?`    | |
| FeaturesMutations | `deleteFeature`  | `id: Int`               | `Boolean`     | |

### Input Types

**CreateAccountInput** : `email, firstName, lastName, username?, password`
**CreateUserInput** : `firstName, lastName, username?, description, email, password, image, birthday, gender, created_at, role`
**UpdateUserInput** : `id, firstName, lastName, username?, description?, email, password?, image?, birthday?, gender?, created_at?, role`
**UpdateProfileInput** : `username?, firstName?, lastName?, description?, avatar_url?, gender?, birthday?`

---

## 5. Backend - API REST

| Methode | Route                          | Description                         |
|---------|--------------------------------|-------------------------------------|
| GET     | `/health`                      | Status + database connectivity      |
| POST    | `/auth/logout`                 | Clear cookies auth_token + token    |
| POST    | `/email/verify-account`        | Body: `{token}` - Verifie l'email   |
| POST    | `/email/forgot-password`       | Body: `{email}` - Envoie email reset (anti-enumeration) |
| POST    | `/email/reset-password`        | Body: `{token, password}` - Reset avec token 1h |
| POST    | `/upload-profile-image/:id`    | Multer, max 5MB, stocke dans `public/images/profiles/` |
| GET     | `/images/profiles/*`           | Sert les images statiques           |
| POST    | `/api/directus/signup`         | Cree user Directus                  |
| POST    | `/api/directus/reset-password` | Reset via Directus                  |
| POST    | `/api/directus/invite-user`    | Invite user (admin)                 |
| GET     | `/api/directus/me`             | User courant Directus               |

---

## 6. Backend - Authentification

- **Hashing** : argon2
- **JWT** : signe avec `JWT_SECRET`, expire en 24h
- **Cookie** : `token`, httpOnly, secure en prod, sameSite none/lax
- **Flow login** :
  1. Verifie que l'email est confirme (`emailVerified`) AVANT le check password (securite)
  2. Verifie le password avec argon2
  3. Genere JWT et set cookie
- **Flow signup** (`createAccount`) :
  1. Valide email + password strength
  2. Hash password
  3. Cree un Profile associe
  4. Genere `emailVerifyToken`
  5. Envoie email de verification via Mailgun
  6. User cree avec `emailVerified: false`
- **Flow reset password** :
  1. `POST /email/forgot-password` genere token (1h expiry), envoie email
  2. `POST /email/reset-password` valide token, hash nouveau password
  3. Toujours retourne succes (anti-enumeration)

---

## 7. Backend - Configuration

### ORM (ormconfig.ts)
- PostgreSQL, host/port/user/password/database via env vars
- `synchronize: true` (auto-sync schema)
- Entites : User, Feature, Profile

### Context GraphQL (MyContext)
```typescript
{ req, res, user?: User | null, models: { User: UserModel, Profile: ProfileModel } }
```

### Models
- **UserModel** : `getAll()`, `getById(id)`, `getByEmail(email)`, `create(data)`, `update(id, data)`, `delete(id)`
- **ProfileModel** : `getById(id)`, `create(data)`, `update(id, data)`

### Scripts npm
- `dev` : ts-node-dev (hot reload)
- `build` : tsc
- `start:prod` : node dist/index.js
- `seed` : ts-node src/seed/index.ts
- `migrate` : ts-node src/migration/index.ts

### Utilitaires
- **validators.ts** : `isStrongPassword` (min 8 chars, lower+upper+digit+special), `isValidEmail`
- **mailgun.ts** : `sendEmail({to, subject, html})` via Mailgun SDK
- **getUser.ts** : extrait user depuis cookie JWT

---

## 8. Frontend - Architecture Hexagonale

### Ports (interfaces)

**AuthPort** : `login`, `logout`, `me`, `signup`, `forgottenPassword`, `resetPassword`, `inviteUser`
**UserPort** : `getAll`, `getById`, `getRoles`, `create`, `update`, `delete`
**FeaturePort** : `getAll`, `getById?`
**ComponentPort** : `getAll`, `getById?`

### Backend Factory (`core/backend/index.ts`)

Selectionne l'adapter selon `VITE_BACKEND_PROVIDER` :
- `"graphql"` : adapters GraphQL (Apollo Client)
- `"supabase"` : adapters Supabase (@supabase/supabase-js)
- `"xano"` : adapters Xano (REST fetch)
- `"directus"` : adapters Directus (@directus/sdk)

Objet expose : `backend.auth`, `backend.user`, `backend.features`, `backend.components`

### Types principaux

```typescript
interface User {
  id: number; email: string; username?: string; firstName?: string;
  lastName?: string; avatar?: string; role?: string; image?: string; profileId?: string;
}

interface SignupPayload { email: string; password: string; firstName?: string; lastName?: string; }
interface Feature { id: string; title: string; description: string; category: string; icon?: string; status?: string; }
```

---

## 9. Frontend - Routes

| Route               | Page            | Auth | Description                          |
|----------------------|-----------------|------|--------------------------------------|
| `/`                  | Home            | Non  | Landing page avec features actives   |
| `/login`             | Login           | Non  | Connexion, gere `?verified=true`     |
| `/signup`            | Signup          | Non  | Inscription avec verification email  |
| `/forgot-password`   | ForgotPassword  | Non  | Demande de reset password            |
| `/reset-password`    | ResetPassword   | Non  | Reset avec `?token=`, guard si absent|
| `/verify-account`    | VerifyAccount   | Non  | Verification email avec `?token=`    |
| `/dashboard/*`       | Dashboard       | Oui  | Layout avec sidebar                  |
| `/dashboard/account-parameters` | AccountParameters | Oui | Edition profil + password |

---

## 10. Frontend - Composants Auth

Tous les composants auth sont polymorphes (props configurables pour wrapper, titre, style, labels, show/hide).

### Login (`components/authentication/Login/Login.tsx`)
- Props : wrapperStyle, titleHeading, inputStyle, email/password labels, buttonStyle, OAuth, forgotPasswordPosition
- Features : validation email/password, toggle visibilite (lucide Eye/EyeOff), OAuth buttons, redirect apres login

### SignUp (`components/authentication/SignUp/SignUp.tsx`)
- Props : idem + firstName/lastName, phone, confirmPassword, passwordStrength, privacyPolicy
- Features : barre de force du password (4 niveaux), validation email en temps reel, guard mismatch seulement quand confirmPassword non vide, flow 2 etapes (formulaire puis message confirmation)
- Name fields utilisent `presets.inputGroupItem2` (pas de gap)

### ForgotPassword (`components/authentication/ForgotPassword/ForgotPassword.tsx`)
- Props : wrapperStyle, email, buttons (submit + cancel)
- Feature : envoie via `backend.auth.forgottenPassword(email)`, affiche message de succes

### ResetPassword (`components/authentication/ResetPassword/ResetPassword.tsx`)
- Props : password, confirmPassword, passwordStrength, eyeIconColor
- Features : barre de force, guard mismatch, bouton disabled si `password.length === 0`

### AccountParameters (`components/authentication/AccountParameters/AccountParameters.tsx`)
- Props : user object, disableRoleEdit, password fields
- Features : 2 formulaires (infos user + reset password), upload image profil, role disable par defaut
- Image path : `${VITE_BACKEND_URL}/images/profiles/${fileName}`

---

## 11. Frontend - State Management

### AuthContext / AuthProvider
- State : `user`, `loading`, `error`
- Methods : `login(email, password)`, `logout()`, `signup(payload)`
- Init : appelle `backend.auth.me()` au mount

### AlertContext
- Types : `success | error | info | warning`
- Methods : `addAlert(type, message)`, `removeAlert(id)`
- Auto-close apres 3 secondes

### Hooks
- `useAuth()` : `{ user, loading, error, login, logout, signup }`
- `useFeatures()` : `{ features, loading, error }`
- `useUsers()` : `{ updateUser, createUser, deleteUser }`
- `useGetAllUsers(trigger?)` : `{ users, loading, error }`
- `useRoles()` : `{ roles: [{id, name}], loading, error }`

---

## 12. Frontend - GraphQL

### Queries
```graphql
query Me { me { id email firstName lastName username description image created_at role birthday gender } }
query GetAllUsers { getAllUsers { ...memes champs } }
query getUserById($id: Float!) { getUserById(id: $id) { ...memes champs } }
query Features { features { id icon title description category } }
```

### Mutations
```graphql
mutation login($email: String!, $password: String!) { login(email: $email, password: $password) { user { id username firstName lastName email } } }
mutation CreateAccount($data: CreateAccountInput!) { createAccount(data: $data) { id email firstName lastName username } }
mutation UpdateUser($data: UpdateUserInput!) { updateUser(data: $data) { id email firstName lastName username birthday gender image } }
mutation DeleteUser($data: DeleteUserInput!) { deleteUser(data: $data) { id } }
mutation Logout { logout }
```

---

## 13. Frontend - Systeme de Styles

### Presets (`styles/presets/`)
- **buttons** : `primary` (full-width, 48px), `secondary` (bordered), `tertiary` (text-only)
- **inputs** : `simple` (46px), `intermediaire` (36px), `advance` (full-width)
- **wrappers** : `simple`, `card` (48px padding, shadow, responsive), `overlay`, `accountCard` (64px)
- **inputGroup** : flex row, 36px gap
- **inputGroupItem** : flex column avec gap
- **inputGroupItem2** : flex column sans gap (utilise pour name fields dans SignUp)
- **passwordInputWrapper** : position relative pour le bouton eye
- **strengthBars / strengthBar** : barres de force du password

### Tokens (`styles/tokens/`)
- Couleurs (primary, secondary, input, text, border, shadow, background)
- Typographie (Manrope, Plus Jakarta Sans)
- Espacements (padding, margin, gap)
- Basics (border-radius, shadows, transitions)

### CSS Modules
- `Login.module.css` (hero, heroBackground)
- `AccountParameters.module.css` (blockImage, profilImage, buttonImage, iconImage)

---

## 14. Frontend - Libraries principales

| Lib                   | Usage                        |
|-----------------------|------------------------------|
| @apollo/client        | Client GraphQL               |
| @supabase/supabase-js | Client Supabase              |
| @directus/sdk         | Client Directus              |
| lucide-react          | Icones (Eye, EyeOff, Upload) |
| framer-motion         | Animations                   |
| leaflet               | Cartes                       |
| chart.js              | Graphiques                   |
| @dnd-kit/*            | Drag and drop                |
| slate / slate-react   | Editeur rich text            |
| html5-qrcode          | Scanner QR code              |
| react-day-picker      | Calendrier / date picker     |
| class-variance-authority | Variants de composants    |
| @heroui/react         | UI components                |
| tailwindcss           | Utilitaire CSS               |

---

## 15. Infrastructure Docker

### Developpement (`docker-compose.dev.yml`)

| Service    | Image                  | Port         | Notes                              |
|------------|------------------------|--------------|-------------------------------------|
| postgres   | postgres:15            | 44002:5432   | Healthcheck, volume pgdata          |
| adminer    | adminer                | 44003:8080   |                                     |
| backend    | Dockerfile.dev         | 44000:4000   | `npm run seed && npm run dev`       |
| frontend   | Dockerfile.dev         | 44001:5173   | `npm run dev -- --host`             |
| db         | postgres:15            | 44004:5432   | Pour Directus                       |
| directus   | directus/directus:latest| 44005:8055  | Mailgun, CORS                       |

### Staging (`vps/staging/docker-compose.yml`)

| Service    | Image                                | Port          |
|------------|--------------------------------------|---------------|
| postgres   | postgres:15                          | ${DATABASE_PORT}:5432 |
| backend    | ghcr.io/${REPO_NAME}-staging-backend | ${BACKEND_PORT}:4000  |
| frontend   | ghcr.io/${REPO_NAME}-staging-frontend| ${FRONTEND_PORT}:4173 |

- `restart: always` sur tous les services
- Healthcheck postgres avec `-d ${DATABASE_NAME}`
- `DATABASE_HOST: postgres` (nom du service Docker)
- Env vars Mailgun sur le backend

### Production (`vps/production/docker-compose.yml`)

Similaire au staging avec en plus :
- Backend command : `node dist/seed/index.js && npm run start:prod`
- Volume `profile_images` partage
- Directus + sa base PostgreSQL dediee
- `FRONTEND_URL: ${FRONTEND_URL}`

---

## 16. CI/CD GitHub Actions

### Staging (`staging.yml`) - trigger: push sur branche `staging`
1. Checkout + setup SSH
2. Build et push backend image vers GHCR
3. Build et push frontend image vers GHCR (avec build args VITE_*)
4. SSH vers VPS staging puis `docker compose up -d`
5. Cleanup Docker (prune > 24h)

### Production (`production.yml`) - trigger: push sur branche `production`
Identique au staging sauf :
- Deploiement : `docker compose up -d --no-deps frontend backend` (ne touche pas postgres)

---

## 17. Variables d'environnement cles

### Backend
```
DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME
JWT_SECRET
FRONTEND_URL
PORT (default: 4000)
EMAIL_MAILGUN_API_KEY, EMAIL_MAILGUN_DOMAIN, EMAIL_MAILGUN_HOST, EMAIL_FROM
DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN
```

### Frontend
```
VITE_BACKEND_PROVIDER (graphql | supabase | xano | directus)
VITE_GRAPHQL_ENDPOINT
VITE_BACKEND_URL
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
VITE_DIRECTUS_URL
VITE_XANO_API_URL
VITE_IMAGE_URL
```

---

## 18. Path Aliases (tsconfig / vite)

### Backend
- `@/utils/*` → `src/utils/*`
- `@/entities/*` → `src/entities/*`

### Frontend
- `@components/*` → `src/components/*`
- `@hooks/*` → `src/hooks/*`
- `@pages/*` → `src/pages/*`
- `@graphql/*` → `src/graphql/*`
- `@context/*` → `src/context/*`
- `@styles/*` → `src/styles/*`
- `@modules/*` → `src/styles/modules/*`
- `@config/*` → `src/config/*`
- `@lib/*` → `src/lib/*`
- `@/core/*` → `src/core/*`
- `@/adapters/*` → `src/adapters/*`

---

## 19. Seed

Le seed cree 13 features dans 2 categories :

**Categorie "home"** (6) : Backend, Frontend, Devops, API routes, Libellule (~50 composants), Services (Maps, Stripe)
**Categorie "dashboard"** (7) : Authentification, Formulaires, Geolocalisation, Graphiques, Interactions, Shopping, Interface utilisateur

---

## 20. Conventions et patterns

- **Decorateurs duaux** : les entites utilisent a la fois les decorateurs TypeORM (`@Entity`, `@Column`) et TypeGraphQL (`@ObjectType`, `@Field`)
- **Separation User/Profile** : les donnees d'auth (User) sont separees des donnees d'affichage (Profile) via une relation OneToOne
- **Anti-enumeration** : le reset password retourne toujours un succes meme si l'email n'existe pas
- **Securite login** : `emailVerified` est verifie AVANT le check password pour eviter la fuite d'info
- **Icones** : utilisation de `lucide-react` (Eye, EyeOff, Upload) dans les composants auth
- **Presets polymorphes** : tous les composants auth acceptent des props pour personnaliser wrapper, titre, inputs, boutons, labels
- **Guard validation** : le message "mots de passe differents" n'apparait que quand `confirmPassword.length > 0`
- **Password strength** : 4 niveaux (rouge/orange/jaune-vert/vert), base sur lowercase + uppercase + digit + special char + min 8 chars
- **Multer uploads** : mkdir dans le callback `destination` (lazy), suppression des anciennes images avant upload
