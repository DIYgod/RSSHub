FROM node:18-bullseye as dep-builder
# Here we use the non-slim image to provide build-time deps (compilers and python), thus no need to install later.
# This effectively speeds up qemu-based cross-build.

WORKDIR /app

# place ARG statement before RUN statement which need it to avoid cache miss
ARG USE_CHINA_NPM_REGISTRY=0
RUN \
    set -ex && \
    if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
        echo 'use npm mirror' && \
        npm config set registry https://registry.npmmirror.com && \
        yarn config set registry https://registry.npmmirror.com && \
        pnpm config set registry https://registry.npmmirror.com ; \
    fi;

COPY ./pnpm-lock.yaml /app/
COPY ./package.json /app/

# lazy install Chromium to avoid cache miss, only install production dependencies to minimize the image size
RUN \
    set -ex && \
    export PUPPETEER_SKIP_DOWNLOAD=true && \
    npm pkg delete scripts.prepare && \
    corepack enable pnpm && \
    pnpm install --prod --frozen-lockfile && \
    pnpm rb

# ---------------------------------------------------------------------------------------------------------------------

FROM debian:bullseye-slim as dep-version-parser
# This stage is necessary to limit the cache miss scope.
# With this stage, any modification to package.json won't break the build cache of the next two stages as long as the
# version unchanged.
# node:18-bullseye-slim is based on debian:bullseye-slim so this stage would not cause any additional download.

WORKDIR /ver
COPY ./package.json /app/
RUN \
    set -ex && \
    grep -Po '(?<="puppeteer": ")[^\s"]*(?=")' /app/package.json | tee /ver/.puppeteer_version && \
    grep -Po '(?<="@vercel/nft": ")[^\s"]*(?=")' /app/package.json | tee /ver/.nft_version && \
    grep -Po '(?<="fs-extra": ")[^\s"]*(?=")' /app/package.json | tee /ver/.fs_extra_version

# ---------------------------------------------------------------------------------------------------------------------

FROM node:18-bullseye-slim as docker-minifier
# The stage is used to further reduce the image size by removing unused files.

