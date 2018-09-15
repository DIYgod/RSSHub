FROM node:10.3.0-slim
MAINTAINER soulteary<soulteary@gmail.com>
RUN apt-get update && apt-get install -yq libgconf-2-4 apt-transport-https

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY ./package.json  .
RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

ARG USE_CHINA_NPM_REGISTRY=0
RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then echo 'use npm mirror'; npm install --production --vb --registry=https://registry.npm.taobao.org; else npm install --production; fi;

COPY . .

CMD node index.js
