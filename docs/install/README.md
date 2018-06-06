---
sidebar: auto
---

# 部署

部署 RSSHub 非常简单，如果您在部署过程中遇到无法解决的问题请到 [issues](https://github.com/DIYgod/RSSHub/issues) 寻找类似的问题或 [向我们提问](https://github.com/DIYgod/RSSHub/issues/new)，我们会尽快给您答复。

## 手动部署

部署 `RSSHub` 最直接的方式，您可以按照以下步骤将 `RSSHub` 部署在您的 电脑、服务器或者其他任何地方。

### 在安装之前

在安装 RSSHub 之前，请确保您的电脑中已经安装了 [Git](https://git-scm.com/) 和 [Node.js >= 8.0.0](https://nodejs.org/)。

### 安装 Git

::: tip 提示

首先您应该输入 `git`，看看系统有没有安装 Git：

windows 打开 `cmd`， macOS 打开`终端(terminal)`。

```bash
$ git
usage: git [--version] [--help] [-C <path>] [-c name=value]
...
```

:::

-   Windows：从 Git 官网直接[下载安装程序](https://git-scm.com/downloads)。
-   MacOS：使用 [Homebrew](https://brew.sh/) `$ brew install git` 或者[下载安装程序](https://git-scm.com/download/mac)。
-   Linux：使用您的包管理器安装例如 `$ sudo apt-get install git`。

### 安装 Node.JS

#### Windows

Windows 用户请 [下载安装程序](https://nodejs.org/zh-cn/)。安装时，请勾选`Add to PATH`选项。

#### MacOS & Linux

安装 NodeJS 的最佳方式是使用 [nvm](https://github.com/creationix/nvm)。

安装 `nvm`

```bash
$ curl https://raw.github.com/creationix/nvm/master/install.sh | sh
```

安装完成后，重启终端并执行下列命令即可安装 `Node.js`。

```bash
$ nvm install node
```

### 安装 RSSHub

首先是下载 `RSSHub` 的源码，请执行下列命令。

```bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

下载完成后，需要安装依赖。

```bash
$ npm install
```

::: tip 提示

推荐使用 [Yarn](https://yarn.bootcss.com/) ，`Yarn` 比 `npm` 更快更稳定。

使用 `Yarn` 安装依赖时只需要键入

```bash
$ yarn
```

由于众所周知的原因，在中国使用 `npm` 下载依赖十分缓慢，建议挂一个代理或者考虑使用 [NPM 镜像](https://npm.taobao.org/)。

:::

### 启动

在 `RSSHub` 文件夹中运行下面的命令就可以启动。

```bash
$ npm start
```

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/)，enjoy it! ✅

### 更新

在 `RSSHub` 文件夹中运行下面的命令就从 github 仓库拉取最新版本。

```bash
$ git pull
```

### 添加配置

可以通过修改 `config.js` 或者设置环境变量来配置 RSSHub。

**如何设置环境变量**

Windows 系统在 cmd.exe 中运行 `$ set PORT=1000`

macOS & Linux 运行 `$ PORT=1000`

再运行 `$ npm start` 启动 RSSHub 即可将监听端口设置为 `1000`。

此处设置的环境变量在关闭终端后就会被清除，如果您想保存这些配置可以编写一个简单的 [批处理文件](https://en.wikipedia.org/wiki/Batch_file) 或 [shell](https://en.wikipedia.org/wiki/Shell_script)。

更多配置项请看 [应用配置](#应用配置)

### 使用 Redis 数据库缓存

RSSHub 默认会有 5 分钟的缓存，默认这个缓存是存放在内存中的。RSSHub 还支持 Redis 数据库缓存。

::: tip 提示

除非流量特别大或者您需要建立分布式集群，否则不需要 Redis 缓存。

:::

#### 安装 Redis

**Windows**

安装 Redis on Windows 直接[下载安装程序](https://github.com/MicrosoftArchive/redis/releases)。

在安装目录中运行下面的命令启动 Redis。

```bash
$ redis-server  redis.windows.conf
```

**MacOS**

使用 [Homebrew](https://brew.sh/) 安装 Redis。

```bash
$ brew install redis
```

再运行下面的命令启动 Redis。

```bash
$ brew services start redis
```

**Linux**

使用您的包管理器安装 Redis。

```bash
# apt
$ sudo apt install redis-server

# yum
$ sudo yum install redis
```

然后运行 `$ redis-server` 启动 Redis。

#### 启用 Redis 数据库缓存

修改配置项 `CACHE_TYPE` 为 `redis`，RSSHub 将使用默认地址 `redis://localhost:6379/` 连接 Redis，如果需要修改地址请看 [应用配置](#应用配置)。

## 部署到 Docker

Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。

### 安装 Docker

官方网站上有各种环境下的 [安装指南](https://docs.docker.com/engine/installation/)

### 部署

运行下面的命令下载 RSSHub 镜像。

```bash
$ docker pull diygod/rsshub
```

然后运行 RSSHub 即可

```bash
$ docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/)，enjoy it! ✅

您可以使用下面的命令来关闭 RSSHub。

```bash
$ docker stop rsshub
```

### 更新

您可以使用下面的命令来更新镜像。

```bash
# 先关闭 rsshub
$ docker stop rsshub

# 删除现有的容器
$ docker rm rsshub

# 下载最新版的 rsshub 镜像
$ docker pull diygod/rsshub
```

### 添加配置

配置运行在 docker 中的 RSSHub，最便利的方法是使用环境变量。

以设置缓存时间为 1 小时举例，只需要在运行时增加参数：`-e CACHE_EXPIRE=3600`

```bash
$ docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 -e GITHUB_ACCESS_TOKEN=example diygod/rsshub
```

更多配置项请看 [应用配置](#应用配置)

### 使用 docker-compose 部署

[docker-compose](https://docs.docker.com/compose/overview/) 是用来运行多容器 Docker 应用的小工具，可以简化配置部署过程：

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

按照这里的引导完成 GCP 账号设置，创建 GCP 项目，创建 App Engine 项目，开通付费功能（必须），安装 git 与 gcloud 工具。并完成 gcloud 工具的初始化，初始化具体方式[请查看这个链接](https://cloud.google.com/sdk/gcloud/?hl=zh-CN)。如果你不打算在本地调试本项目，可以不安装 Node.js 环境。

请注意，GAE 免费用量不支持 Flexible Environment ，部署前请确认收费标准。

### 拉取

运行 git clone https://github.com/DIYgod/RSSHub.git 拉取本项目的最新版本。

### app.yaml 配置

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
  CACHE_EXPIRE: "300"
# [END app_yaml]
```

### 开始部署

在 RSSHub 项目根目录下运行

```bash
gcloud app deploy
```

进行项目部署，如果您需要变更 app.yaml 文件名称或者变更部署的项目 ID 或者指定版本号等，请参考[这个链接](https://cloud.google.com/appengine/docs/flexible/nodejs/testing-and-deploying-your-app)的"Deploying a service" 部分。

部署完成后可访问您的 Google App Engine URL 查看部署情况。

## 配置

### 应用配置

可以通过修改 `config.js` 或者设置环境变量来配置 RSSHub。

::: tip 提示

建议通过设置环境变量来配置 RSSHub。避免版本更新时的冲突。

:::

`PORT`: 监听端口，默认为 `1200`

`CACHE_TYPE`: 缓存类型，可为 `memory` 和 `redis`，设为空可以禁止缓存，默认为 `memory`

`CACHE_EXPIRE`: 缓存过期时间，单位为秒，默认 300

`LISTEN_INADDR_ANY`: 是否允许公网连接，默认 1

`REDIS_URL`: Redis 连接地址（memory 缓存类型时无效），默认为 `redis://localhost:6379/`

`REDIS_PASSWORD`: Redis 连接密码（memory 缓存类型时无效）

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

-   `github`: [申请地址](https://github.com/settings/tokens)

    -   `GITHUB_ACCESS_TOKEN`: GitHub Access Token

### 访问控制

可以通过修改 `middleware/access-control.js` 或者设置环境变量来配置黑名单和白名单。

支持 IP 和路由，设置多项时用英文逗号 `,` 隔开。同时设置黑名单和白名单时仅白名单有效。

-   `BLACKLIST`: 黑名单

-   `WHITELIST`: 白名单，设置白名单后黑名单无效
