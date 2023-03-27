# Prerequisites

Before you begin, it is important that your development environment set up properly.

## Install Node.js

To be able to write new RSS rules, you must first install Node.js first. RSSHub uses Node.js to run its code and create RSS feeds and requires Node v16 or above. You can download the latest LTS version of Node.js from [here](https://nodejs.org/en/download).

On Windows, you can simply download the installer and follow the steps from the installer. Remember to check the option to install **Tools for Native Modules** as well.

On macOS, you can either download the installer from the Node.js website or use [Homebrew](https://brew.sh) to install Node.js with the command `brew install node`.

On Linux, you can refer to [this page](https://nodejs.org/en/download/package-manager) to decide how to install Node.js.

## Install a code editor

To write code, you need a code editor. If you already have one, you can skip this section. If you don't have one, you can choose one from the following list:

-   [Visual Studio Code](https://code.visualstudio.com)
-   [WebStorm](https://www.jetbrains.com/webstorm)
-   [Neovim](https://neovim.io)
-   [Sublime Text](https://www.sublimetext.com)

To speed up the development process and make it easier to keep your code clean, you can install some appropriate extensions to the code editor of your choice. In the latter part of this guide, we will use Visual Studio Code as an example, you can install the following extensions:

-   [Art Template Helper](https://marketplace.visualstudio.com/items?itemName=ZihanLi.at-helper)(provides syntax highlighting for a template engine used by RSSHub)
-   [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)(maintain consistent coding styles across different editors and IDEs)
-   [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)(identify and fix common errors in your code)
-   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)(formats your code to make it more readable and consistent)

### Cloud hosted development environment

If you don't want to install Node.js and a code editor on your computer, you can use a cloud-hosted development environment. You may use [GitHub Codespaces](https://codespace.new/) or [Gitpod](https://www.gitpod.io). Just click one of the buttons below to start a new workspace:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=master&repo=127769231&machine=basicLinux32gb&devcontainer_path=.devcontainer%2Fdevcontainer.json&location=SouthEastAsia)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/DIYgod/RSSHub)

For more information about how to use [GitHub Codespaces](https://codespace.new/) or [Gitpod](https://www.gitpod.io/) , see [GitHub's documentation](https://docs.github.com/codespaces) and [Gitpod's documentation](https://www.gitpod.io/docs/).
