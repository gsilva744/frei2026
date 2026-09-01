# API da Feira Frei 2026 — Node.js + Express (ESM).
# Imagem final não carrega devDependencies nem código de teste.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY db ./db

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 5050

# Aplica migrations pendentes (idempotente: cada uma roda só uma vez, controlado pela
# tabela _migrations) antes de subir o servidor.
CMD ["sh", "-c", "node db/migrate.js && node src/server.js"]
