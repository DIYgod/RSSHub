<!-- 
请不要删除已有内容（注释除外）, 这会导致自动检测失败；不符合要求保留默认内容即可
Do not remove existing titles or structures: it breaks CI
如果有疑问，可以参考已经合并的PR格式
Reference to merged PR if you have question over PR format
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

<!-- 
Please go over the checklist below before PR: this improve your PR pass rate.
Reference: https://docs.rsshub.app/en/joinus/quick-start.html
请在提交PR前检查以下事项: 这可以大大提升通过率
这些就是我们在审核时主要关注的事项, 敬请留意
参考: https://docs.rsshub.app/joinus/quick-start.html
-->

- [ ] 这个PR中包含了新的路由吗? Does this PR add new route?
  - 如果有, 请完成检查列表. If yes, please finish the check list
  - **如果你的PR符合下方某个事项, 也请注明. If any of the checklist item meets your PR, please fill it out.**
  - [x] <- 这样打勾
- [ ] 是否提供了文档? Documentation provided?
  - [ ] 是否提供了英文文档? EN Documentation provided?
- [ ] 是否支持全文获取? Is this RSS Script support fulltext?
  - [ ] 如果全文获取中需要访问文章链接, 是否使用了缓存? If fulltext requires to fetch detail pages, is cache used in the process?
  - [缓存说明](https://docs.rsshub.app/joinus/quick-start.html#ti-jiao-xin-de-rsshub-gui-ze-bian-xie-jiao-ben-shi-yong-huan-cun) | [How to use cache](https://docs.rsshub.app/joinus/quick-start.html#ti-jiao-xin-de-rsshub-gui-ze-bian-xie-jiao-ben-shi-yong-huan-cun)
- [ ] 目标是否有明显的反爬/频率限制? Is there any sign of anti-bot or rate limit?
  - [ ] 如果有, 是否有对应的措施? (延长缓存时间, 写文档说明, etc.) If yes, do your code reflect this sign? (e.g. write documentations, use long cache time)
- [ ] 目标是否有提供日期？ Is there a date in the source?
  - [ ] 如果有，包是否正确解析？ If there is, can this script provide this info?
  - [ ] 如果有提供解析能力，时区是否正确调整？ Is the timezone correctly provided?
  - 如果有提供日期，但是没有提供解析，请说明原因 If there is a date but this script does not parse, please provide your reason.
- [ ] 是否引入的新的包? Any new package introduced?
  - 如果有, 请说明原因. If yes, please state your reason
- [ ] 是否使用了`Puppeteer`? Make use of `Puppeteer`?
  - 如果有, 请说明原因. If yes, please state your reason
  

## 说明 / Note
<!-- 
Please state your reason/note here 
请在这里描述你的原因或留下其他相关的说明
-->
