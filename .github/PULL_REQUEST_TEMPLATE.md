<!-- 
如有疑问，请参考 https://github.com/DIYgod/RSSHub/discussions/8002
Reference: https://github.com/DIYgod/RSSHub/discussions/8002
-->

## 该 PR 相关 Issue / Involved issue

Close #

## 完整路由地址 / Example for the proposed route(s)

<!--
请在 `routes` 区域填写以 / 开头的完整路由地址，否则你的 PR 将会被无条件关闭。
如果路由包含在文档中列出可以完全穷举的参数（例如分类），请依次全部列出。

Please include route starts with /, with all required and optional parameters. Fail to comply will result in your pull request being closed automatically.
```route
/some/route
/some/other/route
```
如果你的 PR 与路由无关, 请在 route 区域 填写 `NOROUTE`，而不是直接删除 `routes` 区域。否则你的 PR 将会被无条件关闭。
If your changes are not related to route, please fill in `routes` with `NOROUTE`. Fail to comply will result in your PR being closed.
-->

```routes
```

## 新 RSS 检查列表 / New RSS Script Checklist
  
- [ ] 新的路由 New Route
  - [ ] 跟随 [v2 路由规范](https://docs.rsshub.app/joinus/script-standard.html) Follows [v2 Script Standard](https://docs.rsshub.app/en/joinus/script-standard.html)
- [ ] 文档说明 Documentation
  - [ ] 中文文档 CN
  - [ ] 英文文档 EN
- [ ] 全文获取 fulltext
  - [ ] 使用缓存 Use Cache
- [ ] 反爬/频率限制 anti-bot or rate limit?
  - [ ] 如果有, 是否有对应的措施? If yes, do your code reflect this sign?
- [ ] [日期和时间](https://docs.rsshub.app/joinus/pub-date.html) [date and time](https://docs.rsshub.app/en/joinus/pub-date.html)
  - [ ] 可以解析 Parsed
  - [ ] 时区调整 Correct TimeZone
- [ ] 添加了新的包 New package added
- [ ] `Puppeteer`

## 说明 / Note
