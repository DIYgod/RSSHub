FROM keymetrics/pm2:8-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "./"]
RUN yarn --ignore-engines --prod -s && mv node_modules ../
COPY . .
EXPOSE 1200
CMD pm2-runtime start process.json
