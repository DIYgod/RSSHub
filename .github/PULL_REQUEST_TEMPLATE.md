<!-- 
If you have any difficulties in filling out this form, please refer to https://docs.rsshub.app/joinus/new-rss/submit-route
如果你在填写此表单时遇到任何困难，请参考 https://docs.rsshub.app/zh/joinus/new-rss/submit-route
-->

## Involved Issue / 该 PR 相关 Issue

Close #

## Example for the Proposed Route(s) / 路由地址示例

<!--
Please include route starts with /, with all required and optional parameters.
Fail to comply will result in your pull request being closed automatically.
请在 `routes` 区域填写以 / 开头的完整路由地址，否则你的 PR 将会被无条件关闭。
如果路由包含在文档中列出可以完全穷举的参数（例如分类），请依次全部列出。

```routes
/some/route
/some/other/route
/dont/use/this/or/modify/it
/use/the/fenced/code/block/below
```

If your changes are not related to route, please fill in `routes` section with `NOROUTE`. Fail to comply will result in your PR being closed.
如果你的 PR 与路由无关, 请在 `routes` 区域 填写 `NOROUTE`，而不是直接删除 `routes` 区域。否则你的 PR 将会被无条件关闭。
-->

```routes
```

## New RSS Route Checklist / 新 RSS 路由检查表
  
- [ ] New Route / 新的路由
  - [ ] Follows [Script Standard](https://docs.rsshub.app/joinus/advanced/script-standard) / 跟随 [路由规范](https://docs.rsshub.app/zh/joinus/advanced/script-standard)
- [ ] Anti-bot or rate limit / 反爬/频率限制
  - [ ] If yes, do your code reflect this sign? / 如果有, 是否有对应的措施?
- [ ] [Date and time](https://docs.rsshub.app/joinus/advanced/pub-date) / [日期和时间](https://docs.rsshub.app/zh/joinus/advanced/pub-date)
  - [ ] Parsed / 可以解析
  - [ ] Correct time zone / 时区正确
- [ ] New package added / 添加了新的包
- [ ] `Puppeteer`

## Note / 说明
