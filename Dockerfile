FROM node:10.13.0-slim
LABEL MAINTAINER https://github.com/DIYgod/RSSHub/

RUN apt-get update && apt-get install -yq libgconf-2-4 apt-transport-https

ENV NODE_ENV production

WORKDIR /app

COPY package.json /app

ARG USE_CHINA_NPM_REGISTRY=0;

RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
  echo 'use npm mirror'; npm config set registry https://registry.npm.taobao.org; \
  fi;

ARG PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1;

RUN if [ "$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = 0 ]; then \
  apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y curl \
  && rm -rf /src/*.deb \
  && npm install --production; \
  else \
  export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && \
  npm install --production; \
  fi;

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY . /app

EXPOSE 1200
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
