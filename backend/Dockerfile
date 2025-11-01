# Etapa 1 — Build
FROM node:20 AS builder
WORKDIR /app

# Copia arquivos de configuração
COPY package*.json tsconfig*.json ./
COPY src/prisma ./prisma
COPY src ./src

# Instala dependências
RUN npm install

# Gera Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Etapa 2 — Runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Copia arquivos necessários do build
COPY --from=builder /app/package*.json ./ 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig*.json ./

# Variáveis padrão
ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

# Comando flexível para dev/prod
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'production' ]; then npm run start:prod; else npm run start:dev; fi"]
