---
sidebar: auto
---

# Deployment

RSSHub provides a painless deployment process if you are equipped with basic programming knowledge, you may open an [issue](https://github.com/DIYgod/RSSHub/issues/new) if you believe you have encountered a problem not listed [here](https://github.com/DIYgod/RSSHub/issues), the community will try to sort it out asap.

The deployment may involve the followings:

1. Command line interface
1. [Git](https://git-scm.com/)
1. [Node.js >= 8.0.0](https://nodejs.org/)
1. [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/zh-Hans/docs/install)

Deploy for public access may require:

1. [Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
1. [Docker](https://www.docker.com/get-started) or [docker-compose](https://docs.docker.com/compose/install/)
1. [Redis](https://redis.io/download)
1. [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
1. [Google App Engine](https://cloud.google.com/appengine/)

## Manual Deployment

Manually deploy a new `RSSHub` instance to a location of your choice.

### Download RSSHub

Execute the following commands to download the source code

```bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

Execute the following commands to install dependencies

Using `npm`

```bash
$ npm install
```

Or `yarn`

```bash
$ yarn
```

### Launch

Under `RSSHub`'s root directory, execute the following commands to launch

```bash
$ npm start
```

Or

```bash
$ yarn start
```

Visit [http://127.0.0.1:1200/](http://127.0.0.1:1200/), and enjoy it! ✅

::: tip tip

Refer to our [Guide](https://docs.rsshub.app/) for usage. Replace `https://rsshub.app/` with `http://localhost:1200` in any route example to see the effect.

:::

### Update

Under `RSSHub`'s directory, execute the following commands to pull the latest source code for `RSSHub`

```bash
$ git pull
```

### Configuration

`RSSHub` reads its configurations from `lib/config.js` or system environment variables.

**How to set system environment variables**

Under Windows, enter `$ set PORT=1000` in cmd

Under UNIX-based OS, enter `$ PORT=1000` in terminal

Enter `$ npm start` to start a `RSSHub` install with port `1000`.

System environment variables set here will be purged after closing cmd/terminal, if you want persist the variables, you can create a simple [batch script](https://en.wikipedia.org/wiki/Batch_file) or [shell script](https://en.wikipedia.org/wiki/Shell_script).

To configure more options please refer to [Settings](#Settings).

### Use Redis for caching

By default, `RSSHub` caches everything for 5 minutes in RAM. Redis support is built-in.

::: tip tips

Unless you are expecting high traffic or deploying in cluster-mode, Redis is not necessary.

:::

Change `CACHE_TYPE` to `redis`, RSSHub will try to connect to `redis://localhost:6379/`. For changing the target address, please refer to [Settings](#Settings).

## Docker Deployment

Execute the following command to pull RSSHub's docker image.

```bash
$ docker pull diygod/rsshub
```

Start a RSSHub container

```bash
$ docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

Visit [http://127.0.0.1:1200/](http://127.0.0.1:1200/), and enjoy it! ✅

Execute the following command to stop `RSSHub`.

```bash
$ docker stop rsshub
```

### Configuration

The simplest way to configure RSSHub container is via system environment variables.

For example, adding `-e CACHE_EXPIRE=3600` will set the cache time to 1 hour.

```bash
$ docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 -e GITHUB_ACCESS_TOKEN=example diygod/rsshub
```

To configure more options please refer to [Settings](#Settings).

### docker-compose Deployment

1.  Create a docker volume to persist Redis caches

```bash
$ docker volume create redis-data
```

2.  Change `environment` section in [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml) to configure the corresponding option

    -   `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1` skips puppeteer Chromium installation. Default to 1, requires `puppeteerWSEndpoint` in `lib/config.js` to be set with a remote Chrome Websocket address, otherwise relevant routes will not work.
    -   `USE_CHINA_NPM_REGISTRY=1` avoids GFW npm registry interference in mainland China. Default to 0.

3.  Deploy

```bash
$ docker-compose up
```

4.  Update

```bash
$ docker-compose build
$ docker-compose up
```

## Heroku Deployment

[![Deploy](https://i.imgur.com/e6ZcmUY.png)](https://heroku.com/deploy?template=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub)

## Google App Engine(GAE) Deployment

### Before You Begin

Follow the [official guide](https://cloud.google.com/appengine/docs/flexible/nodejs/quickstart) for completing your GCP account settings, creating a new Node project, adding billing information (required), installing git and initializing gcloud([link](https://cloud.google.com/sdk/gcloud/)). Node.js is not required if you don't plan to debug RSSHub locally.

Please note, GAE free tier doesn't support Flexible Environment, please check the pricing plan prior to deployment.

Node.js standard environment is still under beta, unknown or unexpected errors might be encountered during the deployment.

### Pull

Execute `git clone https://github.com/DIYgod/RSSHub.git` to pull the latest code

### app.yaml Settings

#### Deploy to Flexible Environment

Under RSSHub's root directory, create a file `app.yaml` with the following content：

```yaml
# [START app_yaml]
runtime: custom
env: flex

# This sample incurs costs to run on the App Engine flexible environment.
# The settings below are to reduce costs during testing and are not appropriate
# for production use. For more information, see:
# https://cloud.google.com/appengine/docs/flexible/nodejs/configuring-your-app-with-app-yaml
manual_scaling:
    instances: 1
# app engine resources, adjust to suit your needs, the required disk space is 10 GB
resources:
    cpu: 1
    memory_gb: 0.5
    disk_size_gb: 10
network:
    forwarded_ports:
        - 80:1200
        - 443:1200
# environment variables section, refer to Settings
env_variables:
    CACHE_EXPIRE: '300'
# [END app_yaml]
```

#### Deploy to standard environment

Under RSSHub's root directory, create a file `app.yaml` with the following content：

```yaml
# [START app_yaml]
runtime: nodejs8

network:
    forwarded_ports:
        - 80:1200
        - 443:1200
# environment variables section, refer to Settings
env_variables:
    CACHE_EXPIRE: '300'
# [END app_yaml]
```

### Launch

Under RSSHub's root directory, execute the following commands to launch RSSHub

```bash
gcloud app deploy
```

For changing the deployment project id or version id, please refer to `Deploying a service` section [here](https://cloud.google.com/appengine/docs/flexible/nodejs/testing-and-deploying-your-app).

You can access your `Google App Engine URL` to check the deployment status

## Setting

### Application Settings

`RSSHub` reads its configurations from `lib/config.js` or environment variables.

::: tip

Use environment variables is recommended to avoid conflicts during upgrade.

:::

`PORT`: listening port, default to `1200`

`SOCKET`: listening Unix Socket, default to `null`

`CACHE_TYPE`: cache type, `memory` or `redis`, empty this value will disable caching, default to `memory`

`CACHE_EXPIRE`: cache expiry time in seconds, default to `300`

`LISTEN_INADDR_ANY`: open up for external access, default to `1`

`TITLE_LENGTH_LIMIT`: limit the length of feed title generated in bytes, an English alphabet counts as 1 byte, the rest such as Chinese, Japanese, Korean or Arabic counts as 2 bytes by design, default to `100`

`REDIS_URL`: Redis target address（invalid when `CACHE_TYPE` is set to memory）, default to `redis://localhost:6379/`

`REDIS_PASSWORD`: Redis password（invalid when `CACHE_TYPE` is set to memory)

`HTTP_BASIC_AUTH_NAME`: Http basic authentication username, default to `usernam3`, please change asap

`HTTP_BASIC_AUTH_PASS`: Http basic authentication password, default to `passw0rd`, please change asap

`LOGGER_LEVEL`: specifies the maximum [level](https://github.com/winstonjs/winston#logging-levels) of messages to the console and log file, default to `info`

### User Authentication

Routes in `protected_route.js` will be protected using HTTP Basic Authentication.

When adding feeds using RSS readers with HTTP Basic Authentication support, authentication information is required, eg：http://usernam3:passw0rd@localhost:1200/protected/rsshub/rss.

### Route-specific Configurations

-   `pixiv`: [registration](https://accounts.pixiv.net/signup)

    -   `PIXIV_USERNAME`: Pixiv username

    -   `PIXIV_PASSWORD`: Pixiv password

-   `disqus`: [API Key application](https://disqus.com/api/applications/)

    -   `DISQUS_API_KEY`: Disqus API

-   `twitter`: [application creation](https://apps.twitter.com)

    -   `TWITTER_CONSUMER_KEY`: Twitter Consumer Key

    -   `TWITTER_CONSUMER_SECRET`: Twitter Consumer Secret

    -   `TWITTER_ACCESS_TOKEN`: Twitter Access Token

    -   `TWITTER_ACCESS_TOKEN_SECRET`: Twitter Access Token Secret

-   `youtube`: [API Key application](https://console.developers.google.com/)

    -   `YOUTUBE_KEY`: YouTube API Key

-   `telegram`: [Bot application](https://telegram.org/blog/bot-revolution)

    -   `TELEGRAM_TOKEN`: Telegram bot token

-   `github`: [Access Token application](https://github.com/settings/tokens)

    -   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

### Access Control

Access control includes a whitelist and a blacklist, which is configured via `middleware/access-control.js` or environment variables.

Support `IP` and `Route`, use `,` as the delimiter to separate multiple values. When both are defined, values in `BLACKLIST` will be disregarded.

-   `BLACKLIST`: the blacklist

-   `WHITELIST`: the blacklist. When set, values in `BLACKLIST` are disregarded.
