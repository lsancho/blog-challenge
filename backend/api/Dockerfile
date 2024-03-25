# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
RUN npm i -g pnpm

FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

FROM base AS deploy
WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build  /app/node_modules ./node_modules
CMD [ "node", "dist/index.js" ]

# docker build . -t blog-challenge-api
# docker run -p 127.0.0.1:8080:8080/tcp --env-file ../../.env blog-challenge-api