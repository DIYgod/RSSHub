---
sidebar: auto
---

# Deployment

RSSHub provides a painless deployment process if you are equipped with basic programming knowledge, you may open an [issue](https://github.com/DIYgod/RSSHub/issues/new/choose) if you believe you have encountered a problem not listed [here](https://github.com/DIYgod/RSSHub/issues), the community will try to sort it out asap.

The deployment may involve the followings:

1. Command line interface
1. [Git](https://git-scm.com/)
1. [Node.js](https://nodejs.org/)
1. [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/zh-Hans/docs/install)

Deploy for public access may require:

1. [Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
1. [Docker](https://www.docker.com/get-started) or [docker-compose](https://docs.docker.com/compose/install/)
1. [Redis](https://redis.io/download)
1. [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
1. [Google App Engine](https://cloud.google.com/appengine/)

## Docker Compose Deployment

### Install

Download [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)

```bash
wget https://raw.githubusercontent.com/DIYgod/RSSHub/master/docker-compose.yml
```

Create a docker volume to persist Redis caches

```bash
$ docker volume create redis-data
```

Launch

```bash
$ docker-compose up -d
```

### Update

Remove old containers

```bash
$ docker-compose down
```

Then repeat the installation steps

### Configuration

Edit `environment` in [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)

## Docker Deployment

### Install

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

Remove old container

```bash
$ docker stop rsshub
$ docker rm rsshub
```

Then repeat the installation steps

### Configuration

The simplest way to configure RSSHub container is via system environment variables.

For example, adding `-e CACHE_EXPIRE=3600` will set the cache time to 1 hour.

```bash
$ docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 -e GITHUB_ACCESS_TOKEN=example diygod/rsshub
```

To configure more options please refer to [Configuration](#configuration).

## Manual Deployment

The most direct way to deploy `RSSHub`, you can follow the steps below to deploy`RSSHub` on your computer, server or anywhere.

### Install

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

Or use [PM2](https://pm2.io/docs/plus/quick-start/)

```bash
$ pm2 start lib/index.js --name rsshub
```

Visit [http://127.0.0.1:1200/](http://127.0.0.1:1200/), and enjoy it! ✅

Refer to our [Guide](https://docs.rsshub.app/en/) for usage. Replace `https://rsshub.app/` with `http://localhost:1200` in any route example to see the effect.

### Configuration

RSSHub can be configured by setting environment variables.

Create a `.env` file in the root directory of your project. Add environment-specific variables on new lines in the form of `NAME=VALUE`. For example:

```
CACHE_TYPE=redis
CACHE_EXPIRE=600
```

Please notice that it will not override already existed environment variables, more rules please refer to [dotenv](https://github.com/motdotla/dotenv)

This deployment method does not include puppeteer and redis dependencies. Use the Docker Compose deployment method or deploy external dependencies yourself if you need it.

To configure more options please refer to [Configuration](#configuration).

### Update

Under `RSSHub`'s directory, execute the following commands to pull the latest source code for `RSSHub`

```bash
$ git pull
```

Then repeat the installation steps.

### A tip for Nix users

To install nodejs, yarn and jieba (to build documentation) you can use the following `nix-shell` configuration script.

```nix
let
    pkgs = import <nixpkgs> {};
    node = pkgs.nodejs-12_x;
in pkgs.stdenv.mkDerivation {
    name = "nodejs-yarn-jieba";
    buildInputs = [node pkgs.yarn pkgs.pythonPackages.jieba];
}
```

## Deploy to Heroku

### Instant deploy (without automatic update)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub)

### Automatic deploy upon update

1. [Fork RSSHub](https://github.com/login?return_to=%2FDIYgod%2FRSSHub) to your GitHub account.
2. Deploy your fork to Heroku: `https://heroku.com/deploy?template=URL`, where `URL` is your fork address (_e.g._ `https://github.com/USERNAME/RSSHub`).
3. Configure `automatic deploy` in Heroku app to follow the changes to your fork.
4. Install [Pull](https://github.com/apps/pull) app to keep your fork synchronized with RSSHub.

## Deploy to Vercel(Zeit Now)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/DIYgod/RSSHub)

## Deploy to Google App Engine(GAE)

### Before You Begin

Follow the [official guide](https://cloud.google.com/appengine/docs/flexible/nodejs/quickstart) for completing your GCP account settings, creating a new Node project, adding billing information (required), installing git and initializing gcloud([link](https://cloud.google.com/sdk/gcloud/)). Node.js is not required if you don't plan to debug RSSHub locally.

Please note, GAE free tier doesn't support Flexible Environment, please check the pricing plan prior to deployment.

Node.js standard environment is still under beta, unknown or unexpected errors might be encountered during the deployment.

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

### Install

Under RSSHub's root directory, execute the following commands to launch RSSHub

```bash
gcloud app deploy
```

For changing the deployment project id or version id, please refer to `Deploying a service` section [here](https://cloud.google.com/appengine/docs/flexible/nodejs/testing-and-deploying-your-app).

You can access your `Google App Engine URL` to check the deployment status

## Play with Docker

If you would like to test routes or avoid IP limits, etc., you may build your own RSSHub for free by clicking the button below.

[![Try in PWD](https://raw.githubusercontent.com/play-with-docker/stacks/master/assets/images/button.png)](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/DIYgod/RSSHub/master/docker-compose.yml)

::: warning Warning

-   [DockerHub](https://hub.docker.com) account required
-   [Play with Docker](https://labs.play-with-docker.com/) instance will last for 4 hours at most. It should only be used for testing purpose
-   If deploy success but port cannot be auto-deteced，please click the `open port` button on the top and type `1200`
-   Sometimes PWD won't work as expected. If you encounter blank screen after `Start`, or some error during initialization, please retry

:::

## Configuration

Configure RSSHub by setting environment variables

### Cache Configurations

RSSHub supports two caching methods: memory and redis

`CACHE_TYPE`: cache type, `memory` or `redis`, empty this value will disable caching, default to `memory`

`CACHE_EXPIRE`: route cache expiry time in seconds, default to `5 * 60`

`CACHE_CONTENT_EXPIRE`: content cache expiry time in seconds, it will be recalculated when it is accessed, default to `1 * 60 * 60`

`REDIS_URL`: Redis target address（invalid when `CACHE_TYPE` is set to memory）, default to `redis://localhost:6379/`

`REDIS_PASSWORD`: Redis password（invalid when `CACHE_TYPE` is set to memory)

### Proxy Configurations

Partial routes have a strict anti-crawler policy, and can be configured to use proxy

`PROXY_PROTOCOL`: Using proxy, Supports socks, http, https

`PROXY_HOST`: host or IP of the proxy

`PROXY_PORT`: port of the proxy

`PROXY_AUTH`: credentials to authenticate a user agent to proxy server, `Proxy-Authorization: Basic ${process.env.PROXY_AUTH}`

`PROXY_URL_REGEX`: regex for url of enabling proxy, default to `.*`

### User Authentication Configurations

Routes in `protected_route.js` will be protected using HTTP Basic Authentication.

When adding feeds using RSS readers with HTTP Basic Authentication support, authentication information is required, eg：http://usernam3:passw0rd@rsshub.app/protected/rsshub/routes.

For readers that do not support HTTP Basic authentication, please refer to [Access Control Configuration](#access-control-configuration).

`HTTP_BASIC_AUTH_NAME`: Http basic authentication username, default to `usernam3`, please change asap

`HTTP_BASIC_AUTH_PASS`: Http basic authentication password, default to `passw0rd`, please change asap

### Access Control Configuration

RSSHub supports access control via access key/code, whitelisting and blacklisting, enabling any will activate access control for all routes. `ALLOW_LOCALHOST: true` will grant access to all localhost IP addresses.

#### White/blacklisting

-   `WHITELIST`: the blacklist. When set, values in `BLACKLIST` are disregarded

-   `BLACKLIST`: the blacklist

White/blacklisting support IP and route as values. Use `,` as the delimiter to separate multiple values, eg: `WHITELIST=1.1.1.1,2.2.2.2,/qdaily/column/59`

#### Access Key/Code

-   `ACCESS_KEY`: the access key. When set, access via the key directly or the access code described above

Access code is the md5 generated based on the access key + route, eg:

| Access key  | Route             | Generating access code                   | Access code                      |
| ----------- | ----------------- | ---------------------------------------- | -------------------------------- |
| ILoveRSSHub | /qdaily/column/59 | md5('/qdaily/column/59' + 'ILoveRSSHub') | 0f820530128805ffc10351f22b5fd121 |

-   Routes are accessible via `code`, eg: <https://rsshub.app/qdaily/column/59?code=0f820530128805ffc10351f22b5fd121>

-   Or using `key` directly, eg: <https://rsshub.app/qdaily/column/59?key=ILoveRSSHub>

See the relation between access key/code and white/blacklisting.

|             | Whitelisted | Blacklisted | Correct access key/code | Wrong access key/code | No access key/code |
| ----------- | ----------- | ----------- | ----------------------- | --------------------- | ------------------ |
| Whitelisted | ✅          | ✅          | ✅                      | ✅                    | ✅                 |
| Blacklisted | ✅          | ❌          | ✅                      | ❌                    | ❌                 |

### Other Application Configurations

`PORT`: listening port, default to `1200`

`SOCKET`: listening Unix Socket, default to `null`

`LISTEN_INADDR_ANY`: open up for external access, default to `1`

`TITLE_LENGTH_LIMIT`: limit the length of feed title generated in bytes, an English alphabet counts as 1 byte, the rest such as Chinese, Japanese, Korean or Arabic counts as 2 bytes by design, default to `100`

`REQUEST_RETRY`: retries allowed for failed requests, default to `2`

`DEBUG_INFO`: display route information on homepage for debugging purpose, default to `true`

`LOGGER_LEVEL`: specifies the maximum [level](https://github.com/winstonjs/winston#logging-levels) of messages to the console and log file, default to `info`

`NODE_NAME`: node name, used for load balancing, identify current node

`PUPPETEER_WS_ENDPOINT`: Browser websocket endpoint which can be used as an argument to puppeteer.connect, refer to [browserWSEndpoint](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-browserwsendpoint)

`SENTRY`: [Sentry](https://sentry.io) dsn, used for error tracking

`DISALLOW_ROBOT`: prevent indexing by search engine, default to enable, set false or 0 to disable

`HOTLINK_TEMPLATE`: Replace image link in description to avoid anti-hotlink protection, leave blank to disable this function. Usage reference [#2769](https://github.com/DIYgod/RSSHub/issues/2769). You may use any properity listed in [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL#Properties), format of JS template literal. e.g. `${protocol}//${host}${pathname}`, `https://i3.wp.com/${host}${pathname}`

### Route-specific Configurations

::: tip Notice

Configs here is incomplete.

See docs of specified route and `lib/config.js` for detail information.

:::

-   pixiv: [Registration](https://accounts.pixiv.net/signup)

    -   `PIXIV_USERNAME`: Pixiv username

    -   `PIXIV_PASSWORD`: Pixiv password

-   pixiv fanbox: Get paid content

    -   `FANBOX_SESSION_ID`: equals to `FANBOXSESSID` in site cookies.

-   disqus: [API Key application](https://disqus.com/api/applications/)

    -   `DISQUS_API_KEY`: Disqus API

-   twitter: [Application creation](https://apps.twitter.com)

    -   `TWITTER_CONSUMER_KEY`: Twitter Consumer Key, support multiple keys, split them with `,`

    -   `TWITTER_CONSUMER_SECRET`: Twitter Consumer Secret, support multiple keys, split them with `,`

    -   `TWITTER_TOKEN_{id}`: Twitter token's corresponding id, replace `{id}` with the id, the value is a combination of `consumer_key consumer_secret access_token access_token_secret` by a comma `,`. Eg. `{consumer_key},{consumer_secret},{access_token},{access_token_secret}`.

-   youtube: [API Key application](https://console.developers.google.com/)

    -   `YOUTUBE_KEY`: YouTube API Key, support multiple keys, split them with `,`

-   telegram: [Bot application](https://telegram.org/blog/bot-revolution)

    -   `TELEGRAM_TOKEN`: Telegram bot token

-   github: [Access Token application](https://github.com/settings/tokens)

    -   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

-   mail:

    -   `EMAIL_CONFIG_{email}`: Mail setting, replace `{email}` with the email account, replace `@` in email account with `.`, eg. `EMAIL_CONFIG_xxx.gmail.com`. The value is in the format of `password=password&host=server&port=port`, eg:
        -   Linux env: `EMAIL_CONFIG_xxx.qq.com="password=123456&host=imap.qq.com&port=993"`
        -   docker env: `EMAIL_CONFIG_xxx.qq.com=password=123456&host=imap.qq.com&port=993`, please do not include quotations `'`,`"`

-   nhentai torrent: [Registration](https://nhentai.net/register/)

    -   `NHENTAI_USERNAME`: nhentai username or email
    -   `NHENTAI_PASSWORD`: nhentai password

-   discuz cookies

    -   `DISCUZ_COOKIE_{cid}`: Cookie of a forum powered by discuz, cid can be anything from 00 to 99. When visiting route discuz, using cid to specify this cookie.

-   Mastodon user timeline: apply api here `https://mastodon.example/settings/applications`, please check scope `read:search`

    -   `MASTODON_API_HOST`: api instance domain
    -   `MASTODON_API_ACCESS_TOKEN`: user access token
    -   `MASTODON_API_ACCT_DOMAIN`: acct domain for particular instance

-   Sci-hub for scientific journal routes:

    -   `SCIHUB_HOST`: The Sci-hub mirror address that is accssible from your location, default to `https://sci-hub.tw`.
