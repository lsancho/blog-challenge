# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN npm i -g pnpm

FROM base AS dependencies
COPY package.json pnpm-lock.yaml .npmrc .env.production ./
RUN pnpm install

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

FROM base AS deploy
WORKDIR /app
COPY --from=dependencies /app/package.json /app/pnpm-lock.yaml /app/.npmrc /app/.env.production ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist/ ./dist/
CMD [ "pnpm", "preview" ]

# docker build . -t blog-challenge-app
# docker run -p 127.0.0.1:5000:8081/tcp --env-file ../.env blog-challenge-app