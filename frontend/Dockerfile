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

ENV VITE_GRAPHQL_ENDPOINT=${VITE_GRAPHQL_ENDPOINT} \
    VITE_BACKEND_URL=${VITE_BACKEND_URL} \
    VITE_BACKEND_PROVIDER=${VITE_BACKEND_PROVIDER} \
    VITE_IMAGE_URL=${VITE_IMAGE_URL} \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL} \
    VITE_XANO_API_URL=${VITE_XANO_API_URL}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fs http://localhost/ > /dev/null || exit 1