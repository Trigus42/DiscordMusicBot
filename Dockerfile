# syntax=docker/dockerfile:1

FROM node:current as builder

ENV NODE_ENV=production
WORKDIR /app

COPY ./package-lock.json /app/package-lock.json
COPY ./package.json /app/package.json
COPY ./patches /app/patches
COPY ./src /app/src
COPY ./tsconfig.json /app/tsconfig.json

RUN \
    npm ci --only=production; \
    npm run build


FROM node:current-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV CONFIG_DIR=/config
ENV NODE_ENV=production
ENV HOST=docker

RUN \
    apt-get update; \
    apt-get install ffmpeg --no-install-recommends -y

COPY ./config /app/config
COPY ./docker-run.sh /

RUN \
    --mount=type=bind,from=builder,src=/app,dst=/mnt/builder/ \
    mkdir -p /app /config; \
    cp /mnt/builder/package.json /app; \
    cp -r /mnt/builder/build /app; \
    cp -r /mnt/builder/node_modules /app

CMD ["/bin/bash", "/docker-run.sh"]