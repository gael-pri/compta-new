# Audit de securite - Compta

> Date : 2026-03-16
> Scope : frontend, Directus, Docker, CI/CD, infrastructure

---

## 1. Authentification et sessions

### Points positifs
- Authentification via Directus (email + password, tokens JWT)
- Routes protegees via `PrivateRoute`
- Password hashing avec argon2 (cote backend legacy)
- Frontend Dockerfile utilise un user non-root (`appuser:1001`)

### Risques identifies

| Severite | Probleme | Detail |
|----------|----------|--------|
| CRITIQUE | Credentials dans `.env` commite | `DIRECTUS_ADMIN_PASSWORD`, `POSTGRES_PASSWORD`, `EMAIL_MAILGUN_API_KEY` visibles dans le repo |
| HAUTE | Cookies sans flags securises | Pas de `HttpOnly`, `Secure`, `SameSite` explicites sur les cookies d'auth |
| MOYENNE | Pas de 2FA/MFA | Aucune authentification a deux facteurs |
| MOYENNE | Tokens de reset en clair | `passwordResetToken` stocke en clair en base |

### Recommandations
- [ ] Ajouter `.env` au `.gitignore` et purger l'historique git (`git filter-branch` ou BFG)
- [ ] Configurer les cookies avec `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Utiliser un gestionnaire de secrets (GitHub Secrets pour CI, `.env.local` ignore pour dev)

---

## 2. Securite API (CORS, Directus)

### Points positifs
- CORS configure sur Directus avec origin restreint
- Architecture hexagonale isole les appels API dans des adapters

### Risques identifies

| Severite | Probleme | Detail |
|----------|----------|--------|
| CRITIQUE | GraphQL introspection activee | Le backend legacy expose le schema complet (si encore actif) |
| CRITIQUE | CSRF prevention desactivee | `csrfPrevention: false` dans Apollo Server (backend legacy) |
| HAUTE | Pas de rate limiting | Aucune limitation de debit sur les endpoints auth/API |
| MOYENNE | Logging de donnees sensibles | Le backend legacy log headers et body des requetes |

### Recommandations
- [ ] Desactiver introspection GraphQL en production (si backend legacy encore actif)
- [ ] Activer `csrfPrevention: true` ou retirer le backend legacy
- [ ] Ajouter du rate limiting sur les endpoints sensibles (login, reset password)
- [ ] Ne jamais logger les tokens, passwords ou headers d'authentification

---

## 3. Securite Docker

### Points positifs
- Production utilise `no-new-privileges:true` et `read_only: true`
- Limites CPU/memoire configurees en production
- Multi-stage build pour le frontend (image finale legere)

### Risques identifies

| Severite | Probleme | Detail |
|----------|----------|--------|
| CRITIQUE | Port PostgreSQL expose | `POSTGRES_PORT:5432` accessible depuis l'exterieur |
| HAUTE | Image Directus `latest` | Pas de version pince, risque de regression ou vulnerabilite |
| HAUTE | `KEY: devkey` et `SECRET: supersecret` en dev | Valeurs par defaut non securisees |
| MOYENNE | Pas de chiffrement des volumes | Donnees au repos non chiffrees |

### Recommandations
- [ ] Retirer l'exposition du port PostgreSQL en production (communication interne uniquement)
- [ ] Pincer la version Directus (`directus/directus:11.x.x` au lieu de `latest`)
- [ ] Generer des `DIRECTUS_KEY` et `DIRECTUS_SECRET` forts en production (ex: `openssl rand -hex 32`)
- [ ] Considerer le chiffrement des volumes Docker en production

---

## 4. Securite CI/CD

### Points positifs
- Secrets GitHub utilises pour les credentials de deploiement
- Concurrency configuree pour eviter les deploiements simultanes
- Images Docker stockees sur GitHub Container Registry (prive)

### Risques identifies

| Severite | Probleme | Detail |
|----------|----------|--------|
| HAUTE | Cle SSH ecrite sur disque | `echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa` dans les workflows |
| HAUTE | Token GHCR expose dans les logs | `echo $GHCR_PAT \| docker login` peut fuiter |
| MOYENNE | Pas de branch protection | Pas de review requise avant merge sur production |
| MOYENNE | Pas de scan de vulnerabilites | Aucun scan d'image Docker (Trivy, Snyk) |
| BASSE | Pas de signature d'image | Images non signees avant deploiement |

### Recommandations
- [ ] Utiliser `webfactory/ssh-agent` au lieu d'ecrire la cle SSH sur disque
- [ ] Masquer le token avec `echo "${{ secrets.GHCR_PAT }}" | docker login ghcr.io --password-stdin`
- [ ] Activer les branch protection rules (review obligatoire, status checks)
- [ ] Ajouter un scan Trivy dans le pipeline avant push

---

## 5. Exposition de donnees

### Risques identifies

| Severite | Probleme | Detail |
|----------|----------|--------|
| CRITIQUE | Credentials dans l'historique git | Passwords, API keys, tokens exposes dans les commits |
| HAUTE | Cle API Mailgun exposee | Permet l'envoi d'emails arbitraires |
| MOYENNE | Upload fichiers sans validation MIME | Seule la taille est verifiee (5MB), pas le type reel |
| BASSE | Images de profil world-readable | Mode `0o644` dans le repertoire public |

### Recommandations
- [ ] Revoquer et regenerer toutes les cles exposees (Mailgun, Directus admin, Postgres)
- [ ] Purger l'historique git des credentials
- [ ] Valider le type MIME des fichiers uploades (allowlist)

---

## 6. Headers de securite manquants

| Header | Statut | Impact |
|--------|--------|--------|
| Content-Security-Policy (CSP) | Absent | Protection XSS |
| Strict-Transport-Security (HSTS) | Absent | Force HTTPS |
| X-Frame-Options | Absent | Protection clickjacking |
| X-Content-Type-Options | Absent | Empeche MIME sniffing |
| Referrer-Policy | Absent | Controle des referrers |

### Recommandation
- [ ] Configurer ces headers via le reverse proxy (Nginx/Caddy) ou Directus

---

## 7. Plan d'action prioritaire

### Immediat (avant mise en production)

1. **Revoquer les credentials exposes** : regenerer Mailgun API key, Directus admin password, Postgres password
2. **Generer des secrets forts** pour `DIRECTUS_KEY` et `DIRECTUS_SECRET` en production
3. **Retirer le port PostgreSQL** de l'exposition externe en production
4. **Ajouter `.env` au `.gitignore`** (verifier qu'il est bien ignore)

### Semaine 1

5. Pincer la version de Directus
6. Corriger le workflow CI/CD (SSH agent, masquage tokens)
7. Activer les branch protection rules
8. Configurer les cookies securises

### Semaine 2

9. Ajouter les headers de securite
10. Implementer le rate limiting
11. Ajouter un scan de vulnerabilites Docker
12. Valider les types MIME sur les uploads

### En continu

13. Rotation reguliere des secrets
14. Audit de dependances (`npm audit`)
15. Mise a jour des images Docker
16. Revue de securite periodique

---

## Resume

| Categorie | Critique | Haute | Moyenne | Basse |
|-----------|----------|-------|---------|-------|
| Auth & sessions | 1 | 1 | 2 | 0 |
| API | 2 | 1 | 1 | 0 |
| Docker | 1 | 2 | 1 | 0 |
| CI/CD | 0 | 2 | 2 | 1 |
| Donnees | 1 | 1 | 1 | 1 |
| Headers | 0 | 0 | 5 | 0 |
| **Total** | **5** | **7** | **12** | **2** |

> Note : certains risques identifies concernent le backend legacy (GraphQL/Apollo) qui n'est plus utilise en production (le frontend communique directement avec Directus). Ces risques sont neanmoins documentes car le code est encore present dans le repo.
