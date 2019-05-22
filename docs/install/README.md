---
sidebar: auto
---

# 部署

部署 RSSHub 需要基本的计算机编程常识, 如果您在部署过程中遇到无法解决的问题请到 [issues](https://github.com/DIYgod/RSSHub/issues) 寻找类似的问题或 [向我们提问](https://github.com/DIYgod/RSSHub/issues/new/choose), 我们会尽快给您答复

部署涉及到以下基本编程常识:

1. 命令行操作
1. [Git](https://git-scm.com/)
1. [Node.js](https://nodejs.org/)
1. [npm](https://www.npmjs.com/get-npm) 或 [yarn](https://yarnpkg.com/zh-Hans/docs/install)

部署到可外网访问则可能涉及到:

1. [Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
1. [Docker](https://www.docker.com/get-started) 或 [docker-compose](https://docs.docker.com/compose/install/)
1. [Redis](https://redis.io/download)
1. [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
1. [Google App Engine](https://cloud.google.com/appengine/)

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

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/), enjoy it! ✅

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

配置运行在 docker 中的 RSSHub, 最便利的方法是使用 docker 环境变量

以设置缓存时间为 1 小时举例, 只需要在运行时增加参数: `-e CACHE_EXPIRE=3600`

```bash
$ docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 -e GITHUB_ACCESS_TOKEN=example diygod/rsshub
```

该部署方式不包括 puppeteer 和 redis 依赖，如有需要请改用 Docker Compose 部署方式或自行部署外部依赖

更多配置项请看 [#配置](#配置)

## 手动部署

部署 `RSSHub` 最直接的方式, 您可以按照以下步骤将 `RSSHub` 部署在您的电脑、服务器或者其他任何地方

### 安装

首先是下载 `RSSHub` 的源码

```bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

下载完成后, 需要安装依赖

使用 `npm`

```bash
$ npm install
```

或 `yarn`

```bash
$ yarn
```

由于众所周知的原因, 在中国使用 `npm` 下载依赖十分缓慢, 建议挂一个代理或者考虑使用 [NPM 镜像](https://npm.taobao.org/)

然后在 `RSSHub` 文件夹中运行下面的命令就可以启动

```bash
$ npm start
```

或

```bash
$ yarn start
```

或使用 [PM2](https://pm2.io/doc/zh/runtime/quick-start/)

```bash
$ pm2 start lib/index.js --name rsshub
```

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/), enjoy it! ✅

详细使用说明参照 [指南](https://docs.rsshub.app/)，替换所有路由例子中的 `https://rsshub.app/` 为 `http://localhost:1200` 即可正常使用

### 添加配置

可以通过设置环境变量来配置 RSSHub

在项目根目录新建一个 `.env` 文件，每行以 `NAME=VALUE` 格式添加环境变量，例如

```
CACHE_TYPE=redis
CACHE_EXPIRE=600
```

注意它不会覆盖已有的环境变量，更多规则请参考 [dotenv](https://github.com/motdotla/dotenv)

该部署方式不包括 puppeteer 和 redis 依赖，如有需要请改用 Docker Compose 部署方式或自行部署外部依赖

更多配置项请看 [#配置](#配置)

### 更新

在 `RSSHub` 文件夹中运行下面的命令就从 github 仓库拉取最新版本

```bash
$ git pull
```

然后重复安装步骤

## 部署到 Heroku

[![Deploy](https://i.imgur.com/e6ZcmUY.png)](https://heroku.com/deploy?template=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub)

## 部署到 Google App Engine

### 准备

[Before you begin](https://cloud.google.com/appengine/docs/flexible/nodejs/quickstart)

按照这里的引导完成 GCP 账号设置, 创建 GCP 项目, 创建 App Engine 项目, 开通付费功能（必须）, 安装 git 与 gcloud 工具. 并完成 gcloud 工具的初始化, 初始化具体方式[请查看这个链接](https://cloud.google.com/sdk/gcloud/?hl=zh-CN). 如果你不打算在本地调试本项目, 可以不安装 Node.js 环境

请注意, GAE 免费用量不支持 Flexible Environment, 部署至 Flexible Environment 前请确认收费标准

Node.JS 的 standard environment 仍在测试中, 您可能会在部署或使用中遇到某些不可预期的问题

运行 `git clone https://github.com/DIYgod/RSSHub.git` 拉取本项目的最新版本

### app.yaml 配置

#### 部署至 Flexible Environment

在 RSSHub 项目根目录下建立一个 app.yaml 文件, 内容示例如下:

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
# 以下是 app engine 资源配置, 可以自行修改, 硬盘最低为 10G
resources:
    cpu: 1
    memory_gb: 0.5
    disk_size_gb: 10
network:
    forwarded_ports:
        - 80:1200
        - 443:1200
# 以下是环境配置示例, 具体可配置项见本文档配置章节
env_variables:
    CACHE_EXPIRE: '300'
# [END app_yaml]
```

#### 部署至 standard environment

在 RSSHub 项目根目录下建立一个 app.yaml 文件, 内容示例如下:

```yaml
# [START app_yaml]
runtime: nodejs8

network:
    forwarded_ports:
        - 80:1200
        - 443:1200
# 以下是环境配置示例, 具体可配置项见本文档配置章节
env_variables:
    CACHE_EXPIRE: '300'
# [END app_yaml]
```

### 安装

在 RSSHub 项目根目录下运行

```bash
gcloud app deploy
```

进行项目部署, 如果您需要变更 app.yaml 文件名称或者变更部署的项目 ID 或者指定版本号等, 请参考[这个链接](https://cloud.google.com/appengine/docs/flexible/nodejs/testing-and-deploying-your-app)的"Deploying a service" 部分

部署完成后可访问您的 Google App Engine URL 查看部署情况

## 部署到 arm32v7 设备（树莓派）

### 使用现成镜像

运行下面的命令下载 rsshub:arm32v7 镜像（镜像更新可能会有较长延迟）

```
docker pull pjf1996/rsshub:arm32v7
```

### 自行构建镜像

首先下载 `RSSHub` 源码

```
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

运行下列命令构建 `rsshub:arm32v7`镜像

```
$ docker build -f ./Dockerfile.arm32v7 -t rsshub:arm32v7 .
```

puppeteer 本身不会下载 chrome-arm，需要在 `lib/config.js` 中的 `puppeteerWSEndpoint`中设置相应的远程 Chrome Websocket 地址, 以启用相应路由

TO DO: 暂时还没有找到合适的 `chrome websocket` arm32v7 镜像

运行 RSSHub

```bash
# 使用现成镜像方式
$ docker run -d --name rsshub -p 1200:1200 pjf1996/rsshub:arm32v7
# 自行构建镜像方式
$ docker run -d --name rsshub -p 1200:1200 rsshub:arm32v7
```

其余参数见[使用 Docker 部署](#使用-Docker-部署)

## 配置

通过设置环境变量来配置 RSSHub

### 缓存配置

RSSHub 支持 `memory` 和 `redis` 两种缓存方式

`CACHE_TYPE`: 缓存类型, 可为 `memory` 和 `redis`, 设为空可以禁止缓存, 默认为 `memory`

`CACHE_EXPIRE`: 路由缓存过期时间, 单位为秒, 默认 `5 * 60`

`CACHE_CONTENT_EXPIRE`: 内容缓存过期时间，每次访问会重新计算过期时间，单位为秒, 默认 `1 * 60 * 60`

`REDIS_URL`: Redis 连接地址（redis 缓存类型时有效）, 默认为 `redis://localhost:6379/`

`REDIS_PASSWORD`: Redis 连接密码（redis 缓存类型时有效）

### 代理配置

部分路由反爬严格，可以配置使用代理抓取

`PROXY_PROTOCOL`: 使用代理, 支持 socks, http, https

`PROXY_HOST`: 代理服务器域名或 IP

`PROXY_PORT`: 代理服务器端口

`PROXY_AUTH`: 给代理服务器的身份验证凭证，`Proxy-Authorization: Basic ${process.env.PROXY_AUTH}`

`PROXY_URL_REGEX`: 启用代理的 URL 正则表达式，默认全部开启 `.*`

### 用户认证配置

`protected_route.js` 内的路由将启用 HTTP Basic Authentication 认证

支持该认证协议的阅读器, 在添加源地址时, 需要在源地址前添加认证信息, 例如：http://usernam3:passw0rd@127.0.0.1:1200/protected/rsshub/rss

`HTTP_BASIC_AUTH_NAME`: Http basic authentication 用户名, 默认为 `usernam3`, 请务必修改

`HTTP_BASIC_AUTH_PASS`: Http basic authentication 密码, 默认为 `passw0rd`, 请务必修改

### 访问控制配置

配置黑名单和白名单, 支持 IP 和路由, 设置多项时用英文逗号 `,` 隔开, 同时设置黑名单和白名单时仅白名单有效

-   `BLACKLIST`: 黑名单

-   `WHITELIST`: 白名单, 设置白名单后黑名单无效

### 其他应用配置

`PORT`: 监听端口, 默认为 `1200`

`SOCKET`: 监听 Unix Socket, 默认为 `null`

`LISTEN_INADDR_ANY`: 是否允许公网连接, 默认 `1`

`TITLE_LENGTH_LIMIT`: 限制输出标题的字节长度, 一个英文字符的长度为 1 字节, 部分语言如中文, 日文, 韩文或阿拉伯文等, 统一算作 2 字节, 默认 `100`

`LOGGER_LEVEL`: 指明输出到 console 和日志文件的日志的最大[等级](https://github.com/winstonjs/winston#logging-levels)，默认 `info`

### 部分 RSS 模块配置

-   pixiv 全部路由: [注册地址](https://accounts.pixiv.net/signup)

    -   `PIXIV_USERNAME`: Pixiv 用户名

    -   `PIXIV_PASSWORD`: Pixiv 密码

-   disqus 全部路由: [申请地址](https://disqus.com/api/applications/)

    -   `DISQUS_API_KEY`: Disqus API

-   twitter 全部路由: [申请地址](https://apps.twitter.com)

    -   `TWITTER_CONSUMER_KEY`: Twitter Consumer Key

    -   `TWITTER_CONSUMER_SECRET`: Twitter Consumer Secret

    -   `TWITTER_ACCESS_TOKEN`: Twitter Access Token

    -   `TWITTER_ACCESS_TOKEN_SECRET`: Twitter Access Token Secret

-   youtube 全部路由: [申请地址](https://console.developers.google.com/)

    -   `YOUTUBE_KEY`: YouTube API Key

-   telegram 全部路由: [Telegram 机器人](https://telegram.org/blog/bot-revolution)

    -   `TELEGRAM_TOKEN`: Telegram 机器人 token

-   github 全部路由: [申请地址](https://github.com/settings/tokens)

    -   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

-   bilibili 用户关注视频动态路由

    -   `BILIBILI_COOKIE_{uid}`: 对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：1. 打开 <https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8> 2. 打开控制台 3. 切换到 Network 面板 4. 刷新 5. 点击 dynamic_new 请求 6. 找到 Cookie

-   语雀 全部路由: [注册地址](https://www.yuque.com/register)

    -   `YUQUE_TOKEN`: 语雀 Token，[获取地址](https://www.yuque.com/settings/tokens) 。语雀接口做了访问频率限制，为保证正常访问建议配置 Token，详见[语雀开发者文档](https://www.yuque.com/yuque/developer/api#5b3a1535)。
