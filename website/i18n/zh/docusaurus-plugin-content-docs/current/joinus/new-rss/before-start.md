---
sidebar_position: 2
---

# 开始之前

在本教程中，我们将通过制作一个 [GitHub 仓库 Issues](/zh/routes/programming#github-yong-hu-cang-ku) 的 RSS 源为例，向您展示制作 RSS 源的过程。

## 安装依赖

开始之前，您需要安装 RSSHub 的依赖项。您可以在 RSSHub 的根目录下运行以下命令来完成安装：

```bash
pnpm i
```

## 开始调试

一旦您成功安装了依赖，您可以通过运行以下命令来开始调试 RSSHub：

```bash
pnpm dev
```

请务必密切关注控制台输出的任何错误消息或其他有用的信息，这些信息可以帮助您诊断和解决问题。另外，如果您遇到任何困难，不要犹豫向 RSSHub 文档或社区寻求帮助。

要查看您所做更改的结果，请在浏览器中打开 `http://localhost:1200`。您将能够在浏览器中自动反映您对代码的更改。

## 遵循路由规范

确保所有新的 RSS 源路由均遵循 [路由规范](/zh/joinus/advanced/script-standard) 非常重要。不遵循规范可能导致您的 Pull Request 在合理的时间内无法合并。

[路由规范](/zh/joinus/advanced/script-standard) 提供了制作高质量和可靠源代码的指导方针。通过遵循这些指南，您可以确保您的 RSS 源按照预期工作，并且易于其他社区维护者阅读。

在提交您的 Pull Request 之前，请仔细阅读 [路由规范](/zh/joinus/advanced/script-standard)，并确保您的代码符合所有要求。这将有助于加快审查过程。

