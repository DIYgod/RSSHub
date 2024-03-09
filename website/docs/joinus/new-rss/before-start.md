---
sidebar_position: 2
---

# Just before you start

In this tutorial, we will walk you through the process of creating an RSS feed for [GitHub Repo Issues](/routes/programming#github-repo-issues) as an example.

## Install dependencies

Before you start, you need to install the dependencies for RSSHub. You can do this by running the following command in the root directory of RSSHub:

<Tabs groupId="package-manager">
<TabItem value="pnpm" label="pnpm" default>

```bash
pnpm i
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm install
```

</TabItem>
</Tabs>

## Start debugging

Once you have successfully installed the dependencies, you can start debugging RSSHub by running the following command:

<Tabs groupId="package-manager">
<TabItem value="pnpm" label="pnpm" default>

```bash
pnpm run dev
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn dev
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm run dev
```

</TabItem>
</Tabs>

Make sure to keep an eye on the console output for any error messages or other useful information that can help you diagnose and resolve issues. Additionally, don't hesitate to consult the RSSHub documentation or seek help from the community if you encounter any difficulties.

To view the result of your changes, open `http://localhost:1200` in your browser. You'll be able to see the changes you made to the code automatically reflected in the browser.

## Follow the Script Standard

It's important to ensure that all new RSS routes adhere to the [Script Standard](/joinus/advanced/script-standard). Failure to comply with this standard may result in your Pull Request not being merged in a reasonable timeframe.

The [Script Standard](/joinus/advanced/script-standard) provides guidelines for creating high-quality and reliable source code. By following these guidelines, you can ensure that your RSS feed works as intended and is easy for other community maintainers to read.

Before submitting your Pull Request, make sure to carefully review the [Script Standard](/joinus/advanced/script-standard) and ensure that your code meets all of the requirements. This will help to expedite the review process.

## Create a namespace

The first step in creating a new RSS route is to create a namespace. The namespace should be the **same** as the second level domain name of the main website for which you are creating the RSS feed. For example, if you are creating an RSS feed for [https://github.com/DIYgod/RSSHub/issues](https://github.com/DIYgod/RSSHub/issues), the second level domain name is `github`. Therefore, you should create a folder called `github` under `lib/routes` to serve as the namespace for your RSS route.

:::tip

When creating a namespace, it's important to avoid creating multiple namespaces for variations of the same domain. For example, if you are creating an RSS feed for both `yahoo.co.jp` and `yahoo.com`, you should stick with a single namespace `yahoo`, rather than creating multiple namespaces like `yahoo-jp`, `yahoojp`, `yahoo.jp`, `jp.yahoo`, `yahoocojp`, etc.

:::

## Understand the Basics

### router.ts

Once you have created the namespace for your RSS route, the next step is to register it in the `router.ts`

For example, if you are creating an RSS feed for [GitHub Repo Issues](/routes/programming#github-repo-issues) and suppose you want users to enter a GitHub username and a repository name, and fall back to `RSSHub` if they don't enter the repository name, you can register your new RSS route in `github/router.ts` using the following code:

<Tabs>
<TabItem value="Arrow Functions" label="Arrow Functions" default>

```js
export default (router) => {
    // highlight-next-line
    router.get('/issue/:user/:repo?', './issue');
};
```

</TabItem>
<TabItem value="Regular Functions" label="Regular Functions">

```js
export default function (router) {
    // highlight-next-line
    router.get('/issue/:user/:repo?', './issue');
};
```

</TabItem>
</Tabs>

When registering your new RSS route in `router.ts`, you can define the route path and specify the corresponding function to be executed. In the code above, the `router.get()` method is used to specify the HTTP method and the path of the new RSS route. The first parameter of `router.get()` is the route path using [Hono routing](https://hono.dev/api/routing) syntax. The second parameter is the relative path of your new RSS rule, `issue.ts`. Note that you can omit the `.ts` extension.

In the example above, `issue` is an exact match, `:user` is a required parameter, and `:repo?` is an optional parameter. The `?` after `:repo` means that the parameter is optional. If the user does not enter repo, it will fall back to whatever is specified in your code (in this case, `RSSHub`).

Once you have defined the route path, you can retrieve the value of the parameters from the [`ctx.req.param()`](https://hono.dev/api/request#param) function. For example, if the user visits `/github/issue/DIYgod/RSSHub`, you can get the value of `user` and `repo` from `ctx.req.param('user')` and `ctx.req.param('repo')`, respectively. For example, if an user visits `/github/issue/DIYgod/RSSHub`, `ctx.req.param('user')` and `ctx.req.param('repo')` which will be `DIYgod` and `RSSHub`.

:::tip

For more advanced usage of `router`, see the [Hono Routing API Reference](https://hono.dev/api/routing).

:::

### maintainer.ts

This file is used to store information about the maintainer of the RSS routes. You can add your GitHub username to the value array. Note that the key here should exactly match the path in `router.ts` :

```js
export default {
    // highlight-next-line
    '/issue/:user/:repo?': ['DIYgod'],
};
```

The `maintainer.ts` file is useful for keeping track of who is responsible for maintaining an RSS route. When a user encounters an issue with your RSS route, they can reach out to the maintainers listed in this file.

### `templates` folder

The `templates` folder contains templates for your new RSS route. You only need this folder if you want to render custom HTML content instead of using the original website's HTML content. If you don't need to render any custom HTML content, you can skip this folder.

Each template file should have a `.art` file extension.

### radar.ts

The `radar.ts` file helps users subscribe to your new RSS route when they use [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) or other software that is compatible with its format. We'll cover more about this in a later section.

### Your new RSS route `issue.ts`

Now you can [start writing](/joinus/new-rss/start-code) your new RSS route.

## Acquire Data

To acquire data for your new RSS route, you will typically make HTTP requests using [got](https://github.com/sindresorhus/got) to an API or webpage. In some cases, you may need to use [puppeteer](https://github.com/puppeteer/puppeteer) to simulate a browser and render a webpage in order to acquire data.

The data you retrieve will typically be in JSON or HTML format. If you're working with HTML, you can use [cheerio](https://github.com/cheeriojs/cheerio) for further processing.

Here's a list of recommended data collection methods, ordered by preference:

1.  **Via API**: This is the most recommended way to retrieve data, as APIs are usually more stable and faster than extracting data from an HTML webpage.

2.  **Via HTML webpage using got**: If an API is not available, you can try to retrieve data from the HTML webpage. This is the method you'll use most of the time. Note that if the HTML contains embedded JSON, you should use that instead of the rest of the HTML elements.

3.  **Common Configured Route**: The Common Configured Route is a special route that can easily generate RSS by reading JSON data through cheerio (CSS selectors and jQuery functions).

4.  **Puppeteer**: In some rare cases, you might need to use puppeteer to simulate a browser and retrieve data. This is the least recommended method and should only be used if absolutely necessary, such as when the webpage is blocked behind a browser integrity check or heavily encrypted. If possible, it's best to use other methods such as API requests or retrieving data from the HTML page directly using [got](https://github.com/sindresorhus/got) or [cheerio](https://github.com/cheeriojs/cheerio).
