FROM node:10.3.0-slim

MAINTAINER soulteary<soulteary@gmail.com>

ENV NODE_ENV production

WORKDIR /usr/src/app

ADD ./package.json  .

ARG USE_CHINA_NPM_REGISTRY=0
RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then echo 'use npm mirror'; npm install --production --vb --registry=https://registry.npm.taobao.org; else npm install --production; fi;

ADD . .

CMD node index.js
