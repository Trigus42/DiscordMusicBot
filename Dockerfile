# syntax=docker/dockerfile:1

FROM node:17
ENV NODE_ENV=production

WORKDIR /app

RUN \
    apt update; \
    apt install ffmpeg -y

COPY ./config /app/config
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json /app/package.json
COPY ./patches /app/patches

RUN \
    npm install; \
    npm run build

CMD ["node", "--no-deprecation", "build/index.js"]