WORKDIR /minifier
COPY --from=dep-version-parser /ver/* /minifier/

ARG USE_CHINA_NPM_REGISTRY=0
RUN \
    set -ex && \
    if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
        npm config set registry https://registry.npmmirror.com && \
        yarn config set registry https://registry.npmmirror.com && \
        pnpm config set registry https://registry.npmmirror.com ; \
    fi; \
    corepack enable pnpm && \
    pnpm add @vercel/nft@$(cat .nft_version) fs-extra@$(cat .fs_extra_version) --save-prod

COPY . /app
COPY --from=dep-builder /app /app

RUN \
    set -ex && \
    cp /app/scripts/docker/minify-docker.js /minifier/ && \
    export PROJECT_ROOT=/app && \
    node /minifier/minify-docker.js && \
    rm -rf /app/node_modules /app/scripts && \
    mv /app/app-minimal/node_modules /app/ && \
    rm -rf /app/app-minimal && \
    ls -la /app && \
    du -hd1 /app

# ---------------------------------------------------------------------------------------------------------------------

FROM node:18-bullseye-slim as chromium-downloader
# This stage is necessary to improve build concurrency and minimize the image size.
# Yeah, downloading Chromium never needs those dependencies below.

WORKDIR /app
COPY ./.puppeteerrc.js /app/
COPY --from=dep-version-parser /ver/.puppeteer_version /app/.puppeteer_version

ARG TARGETPLATFORM
ARG USE_CHINA_NPM_REGISTRY=0
ARG PUPPETEER_SKIP_DOWNLOAD=1
# The official recommended way to use Puppeteer on x86(_64) is to use the bundled Chromium from Puppeteer:
# https://pptr.dev/faq#q-why-doesnt-puppeteer-vxxx-work-with-chromium-vyyy
RUN \
    set -ex ; \
    if [ "$PUPPETEER_SKIP_DOWNLOAD" = 0 ] && [ "$TARGETPLATFORM" = 'linux/amd64' ]; then \
        if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
            npm config set registry https://registry.npmmirror.com && \
            yarn config set registry https://registry.npmmirror.com && \
            pnpm config set registry https://registry.npmmirror.com ; \
        fi; \
        echo 'Downloading Chromium...' && \
        unset PUPPETEER_SKIP_DOWNLOAD && \
        corepack enable pnpm && \
        pnpm add puppeteer@$(cat /app/.puppeteer_version) --save-prod && \
        pnpm rb ; \
    else \
        mkdir -p /app/node_modules/.cache/puppeteer ; \
    fi;

# ---------------------------------------------------------------------------------------------------------------------

FROM node:18-bullseye-slim as app

LABEL org.opencontainers.image.authors="https://github.com/DIYgod/RSSHub"

ENV NODE_ENV production
ENV TZ Asia/Shanghai

WORKDIR /app

# install deps first to avoid cache miss or disturbing buildkit to build concurrently
ARG TARGETPLATFORM
ARG PUPPETEER_SKIP_DOWNLOAD=1
# https://pptr.dev/troubleshooting#chrome-headless-doesnt-launch-on-unix
# https://github.com/puppeteer/puppeteer/issues/7822
# https://www.debian.org/releases/bullseye/amd64/release-notes/ch-information.en.html#noteworthy-obsolete-packages
# The official recommended way to use Puppeteer on arm/arm64 is to install Chromium from the distribution repositories:
# https://github.com/puppeteer/puppeteer/blob/07391bbf5feaf85c191e1aa8aa78138dce84008d/packages/puppeteer-core/src/node/BrowserFetcher.ts#L128-L131
RUN \
    set -ex && \
    apt-get update && \
    apt-get install -yq --no-install-recommends \
        dumb-init \
    ; \
    if [ "$PUPPETEER_SKIP_DOWNLOAD" = 0 ]; then \
        if [ "$TARGETPLATFORM" = 'linux/amd64' ]; then \
            apt-get install -yq --no-install-recommends \
                ca-certificates fonts-liberation wget xdg-utils \
                libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 \
                libexpat1 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
                libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 \
            ; \
        else \
            apt-get install -yq --no-install-recommends \
                chromium \
            && \
            echo 'CHROMIUM_EXECUTABLE_PATH=chromium' | tee /app/.env ; \
        fi; \
    fi; \
    rm -rf /var/lib/apt/lists/*

COPY --from=chromium-downloader /app/node_modules/.cache/puppeteer /app/node_modules/.cache/puppeteer

# if grep matches nothing then it will exit with 1, thus, we cannot `set -e` here
RUN \
    set -x && \
    if [ "$PUPPETEER_SKIP_DOWNLOAD" = 0 ] && [ "$TARGETPLATFORM" = 'linux/amd64' ]; then \
        echo 'Verifying Chromium installation...' && \
        ldd $(find /app/node_modules/.cache/puppeteer/ -name chrome -type f) | grep "not found" ; \
        if [ "$?" = 0 ]; then \
            echo "!!! Chromium has unmet shared libs !!!" && \
            exit 1 ; \
        else \
            echo "Awesome! All shared libs are met!" ; \
        fi; \
    fi;

COPY --from=docker-minifier /app /app

EXPOSE 1200
ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]

# ---------------------------------------------------------------------------------------------------------------------

# In case Chromium has unmet shared libs, here is some magic to find and install the packages they belong to:
# In most case you can just stop at `grep ^lib` and add those packages to the above stage.
#
# set -ex && \
# apt-get update && \
# apt install -yq --no-install-recommends \
#     apt-file \
# && \
# apt-file update && \
# ldd $(find /app/node_modules/.cache/puppeteer/ -name chrome -type f) | grep -Po "\S+(?= => not found)" | \
# sed 's/\./\\./g' | awk '{print $1"$"}' | apt-file search -xlf - | grep ^lib | \
# xargs -d '\n' -- \
#     apt-get install -yq --no-install-recommends \
# && \
# apt purge -yq --auto-remove \
#     apt-file \
# rm -rf /tmp/.chromium_path /var/lib/apt/lists/*

# !!! If you manually build Docker image but with buildx/BuildKit disabled, set TARGETPLATFORM yourself !!!
