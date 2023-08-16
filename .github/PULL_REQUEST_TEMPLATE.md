<!-- 
如有疑问，请参考 https://docs.rsshub.app/joinus/new-rss/submit-route
Reference: https://docs.rsshub.app/en/joinus/new-rss/submit-route
-->

## 该 PR 相关 Issue / Involved Issue

Close #

## 路由地址示例 / Example for the Proposed Route(s)

<!--
请在 `routes` 区域填写以 / 开头的完整路由地址，否则你的 PR 将会被无条件关闭。
如果路由包含在文档中列出可以完全穷举的参数（例如分类），请依次全部列出。

Please include route starts with /, with all required and optional parameters. Fail to comply will result in your pull request being closed automatically.
```route
/some/route
/some/other/route
/dont/use/this/or/modify/it
/use/the/fenced/code/block/below
```
如果你的 PR 与路由无关, 请在 `routes` 区域 填写 `NOROUTE`，而不是直接删除 `routes` 区域。否则你的 PR 将会被无条件关闭。
If your changes are not related to route, please fill in `routes` section with `NOROUTE`. Fail to comply will result in your PR being closed.
-->

```routes
```

## 新 RSS 路由检查表 / New RSS Route Checklist
  
- [ ] 新的路由 New Route
  - [ ] 跟随 [v2 路由规范](https://docs.rsshub.app/joinus/advanced/script-standard) Follows [v2 Script Standard](https://docs.rsshub.app/en/joinus/advanced/script-standard)
- [ ] 文档说明 Documentation
  - [ ] 中文文档 CN
  - [ ] 英文文档 EN
- [ ] 全文获取 full article
  - [ ] 使用缓存 Use cache
- [ ] 反爬/频率限制 anti-bot or rate limit?
  - [ ] 如果有, 是否有对应的措施? If yes, do your code reflect this sign?
- [ ] [日期和时间](https://docs.rsshub.app/joinus/advanced/pub-date) [date and time](https://docs.rsshub.app/en/joinus/advanced/pub-date)
  - [ ] 可以解析 Parsed
  - [ ] 时区正确 Correct time zone
- [ ] 添加了新的包 New package added
- [ ] `Puppeteer`

## 说明 / Note
