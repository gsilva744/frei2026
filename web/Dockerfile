# Hotsite da Feira Frei 2026 — TanStack Start (SSR), buildado como servidor Node
# autônomo (nitro preset "node-server", não o "cloudflare-module" usado no deploy
# via Cloudflare Worker). VITE_API_URL precisa ser conhecida em tempo de build:
# o Vite embute variáveis VITE_* no bundle do cliente, não é possível trocá-la
# depois só reiniciando o container.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV NITRO_PRESET=node-server
RUN npm run build

# O build do nitro (preset node-server) gera um servidor autocontido em
# .output/server — não depende de node_modules em tempo de execução.
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.output ./.output

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
