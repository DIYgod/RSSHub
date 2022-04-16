# 常见问题

**Q: RSS 是什么？RSS 如何使用？可以推荐一下好用的 RSS 阅读器么？**

**A:** [我有特别的 RSS 使用技巧](https://diygod.me/ohmyrss/)

**Q: RSSHub 是如何工作的？**

**A:** 请求路由时，RSSHub 会按照给定规则请求源站数据，然后以 RSS 格式输出；如果在设定缓存时间内重新请求路由，则会直接返回缓存内容，不请求源站；再加一点点魔法。

**Q: RSSHub Radar 是如何工作的？**

**A:** 进入新页面时， RSSHub Radar 先根据页面 link 标签[寻找](https://github.com/DIYgod/RSSHub-Radar/blob/master/src/js/content/utils.js#L25)页面自带 RSS，再根据远程更新的[规则](https://github.com/DIYgod/RSSHub/blob/master/assets/radar-rules.js)寻找适用当前页面和当前网站的 RSSHub 路由；再加一点点魔法。

**Q: 演示地址可以用么？**

**A:** 演示地址为 [rsshub.app](https://rsshub.app), 缓存时间 120 分钟，可以随意使用。但如果你看到路由有 <Badge text="反爬严格" vertical="middle" type="warn"/> 标记，如微博、知乎等，意味着目标网站有严重的反爬策略，demo 无法确保可用性，建议自建来提高稳定性。

**Q: 为什么 RSSHub 里的图片加载不出来？**

**A:** RSSHub 里的图片地址都是源站地址，大部分有防盗链，所以 RSSHub 给图片加了 `referrerpolicy="no-referrer"` 属性来防止跨域问题，但部分 RSS 服务会自作主张去掉这个属性，如 Feedly、Inoreader，在它们的网页端图片会触发跨域加载不出来

**Q: 没有我想订阅的网站怎么办嘤嘤嘤 QAQ**

**A:** 如果你会写 JavaScript，请按照[规则](/joinus/quick-start.html#ti-jiao-xin-de-rsshub-gui-ze)提交 pull request，否则按照要求[提交 issue](https://github.com/DIYgod/RSSHub/issues/new?template=rss_request_zh.md)，然后等待有缘人完成你的需求，也可以考虑[赞助项目](/support)或附上一张你自己的女装照来获得更快的 issue 响应速度。

**Q: 我怎么才能知道 RSSHub 更新了哪些路由？**

**A:** 可以使用 RSS 订阅[RSSHub 有新路由啦](/program-update.html#rsshub)。
