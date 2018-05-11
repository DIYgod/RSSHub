# 部署

## 环境

需要 Node.js v10.0.0 或更高版本，若启用 Redis 缓存需要先启动 Redis

## 安装

安装依赖：`yarn`

修改配置：配置文件为 `config.js`

启动程序：`node index.js`

## 配置

### 应用配置

`port`: 监听端口

`cacheType`: 缓存类型，可为 `memory` 和 `redis`

`cacheExpire`: 缓存过期时间

### 部分 RSS 模块配置

`pixiv`: [注册地址](https://accounts.pixiv.net/signup)

`disqus`: [申请地址](https://disqus.com/api/applications/)

`twitter`: [申请地址](https://apps.twitter.com)

`youtube`: [申请地址](https://console.developers.google.com/)