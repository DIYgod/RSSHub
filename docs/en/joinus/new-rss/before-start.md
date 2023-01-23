---
sidebarDepth: 2
---
# Just before you start

In the following sections, we will walk you through the process of creating a new RSS rule. As an example, we will create an RSS feed for [GitHub Repo Issues](/en/programming.html#github-repo-issues).

## Install dependencies

Before you start, you need to install the dependencies for RSSHub. You can do this by running the following command in the root directory of RSSHub:

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

Open `http://localhost:1200` in your browser to see the result. Any changes you make to the code will be automatically be reflected in the browser.

## Follow the standard

All new RSS routes should follow the [Script Standard](/en/joinus/script-standard.html). Failure to follow the standard will result in the PR not being processed.

## Create a namespace

The first step is to create a namespace for your RSS rule. The namespace should be the **same** as the domain name of the main website. In this case, we will be creating RSS for <https://github.com/DIYgod/RSSHub/issues>. Since the root domain name is `github.com`, we will create a namespace called `github` in `lib/v2`.

::: tip Tips
If you want to create a new RSS rule for `github.io`, stick with `github` instead of creating new namespaces like `github-io`, `githubio`, `github.io`, `io.github`, etc.
:::

## Know the basics

### router.js

After creating the namespace, you need to register your new RSS rule in `router.js` of the namespace you just created. Suppose you want users to enter a GitHub username and a repository name, and fall back to `RSSHub` if they don't enter the repository name. You can register your new RSS rule like this:

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

The first parameter of `router.get()` is the route path. The second parameter is the path to the file containing the code for your new RSS rule. In this case, the file is `issue.js` in the `github` namespace. You can omit the `.js` extension.

In the first parameter of `router.get()`, `issue` is an exact match, `:user` is a required parameter, and `:repo?` is an optional parameter. The `?` after `:repo` means that the parameter is optional. If the user does not enter `repo`, it will be fall back to whatever is specified in your code (in this case, `RSSHub`).

Once you have defined the route path, you can retrieve the value of the parameters from the `ctx.params` object. For example, if the user visits `/github/issue/DIYgod/RSSHub`, you can get the value of `user` and `repo` from `ctx.params.user` and `ctx.params.repo` which will be `DIYgod` and `RSSHub` respectively.

**The type of the value will be either `String` or `undefined`**.

You can add a `*` to `:variable` to match the rest of the path like `/some/path/:variable*`. The first parameter also works with patterns like `/some/path/:variable(\\d+)?` or even RegExp.

::: tip Tips
For more advanced usage of `router`, see the [koajs/router API Reference](https://github.com/koajs/router/blob/master/API.md).
:::

### maintainer.js

This file is used to store information about the RSS rules maintainer. You can add your GitHub username to the value array. Note that the key here should be exactly the same as the path in `router.js` :

```js{2}
module.exports = {
    '/issue/:user/:repo?': ['DIYgod'],
};
```

### `templates` folder

This folder contains the templates for your new RSS feed. You only need this if you are trying to render custom HTML content other than the HTML content from the original website. If you don't need to render any custom HTML content, you can skip this section.

The file extension of each template should be `.art`.

### radar.js

This file helps users to subscribe to your new RSS rule when they are using [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar). The content will be covered in a later section.

### Your new RSS rule `issue.js`

Now you can [start writing](/en/joinus/new-rss/start-code.html) your new RSS rule.

## Acquire Data

Typically, data can be acquired through HTTP requests (via API or web page) sent by [got](https://github.com/sindresorhus/got).

Occasionally [puppeteer](https://github.com/puppeteer/puppeteer) is required for browser stimulation and page rendering in order to acquire the data.

The retrieved data are most likely in JSON or HTML format. For HTML, [cheerio](https://github.com/cheeriojs/cheerio) can be used for further processing.

Below is a list of data collection methods, ordered by the **level of recommendation**:

1.  **Via API**: The most recommended way to retrieve data. The API is usually more stable and faster than extracting data from the HTML web page.

2.  **Via HTML web page using got**: If the API is not available, you can try to retrieve data from the HTML web page. You will use this approach most of the time.

3.  **Common configured route**: The common configured route is a special route that can easily generate RSS by reading JSON data through cheerio (CSS selectors and jQuery functions).

4.  **Puppeteer**: In some cases, you may need to use puppeteer to retrieve data. For example, if the web page needs to be rendered.
