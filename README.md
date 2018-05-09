<p align="center">
<img src="https://i.imgur.com/NZpRScX.png" alt="RSSHub" width="100">
</p>
<h1 align="center">RSSHub</h1>

> 🍭 使用 RSS 连接全世界

## 介绍

RSSHub 是一个轻量、易于扩展的 RSS 生成器，可以给任何奇奇怪怪的内容生成 RSS 订阅源

[使用文档](https://rsshub.js.org)

当前支持列表：

- bilibili
  - 番剧
  - UP 主投稿
  - UP 主动态
  - UP 主收藏夹
  - UP 主投币视频
  - UP 主粉丝
  - UP 主关注用户
  - 分区视频
  - 视频评论
  - link 公告
- 微博
  - 博主
  - 关键词
- 网易云音乐
  - 歌单歌曲
  - 用户歌单
  - 歌手专辑
- 掘金
  - 分类
- 简书
  - 首页
  - 7 日热门
  - 30 日热门
  - 专题
  - 作者
- 知乎
  - 收藏夹
  - 用户动态
  - 专栏
- 自如
  - 房源
- 快递
- 贴吧
  - 帖子列表
- 妹子图
  - 首页（最新）
  - 分类
  - 所有专题
  - 专题详情
  - 详情
- pixiv
  - 用户收藏
  - 用户动态
  - 排行榜
- 豆瓣
  - 正在上映的电影
  - 正在上映的高分电影
  - 即将上映的电影
  - 北美票房榜
- 煎蛋
  - 无聊图
- 喷嚏
  - 图卦
- Dockone
  - 周报
- 腾讯吐个槽
  - 吐槽新帖
- 笔趣阁
  - 小说章节
- 开发者头条
  - 今天头条
  - 独家号
- Disqus
  - 评论
- Twitter
  - 用户

## 参与我们

如果有任何想法或需求，可以在 [issue](https://github.com/DIYgod/RSSHub/issues) 中告诉我们，同时我们欢迎各种 pull requests

### 提交新的 RSS 内容

1. 在 [/router.js](https://github.com/DIYgod/RSSHub/blob/master/router.js) 里添加路由

1. 在 [/routes/](https://github.com/DIYgod/RSSHub/tree/master/routes) 中的路由对应路径添加获取 RSS 内容的脚本

1. 更新 README 和文档: [/README.md](https://github.com/DIYgod/RSSHub/blob/master/README.md) [/docs/README.md](https://github.com/DIYgod/RSSHub/blob/master/docs/README.md)

### 参与讨论

1. [Telegram 群](https://t.me/rsshub)

## 搭建

环境：需要 Node.js v7.6.0 或更高版本，若启用 Redis 缓存需要先启动 Redis

安装依赖：`yarn`

修改配置：配置文件为 `config.js`

启动程序：`node index.js`

## Contributors

This project exists thanks to all the people who contribute.

<a href="https://github.com/DIYgod/RSSHub/graphs/contributors"><img src="https://opencollective.com/RSSHub/contributors.svg?width=890&button=false" /></a>

## 赞助 RSSHub 的研发

RSSHub 是采用 MIT 许可的开源项目，使用完全免费。 但是随着项目规模的增长，也需要有相应的资金支持才能持续项目的维护与开发。

你可以通过下列的方法来赞助 RSSHub 的开发。

### 一次性赞助

我们通过以下方式接受赞助：

- [微信支付](https://i.imgur.com/aq6PtWa.png)
- [支付宝](https://i.imgur.com/wv1Pj2k.png)
- [Paypal](https://www.paypal.me/DIYgod)
- 比特币: 13CwQLHzPYm2tewNMSJBeArbbRM5NSmCD1

### 周期性赞助

周期性赞助可以获得额外的回报，比如你的名字 会出现在 RSSHub 的 GitHub 仓库和现在我们的官网中。

- 通过 [OpenCollective](https://opencollective.com/RSSHub) 赞助成为 backer 或 sponsor
- 给我们发邮件联系赞助事宜: i#html.love

## Author

**RSSHub** © [DIYgod](https://github.com/DIYgod), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by DIYgod with help from contributors ([list](https://github.com/DIYgod/RSSHub/contributors)).

> Blog [@DIYgod](https://diygod.me) · GitHub [@DIYgod](https://github.com/DIYgod) · Twitter [@DIYgod](https://twitter.com/DIYgod) · Telegram Channel [@awesomeDIYgod](https://t.me/awesomeDIYgod)
