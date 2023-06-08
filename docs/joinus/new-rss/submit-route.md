---
sidebarDepth: 2
---
# 提交路由

当您完成您的路由后，您可以提交一个 Pull Request（下称 PR）到 [RSSHub](https://github.com/DIYgod/RSSHub)。我们将使用 squash merge 策略，这意味着您分支中的所有提交将合并成 RSSHub 仓库上的一个提交。然而，保持您的提交历史干净整洁仍然很重要。我们还提供了一个直观的模板供您填写。

## PR 模板

````md
<!-- 
如有疑问，请参考 https://docs.rsshub.app/joinus/new-rss/submit-route.html
Reference: https://docs.rsshub.app/en/joinus/new-rss/submit-route.html
-->

## 该 PR 相关 Issue / Involved Issue

Close #

## 路由地址示例 / Example for the Proposed Route(s)

<!--
请在 `routes` 区域填写以 / 开头的完整路由地址，否则你的 PR 将会被无条件关闭。
如果路由包含在文档中列出可以完全穷举的参数（例如分类），请依次全部列出。

Please include route starts with /, with all required and optional parameters in the `routes` section. Fail to comply will result in your pull request being closed automatically.
```route
/some/route
/some/other/route
/dont/use/this/or/modify/it
/use/the/fenced/code/block/below
```
如果你的 PR 与路由无关, 请在 `routes` 区域填写 `NOROUTE`，而不是直接删除 `routes` 区域。否则你的 PR 将会被无条件关闭。
If your changes are not related to route, please fill in `routes` with `NOROUTE`. Fail to comply will result in your PR being closed.
-->

```routes
```

## 新 RSS 路由检查列表 / New RSS Route Checklist
  
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
````

### 相关的 Issue

您可以在此处填写此 PR 相关的 Issue 编号。如果没有相关的 Issue，请将其留空。如果您的 PR 被合并，相关的 Issue 将自动关闭。如果您想关闭多个 Issue，请添加另一个以空格或逗号分隔的 `Close #`。例如，`Close #123, Close #456, Close #789` 或 `Close #123 Close #456 Close #789`。

### 路由地址示例

在这里，您可以添加您添加的路由以及所有必需和可选参数。如果您想添加多条路由，请在新行中添加每条路由。例如：

````md
```routes
/github/issue/DIYgod
/github/issue/DIYgod/RSSHub
/github/issue/DIYgod/RSSHub-Radar
/github/issue/flutter/flutter
```
````

**不要**填写`/github/issue/:user/:repo?` 或 `/issue/:user/:repo?`。

如果您的更改与路由无关，例如文档，请在 `routes` 区域中填写 `NOROUTE`。

````md
```routes
NOROUTE
```
````

**不要**删除或不理会 `routes` 区域，否则您的 PR 将自动关闭。

对于路由相关的 PR，**不要**使用 `NOROUTE`，否则它们也将被自动关闭。

### 新 RSS 路由检查表

此检查表将帮助您确保您的 PR 包含所有必要的组件。虽然您不必勾选所有项目，以使您的 PR 合并，但请确保您的新路由遵循 [路由规范](/joinus/script-standard.html)。这是所有新路由的强制性要求。


```md
- [ ] 新的路由 New Route
```

要勾选项目，请将 `[ ]` 修改为 `[x]`.

```md
- [x] 新的路由 New Route
```

### 说明

此部分包含您想要分享的任何附加信息或评论。

## PR 标题

当您的拉取请求被合并时，拉取请求标题将用作提交信息。请遵循 [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/#概述) 规范。

如果您正在添加新的路由，包括所有必需的文档和 `radar.js`，请以 `route` 作为范围。如果仅添加新的 Radar 规则，则请以 `radar` 作为范围。

## 回复代码审查

您的拉取请求将由 RSSHub 维护者和机器人审核。您可以点击检查名称旁边的“Details”来检查自动检查的详细信息。如果 RSSHub 维护者要求更改，您可以提交并将更改推送到您的分支。PR 将自动更新以反映您的更改。您也可以使用 [“添加建议到批次 (Add suggestion to batch)”](https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request#applying-suggested-changes) 批量整合维护者的反馈。

## 接下来怎么做

当您的 PR 被合并后，将会构建一个新的 Docker 镜像。由于我们需要构建多个平台（包括 `linux/arm/v7`、`linux/arm64` 和 `linux/amd64`）以及包含和不包含 Chromium，该过程可能需要长达一个小时。
