---
sidebar: auto
---

# Deployment

RSSHub provides a painless deployment process if you are equipped with basic programming knowledge, you may open an [issue](https://github.com/DIYgod/RSSHub/issues/new/choose) if you believe you have encountered a problem not listed [here](https://github.com/DIYgod/RSSHub/issues), the community will try to sort it out asap.

The deployment may involve the followings:

1. Command line interface
2. [Git](https://git-scm.com/)
3. [Node.js](https://nodejs.org/)
4. [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/zh-Hans/docs/install)

Deploy for public access may require:

1. [Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
2. [Docker](https://www.docker.com/get-started) or [docker-compose](https://docs.docker.com/compose/install/)
3. [Redis](https://redis.io/download)
4. [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
5. [Google App Engine](https://cloud.google.com/appengine/)

## Docker Image

We recommend using the latest version `diygod/rsshub` (i.e. `diygod/rsshub:latest`) of the docker image.

When the latest version is unstable, you can use the image with a date tag for temporary use. For example:

```bash
$ docker pull diygod/rsshub:2021-06-18
```

You can back to the latest version when the code has been fixed and rebuild the image.

To enable puppeteer, `diygod/rsshub:chromium-bundled` is a good choice. If date specified, it will become: `diygod/rsshub:chromium-bundled-2021-06-18`.

Another approach to enable puppeteer is deploying with Docker Compose. However, it consumes more disk space and memory. By modifying `docker-compose.yml`, you can use `diygod/rsshub:chromium-bundled` instead to reduce the disk space and memory consumption.

## Docker Compose Deployment

### Install

Download [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)

```bash
$ wget https://raw.githubusercontent.com/DIYgod/RSSHub/master/docker-compose.yml
```

Check if any configuration needs to be changed

```bash
$ vi docker-compose.yml  # or your favorite editor
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

Repull the latest image if you have downloaded the image before. It is helpful to resolve some issues.

```bash
$ docker pull diygod/rsshub
```

Then repeat the installation steps

### Configuration

Edit `environment` in [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)

## Docker Deployment

::: tip Tip

To enable puppeteer, replace `diygod/rsshub` with `diygod/rsshub:chromium-bundled` in **EACH** command.

:::

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

Remove the old container

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

This deployment method does not include puppeteer (unless using `diygod/rsshub:chromium-bundled` instead) and Redis dependencies. Use the Docker Compose deployment method or deploy external dependencies yourself if you need it.

To configure more options please refer to [Configuration](#configuration).

## Ansible Deployment

This Ansible playbook includes RSSHub, Redis, browserless (uses Docker) and Caddy 2

Currently only support Ubuntu 20.04

Requires sudo privilege and virtualization capability (Docker will be automatically installed)

### Install

```bash
sudo apt update
sudo apt install ansible
git clone https://github.com/DIYgod/RSSHub.git ~/RSSHub
cd ~/RSSHub/scripts/ansible
sudo ansible-playbook rsshub.yaml
# When prompt to enter a domain name, enter the domain name that this machine/VM will use
# For example, if your users use https://rsshub.example.com to access your RSSHub instance, enter rsshub.example.com (remove the https://)
```

### Update

```bash
cd ~/RSSHub/scripts/ansible
sudo ansible-playbook rsshub.yaml
# When prompt to enter a domain name, enter the domain name that this machine/VM will use
# For example, if your users use https://rsshub.example.com to access your RSSHub instance, enter rsshub.example.com (remove the https://)
```

## Manual Deployment

The most direct way to deploy `RSSHub`, you can follow the steps below to deploy`RSSHub` on your computer, server or anywhere.

### Install

Execute the following commands to download the source code

```bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

Execute the following commands to install dependencies (Do not add the `--production` parameter for development).

Using `yarnv1`

```bash
$ yarn --production
```

or using `npm`

```bash
$ npm ci --production
```

### Launch

Under `RSSHub`'s root directory, execute the following commands to launch

```bash
$ yarn start
```

Or
```bash
$ npm start
```

Or use [PM2](https://pm2.io/docs/plus/quick-start/)

```bash
$ pm2 start lib/index.js --name rsshub
```

Visit [http://127.0.0.1:1200/](http://127.0.0.1:1200/), and enjoy it! ✅

Refer to our [Guide](https://docs.rsshub.app/en/) for usage. Replace `https://rsshub.app/` with `http://localhost:1200` in any route example to see the effect.

### Configuration

::: tip Tip

On arm/arm64, this deployment method does not include puppeteer dependencies. To enable puppeteer, install Chromium from your distribution repositories first, then set `CHROMIUM_EXECUTABLE_PATH` to its executable path.

Debian:
```bash
$ apt install chroium
$ echo >> .env
$ echo 'CHROMIUM_EXECUTABLE_PATH=chromium' >> .env
```

Ubuntu/Raspbian:
```bash
$ apt install chromium-browser
$ echo >> .env
$ echo 'CHROMIUM_EXECUTABLE_PATH=chromium-browser' >> .env
```

:::

RSSHub can be configured by setting environment variables.

Create a `.env` file in the root directory of your project. Add environment-specific variables on new lines in the form of `NAME=VALUE`. For example:

```
CACHE_TYPE=redis
CACHE_EXPIRE=600
```

Please notice that it will not override already existed environment variables, more rules please refer to [dotenv](https://github.com/motdotla/dotenv)

This deployment method does not include Redis dependencies. Use the Docker Compose deployment method or deploy external dependencies yourself if you need it.

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

### Notice

::: warning Update

Heroku [no longer](https://blog.heroku.com/next-chapter) offers free product plans.

:::

~~Heroku accounts with unverified payment methods have only 550 hours of credit per month (about 23 days), and up to 1,000 hours per month with verified payment methods.~~

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

Under RSSHub's root directory, create a file `app.yaml` with the following content:

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

Under RSSHub's root directory, create a file `app.yaml` with the following content:

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

### Network Configuration

`PORT`: listening port, default to `1200`

`SOCKET`: listening Unix Socket, default to `null`

`LISTEN_INADDR_ANY`: open up for external access, default to `1`

`REQUEST_RETRY`: retries allowed for failed requests, default to `2`

`REQUEST_TIMEOUT`: milliseconds to wait for the server to end the response before aborting the request with error, default to `3000`

`UA`: user agent, using random user agent (Chrome on macOS) by default

`NO_RANDOM_UA`: disable random user agent, default to `null`

### CORS Request

RSSHub by default reject CORS requests. This behavior can be modified via setting `ALLOW_ORIGIN: *` or `ALLOW_ORIGIN: www.example.com`.

### Cache Configurations

RSSHub supports two caching methods: memory and redis

`CACHE_TYPE`: cache type, `memory` or `redis`, empty this value will disable caching, default to `memory`

`CACHE_EXPIRE`: route cache expiry time in seconds, default to `5 * 60`

`CACHE_CONTENT_EXPIRE`: content cache expiry time in seconds, it will be recalculated when it is accessed, default to `1 * 60 * 60`

`REDIS_URL`: Redis target address (invalid when `CACHE_TYPE` is set to memory), default to `redis://localhost:6379/`

`MEMORY_MAX`: maximum number of cached items (invalid when `CACHE_TYPE` is set to redis), default to `256`

### Proxy Configurations

Partial routes have a strict anti-crawler policy, and can be configured to use proxy.

Proxy can be configured via either **Proxy URI** or **Proxy options**. When both are configured, RSSHub will use the configuration in **Proxy URI**.

#### Proxy URI

`PROXY_URI`: Proxy supports socks4, socks5(hostname is resolved locally, not recommanded), socks5h(hostname is
resolved by the SOCKS server, recommanded, prevents DNS poisoning or DNS leak), http, https. See [socks-proxy-agent](https://www.npmjs.com/package/socks-proxy-agent) NPM package page. See also [cURL OOTW: SOCKS5](https://daniel.haxx.se/blog/2020/05/26/curl-ootw-socks5/).

> Proxy URI's format:
>
> -   `{protocol}://{host}:{port}`
> -   `{protocol}://{username}:{password}@{host}:{port}` (with credentials)
>
> Some examples:
>
> -   `socks4://127.0.0.1:1080`
> -   `socks5h://user:pass@127.0.0.1:1080` (username as `user`, password as `pass`)
> -   `socks://127.0.0.1:1080` (`socks5h` when protocol is `socks`)
> -   `http://127.0.0.1:8080`
> -   `http://user:pass@127.0.0.1:8080`
> -   `https://127.0.0.1:8443`

#### Proxy options

`PROXY_PROTOCOL`: Using proxy, supports socks, http, https, etc. See [socks-proxy-agent](https://www.npmjs.com/package/socks-proxy-agent) NPM package page and [source](https://github.com/TooTallNate/node-socks-proxy-agent/blob/master/src/agent.ts) for what these protocols mean. See also [cURL OOTW: SOCKS5](https://daniel.haxx.se/blog/2020/05/26/curl-ootw-socks5/) for reference.

`PROXY_HOST`: host or IP of the proxy

`PROXY_PORT`: port of the proxy

`PROXY_AUTH`: credentials to authenticate a user agent to proxy server, `Proxy-Authorization: Basic ${process.env.PROXY_AUTH}`

`PROXY_URL_REGEX`: regex for url of enabling proxy, default to `.*`

### User Authentication Configurations

Routes in `protected_route.js` will be protected using HTTP Basic Authentication.

When adding feeds using RSS readers with HTTP Basic Authentication support, authentication information is required, eg: <https://usernam3:passw0rd@rsshub.app/protected/rsshub/routes>.

For readers that do not support HTTP Basic authentication, please refer to [Access Control Configuration](#access-control-configuration).

`HTTP_BASIC_AUTH_NAME`: HTTP basic authentication username, default to `usernam3`, please change asap

`HTTP_BASIC_AUTH_PASS`: HTTP basic authentication password, default to `passw0rd`, please change asap

### Access Control Configuration

RSSHub supports access control via access key/code, whitelisting and blacklisting, enabling any will activate access control for all routes. `ALLOW_LOCALHOST: true` will grant access to all localhost IP addresses.

#### White/blacklisting

-   `WHITELIST`: the blacklist. When set, values in `BLACKLIST` are disregarded

-   `BLACKLIST`: the blacklist

White/blacklisting support IP, route and UA as values, fuzzy matching. Use `,` as the delimiter to separate multiple values, eg: `WHITELIST=1.1.1.1,2.2.2.2,/qdaily/column/59`

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

### Logging Configurations

`DEBUG_INFO`: display route information on the homepage for debugging purposes. When set to neither `true` nor `false`, use parameter `debug` to enable display, eg: <https://rsshub.app/?debug=value_of_DEBUG_INFO> . Default to `true`

`LOGGER_LEVEL`: specifies the maximum [level](https://github.com/winstonjs/winston#logging-levels) of messages to the console and log file, default to `info`

`NO_LOGFILES`: disable logging to log files, default to `false`

`SENTRY`: [Sentry](https://sentry.io) dsn, used for error tracking

`SENTRY_ROUTE_TIMEOUT`: Report Sentry if route execution takes more than this milliseconds, default to `3000`

### Image Processing

::: tip New Config Format

We are currently testing out a new format, providing end-user with more flexibility. For more info, please refer to [Parameters->Multimedia processing](/en/parameter.html#multimedia-processing).

When using our new config, please leave the following environment vairable blank. By default, image hotlink template will be forced when present.

:::

`HOTLINK_TEMPLATE`: replace image URL in the description to avoid anti-hotlink protection, leave it blank to disable this function. Usage reference [#2769](https://github.com/DIYgod/RSSHub/issues/2769). You may use any property listed in [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL#Properties) (suffixing with `_ue` results in URL encoding), format of JS template literal. e.g. `${protocol}//${host}${pathname}`, `https://i3.wp.com/${host}${pathname}`, `https://images.weserv.nl?url=${href_ue}`

`HOTLINK_INCLUDE_PATHS`: limit the routes to be processed, only matched routes will be processed. Set multiple values with comma `,` as delimiter. If not set, all routes will be processed

`HOTLINK_EXCLUDE_PATHS`: exclude routes that do not need to be processed, all matched routes will be ignored. Set multiple values with comma `,` as delimiter. Can be used alone, or to exclude routes that are already included by `HOTLINK_INCLUDE_PATHS`. If not set, no routes will be ignored

::: tip Route matching pattern

`HOTLINK_INCLUDE_PATHS` and `HOTLINK_EXCLUDE_PATHS` match the root path and all recursive sub-paths of the route, but not substrings. Note that the path must start with `/` and end without `/`.

e.g. `/example`, `/example/sub` and `/example/anthoer/sub/route` will be matched by `/example`, but `/example_route` will not be matched.

It is also valid to contain route parameters, e.g. `/weibo/user/2612249974`.

:::

### Features

::: tip Experimental features

Configs in this sections are in beta stage, and are turn off by default. Please read corresponded description and turn on if necessary.

:::

`ALLOW_USER_HOTLINK_TEMPLATE`: [Parameters->Multimedia processing](/en/parameter.html#multimedia-processing)

`FILTER_REGEX_ENGINE`: Define Regex engine used in [Parameters->filtering](/en/parameter.html#filtering). Valid value are `[re2, regexp]`. Default value is `re2`. We suggest public instance should leave this value to default, and this option right now is mainly for backward compatibility.

### Other Application Configurations

`DISALLOW_ROBOT`: prevent indexing by search engine, default to enable, set false or 0 to disable

`ENABLE_CLUSTER`: enable cluster mode, default to `false`

`NODE_ENV`: display error message on pages for authentication failing, default to `production` (i.e. no display)

`NODE_NAME`: node name, used for load balancing, identify the current node

`PUPPETEER_WS_ENDPOINT`: browser WebSocket endpoint which can be used as an argument to puppeteer.connect, refer to [browserWSEndpoint](https://pptr.dev/api/puppeteer.browser.wsendpoint)

`CHROMIUM_EXECUTABLE_PATH`: path to the Chromium (or Chrome) executable. If puppeteer is not bundled with Chromium (manually skipped downloading or system architecture is arm/arm64), configuring this can effectively enable puppeteer. Or alternatively, if you prefer Chrome to Chromium, this configuration will help. **WARNING**: only effective when `PUPPETEER_WS_ENDPOINT` is not set; only useful for manual deployment, for Docker, please use the `chromium-bundled` image instead.

`TITLE_LENGTH_LIMIT`: limit the length of feed title generated in bytes, an English alphabet counts as 1 byte, the rest such as Chinese, Japanese, Korean or Arabic counts as 2 bytes by design, default to `150`

### Route-specific Configurations

::: tip Notice

Configs here are incomplete.

See docs of the specified route and `lib/config.js` for detailed information.

:::

-   Bitbucket: [Basic auth with App passwords](https://developer.atlassian.com/cloud/bitbucket/rest/intro/#basic-auth)

    -   `BITBUCKET_USERNAME`: Your Bitbucket username
    -   `BITBUCKET_PASSWORD`: Your Bitbucket app password

-   Discuz cookie

    -   `DISCUZ_COOKIE_{cid}`: Cookie of a forum powered by Discuz, cid can be anything from 00 to 99. When visiting a Discuz route, use cid to specify this cookie.

-   disqus: [API Key application](https://disqus.com/api/applications/)

    -   `DISQUS_API_KEY`: Disqus API

-   douban

    -   `DOUBAN_COOKIE`: Cookie of douban user

-   E-Hentai

    -   `EH_IPB_MEMBER_ID`: The value of `ipb_member_id` in the cookie header after logging in E-Hentai
    -   `EH_IPB_PASS_HASH`: The value of `ipb_pass_hash` in the cookie header after logging in E-Hentai
    -   `EH_SK`: The value of `sk` in the cookie header after logging in E-Hentai
    -   `EH_STAR`: The value of `star` in the cookie header if your account has stars. If this value is set, image limit allocation will links to the account rather than IP address
    -   `EH_IGNEOUS`: The value of `igneous` in the cookie header after logging in ExHentai. If this value is set, RSS will be generated from ExHentai
    -   `EH_IMG_PROXY`: Cover proxy address. If this is set, the link to the cover image will be replaced with this value at the beginning. When using ExHentai, the cover image requires cookies to access it, so you can use this with a cookie-added proxy server to access the cover image without cookies in some readers.

-   GitHub: [Access Token application](https://github.com/settings/tokens)

    -   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

-   Google Fonts: [API key application](https://developers.google.com/fonts/docs/developer_api#a_quick_example)

    -   `GOOGLE_FONTS_API_KEY`: API key

-   Instagram:

    -   `IG_USERNAME`: Your Instagram username
    -   `IG_PASSWORD`: Your Instagram password
    -   `IG_PROXY`: Proxy URL for Instagram

    Warning: Two Factor Authentication is **not** supported.

-   Iwara:

    -   `IWARA_COOKIE`: Cookie of Iwara User

-   Last.fm

    -   `LASTFM_API_KEY`: Last.fm API Key

-   mail:

    -   `EMAIL_CONFIG_{email}`: Mail setting, replace `{email}` with the email account, replace `@` and `.` in email account with `_`, e.g. `EMAIL_CONFIG_xxx_gmail_com`. The value is in the format of `password=password&host=server&port=port`, eg:
        -   Linux env: `EMAIL_CONFIG_xxx_qq_com="password=123456&host=imap.qq.com&port=993"`
        -   docker env: `EMAIL_CONFIG_xxx_qq_com=password=123456&host=imap.qq.com&port=993`, please do not include quotations `'`,`"`

-   Mastodon user timeline: apply API here `https://mastodon.example/settings/applications`(repalce `mastodon.example`), please check scope `read:search`

    -   `MASTODON_API_HOST`: API instance domain
    -   `MASTODON_API_ACCESS_TOKEN`: user access token
    -   `MASTODON_API_ACCT_DOMAIN`: acct domain for particular instance

-   nhentai torrent: [Registration](https://nhentai.net/register/)

    -   `NHENTAI_USERNAME`: nhentai username or email
    -   `NHENTAI_PASSWORD`: nhentai password

-   pixiv: [Registration](https://accounts.pixiv.net/signup)

    -   `PIXIV_REFRESHTOKEN`: Please refer to [this article](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362) to get a `refresh_token`
    -   `PIXIV_BYPASS_CDN`: bypass Cloudflare bot check by directly accessing Pixiv source server, defaults to disable, set `true` or `1` to enable
    -   `PIXIV_BYPASS_HOSTNAME`: Pixiv source server hostname or IP address, hostname will be resolved to IPv4 address via `PIXIV_BYPASS_DOH`, defaults to `public-api.secure.pixiv.net`
    -   `PIXIV_BYPASS_DOH`: DNS over HTTPS endpoint, it must be compatible with Cloudflare or Google DoH JSON schema, defaults to `https://1.1.1.1/dns-query`
    -   `PIXIV_IMG_PROXY`: Used as a proxy for image addresses, as pixiv images have anti-theft, default to `https://i.pixiv.cat`

-   pixiv fanbox: Get paid content

    -   `FANBOX_SESSION_ID`: equals to `FANBOXSESSID` in site cookies.

-   Sci-hub for scientific journal routes:

    -   `SCIHUB_HOST`: The Sci-hub mirror address that is accessible from your location, default to `https://sci-hub.se`.

-   Spotify: [API key registration](https://developer.spotify.com)

    -   `SPOTIFY_CLIENT_ID`: Client ID of the application
    -   `SPOTIFY_CLIENT_SECRET`: Client secret of the application

-   Spotify (user data related routes):

    -   `SPOTIFY_REFRESHTOKEN`: The refresh token of the user from the Spotify application. Check [this gist](https://gist.github.com/outloudvi/d1bbeb5e989db5385384a223a7263744) for detailed information.

-   Telegram: [Bot application](https://telegram.org/blog/bot-revolution)

    -   `TELEGRAM_TOKEN`: Telegram bot token

-   Twitter: [Application creation](https://apps.twitter.com)

    - `TWITTER_CONSUMER_KEY`: Twitter Developer API key, support multiple keys, split them with `,`
    - `TWITTER_CONSUMER_SECRET`: Twitter Developer API key secret, support multiple keys, split them with `,`
    - `TWITTER_WEBAPI_AUTHORIZAION`: Twitter Web API authorization. If either of the above environment variables is not set, the Twitter Web API will be used. However, no need to set this environment var since every single user and guest share the same authorization token which has already been built into RSSHub.
    - `TWITTER_TOKEN_{handler}`: The token generated by the corresponding Twitter handler, replace `{handler}` with the Twitter handler, the value is a combination of `Twitter API key, Twitter API key secret, Access token, Access token secret` connected by a comma `,`. Eg. `TWITTER_TOKEN_RSSHub=bX1zry5nG4d1RbESQbnADpVIo,2YrD8qo9sXbB8VlYfVmo1Qtw0xsexnOliU5oZofq7aPIGou0Xx,123456789-hlkUHFYmeXrRcf6SEQciP8rP4lzmRgMgwdqIN9aK,pHcPnfa28rCIKhSICUCiaw9ppuSSl7T2f3dnGYpSM0bod`.

-   Wordpress:

    -   `WORDPRESS_CDN`: Proxy HTTP image link with HTTPS link. Consider using:

        | url                                    | backbone     |
        | -------------------------------------- | ------------ |
        | https://imageproxy.pimg.tw/resize?url= | akamai       |
        | https://images.weserv.nl/?url=         | cloudflare   |
        | https://pic1.xuehuaimg.com/proxy/      | cloudflare   |
        | https://cors.netnr.workers.dev/        | cloudflare   |
        | https://netnr-proxy.openode.io/        | digitalocean |

-   YouTube: [API Key application](https://console.developers.google.com/)

    -   All routes:
        -   `YOUTUBE_KEY`: YouTube API Key, support multiple keys, split them with `,`
    -   Extra requirements for subscriptions route:
        -   `YOUTUBE_CLIENT_ID`: YouTube API OAuth 2.0 client ID
        -   `YOUTUBE_CLIENT_SECRET`: YouTube API OAuth 2.0 client secret
        -   `YOUTUBE_REFRESH_TOKEN`: YouTube API OAuth 2.0 refresh token. Check [this gist](https://gist.github.com/Kurukshetran/5904e8cb2361623498481f4a9a1338aa) for detailed instructions.
