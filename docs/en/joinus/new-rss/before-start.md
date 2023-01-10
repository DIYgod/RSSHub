---
sidebarDepth: 2
---
# Just before you start

In the following sections, we will walk you through the process of writing a new RSS rule. We will create a RSS feed for [GitHub Repo Issues](/en/programming.html#github-repo-issues) as an example.

## Install dependencies

Before you start, you need to install the dependencies of RSSHub. You can do this by running the following command in the root directory of RSSHub:

<code-group>
<code-block title="yarn" active>

```bash
yarn
```

</code-block>
<code-block title="npm">

```bash
npm install
```

</code-block>
</code-group>

## Start debugging

After you have installed the dependencies, you can start debugging RSSHub by running the following command:

<code-group>
<code-block title="yarn" active>

```bash
yarn dev
```

</code-block>
<code-block title="npm">

```bash
npm run dev
```

</code-block>
</code-group>

Open `http://localhost:1200` in your browser to see the result. Any changes you make to the code will be automatically reflected in the browser.

## Follow the standard

All new RSS routes should follow the [Script Standard](/en/joinus/script-standard.html). Failure to follow the standard will result in the PR being not processed.

## Create a namespace

The first step is to create a namespace for your RSS rule. The namespace should be the **same** as the domain name of the main website. In this case, we will be creating RSS for <https://github.com/DIYgod/RSSHub/issues>. Since the root domain name is `github.com`, we will create a namespace named `github` under `lib/v2`.

::: tip Tips
If you want to create a new RSS rule for `github.io`, stick with `github` instead of creating new namespaces like `github-io`, `githubio`, `github.io`, `io.github`, etc.
:::

## Know the basics

### router.js

After creating the namespace, you need to register your new RSS rule in `router.js` of the namespace you just created. Suppose you want users to enter the GitHub username and repository name and fall back to `RSSHub` if users don't enter the repository name. You can register your new RSS rule like this:

<code-group>
<code-block title="Arrow Functions" active>

```js{2}
module.exports = (router) => {
    router.get('/issue/:user/:repo?', require('./issue'));
};
```

</code-block>
<code-block title="Regular Functions">

```js{2}
module.exports = function (router) {
    router.get('/issue/:user/:repo?', require('./issue'));
};
```

</code-block>
</code-group>

The first parameter of `router.get()` is the route path. The second parameter is the path to the file that contains the code for your new RSS rule. In this case, the file is `issue.js` under the namespace `github`. You can omit the `.js` extension.

In the first parameter of `router.get()`, `issue` is an exact match, `:user` is a compulsory parameter, and `:repo?` is an optional parameter. The `?` after `:repo` means that the parameter is optional. If the user does not enter `repo`, it will be fall back to whatever is specified in your code (in this case, `RSSHub`).

Once you define the route path, you can retrieve the value of the parameters from `ctx.params` object. For example, if the user visits `/github/issue/DIYgod/RSSHub`, you can retrieve the value of `user` and `repo` from `ctx.params.user` and `ctx.params.repo` which will be `DIYgod` and `RSSHub` respectively.

**The type of the value will either be `String` or `undefined`**.

You can add a `*` to `:variable` to match the rest of the path like `/some/path/:variable*`. The first parameter also works with patterns like `/some/path/:variable(\\d+)?` or even RegExp.

::: tip Tips
For more advanced usage of `router`, you can refer to [koajs/router API Reference](https://github.com/koajs/router/blob/master/API.md).
:::

### maintainer.js

This file is used to store the information of the maintainer of RSS rules. You can add your GitHub username to the value array. Note that the key here should be exactly the same as  the path in `router.js` :

```js{2}
module.exports = {
    '/issue/:user/:repo?': ['DIYgod'],
};
```

### `templates` folder

This folder contains the templates for your new RSS feed. You only need this if you are trying to render custom HTML content other than the HTML content from the original website. If you don't need to render custom HTML content, you can skip this section.

The file extension of each template should be `.art`.

### radar.js

This file helps users to subscribe to your new RSS rule when they are using [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar). The content will be covered in a later section.

### Your new RSS rule `issue.js`

Now you can [start writing](/en/joinus/new-rss/start-code.html) your new RSS rule.

## Acquiring Data

Typically, data can be acquired through HTTP requests (via API or webpage) sent by [got](https://github.com/sindresorhus/got).

Occasionally [puppeteer](https://github.com/puppeteer/puppeteer) is required for browser stimulation and page rendering in order to acquire the data.

The acquired data are most likely in JSON or HTML format. For HTML, [cheerio](https://github.com/cheeriojs/cheerio) cam be used for further processing.

Below is a list of data acquisition methods, ordered by the **level of recommendation**:

1.  **Via API**: The most recommended way to acquire data. The API is usually more stable and faster than extracting data from the HTML webpage.

2.  **Via HTML webpage using got**: If the API is not available, you can try to acquire data from the HTML webpage. You will be using this approach most of the time.

3.  **Common configured route**: The common configured route is a special route that can generate RSS with ease by reading JSON data through cheerio(CSS selectors and jQuery functions).

4.  **Puppeteer**: In some cases, you may need to use puppeteer to acquire data. For example, if the webpage requires rendering.
