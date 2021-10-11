<!-- 
如有疑问，请参考 https://github.com/DIYgod/RSSHub/discussions/8002
Reference: https://github.com/DIYgod/RSSHub/discussions/8002
-->

## 该 PR 相关 Issue / Involved issue

Close #

## 完整路由地址 / Example for the proposed route(s)

<!--
为方便测试，请附上完整路由地址（可以真正访问的地址），否则将导致 PR 被关闭
请按照如下格式填写`routes`区域: 我们将会根据你的参数展开自动测试. 一行一个路由
如果路由包含在文档中列出可以完全穷举的参数（例如分类），请依次全部列出
To simplify the testing workflow, please include COMPLETE route URL, with all required and optional parameters, otherwise your pull request will be closed.
Please fill the `routes` block follow the format below, as we will perform automatic test based on this information. one route per line.
```
/some/route
/some/other/route
```
如果与路由无关, 请写`NOROUTE`
请不要删除代码块`routes`标识 
If it is not related to route, use `NOROUTE` to bypass CI
FILL BELOW and keep `routes` keyword
-->

```routes
```

## 新RSS检查列表 / New RSS Script Checklist
  
- [ ] New Route
- [ ] Documentation
  - [ ] CN
  - [ ] EN
- [ ] 全文获取 fulltext
  - [ ] Use Cache
- [ ] 反爬/频率限制 anti-bot or rate limit?
  - [ ] 如果有, 是否有对应的措施? If yes, do your code reflect this sign?
- [ ] 日期和时间 date and time
  - [ ] 可以解析 Parsed
  - [ ] 时区调整 Correct TimeZone
- [ ] 添加了新的包 New package added 
- [ ] `Puppeteer`

## 说明 / Note
