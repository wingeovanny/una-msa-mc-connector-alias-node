ARG NODE_VERSION=16.15.0

# Build stage
FROM node:$NODE_VERSION-alpine AS build

ARG NPM_VERSION=8.11.0

COPY package*.json ./
COPY .npmrc .

RUN npm i -g npm@${NPM_VERSION}

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:$NODE_VERSION-alpine as production

COPY --from=egc67676.live.dynatrace.com/linux/oneagent-codemodules-musl:nodejs / /
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so


COPY --from=build /dist ./dist
COPY --from=build /node_modules ./node_modules

EXPOSE 80

CMD [ "npm", "start" ]
