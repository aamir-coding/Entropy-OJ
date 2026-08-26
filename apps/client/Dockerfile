FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/client/package*.json ./apps/client/

RUN npm install

COPY packages/shared ./packages/shared
COPY apps/client ./apps/client

RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/client run build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
