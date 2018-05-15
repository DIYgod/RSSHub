---
sidebar: auto
---

# 部署

部署 RSSHub 非常简单，如果你在部署过程中遇到无法解决的问题请到 [issues](https://github.com/DIYgod/RSSHub/issues) 寻找类似的问题或 [向我们提问](https://github.com/DIYgod/RSSHub/issues/new)，我们会尽快给你答复。

[[toc]]

## 手动部署

部署 `RSSHub` 最直接的方式，你可以按照以下步骤将 `RSSHub` 部署在您的电脑、服务器或者其他任何地方。

### 在安装之前

在安装 RSSHub 之前，请确保你到电脑中已经安装了 [Node.js >= 10.0](https://nodejs.org/) 和 [Git](https://git-scm.com/)。

### 安装 Git

::: tip 提示
首先你应该输入 `git`，看看系统有没有安装 Git：

windows 打开 `cmd`， macOS 打开`终端(terminal)`。

``` bash
$ git
usage: git [--version] [--help] [-C <path>] [-c name=value]
...
```
:::

* Windows：从Git官网直接[下载安装程序](https://git-scm.com/downloads)。
* MacOS：使用 [Homebrew](https://brew.sh/) `brew install git` 或者[下载安装程序](https://git-scm.com/download/mac)。
* Linux：使用你的包管理器安装例如 `sudo apt-get install git`。

### 安装 Node.JS

#### Windows
Windows 用户请 [下载安装程序](https://nodejs.org/zh-cn/)。安装时，请勾选`Add to PATH`选项。

#### MacOS & Linux
安装 NodeJS 的最佳方式是使用 [nvm](https://github.com/creationix/nvm)。

安装 `nvm`
``` bash
$ curl https://raw.github.com/creationix/nvm/master/install.sh | sh
```

安装完成后，重启终端并执行下列命令即可安装 `Node.js`。

``` bash
$ nvm install node
```

### 安装 RSSHub

首先是下载 `RSSHub` 的源码，请执行下列命令。

``` bash
$ git clone https://github.com/DIYgod/RSSHub.git
$ cd RSSHub
```

下载完成后，需要安装依赖。

``` bash
$ npm install
```

::: tip 提示
推荐使用 [Yarn](https://yarn.bootcss.com/) ，`Yarn` 比 `npm` 更快更稳定。

使用 `Yarn` 安装依赖时只需要键入
``` bash
$ yarn
```

由于众所周知的原因，在中国使用 `npm` 下载依赖十分缓慢，建议挂一个代理或者考虑使用 [NPM 镜像](https://npm.taobao.org/)。
:::

### 启动 RSSHub

在 `RSSHub` 文件夹中运行下面的命令就可以启动。

```
$ npm start
```

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/)，enjoy it! ✅

## 部署到 docker

Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。

运行下面的命令下载 RSSHub 镜像。

``` bash
$ docker pull diygod/rsshub
```

然后运行 RSSHub 即可

``` bash
& docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

在浏览器中打开 [http://127.0.0.1:1200/](http://127.0.0.1:1200/)，enjoy it! ✅

您可以使用下面的命令来关闭 RSSHub。

``` bash
$ docker stop rsshub
```

### 添加配置

配置运行在 docker 中的 RSSHub，最便利的方法是使用环境变量。

以设置缓存时间为1小时举例，只需要在运行时增加参数：`-e CACHE_EXPIRE=3600`

``` bash
& docker run -d --name rsshub -p 1200:1200 -e CACHE_EXPIRE=3600 PORT=1000 diygod/rsshub
```

更多配置项请看 [应用配置](#应用配置)

## 部署到 Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https%3A%2F%2Fgithub.com%2FDIYgod%2FRSSHub)

## 配置

### 应用配置

可以通过修改 `config.js` 或者设置环境变量来配置 RSSHub。

`PORT`: 监听端口，默认为 `1200`

`CACHE_TYPE`: 缓存类型，可为 `memory` 和 `redis`，设为空可以禁止缓存，默认为 `memory`

`CACHE_EXPIRE`: 缓存过期时间，单位为秒，默认 300

`LISTEN_INADDR_ANY`: 是否允许公网连接，默认 1

`REDIS_URL`: Redis 连接地址（memory 缓存类型时无效）

`REDIS_PASSWORD`: Redis 连接密码（memory 缓存类型时无效）

### 部分 RSS 模块配置

`pixiv`: [注册地址](https://accounts.pixiv.net/signup)

`disqus`: [申请地址](https://disqus.com/api/applications/)

`twitter`: [申请地址](https://apps.twitter.com)

`youtube`: [申请地址](https://console.developers.google.com/)
