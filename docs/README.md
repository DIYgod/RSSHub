# 关于

<p align="center" class="logo-img">
    <img src="https://i.imgur.com/NZpRScX.png" alt="RSSHub" width="100">
</p>
<h1 align="center" class="logo-text">RSSHub</h1>

> 🍰 万物皆可 RSS

[![telegram](https://img.shields.io/badge/chat-telegram-brightgreen.svg?style=flat-square)](https://t.me/rsshub)
[![build status](https://img.shields.io/travis/DIYgod/RSSHub/master.svg?style=flat-square)](https://travis-ci.org/DIYgod/RSSHub)
[![Test coverage](https://img.shields.io/codecov/c/github/DIYgod/RSSHub.svg?style=flat-square)](https://codecov.io/github/DIYgod/RSSHub?branch=master)

RSSHub 是一个轻量、易于扩展的 RSS 生成器, 可以给任何奇奇怪怪的内容生成 RSS 订阅源

[Telegram 群](https://t.me/rsshub)

## 鸣谢

### Special Sponsors

<a href="https://rixcloud.app/rsshub" target="_blank"><img width="240px" src="https://i.imgur.com/qRP0eMg.png"></a>

### Sponsors

| [Eternal Proxy](https://proxy.eternalstudio.cn/?from=rsshub) | [Liuyang](https://github.com/lingllting) | [Sayori Studio](https://t.me/SayoriStudio) | 匿名 | [Sion Kazama](https://blog.sion.moe) |
| :----------------------------------------------------------: | :--------------------------------------: | :----------------------------------------: | :--: | :----------------------------------: |


[![](https://opencollective.com/static/images/become_sponsor.svg)](https://docs.rsshub.app/support/)

### Contributors

[![](https://opencollective.com/RSSHub/contributors.svg?width=740)](https://github.com/DIYgod/RSSHub/graphs/contributors)

Logo designed by [sheldonrrr](https://dribbble.com/sheldonrrr)

## 常见问题

**Q: RSSHub 是怎么工作的？**

**A:** 请求路由时，RSSHub 会按照给定规则请求源站数据，然后以 RSS 格式输出；如果在设定缓存时间内重新请求路由，则会直接返回缓存内容，不请求源站；再加一点点魔法。

**Q: 演示地址可以用么？**

**A:** 演示地址为 [rsshub.app](https://rsshub.app), 缓存时间 10 分钟, 可以随意使用。部分网站反爬策略严格，可能无法确保可用性，自建可以提高稳定性。

**Q: 没有我想订阅的网站怎么办嘤嘤嘤 QAQ**

**A:** 如果你会写 JavaScript，请按照[规则](/joinus/#%E6%8F%90%E4%BA%A4%E6%96%B0%E7%9A%84-rss-%E5%86%85%E5%AE%B9)提交 pull request，否则按照要求[提交 issue](https://github.com/DIYgod/RSSHub/issues/new?template=rss_request_zh.md)，然后等待有缘人完成你的需求，也可以考虑[赞助项目](/support)或附上一张你自己的女装照来获得更快的 issue 响应速度。

**Q: 可以推荐一下好用的 RSS 阅读器么？**

**A:** 最强组合：[Tiny Tiny RSS](https://github.com/HenryQW/docker-ttrss-plugins) + Reeder。

**Q: 我怎么才能知道 RSSHub 更新了哪些路由？**

**A:** 可以使用 RSS 订阅[RSSHub 有新路由啦](#rsshub)。
