## 该 PR 相关 Issue / Involved issue

Close #

## 完整路由地址 / Example for the proposed route(s)

<!--

为方便测试，请附上完整路由地址，包括所有必选与可选参数，否则将导致 PR 被关闭。

To simplify the testing workflow, please include the complete route, with all required and optional parameters, otherwise your pull request will be closed.

-->

## 新RSS检查列表 / New RSS Script Checklist

<!-- 

Please go over the checklist below before PR: this improve your PR pass rate.

Reference: https://docs.rsshub.app/en/joinus/

请在提交PR前检查以下事项: 这可以提升PR通过率

参考: https://docs.rsshub.app/joinus

-->

- [ ] 这是在提交一个新的RSS吗? Is this a new RSS Script?
  - **如果不是, 请留空本列表**. **LEAVE BLANK** if it is not a submitting new RSS Script
- [ ] 是否提供了文档? Documentation provided?
  - [ ] 是否提供了英文文档? EN Documentation provided?
- [ ] 是否支持全文获取? Is this RSS Script support fulltext?
  - [ ] 如果全文获取中需要访问文章链接, 是否使用了缓存? If fulltext requires to fetch detail pages, is cache used in the process?
  - [缓存说明](https://docs.rsshub.app/joinus/#ti-jiao-xin-de-rsshub-gui-ze-bian-xie-jiao-ben-shi-yong-huan-cun) | [How to use cache](https://docs.rsshub.app/joinus/#ti-jiao-xin-de-rsshub-gui-ze-bian-xie-jiao-ben-shi-yong-huan-cun)
- [ ] 目标是否有明显的反爬/频率限制? Is there any sign of anti-bot or rate limit?
  - [ ] 如果有, 是否有对应的措施? (延长缓存时间, 写文档说明, etc.) If yes, do your code reflect this sign? (e.g. write documentations, use long cache time)
- [ ] 是否引入的新的包? Any new package introduced?
  - 如果有, 请说明原因. If yes, please state your reason
- [ ] 是否使用了`Puppeteer`? Make use of `Puppeteer`?
  - 如果有, 请说明原因. If yes, please state your reason
  

## 说明 / Note

<!-- 

Please state your reason/note here 

请在这里描述你的原因或留下其他相关的说明

-->
