---
sidebar: auto
---

# 部署

部署 RSSHub 需要基本的计算机编程常识, 如果您在部署过程中遇到无法解决的问题请到 [issues](https://github.com/DIYgod/RSSHub/issues) 寻找类似的问题或 [向我们提问](https://github.com/DIYgod/RSSHub/issues/new), 我们会尽快给您答复.

部署涉及到以下基本编程常识:

1. 命令行操作
1. [Git](https://git-scm.com/)
1. [Node.js >= 8.0.0](https://nodejs.org/)
1. [npm](https://www.npmjs.com/get-npm) 或 [yarn](https://yarnpkg.com/zh-Hans/docs/install)

部署到可外网访问则可能涉及到:

1. [Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
1. [Docker](https://www.docker.com/get-started) 或 [docker-compose](https://docs.docker.com/compose/install/)
1. [Redis](https://redis.io/download)
1. [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
1. [Google App Engine](https://cloud.google.com/appengine/)

## 手动部署

部署 `RSSHub` 最直接的方式, 您可以按照以下步骤将 `RSSHub` 部署在您的电脑、服务器或者其他任何地方.

### 安装 RSSHub

首先是下载 `RSSHub` 的源码, 请执行下列命令.

```bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

下载完成后, 需要安装依赖.

使用 `npm`

```bash
$ npm install
```

或 `yarn`

```bash
$ yarn
```

由于众所周知的原因, 在中国使用 `npm` 下载依赖十分缓慢, 建议挂一个代理或者考虑使用 [NPM 镜像](https://npm.taobao.org/).

:::

### 启动

在 `RSSHub` 文件夹中运行下面的命令就可以启动.

```bash
$ npm start
```

或

```bash
$ yarn start
```

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/), enjoy it! ✅

::: tip tip

详细使用说明参照 [指南](https://docs.rsshub.app/). 替换所有路由例子中的 `https://rsshub.app/` 为 `http://localhost:1200` 即可正常使用.

:::

### 更新

在 `RSSHub` 文件夹中运行下面的命令就从 github 仓库拉取最新版本.

```bash
$ git pull
```

### 添加配置

可以通过修改 `config.js` 或者设置环境变量来配置 RSSHub.

**如何设置环境变量**

Windows 系统在 cmd.exe 中运行 `$ set PORT=1000`

macOS & Linux 运行 `$ PORT=1000`

再运行 `$ npm start` 启动 RSSHub 即可将监听端口设置为 `1000`.

此处设置的环境变量在关闭终端后就会被清除, 如果您想保存这些配置可以编写一个简单的 [批处理文件](https://en.wikipedia.org/wiki/Batch_file) 或 [shell](https://en.wikipedia.org/wiki/Shell_script).

更多配置项请看 [应用配置](#应用配置)

### 使用 Redis 数据库缓存

RSSHub 默认会有 5 分钟的缓存, 默认缓存是存放在内存中的. RSSHub 还支持 Redis 数据库缓存.

::: tip 提示

除非流量特别大或者您需要建立分布式集群, 否则不需要 Redis 缓存.

:::

修改配置项 `CACHE_TYPE` 为 `redis`, RSSHub 将使用默认地址 `redis://localhost:6379/` 连接 Redis, 如果需要修改地址请看 [应用配置](#应用配置).

## 使用 Docker 部署

运行下面的命令下载 RSSHub 镜像.

```bash
$ docker pull diygod/rsshub
```

然后运行 RSSHub 即可

```bash
$ docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/), enjoy it! ✅

您可以使用下面的命令来关闭 RSSHub.

```bash
$ docker stop rsshub
```

### 添加配置

配置运行在 docker 中的 RSSHub, 最便利的方法是使用 docker 环境变量.

以设置缓存时间为 1 小时举例, 只需要在运行时增加参数: `-e CACHE_EXPIRE=3600`

```bash
$ docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 -e GITHUB_ACCESS_TOKEN=example diygod/rsshub
```

更多配置项请看 [应用配置](#应用配置)

### 使用 docker-compose 部署

1.  创建 volume 持久化 Redis 缓存

```bash
$ docker volume create redis-data
```

2.  修改 [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml) 中的 `environment` 进行配置

3.  部署

```bash
$ docker-compose up
```

4.  更新

```bash
$ docker-compose build
$ docker-compose up
```

## 部署到 Heroku

[![Deploy](https://i.imgur.com/e6ZcmUY.png)](https://heroku.com/deploy?template=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub)

## 部署到 Google App Engine

### 部署之前

[Before you begin](https://cloud.google.com/appengine/docs/flexible/nodejs/quickstart)

按照这里的引导完成 GCP 账号设置, 创建 GCP 项目, 创建 App Engine 项目, 开通付费功能（必须）, 安装 git 与 gcloud 工具. 并完成 gcloud 工具的初始化, 初始化具体方式[请查看这个链接](https://cloud.google.com/sdk/gcloud/?hl=zh-CN). 如果你不打算在本地调试本项目, 可以不安装 Node.js 环境.

请注意, GAE 免费用量不支持 Flexible Environment, 部署至 Flexible Environment 前请确认收费标准.

Node.JS 的 standard environment 仍在测试中, 您可能会在部署或使用中遇到某些不可预期的问题.

### 拉取

运行 `git clone https://github.com/DIYgod/RSSHub.git` 拉取本项目的最新版本.

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

### 开始部署

在 RSSHub 项目根目录下运行

```bash
gcloud app deploy
```

进行项目部署, 如果您需要变更 app.yaml 文件名称或者变更部署的项目 ID 或者指定版本号等, 请参考[这个链接](https://cloud.google.com/appengine/docs/flexible/nodejs/testing-and-deploying-your-app)的"Deploying a service" 部分.

部署完成后可访问您的 Google App Engine URL 查看部署情况.

## 配置

### 应用配置

可以通过修改 `config.js` 或者设置环境变量来配置 RSSHub.

::: tip 提示

建议通过设置环境变量来配置 RSSHub. 避免版本更新时的冲突.

:::

`PORT`: 监听端口, 默认为 `1200`

`SOCKET`: 监听 Unix Socket, 默认为 `null`

`CACHE_TYPE`: 缓存类型, 可为 `memory` 和 `redis`, 设为空可以禁止缓存, 默认为 `memory`

`CACHE_EXPIRE`: 缓存过期时间, 单位为秒, 默认 `300`

`LISTEN_INADDR_ANY`: 是否允许公网连接, 默认 `1`

`TITLE_LENGTH_LIMIT`: 限制输出标题的字节长度, 一个英文字符的长度为 1 字节, 部分语言如中文, 日文, 韩文或阿拉伯文等, 统一算作 2 字节, 默认 `100`

`REDIS_URL`: Redis 连接地址（memory 缓存类型时无效）, 默认为 `redis://localhost:6379/`

`REDIS_PASSWORD`: Redis 连接密码（memory 缓存类型时无效）

`HTTP_BASIC_AUTH_NAME`: Http basic authentication 用户名, 默认为 `usernam3`, 请务必修改

`HTTP_BASIC_AUTH_PASS`: Http basic authentication 密码, 默认为 `passw0rd`, 请务必修改

### 用户认证

`protected_route.js` 内的路由将启用 HTTP Basic Authentication 认证.

支持该认证协议的阅读器, 在添加源地址时, 需要在源地址前添加认证信息, 例如：http://usernam3:passw0rd@localhost:1200/protected/rsshub/rss.

### 部分 RSS 模块配置

-   `pixiv`: [注册地址](https://accounts.pixiv.net/signup)

    -   `PIXIV_USERNAME`: Pixiv 用户名

    -   `PIXIV_PASSWORD`: Pixiv 密码

-   `disqus`: [申请地址](https://disqus.com/api/applications/)

    -   `DISQUS_API_KEY`: Disqus API

-   `twitter`: [申请地址](https://apps.twitter.com)

    -   `TWITTER_CONSUMER_KEY`: Twitter Consumer Key

    -   `TWITTER_CONSUMER_SECRET`: Twitter Consumer Secret

    -   `TWITTER_ACCESS_TOKEN`: Twitter Access Token

    -   `TWITTER_ACCESS_TOKEN_SECRET`: Twitter Access Token Secret

-   `youtube`: [申请地址](https://console.developers.google.com/)

    -   `YOUTUBE_KEY`: YouTube API Key

-   `telegram`: [Telegram 机器人](https://telegram.org/blog/bot-revolution)

    -   `TELEGRAM_TOKEN`: Telegram 机器人 token

-   `gitHhub`: [申请地址](https://github.com/settings/tokens)

    -   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

### 访问控制

可以通过修改 `middleware/access-control.js` 或者设置环境变量来配置黑名单和白名单.

支持 IP 和路由, 设置多项时用英文逗号 `,` 隔开. 同时设置黑名单和白名单时仅白名单有效.

-   `BLACKLIST`: 黑名单

-   `WHITELIST`: 白名单, 设置白名单后黑名单无效
