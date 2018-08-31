---
sidebar: auto
---

# Deployment

RSSHub provides painless deployment, you may open an [issue](https://github.com/DIYgod/RSSHub/issues/new) if you believe you have encountered a problem not listed [here](https://github.com/DIYgod/RSSHub/issues), the community will try to sort it out asap.

## Manual Deployment

Manually deploy a new `RSSHub` instance to a location of your choice.

## System requirement

Please ensure you have installed both [Git](https://git-scm.com/) and [Node.js >= 8.0.0](https://nodejs.org/).

### Install Git

::: tip

Entering `git` to check whether Git is already installed：

Use `cmd` for windows, use `terminal` for UNIX-based OS including macOS.

```bash
$ git
usage: git [--version] [--help] [-C <path>] [-c name=value]
...
```

:::

-   Windows：Download Git [from git's official website](https://git-scm.com/downloads).
-   macOS：Use [Homebrew](https://brew.sh/) `$ brew install git` or [download from git's official website](https://git-scm.com/download/mac).
-   UNIX: your package manager `$ sudo apt-get install git`.

### Install Node.JS

#### Windows

Windows users please download [from node's official website](https://nodejs.org/zh-cn/). During the installation, please check `Add to PATH` option.

#### UNIX-based

The easiest way to install NodeJS is using [nvm](https://github.com/creationix/nvm).

Install `nvm`

```bash
$ curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | sh
```

Upon completion please restart your terminal to install `Node.js`.

```bash
$ nvm install node
```

### Download RSSHub

Execute the following commands to download the source code

```bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

Execute the following commands to the dependencies

```bash
$ npm install
```

::: tip

[Yarn](https://yarn.bootcss.com/) is recommended over `npm` for its performance and stability

Use `Yarn` simplifies the dependency installation process

```bash
$ yarn
```

:::

### Launch

Under `RSSHub`'s root directory, execute the following commands to launch

```bash
$ npm start
```

Visit [http://127.0.0.1:1200/](http://127.0.0.1:1200/), and enjoy it! ✅

### Update

Under `RSSHub`'s directory, execute the following commands to pull the latest source code for `RSSHub`

```bash
$ git pull
```

### Configuration

`RSSHub` reads its configurations from `config.js` or system environment variables.

**How to set system environment variables**

Under Windows, enter `$ set PORT=1000` in cmd

Under UNIX-based OS, enter `$ PORT=1000` in terminal

Enter `$ npm start` to start a `RSSHub` install with port `1000`.

System environment variables set here will be purged after closing cmd/terminal, if you want persist the variables, you can create a simple [batch script](https://en.wikipedia.org/wiki/Batch_file) or [shell script](https://en.wikipedia.org/wiki/Shell_script).

To configure more options please refer to [Settings](#Settings).

### Use Redis for caching

By default, `RSSHub` caches everything for 5 minutes in RAM. Redis support is built-in.

::: tip

Unless you are expecting high traffic or deploying in cluster-mode, Redis is not necessary.

:::

#### Install Redis

**Windows**

Please download Redis for Windows from [Redis' github](https://github.com/MicrosoftArchive/redis/releases).

Under your installation directory, execute the following commands to start Redis.

```bash
$ redis-server  redis.windows.conf
```

**MacOS**

Use [Homebrew](https://brew.sh/) to install Redis.

```bash
$ brew install redis
```

Execute the following commands to start Redis.

```bash
$ brew services start redis
```

**UNIX-based**

Use your package manager to install Redis.

```bash
# apt
$ sudo apt install redis-server

# yum
$ sudo yum install redis
```

Execute `$ redis-server` to start Redis.

#### Enable RSSHub to Redis as the caching backend

Change `CACHE_TYPE` to `redis`, RSSHub will try to connect to `redis://localhost:6379/`. For changing the target address, please refer to [Settings](#Settings).

## Docker Deployment

Docker is the most popular containerization technology, it simplifies the deployment process down to one line of code.

### Install Docker

Please refer to [Docker's official guide](https://docs.docker.com/engine/installation/)

### Deployment

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

### Update

Execute the following command to pull the latest `RSSHub` docker image.

```bash
# stop the current rsshub container
$ docker stop rsshub

# delete the existing rsshub container
$ docker rm rsshub

# pull the latest rsshub image
$ docker pull diygod/rsshub
```

### Configuration

The simplest way to configure RSSHub container is via system environment variables.

For example, adding `-e CACHE_EXPIRE=3600` will set the cache time to 1 hour.

```bash
$ docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 -e GITHUB_ACCESS_TOKEN=example diygod/rsshub
```

To configure more options please refer to [Settings](#Settings).

### Docker-compose Deployment

[docker-compose](https://docs.docker.com/compose/overview/) simplifies multi-container deployment process：

1.  Create a docker volume to persist Redis caches

```bash
$ docker volume create redis-data
```

2.  Change `environment` section in [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml) to configure the corresponding option

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

Please note, GAE free tier doesn't support Flexible Environment , please check the pricing plan prior to deployment.

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

`RSSHub` reads its configurations from `config.js` or environment variables.

::: tip

Use environment variables is recommended to avoid conflicts during upgrade.

:::

`PORT`: listening port, default to `1200`

`SOCKET`: listening Unix Socket, default to `null`

`CACHE_TYPE`: cache type, `memory` or `redis`, empty this value will disable caching, default to `memory`

`CACHE_EXPIRE`: cache expiry time in seconds, default to `300`

`LISTEN_INADDR_ANY`: open up for external access, default to `1`

`REDIS_URL`: Redis target address（invalid when `CACHE_TYPE` is set to memory）, default to `redis://localhost:6379/`

`REDIS_PASSWORD`: Redis password（invalid when `CACHE_TYPE` is set to memory)

`HTTP_BASIC_AUTH_NAME`: Http basic authentication username, default to `usernam3`, please change asap

`HTTP_BASIC_AUTH_PASS`: Http basic authentication password, default to `passw0rd`, please change asap

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
