# 参与我们

如果您在使用 RSSHub 过程中遇到了问题或者有建议改进，我们很乐意听取您的意见！您可以通过 Pull Request 来提交您的修改。无论您对 Pull Request 的使用是否熟悉，我们都欢迎不同经验水平的开发者参与贡献。如果您不懂编程，也可以通过 [报告错误](https://github.com/DIYgod/RSSHub/issues) 的方式来帮助我们。

## 参与讨论

[![Telegram 群组](https://img.shields.io/badge/chat-telegram-brightgreen.svg?logo=telegram\&style=for-the-badge)](https://t.me/rsshub) [![GitHub Issues](https://img.shields.io/github/issues/DIYgod/RSSHub?color=bright-green\&logo=github\&style=for-the-badge)](https://github.com/DIYgod/RSSHub/issues) [![GitHub 讨论](https://img.shields.io/github/discussions/DIYgod/RSSHub?logo=github\&style=for-the-badge)](https://github.com/DIYgod/RSSHub/discussions)

## 开始之前

要制作一个 RSS 订阅，您需要结合使用 Git、HTML、JavaScript、jQuery 和 Node.js。

如果您对它们不是很了解，但想要学习它们，以下是一些好的资源：

-   [MDN Web Docs 上的 JavaScript 指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript#教程)
-   [W3Schools](https://www.w3schools.com)
-   [Codecademy 上的 Git 课程](https://www.codecademy.com/learn/learn-git)

如果您想查看其他开发人员如何使用这些技术来制作 RSS 订阅的示例，您可以查看 [我们的代码库](https://github.com/DIYgod/RSSHub/tree/master/lib/v2) 中的一些代码。

## 提交新的 RSSHub 规则

如果您发现一个网站没有提供 RSS 订阅，您可以使用 RSSHub 制作一个 RSS 规则。RSS 规则是一个短小的 Node.js 程序代码（以下简称 “路由”），它告诉 RSSHub 如何从网站中提取内容并生成 RSS 订阅。通过制作新的 RSS 路由，您可以帮助让您喜爱的网站的内容被更容易访问和关注。

在您开始编写 RSS 路由之前，请确保源站点没有提供 RSS。一些网页会在 HTML 头部中包含一个 type 为 `application/atom+xml` 或 `application/rss+xml` 的 link 元素来指示 RSS 链接。

这是在 HTML 头部中看到 RSS 链接可能会长成这样：`<link rel="alternate" type="application/rss+xml" href="http://example.com/rss.xml" />`。如果您看到这样的链接，这意味着这个网站已经有了一个 RSS 订阅，您不需要为它制作一个新的 RSS 路由。

### 开始

在本指南中，您将学习从头制作一个新的 RSS 路由的方法。我们将涵盖从设置开发环境到提交代码到 RSSHub 仓库的所有内容。到本指南结束时，您将能够为不提供 RSS 的网站制作自己的 RSS 订阅源。

[准备好了吗？点这里开始学习！](/joinus/new-rss/prerequisites.html)

## 提交新的 RSSHub Radar 规则

### 开始之前

建议您在开始之前，在浏览器中下载并安装 RSSHub Radar。

安装 RSSHub Radar 后，打开设置并切换到 “规则列表” 选项页。然后滚动到页面底部，您会看到一个文本框。在这里，您可以使用您的新规则替换旧规则以进行调试。

[开始吧！](/joinus/new-radar.html)

<a href="https://chrome.google.com/webstore/detail/rsshub-radar/kefjpfngnndepjbopdmoebkipbgkggaa" target="_blank" rel="noopener noreferrer"><img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png" alt="为 Chromium 安装 RSSHub Radar" height="58"></a> <a href="https://addons.mozilla.org/firefox/addon/rsshub-radar/" target="_blank" rel="noopener noreferrer"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="为 Firefox 安装 RSSHub Radar for " height="58"></a> <a href="https://microsoftedge.microsoft.com/addons/detail/rsshub-radar/gangkeiaobmjcjokiofpkfpcobpbmnln" target="_blank" rel="noopener noreferrer"><img src="https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/f/f7/Get_it_from_Microsoft_Badge.svg" alt="为 Edge 安装 RSSHub Radar" height="58"></a> <a href="https://apps.apple.com/us/app/rsshub-radar/id1610744717" target="_blank" rel="noopener noreferrer"><img src="https://developer.apple.com/news/images/download-on-the-app-store-badge.png" alt="为 Safari 安装 RSSHub Radar" height="58"></a>
