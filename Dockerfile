FROM node:10-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY ["package.json", "./"]

RUN yarn --ignore-engines --prod -s && mv node_modules ../

COPY . /usr/src/app

EXPOSE 1200

CMD ["npm", "start"] 