FROM node:22-alpine AS builder
WORKDIR /usr/src/app

ARG VITE_GRAPHQL_ENDPOINT
ARG VITE_BACKEND_URL
ARG VITE_BACKEND_PROVIDER
ARG VITE_IMAGE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DIRECTUS_URL
ARG VITE_XANO_API_URL

ENV VITE_GRAPHQL_ENDPOINT=${VITE_GRAPHQL_ENDPOINT}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_BACKEND_PROVIDER=${VITE_BACKEND_PROVIDER}
ENV VITE_IMAGE_URL=${VITE_IMAGE_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL}
ENV VITE_XANO_API_URL=${VITE_XANO_API_URL}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /usr/src/app

# Crée un utilisateur non-root
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copie le build et la config Vite (nécessaire pour vite preview)
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/vite.config.ts ./

RUN chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4173/ || exit 1

CMD ["npm", "run", "preview"]