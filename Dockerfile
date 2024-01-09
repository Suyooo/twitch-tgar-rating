FROM node:20-alpine AS build
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm ci
COPY --chown=node:node . .
RUN npm run build

FROM node:20-alpine
RUN mkdir -p /home/node/app/build && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
COPY --from=build --chown=node:node /home/node/app/build ./build
USER node
EXPOSE 3000
EXPOSE 3001
CMD [ "node", "build" ]