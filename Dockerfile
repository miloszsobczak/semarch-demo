FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/api/package.json packages/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/web/package.json packages/web/package.json
COPY packages/worker/package.json packages/worker/package.json
RUN npm ci
COPY tsconfig.json tsconfig.base.json ./
COPY packages ./packages
RUN npm run build

FROM build AS api
CMD ["node", "packages/api/dist/server.js"]

FROM build AS worker
CMD ["node", "packages/worker/dist/run.js"]
