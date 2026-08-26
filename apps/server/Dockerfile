FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace definitions
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/server/package*.json ./apps/server/

RUN npm install

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Build packages
RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/server run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/server/package*.json ./apps/server/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 5000

CMD ["npm", "--workspace=apps/server", "run", "start"]
