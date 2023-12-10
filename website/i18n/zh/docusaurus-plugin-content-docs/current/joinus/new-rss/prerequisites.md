---
sidebar_position: 1
---

# 准备工作

在开始编写新的 RSS 规则之前，确保您的开发环境已正确配置很重要。

## 安装 Node.js

为了能够编写新的 RSS 规则，您必须首先安装 Node.js。RSSHub 使用 Node.js 运行其代码以及制作 RSS 订阅源，需要 Node v16 或更高版本。您可以从 [这里](https://nodejs.org/en/download) 下载最新的 Node.js LTS 版本。

在 Windows 系统下，您可以下载安装程序并按照安装程序的步骤进行操作。记得勾选安装 **原生模块的工具（Tools for Native Modules）** 选项。

在 macOS 系统下，您可以从 Node.js 网站下载安装程序，或者使用 [Homebrew](https://brew.sh) 命令 `brew install node` 安装 Node.js。

在 Linux 系统下，您可以参考 [这个页面](https://nodejs.org/en/download/package-manager) 决定如何安装 Node.js。

## 安装代码编辑器

编写代码需要一个代码编辑器。如果您已经有一个，您可以跳过这一部分。如果您还没有一个编辑器，可以从以下列表中选择一个：

-   [Visual Studio Code](https://code.visualstudio.com)
-   [WebStorm](https://www.jetbrains.com/webstorm)
-   [Neovim](https://neovim.io)
-   [Sublime Text](https://www.sublimetext.com)

为了加速开发过程并更容易维护代码风格的一致性，可以为您选择的代码编辑器安装一些适当的扩展。在本指南的后半部分，我们将使用 Visual Studio Code 作为示例，您可以安装以下扩展：

-   [Art Template Helper](https://marketplace.visualstudio.com/items?itemName=ZihanLi.at-helper)（为 RSSHub 使用的一种模板引擎提供语法高亮）
-   [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)（保持在不同的 IDE 中的一致的代码风格）
-   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)（识别并修复代码中的常见错误）
-   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)（使您的代码更易读和更一致地格式化）

### 云托管的开发环境

如果您不想在计算机上安装 Node.js 和代码编辑器，您可以使用云托管的开发环境。您可以使用 [GitHub Codespaces](https://codespace.new) 或 [Gitpod](https://www.gitpod.io)。只需点击以下按钮即可启动新的工作区：

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/DIYgod/RSSHub?quickstart=1)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/DIYgod/RSSHub)

有关如何使用 [GitHub Codespaces](https://codespace.new) 或 [Gitpod](https://www.gitpod.io) 的更多信息，请参见 [GitHub 文档](https://docs.github.com/codespaces) 和 [Gitpod 文档](https://www.gitpod.io/docs)。
