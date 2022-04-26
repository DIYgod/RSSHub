FROM node:16-bullseye-slim as dep-builder

# bash has already been the default shell
#RUN ln -sf /bin/bash /bin/sh

# these deps are no longer needed since we use yarn instead of npm to install dependencies
# the installation of dumb-init has been moved to the app stage to improve concurrency and speed up builds on arm/arm64
#RUN \
#    set -ex && \
#    apt-get update && \
#    apt-get install -yq --no-install-recommends \
#        libgconf-2-4 apt-transport-https git dumb-init python3 build-essential \
#    && \
#    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# place ARG statement before RUN statement which need it to avoid cache miss
ARG USE_CHINA_NPM_REGISTRY=0
RUN \
    set -ex && \
    if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
        echo 'use npm mirror' && \
        npm config set registry https://registry.npmmirror.com; \
    fi;

COPY ./yarn.lock /app/
COPY ./package.json /app/

# lazy install Chromium to avoid cache miss, only install production dependencies to minimize the image size
RUN \
    set -ex && \
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && \
    yarn install --production --frozen-lockfile --network-timeout 1000000 && \
    yarn cache clean


FROM debian:bullseye-slim as dep-version-parser
# This stage is necessary to limit the cache miss scope.
# With this stage, any modification to package.json won't break the build cache of the next two stages as long as the
# version unchanged.
# node:16-bullseye-slim is based on debian:bullseye-slim so this stage would not cause any additional download.

WORKDIR /ver
COPY ./package.json /app/
RUN \
    set -ex && \
    grep -Po '(?<="puppeteer": ")[^\s"]*(?=")' /app/package.json | tee /ver/.puppeteer_version && \
    grep -Po '(?<="@vercel/nft": ")[^\s"]*(?=")' /app/package.json | tee /ver/.nft_version && \
    grep -Po '(?<="fs-extra": ")[^\s"]*(?=")' /app/package.json | tee /ver/.fs_extra_version


FROM node:16-bullseye-slim as docker-minifier
# The stage is used to further reduce the image size by removing unused files.

WORKDIR /minifier
COPY --from=dep-version-parser /ver/* /minifier/

ARG USE_CHINA_NPM_REGISTRY=0
RUN \
    set -ex && \
    if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
        npm config set registry https://registry.npmmirror.com; \
    fi; \
    yarn add @vercel/nft@$(cat .nft_version) fs-extra@$(cat .fs_extra_version) && \
    yarn cache clean

COPY . /app
COPY --from=dep-builder /app /app

RUN \
    set -ex && \
    cp /app/scripts/docker/minify-docker.js /minifier/ && \
    export PROJECT_ROOT=/app && \
    node /minifier/minify-docker.js && \
    rm -rf /app/node_modules /app/scripts && \
    cp -r /app/app-minimal/node_modules /app/ && \
    rm -rf /app/app-minimal && \
    ls -la /app && \
    du -hd1 /app


FROM node:16-bullseye-slim as chromium-downloader
# This stage is necessary to improve build concurrency and minimize the image size.
# Yeah, downloading Chromium never needs those dependencies below.

WORKDIR /app
COPY --from=dep-version-parser /ver/.puppeteer_version /app/.puppeteer_version

ARG USE_CHINA_NPM_REGISTRY=0
ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
# https://github.com/puppeteer/puppeteer#q-why-doesnt-puppeteer-vxxx-work-with-chromium-vyyy
RUN \
    set -ex ; \
    if [ "$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = 0 ]; then \
        if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
            npm config set registry https://registry.npmmirror.com; \
        fi; \
        echo 'Downloading Chromium...' && \
        unset PUPPETEER_SKIP_CHROMIUM_DOWNLOAD && \
        yarn add puppeteer@$(cat /app/.puppeteer_version) && \
        yarn cache clean ; \
    else \
        mkdir -p /app/node_modules/puppeteer ; \
    fi;


FROM node:16-bullseye-slim as app

LABEL org.opencontainers.image.authors="https://github.com/DIYgod/RSSHub"

ENV NODE_ENV production
ENV TZ Asia/Shanghai

WORKDIR /app

# install deps first to avoid cache miss or disturbing buildkit to build concurrently
ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
# https://github.com/puppeteer/puppeteer/issues/7822
# https://www.debian.org/releases/bullseye/amd64/release-notes/ch-information.en.html#noteworthy-obsolete-packages
RUN \
    set -ex && \
    apt-get update && \
    apt-get install -yq --no-install-recommends \
        dumb-init \
    ; \
    if [ "$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = 0 ]; then \
        apt-get install -yq --no-install-recommends \
            ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
            libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
            libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
            libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils \
            libayatana-appindicator3-1 \
    ; \
    fi; \
    rm -rf /var/lib/apt/lists/*

COPY --from=chromium-downloader /app/node_modules/puppeteer /app/node_modules/puppeteer
COPY --from=docker-minifier /app /app

EXPOSE 1200
ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]
