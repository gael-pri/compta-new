# Étape 1 : Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Installe les dépendances
COPY package*.json ./
RUN npm ci

# Copie le code source et build TypeScript
COPY . .
RUN npm run build

# Étape 2 : Runner
FROM node:22-alpine

WORKDIR /usr/src/app

# Crée un utilisateur non-root
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Seules les dépendances de prod sont installées
COPY package*.json ./
RUN npm ci --omit=dev

# Copie le build généré
COPY --from=builder /usr/src/app/dist ./dist

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/ || exit 1
  
CMD ["npm", "run", "start:prod"]
