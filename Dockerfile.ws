# Dockerfile for stateful WebSocket server
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps
RUN npx prisma generate

COPY . .

# Build step if needed, but for the ws-server we can run it directly with tsx
EXPOSE 3001

CMD ["npx", "tsx", "server/ws-server.ts"]
