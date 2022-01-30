# syntax=docker/dockerfile:1

FROM node
ENV NODE_ENV=production

WORKDIR /app

RUN \
    apt update; \
    apt install ffmpeg -y

COPY ./build /app/build
COPY ./config /app/config
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install

CMD ["node", "--no-deprecation", "build/index.js"]