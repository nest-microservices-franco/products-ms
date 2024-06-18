FROM node:22-alpine3.19

RUN apk --no-cache add sqlite

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 8081