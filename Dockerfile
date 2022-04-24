FROM node:14-buster-slim as dep-builder

LABEL MAINTAINER https://github.com/DIYgod/RSSHub/

ARG USE_CHINA_NPM_REGISTRY=0
ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

RUN ln -sf /bin/bash /bin/sh
RUN apt-get update && apt-get install -yq libgconf-2-4 apt-transport-https git dumb-init python3 build-essential --no-install-recommends

WORKDIR /app

COPY ./yarn.lock /app
COPY ./package.json /app

RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
  echo 'use npm mirror'; npm config set registry https://registry.npmmirror.com; \
  fi;

RUN npm i -g npm

RUN if [ "$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = 0 ]; then \
  unset PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ;\
  else \
  export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true ;\
  fi;

RUN yarn --frozen-lockfile --network-timeout 1000000
COPY . /app
RUN node scripts/docker/minify-docker.js


FROM node:14-slim as app

ENV NODE_ENV production
ENV TZ Asia/Shanghai
ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

WORKDIR /app
COPY . /app
COPY --from=dep-builder /app/app-minimal/node_modules /app/node_modules
COPY --from=dep-builder /usr/bin/dumb-init /usr/bin/dumb-init

RUN if [ "$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = 0 ]; then \
  apt-get update \
  && apt-get install -y wget gnupg ca-certificates --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && set -ex \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
  ca-certificates \
  fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
  libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
  libxrender1 libxss1 libxtst6 lsb-release \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y wget gnupg; \
  fi;

EXPOSE 1200
ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]
