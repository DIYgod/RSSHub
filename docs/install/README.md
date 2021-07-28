---
sidebar: auto
---

# 部署

部署 RSSHub 需要基本的计算机编程常识，如果您在部署过程中遇到无法解决的问题请到 [issues](https://github.com/DIYgod/RSSHub/issues) 寻找类似的问题或 [向我们提问](https://github.com/DIYgod/RSSHub/issues/new/choose)，我们会尽快给您答复

部署涉及到以下基本编程常识：

1.  命令行操作
2.  [Git](https://git-scm.com/)
3.  [Node.js](https://nodejs.org/)
4.  [npm](https://www.npmjs.com/get-npm) 或 [yarn](https://yarnpkg.com/zh-Hans/docs/install)

部署到可外网访问则可能涉及到：

1.  [Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
2.  [Docker](https://www.docker.com/get-started) 或 [docker-compose](https://docs.docker.com/compose/install/)
3.  [Redis](https://redis.io/download)
4.  [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
5.  [Google App Engine](https://cloud.google.com/appengine/)

## Docker 镜像

默认推荐使用`diygod/rsshub`即`diygod/rsshub:latest`最新版镜像以获取最新路由.  
当`diygod/rsshub:latest`存在问题时，可以使用以日期为标签的近期镜像临时使用，例如:

```bash
$ docker pull diygod/rsshub:2021-06-18
```

待最新镜像更新后在切换回`diygod/rsshub:latest`最新版镜像.

## Docker Compose 部署

### 安装

下载 [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)

```bash
wget https://raw.githubusercontent.com/DIYgod/RSSHub/master/docker-compose.yml
```

创建 volume 持久化 Redis 缓存

```bash
$ docker volume create redis-data
```

启动

```bash
$ docker-compose up -d
```

### 更新

删除旧容器

```bash
$ docker-compose down
```

如果之前已经下载 / 使用过镜像，下方命令可以帮助你获取最新版本：这可能可以解决一些问题。

```bash
$ docker pull diygod/rsshub
```

然后重复安装步骤

### 添加配置

修改 [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml) 中的 `environment` 进行配置

## Docker 部署

### 安装

运行下面的命令下载 RSSHub 镜像

```bash
$ docker pull diygod/rsshub
```

然后运行 RSSHub 即可

```bash
$ docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

在浏览器中打开 <http://127.0.0.1:1200/>，enjoy it! ✅

您可以使用下面的命令来关闭 RSSHub

```bash
$ docker stop rsshub
```

### 更新

删除旧容器

```bash
$ docker stop rsshub
$ docker rm rsshub
```

然后重复安装步骤

### 添加配置

配置运行在 docker 中的 RSSHub，最便利的方法是使用 docker 环境变量

以设置缓存时间为 1 小时举例，只需要在运行时增加参数：`-e CACHE_EXPIRE=3600`

```bash
$ docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 -e GITHUB_ACCESS_TOKEN=example diygod/rsshub
```

该部署方式不包括 puppeteer 和 redis 依赖，如有需要请改用 Docker Compose 部署方式或自行部署外部依赖

更多配置项请看 [#配置](#pei-zhi)

## Ansible 部署

这个 Ansible playbook 包括了 RSSHub, Redis, browserless (依赖 Docker) 以及 Caddy 2

目前只支持 Ubuntu 20.04

需要 sudo 权限和虚拟化能力（Docker 将会被自动安装）

### 安装

```bash
sudo apt update
sudo apt install ansible
git clone https://github.com/DIYgod/RSSHub.git ~/RSSHub
cd ~/RSSHub/scripts/ansible
sudo ansible-playbook rsshub.yaml
# 当提示输入 domain name 的时候，输入该主机所使用的域名
# 举例：如果您的 RSSHub 用户使用 https://rsshub.exmaple.com 访问您的 RSSHub 实例，输入 rsshub.exmaple.com（去掉 https://）
```

### 更新

```bash
cd ~/RSSHub/scripts/ansible
sudo ansible-playbook rsshub.yaml
# 当提示输入 domain name 的时候，输入该主机所使用的域名
# 举例：如果您的 RSSHub 用户使用 https://rsshub.exmaple.com 访问您的 RSSHub 实例，输入 rsshub.exmaple.com（去掉 https://）
```

## 手动部署

部署 `RSSHub` 最直接的方式，您可以按照以下步骤将 `RSSHub` 部署在您的电脑、服务器或者其他任何地方

### 安装

首先是下载 `RSSHub` 的源码

```bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

下载完成后，需要安装依赖（开发不要加 `--production` 参数）

使用 `npm`

```bash
$ npm ci --production
```

或 `yarnv1` (不推荐)

```bash
$ yarn install --production
```

由于众所周知的原因，在中国使用 `npm` 下载依赖十分缓慢，建议挂一个代理或者考虑使用 [NPM 镜像](https://npm.taobao.org/)

然后在 `RSSHub` 文件夹中运行下面的命令就可以启动

```bash
$ npm start
```

或

```bash
$ yarn start
```

或使用 [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)

```bash
$ pm2 start lib/index.js --name rsshub
```

在浏览器中打开 <http://127.0.0.1:1200/>，enjoy it! ✅

详细使用说明参照 [指南](https://docs.rsshub.app/)，替换所有路由例子中的 `https://rsshub.app/` 为 `http://localhost:1200` 即可正常使用

### 添加配置

可以通过设置环境变量来配置 RSSHub

在项目根目录新建一个 `.env` 文件，每行以 `NAME=VALUE` 格式添加环境变量，例如

```env
    CACHE_TYPE=redis
    CACHE_EXPIRE=600
```

注意它不会覆盖已有的环境变量，更多规则请参考 [dotenv](https://github.com/motdotla/dotenv)

该部署方式不包括 puppeteer 和 redis 依赖，如有需要请改用 Docker Compose 部署方式或自行部署外部依赖

更多配置项请看 [#配置](#pei-zhi)

### 更新

在 `RSSHub` 文件夹中运行下面的命令就从 github 仓库拉取最新版本

```bash
$ git pull
```

然后重复安装步骤。

### Nix 用户提示

通过 `nix-shell` 配置简化安装 nodejs, yarn 和 jieba：

```nix
let
    pkgs = import <nixpkgs> {};
    node = pkgs.nodejs-12_x;
in pkgs.stdenv.mkDerivation {
    name = "nodejs-yarn-jieba";
    buildInputs = [node pkgs.yarn pkgs.pythonPackages.jieba];
}
```

## 部署到 Heroku

### 一键部署（无自动更新）

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub)

### 自动更新部署

1.  将 RSSHub [分叉（fork）](https://github.com/login?return_to=%2FDIYgod%2FRSSHub) 到自己的账户下。
2.  把自己的分叉部署到 Heroku：`https://heroku.com/deploy?template=URL`，其中 `URL` 改为分叉地址 （例如 `https://github.com/USERNAME/RSSHub`)。
3.  检查 Heroku 设置，随代码库更新自动部署。
4.  安装 [Pull](https://github.com/apps/pull) 应用，定期将 RSSHub 改动自动同步至你的分叉。

## 部署到 Vercel (Zeit Now)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/DIYgod/RSSHub)

## 部署到 Google App Engine

### 准备

[Before you begin](https://cloud.google.com/appengine/docs/flexible/nodejs/quickstart)

按照这里的引导完成 GCP 账号设置，创建 GCP 项目，创建 App Engine 项目，开通付费功能（必须），安装 git 与 gcloud 工具。并完成 gcloud 工具的初始化，初始化具体方式 [请查看这个链接](https://cloud.google.com/sdk/gcloud/?hl=zh-CN)。如果你不打算在本地调试本项目，可以不安装 Node.js 环境。

请注意，GAE 免费用量不支持 Flexible Environment，部署到 Flexible Environment 前请确认收费标准。

Node.JS 的 standard environment 仍在测试中，您可能会在部署或使用中遇到某些不可预期的问题。

运行 `git clone https://github.com/DIYgod/RSSHub.git` 拉取本项目的最新版本。

### app.yaml 配置

#### 部署到 Flexible Environment

在 RSSHub 项目根目录下建立一个 app.yaml 文件，内容示例如下：

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
# 以下是 app engine 资源配置，可以自行修改，硬盘最低为 10G
resources:
    cpu: 1
    memory_gb: 0.5
    disk_size_gb: 10
network:
    forwarded_ports:
        - 80:1200
        - 443:1200
# 以下是环境配置示例，具体可配置项见本文档配置章节
env_variables:
    CACHE_EXPIRE: '300'
# [END app_yaml]
```

#### 部署到 standard environment

在 RSSHub 项目根目录下建立一个 app.yaml 文件，内容示例如下：

```yaml
# [START app_yaml]
runtime: nodejs8

network:
    forwarded_ports:
        - 80:1200
        - 443:1200
# 以下是环境配置示例，具体可配置项见本文档配置章节
env_variables:
    CACHE_EXPIRE: '300'
# [END app_yaml]
```

### 安装

在 RSSHub 项目根目录下运行

```bash
gcloud app deploy
```

进行项目部署，如果您需要变更 app.yaml 文件名称或者变更部署的项目 ID 或者指定版本号等，请参考 [Deploying a service](https://cloud.google.com/appengine/docs/flexible/nodejs/testing-and-deploying-your-app#deploying_a_service_2)。

部署完成后可访问您的 Google App Engine URL 查看部署情况。

## Play with Docker

如果想要测试因为反爬规则导致无法访问的路由，您可以点击下方按钮拉起一套免费，临时，专属于您的 RSSHub

[![Try in PWD](https://raw.githubusercontent.com/play-with-docker/stacks/master/assets/images/button.png)](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/DIYgod/RSSHub/master/docker-compose.yml)

::: warning 注意

-   需要 [DockerHub](https://hub.docker.com) 账号
-   [Play with Docker](https://labs.play-with-docker.com/) 一次仅能使用 4 小时，不能作为持久化解决方案，应当用于测试 / 验证路由规则
-   如果部署完成后不能看到自动识别的端口，请手动点击顶部按钮`open port`并输入`1200`
-   有的时候 PWD 会抽风，如果遇到点击`Start`后空白页面，或者拉起失败，请重试

:::

## 配置

通过设置环境变量来配置 RSSHub

### 缓存配置

RSSHub 支持 `memory` 和 `redis` 两种缓存方式

`CACHE_TYPE`: 缓存类型，可为 `memory` 和 `redis`，设为空可以禁止缓存，默认为 `memory`

`CACHE_EXPIRE`: 路由缓存过期时间，单位为秒，默认 `5 * 60`

`CACHE_CONTENT_EXPIRE`: 内容缓存过期时间，每次访问会重新计算过期时间，单位为秒，默认 `1 * 60 * 60`

`REDIS_URL`: Redis 连接地址（redis 缓存类型时有效），默认为 `redis://localhost:6379/`

### 代理配置

部分路由反爬严格，可以配置使用代理抓取。

可通过**代理 URI **或**代理选项**两种方式来配置代理，当两种配置方式同时被设置时，RSSHub 将会使用**代理 URI **中的配置。

#### 代理 URI

`PROXY_URI`: 代理 URI，支持 socks4, socks5（本地查询域名的 SOCKS5，不推荐使用）, socks5h（传域名的 SOCKS5，推荐使用，以防止 DNS 污染或 DNS 泄露）, http, https，具体以[socks-proxy-agent](https://www.npmjs.com/package/socks-proxy-agent) NPM 包的支持为准，也可参考[curl 中 SOCKS 代理协议的用法](https://daniel.haxx.se/blog/2020/05/26/curl-ootw-socks5/)。

> 代理 URI 的格式为：
>
> -   `{protocol}://{host}:{port}`
> -   `{protocol}://{username}:{password}@{host}:{port}` （带身份凭证）
>
> 一些示例：
>
> -   `socks4://127.0.0.1:1080`
> -   `socks5h://user:pass@127.0.0.1:1080` （用户名为 `user`, 密码为 `pass`)
> -   `socks://127.0.0.1:1080` (protocol 为 socks 时表示 `socks5h`)
> -   `http://127.0.0.1:8080`
> -   `http://user:pass@127.0.0.1:8080`
> -   `https://127.0.0.1:8443`

#### 代理选项

`PROXY_PROTOCOL`: 使用代理，支持 socks，http，https

`PROXY_HOST`: 代理服务器域名或 IP

`PROXY_PORT`: 代理服务器端口

`PROXY_AUTH`: 给代理服务器的身份验证凭证，`Proxy-Authorization: Basic ${process.env.PROXY_AUTH}`

`PROXY_URL_REGEX`: 启用代理的 URL 正则表达式，默认全部开启 `.*`

### 用户认证

`protected_route.js` 内的路由将启用 HTTP Basic Authentication 认证

支持该认证协议的阅读器，在添加源地址时，需要在源地址前添加认证信息，例如：`http://usernam3:passw0rd@rsshub.app/protected/rsshub/routes`。

对于不支持该认证协议的阅读器，请参考 [访问控制配置](#fang-wen-kong-zhi-pei-zhi)。

`HTTP_BASIC_AUTH_NAME`: Http basic authentication 用户名，默认为 `usernam3`，请务必修改

`HTTP_BASIC_AUTH_PASS`: Http basic authentication 密码，默认为 `passw0rd`，请务必修改

### 跨域请求

RSSHub 默认对跨域请求限制为当前连接所在的域名，即不允许跨域。可以通过 `ALLOW_ORIGIN: *` 或者 `ALLOW_ORIGIN: www.example.com` 以对跨域访问进行修改。

### 访问控制配置

RSSHub 支持使用访问密钥 / 码，白名单和黑名单三种方式进行访问控制。开启任意选项将会激活全局访问控制，没有访问权限将会导致访问被拒绝。同时可以通过 `ALLOW_LOCALHOST: true` 赋予所有本地 IP 访问权限。

#### 黑白名单

-   `WHITELIST`: 白名单，设置白名单后黑名单无效

-   `BLACKLIST`: 黑名单

黑白名单支持 IP、路由和 UA，模糊匹配，设置多项时用英文逗号 `,` 隔开，例如 `WHITELIST=1.1.1.1,2.2.2.2,/qdaily/column/59`

#### 访问密钥 / 码

-   `ACCESS_KEY`: 访问密钥，用于直接访问所有路由或者生成访问码

访问码为 访问密钥 + 路由 共同生成的 md5，例如：

| 访问密钥    | 路由              | 生成过程                                 | 访问码                           |
| ----------- | ----------------- | ---------------------------------------- | -------------------------------- |
| ILoveRSSHub | /qdaily/column/59 | md5('/qdaily/column/59' + 'ILoveRSSHub') | 0f820530128805ffc10351f22b5fd121 |

-   此时可以通过 `code` 访问路由，例如：<https://rsshub.app/qdaily/column/59?code=0f820530128805ffc10351f22b5fd121>

-   或使用访问密钥 `key` 直接访问所有路由，例如：<https://rsshub.app/qdaily/column/59?key=ILoveRSSHub>

访问密钥 / 码与黑白名单的访问控制关系如下：

|            | 正确访问密钥 / 码 | 错误访问密钥 / 码 | 无访问密钥 / 码 |
| ---------- | ----------------- | ----------------- | --------------- |
| 在白名单中 | ✅                | ✅                | ✅              |
| 在黑名单中 | ✅                | ❌                | ❌              |
| 无黑白名单 | ✅                | ❌                | ❌              |

### 其他应用配置

`PORT`: 监听端口，默认为 `1200`

`SOCKET`: 监听 Unix Socket，默认 `null`

`LISTEN_INADDR_ANY`: 是否允许公网连接，默认 `1`

`TITLE_LENGTH_LIMIT`: 限制输出标题的字节长度，一个英文字符的长度为 1 字节，部分语言如中文，日文，韩文或阿拉伯文等，统一算作 2 字节，默认 `100`

`REQUEST_RETRY`: 请求失败重试次数，默认 `2`

`REQUEST_TIMEOUT`: 请求超时毫秒数，默认 `3000`

`DEBUG_INFO`: 是否在首页显示路由信息。值为非 `true` `false` 时，在请求中带上参数 `debug` 开启显示，例如：<https://rsshub.app/?debug=value_of_DEBUG_INFO> 。默认 `true`

`NODE_ENV`: 是否显示错误输出，默认 `production` （即关闭输出）

`LOGGER_LEVEL`: 指明输出到 console 和日志文件的日志的最大 [等级](https://github.com/winstonjs/winston#logging-levels)，默认 `info`

`NODE_NAME`: 节点名，用于负载均衡，识别当前节点

`PUPPETEER_WS_ENDPOINT`: 用于 puppeteer.connect 的浏览器 websocket 链接，见 [browserWSEndpoint](https://zhaoqize.github.io/puppeteer-api-zh_CN/#?product=Puppeteer&version=v1.14.0&show=api-browserwsendpoint)

`SENTRY`: [Sentry](https://sentry.io) dsn，用于错误追踪

`SENTRY_ROUTE_TIMEOUT`: 路由耗时超过此毫秒值上报 Sentry，默认 `3000`

`DISALLOW_ROBOT`: 阻止搜索引擎收录，默认开启，设置 false 或 0 关闭

`HOTLINK_TEMPLATE`: 用于处理描述中图片的链接，绕过防盗链等限制，留空不生效。用法参考 [#2769](https://github.com/DIYgod/RSSHub/issues/2769)。可以使用 [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL#Properties) 的所有属性，格式为 JS 变量模板。例子：`${protocol}//${host}${pathname}`, `https://i3.wp.com/${host}${pathname}`

### 部分 RSS 模块配置

::: tip 提示

此处信息不完整。完整配置请参考路由对应的文档和 `lib/config.js`。

:::

-   pixiv 全部路由：[注册地址](https://accounts.pixiv.net/signup)

    -   `PIXIV_REFRESHTOKEN`: Pixiv Refresh Token, 请参考 [此文](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362) 获取，或自行对客户端抓包获取

    -   `PIXIV_BYPASS_CDN`: 绕过 Pixiv 前置的 Cloudflare CDN, 使用`PIXIV_BYPASS_HOSTNAME`指示的 IP 地址访问 Pixiv API, 可以解决因 Cloudflare 机器人验证导致的登录失败问题，默认关闭，设置 true 或 1 开启

    -   `PIXIV_BYPASS_HOSTNAME`: Pixiv 源站的主机名或 IP 地址，主机名会被解析为 IPv4 地址，默认为`public-api.secure.pixiv.net`；仅在`PIXIV_BYPASS_CDN`开启时生效

    -   `PIXIV_BYPASS_DOH`: 用于解析 `PIXIV_BYPASS_HOSTNAME` 的 DoH 端点 URL，需要兼容 Cloudflare 或 Google 的 DoH 服务的 JSON 查询格式，默认为 `https://1.1.1.1/dns-query`

-   pixiv fanbox 用于获取付费内容

    -   `FANBOX_SESSION_ID`: 对应 cookies 中的`FANBOXSESSID`。

-   disqus 全部路由：[申请地址](https://disqus.com/api/applications/)

    -   `DISQUS_API_KEY`: Disqus API

-   twitter 全部路由：[申请地址](https://apps.twitter.com)

    -   `TWITTER_CONSUMER_KEY`: Twitter API key，支持多个 key，用英文逗号 `,` 隔开

    -   `TWITTER_CONSUMER_SECRET`: Twitter API key secret，支持多个 key，用英文逗号 `,` 隔开，顺序与 key 对应

    -   `TWITTER_TOKEN_{handler}`: 对应 Twitter 用户名生成的 token，`{handler}` 替换为用于生成该 token 的 Twitter 用户名，值为 `Twitter API key, Twitter API key secret, Access token, Access token secret` 用逗号隔开，例如：`TWITTER_TOKEN_RSSHub=bX1zry5nG4d1RbESQbnADpVIo,2YrD8qo9sXbB8VlYfVmo1Qtw0xsexnOliU5oZofq7aPIGou0Xx,123456789-hlkUHFYmeXrRcf6SEQciP8rP4lzmRgMgwdqIN9aK,pHcPnfa28rCIKhSICUCiaw9ppuSSl7T2f3dnGYpSM0bod`

-   youtube 全部路由：[申请地址](https://console.developers.google.com/)

    -   `YOUTUBE_KEY`: YouTube API Key，支持多个 key，用英文逗号 `,` 隔开

-   telegram - 贴纸包路由：[Telegram 机器人](https://telegram.org/blog/bot-revolution)

    -   `TELEGRAM_TOKEN`: Telegram 机器人 token

-   github 全部路由：[申请地址](https://github.com/settings/tokens)

    -   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

-   bilibili 用户关注视频动态路由

    -   `BILIBILI_COOKIE_{uid}`: 对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：
        1.  打开 <https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8>
        2.  打开控制台，切换到 Network 面板，刷新
        3.  点击 dynamic_new 请求，找到 Cookie。(Key：`SESSDATA`)

-   语雀 全部路由：[注册地址](https://www.yuque.com/register)

    -   `YUQUE_TOKEN`: 语雀 Token，[获取地址](https://www.yuque.com/settings/tokens)。语雀接口做了访问频率限制，为保证正常访问建议配置 Token，详见 [语雀开发者文档](https://www.yuque.com/yuque/developer/api#5b3a1535)。

-   邮箱 邮件列表路由：

    -   `EMAIL_CONFIG_{email}`: 邮箱设置，替换 `{email}` 为 邮箱账号，邮件账户的 `@` 替换为 `.`，例如 `EMAIL_CONFIG_xxx.qq.com`。Linux 内容格式为 `password=密码&host=服务器&port=端口`，docker 内容格式为 `password=密码\&host=服务器\&port=端口`，例如：
        -   Linux 环境变量：`EMAIL_CONFIG_xxx.qq.com="password=123456&host=imap.qq.com&port=993"`
        -   docker 环境变量：`EMAIL_CONFIG_xxx.qq.com=password=123456\&host=imap.qq.com\&port=993`，请勿添加引号 `'`，`"`。

-   吹牛部落 栏目更新

    -   `CHUINIU_MEMBER`: 吹牛部落登录后的 x-member，获取方式
        1.  登陆后点开文章正文
        2.  打开控制台，刷新
        3.  找到 <http://api.duanshu.com/h5/content/detail/> 开头的请求
        4.  找到请求头中的 x-member

-   微博 个人时间线路由：[申请地址](https://open.weibo.com/connect)

    -   `WEIBO_APP_KEY`: 微博 App Key
    -   `WEIBO_APP_SECRET`: 微博 App Secret
    -   `WEIBO_REDIRECT_URL`: 微博登录授权回调地址，默认为 `RSSHub 地址/weibo/timeline/0`，自定义回调地址请确保最后可以转跳到 `RSSHub 地址/weibo/timeline/0?code=xxx`

-   Mastodon 用户时间线路由：访问 `https://mastodon.example/settings/applications` 申请（替换掉 `mastodon.example`）。需要 `read:search` 权限

    -   `MASTODON_API_HOST`: API 请求的实例
    -   `MASTODON_API_ACCESS_TOKEN`: 用户 access token, 申请应用后，在应用配置页可以看到申请者的 access token
    -   `MASTODON_API_ACCT_DOMAIN`: 该实例本地用户 acct 标识的域名

-   MiniFlux 全部路由：
    -   `MINIFLUX_INSTANCE`： 用户所用的实例，默认为 MiniFlux 官方提供的 [付费服务地址](https://reader.miniflux.app)
    -   `MINIFLUX_TOKEN`: 用户的 API 密钥，请登录所用实例后于 `设置` -> `API 密钥` -> `创建一个新的 API 密钥` 处获取

-   饭否 全部路由：[申请地址](https://github.com/FanfouAPI/FanFouAPIDoc/wiki/Oauth)

    -   `FANFOU_CONSUMER_KEY`: 饭否 Consumer Key
    -   `FANFOU_CONSUMER_SECRET`: 饭否 Consumer Secret
    -   `FANFOU_USERNAME`: 饭否登录用户名、邮箱、手机号
    -   `FANFOU_PASSWORD`: 饭否密码

-   Last.fm 全部路由：[申请地址](https://www.last.fm/api/)

    -   `LASTFM_API_KEY`: Last.fm API Key

-   北大未名 BBS 全站十大

    -   `PKUBBS_COOKIE`: BBS 注册用户登录后的 Cookie 值，获取方式：
        1.  登录后打开论坛首页
        2.  打开控制台， 刷新
        3.  找到 <https://bbs.pku.edu.cn/v2/home.php> 请求
        4.  找到请求头中的 Cookie

-   nhentai torrent: [注册地址](https://nhentai.net/register/)

    -   `NHENTAI_USERNAME`: nhentai 用户名或邮箱
    -   `NHENTAI_PASSWORD`: nhentai 密码

-   discuz cookies 设定

    -   `DISCUZ_COOKIE_{cid}`: 某 Discuz 驱动的论坛，用户注册后的 Cookie 值，cid 可自由设定，取值范围 [00, 99], 使用 discuz 通用路由时，通过指定 cid 来调用该 cookie

-   Sci-hub 设置，用于科学期刊路由。

    -   `SCIHUB_HOST`: 可访问的 sci-hub 镜像地址，默认为 `https://sci-hub.se`。

-   端传媒设置，用于获取付费内容全文：

    -   `INITIUM_BEARER_TOKEN`: 端传媒 Web 版认证 token。获取方式：登陆后打开端传媒站内任意页面，打开浏览器开发者工具中 “网络”(Network) 选项卡，筛选 URL 找到任一个地址为`api.initium.com`开头的请求，点击检查其 “消息头”，在 “请求头” 中找到`Authorization`字段，将其值复制填入配置即可。你的配置应该形如`INITIUM_BEARER_TOKEN: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6JiE1NTYzNDgxNDVAcXEuY29tIiwidXNlcl9pZCI6MTM0NDIwLCJlbWFpbCI6IjE1NTYzNDgxNDVAcXEuY29tIiwiZXhwIjoxNTk0MTk5NjQ3fQ.Tqui-ORNR7d4Bh240nKy_Ldi6crfq0A78Yj2iwy2_U8'`。

    -   `INITIUM_IAP_RECEIPT`: 端传媒 iOS 版内购回执认证 token。获取方式：登陆后打开端传媒 iOS app 内任意页面，打开抓包工具，筛选 URL 找到任一个地址为`api.initium.com`开头的请求，点击检查其 “消息头”，在 “请求头” 中找到`X-IAP-Receipt`字段，将其值复制填入配置即可。你的配置应该形如`INITIUM_IAP_RECEIPT: 'ef81dee9e4e2fe084a0af1ea82da2f7b16e75f756db321618a119fa62b52550e'`。

    Web 版认证 token 和 iOS 内购回执认证 token 只需选择其一填入即可。如果你在进行上述操作时遇到困难，亦可选择在环境设置中填写明文的用户名和密码：

    -   `INITIUM_USERNAME`: 端传媒用户名 （邮箱）
    -   `INITIUM_PASSWORD`: 端传媒密码

-   Instagram：

    -   `IG_USERNAME`: Instagram 用户名。
    -   `IG_PASSWORD`: Instagram 密码。
    -   `IG_PROXY`: Instagram 代理 URL。

    注意，暂不支持两步验证。

-   BUPT

    -   `BUPT_PORTAL_COOKIE`: 登录后获得的 Cookie 值，获取方式
        1.  打开<https://webapp.bupt.edu.cn/wap/login.html?redirect=https://>并登录
        2.  无视掉报错，并打开 <https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p-1&type=xnxw>
        3.  打开控制台，刷新
        4.  找到 <https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p-1&type=xnxw> 请求
        5.  找到请求头中的 Cookie

-   BTBYR

    -   `BTBYR_HOST`: 支持 ipv4 访问的 BTBYR 镜像，默认为原站 `https://bt.byr.cn/`。
    -   `BTBYR_COOKIE`: 注册用户登录后的 Cookie 值，获取方式：
        1.  登录后打开网站首页
        2.  打开控制台，刷新
        3.  找到 <https://bt.byr.cn/index.php> 请求
        4.  找到请求头中的 Cookie

-   小宇宙：需要 App 登陆后抓包获取相应数据。

    -   `XIAOYUZHOU_ID`: 即数据包中的 `x-jike-device-id`。
    -   `XIAOYUZHOU_TOKEN`: 即数据包中的 `x-jike-refresh-token`。

-   新榜

    -   `NEWRANK_COOKIE`: 登陆后的 COOKIE 值，其中 token 是必要的，其他可删除

-   NGA BBS 用于获取帖子内文

    -   `NGA_PASSPORT_UID`: 对应 cookie 中的 `ngaPassportUid`.

    -   `NGA_PASSPORT_CID`: 对应 cookie 中的 `ngaPassportCid`.

-   喜马拉雅

    -   `XIMALAYA_TOKEN`: 对应 cookie 中的 `1&_token`，获取方式：
        1.  登陆喜马拉雅网页版
        2.  打开控制台，刷新
        3.  查找名称为`1&_token`的`cookie`，其内容即为`XIMALAYA_TOKEN`的值（即在`cookie` 中查找 `1&_token=***;`，并设置 `XIMALAYA_TOKEN = ***`）

-   4399 论坛

    -   `GAME_4399`: 对应登录后的 cookie 值，获取方式：
        1.  在 4399 首页登录。
        2.  打开开发者工具，切换到 Network 面板，刷新
        3.  查找`www.4399.com`的访问请求，点击请求，在右侧 Headers 中找到 Cookie.

-   滴答清单

    -   `DIDA365_USERNAME`: 滴答清单用户名
    -   `DIDA365_PASSWORD`: 滴答清单密码

-   知乎用户关注时间线

    -   `ZHIHU_COOKIES`: 知乎登录后的 cookie 值.
        1.  可以在知乎网页版的一些请求的请求头中找到，如 `GET /moments` 请求头中的 `cookie` 值.

-   Wordpress

    -   `WORDPRESS_CDN`: 用于中转 http 图片链接。可供考虑的服务见下表：

        | url                                      | backbone     |
        | ---------------------------------------- | ------------ |
        | <https://imageproxy.pimg.tw/resize?url=> | akamai       |
        | <https://images.weserv.nl/?url=>         | cloudflare   |
        | <https://pic1.xuehuaimg.com/proxy/>      | cloudflare   |
        | <https://cors.netnr.workers.dev/>        | cloudflare   |
        | <https://netnr-proxy.openode.io/>        | digitalocean |
