FROM node:14-slim as dep-builder

LABEL MAINTAINER https://github.com/DIYgod/RSSHub/

ARG USE_CHINA_NPM_REGISTRY=0;
ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1;

RUN ln -sf /bin/bash /bin/sh

RUN apt-get update && apt-get install -yq libgconf-2-4 apt-transport-https git dumb-init python build-essential --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
  echo 'use npm mirror'; yarn config set registry https://registry.npm.taobao.org; \
  fi;

RUN if [ "$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = 0 ]; then \
  apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y wget\
  && rm -rf /src/*.deb;\
  else \
  export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true;\
  fi;

RUN yarn install
RUN node tools/minify-docker.js && sh tools/clean-nm.sh

FROM node:14-slim as app

ENV NODE_ENV production
ENV TZ Asia/Shanghai

COPY . /app
COPY --from=dep-builder /app/node_modules /app/node_modules
COPY --from=dep-builder /usr/bin/dumb-init /usr/bin/dumb-init

EXPOSE 1200
ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]
