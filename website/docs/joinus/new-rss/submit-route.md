---
sidebar_position: 5
---

# Submit your route

Once you have finished your route, you can submit a pull request (hereafter referred to as PR) to [RSSHub](https://github.com/DIYgod/RSSHub). We use a squash merge strategy, meaning all commits in your branch will be merged into one commit on RSSHub's repository. However, keeping your commit history clean and tidy is still important. We've also provided an intuitive template for you to fill out.

## Pull Request Template

````md
<!--
If you have any difficulties in filling out this form, please refer to https://docs.rsshub.app/joinus/new-rss/submit-route
如果你在填写此表单时遇到任何困难，请参考 https://docs.rsshub.app/zh/joinus/new-rss/submit-route
-->

## Involved Issue / 该 PR 相关 Issue

Close #

## Example for the Proposed Route(s) / 路由地址示例

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
如果你的 PR 与路由无关, 请在 `routes` 区域 填写 `NOROUTE`，而不是直接删除 `routes` 区域。否则你的 PR 将会被无条件关闭。
If your changes are not related to route, please fill in `routes` section with `NOROUTE`. Fail to comply will result in your PR being closed.
-->

```routes
```

## New RSS Route Checklist / 新 RSS 路由检查表

- [ ] New Route / 新的路由
  - [ ] Follows [Script Standard](https://docs.rsshub.app/joinus/advanced/script-standard) / 跟随 [路由规范](https://docs.rsshub.app/zh/joinus/advanced/script-standard)
- [ ] Documentation / 文档说明
- [ ] Full text / 全文获取
  - [ ] Use cache / 使用缓存
- [ ] Anti-bot or rate limit / 反爬/频率限制
  - [ ] If yes, do your code reflect this sign? / 如果有, 是否有对应的措施?
- [ ] [Date and time](https://docs.rsshub.app/joinus/advanced/pub-date) / [日期和时间](https://docs.rsshub.app/zh/joinus/advanced/pub-date)
  - [ ] Parsed / 可以解析
  - [ ] Correct time zone / 时区正确
- [ ] New package added / 添加了新的包
- [ ] `Puppeteer`

## Note / 说明
````

### Involved Issue

You can fill in the issue number that this PR is related to here. If there's no related issue, leave it blank. If your pull request gets merged, the related issue will be automatically closed. If you want to close multiple issues, add another `Close #` separated by a space or comma. For example, `Close #123, Close #456, Close #789` or `Close #123 Close #456 Close #789`.

### Example for the Proposed Route(s)

Here you can add the route(s) you're proposing to **add or change**, along with all required and optional parameters. If you want to add multiple routes, add each one in a new line. For example:

````md
```routes
/github/issue/DIYgod
/github/issue/DIYgod/RSSHub
/github/issue/DIYgod/RSSHub-Radar
/github/issue/flutter/flutter
```
````

**Do not** fill in `/github/issue/:user/:repo?` or `/issue/:user/:repo?`.

If your changes are not related to a route, such as documentation, you can fill in `routes` section with `NOROUTE`.

````md
```routes
NOROUTE
```
````

**Do not** delete or leave the `routes` section untouched, or your pull request will be automatically closed.

**Do not** use `NOROUTE` for route-related pull requests, or they will be automatically closed as well.

### New RSS Route Checklist

This checklist will help you ensure that your pull request includes all necessary components. Although you don't have to check off all items to get your PR merged, please make sure that your new route follows the [Script Standard](/joinus/advanced/script-standard). This is a **mandatory** requirement for all new routes.

```md
- [ ] 新的路由 New Route
```

To check off an item, replace `[ ]` with `[x]`.

```md
- [x] 新的路由 New Route
```

### Note

Use this section to include any additional information or comments you'd like to share.

## Pull Request Title

The pull request title will be used as the commit message when your pull request is merged. Please follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) specification.

If you are adding a new route, including all required documentation and `radar.ts`, use `route` as the scope. If you are adding new radar rules only, use `radar` as the scope.

## Response to Code Review

Your pull request will be reviewed by both bots and RSSHub maintainers. You can check the details of the automated checks by clicking on the `Details` link next to the check name.
If an RSSHub maintainer requests changes, you can commit and push your changes to your branch. The pull request will automatically update to reflect your changes. You can also incorporate feedback from the maintainer in batch by using the [suggested changes feature](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request#applying-suggested-changes).

## What's Next

After your pull request is merged, a new docker image will be built. This process can take up to an hour since we are building for multiple platforms, including `linux/arm/v7`, `linux/arm64`, and `linux/amd64`, with and without bundled Chromium.
