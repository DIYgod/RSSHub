---
sidebar_position: 3
---

# Create Your Own RSSHub Route

As mentioned earlier, we will create an RSS feed for [GitHub Repo Issues](/routes/programming#github-repo-issues) as an example. We will show all four data collection methods mentioned:

1.  [Via API](#via-api)
2.  [Via HTML web page using got](#via-html-web-page-using-got)
3.  [Using the Common Configured Route](#using-the-common-configured-route)
4.  [Using puppeteer](#using-puppeteer)

## Via API

### Check the API documentation

Different sites have different APIs. You can check the API documentation for the site you want to create an RSS feed for. In this case, we will use the [GitHub Issues API](https://docs.github.com/en/rest/issues/issues#list-repository-issues).

### Create the main file

Open your code editor and create a new file. Since we are going to create an RSS feed for GitHub issues, it is suggested that you save the file as `issue.ts`, but you can name it whatever you like.

Here's the basic code to get you started:

<Tabs>
<TabItem value="issue.ts" label="issue.ts">

```js
// Import the necessary modules
import got from '@/utils/got'; // a customised got
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    // Your logic here

    ctx.set('data', {
        // Your RSS output here
    });
};
```

</TabItem>
</Tabs>

### Retrieving user input

As mentioned earlier, we need to retrieve the GitHub username and repository name from user input. The repository name should default to `RSSHub` if it is not provided in the request URL. Here's how you can do it:

<Tabs groupId="jsStyle">
<TabItem value="Object destructuring" label="Object destructuring" default>

```js
export default async (ctx) => {
    // highlight-next-line
    const { user, repo = 'RSSHub' } = ctx.req.param();

    ctx.set('data', {
        // Your RSS output here
    });
};
```

</TabItem>
<TabItem value="Traditional assignment" label="Traditional assignment">

```js
export default async (ctx) => {
    // highlight-start
    const user = ctx.req.param('user');
    const repo = ctx.req.param('repo') ?? 'RSSHub';
    // highlight-end

    ctx.set('data', {
        // Your RSS output here
    });
};
```

</TabItem>
</Tabs>

Both of these code snippets do the same thing. The first one uses object destructuring to assign the `user` and `repo` variables, while the second one uses traditional assignment with a nullish coalescing operator to assign the `repo` variable a default value of `RSSHub` if it is not provided in the request URL.

### Getting data from the API

After we have the user input, we can use it to make a request to the API. In most cases, you will need to use `got` from `@/utils/got` (a customized got wrapper) to make HTTP requests. For more information, please refer to the [got documentation](https://github.com/sindresorhus/got/tree/v11#usage).

<Tabs groupId="jsStyle">
<TabItem value="Object destructuring" label="Object destructuring" default>

```js
export default async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.req.param();
    // highlight-start
    // Send an HTTP GET request to the API
    // and destruct the data object returned by the request
    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, {
        headers: {
            // This example uses HTML for simplicity instead of the
            // recommended 'application/vnd.github+json', which returns
            // Markdown and requires additional processing
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            // This allows users to set the number of feed items they want
            per_page: ctx.req.query('limit') ? parseInt(ctx.req.query('limit'), 10) : 30,
        },
    });
    // highlight-end

    ctx.set('data', {
        // Your RSS output here
    });
};
```

</TabItem>
<TabItem value="Traditional assignment" label="Traditional assignment">

```js
export default async (ctx) => {
    const user = ctx.req.param('user');
    const repo = ctx.req.param('repo') ?? 'RSSHub';
    // highlight-start
    // Send an HTTP GET request to the API
    const response = await got(`https://api.github.com/repos/${user}/${repo}/issues`, {
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.req.query('limit') ? parseInt(ctx.req.query('limit'), 10) : 30,
        },
    });
    // response.data is the data object returned by the above request
    const data = response.data;
    // highlight-end

    ctx.set('data', {
        // Your RSS output here
    });
};
```

</TabItem>
</Tabs>

### Outputting the RSS

Once we have retrieved the data from the API, we need to process it further to generate an RSS feed that conforms to the RSS specification. Specifically, we need to extract the channel title, channel link, item title, item link, item description, and item publication date.

To do this, we can assign the relevant data to the `ctx.set('data', obj)` object, and RSSHub's middleware will take care of the rest.

Here is the final code that you should have:

<Tabs>
<TabItem value="Final code" label="Final code" default>

```js
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.req.param();

    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, {
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.req.query('limit') ? parseInt(ctx.req.query('limit'), 10) : 30,
        },
    });

    // highlight-start
    // extract the relevant data from the API response
    const items = data.map((item) => ({
        // item title
        title: item.title,
        // item link
        link: item.html_url,
        // item description
        description: item.body_html,
        // item publish date or time
        pubDate: parseDate(item.created_at),
        // item author, if available
        author: item.user.login,
        // item category, if available
        category: item.labels.map((label) => label.name),
    }));
    // highlight-end

    // highlight-start
    ctx.set('data', {
        // channel title
        title: `${user}/${repo} issues`,
        // channel link
        link: `https://github.com/${user}/${repo}/issues`,
        // each feed item
        item: items,
    });
    // highlight-end
};
```

</TabItem>
<TabItem value="Alternative" label="Alternative">

```js
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.req.param();

    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, {
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.req.query('limit') ? parseInt(ctx.req.query('limit'), 10) : 30,
        },
    });

    // highlight-start
    ctx.set('data', {
        // channel title
        title: `${user}/${repo} issues`,
        // channel link
        link: `https://github.com/${user}/${repo}/issues`,
        // iterate through all leaf objects
        item: data.map((item) => ({
            // item title
            title: item.title,
            // item link
            link: item.html_url,
            // item description
            description: item.body_html,
            // item publish date or time
            pubDate: parseDate(item.created_at),
            // item author, if available
            author: item.user.login,
            // item category, if available
            category: item.labels.map((label) => label.name),
        }));
    });
    // highlight-end
};
```

</TabItem>
</Tabs>

## Via HTML web page using got

### Creat the main file

To start, open your code editor and create a new file. Since we are going to create an RSS feed for GitHub issues, it is suggested that you save the file as `issue.ts`. However, you can also name it whatever you like.

Here's the basic code to get you started:

```js
// Require necessary modules
import got from '@/utils/got'; // a customised got
import { load } from 'cheerio'; // an HTML parser with a jQuery-like API
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    // Your logic here

    ctx.set('data', {
        // Your RSS output here
    });
};
```

The `parseDate` function is a utility function provided by RSSHub that we will use to parse dates later in the code.

You will add your own code to extract data from the HTML document, process it, and output it in RSS format. We will cover the details of this process in the next steps.

### Retrieving user input

As mentioned before, we want users to enter a GitHub username and a repository name, and fall back to `RSSHub` if they don't enter the repository name in the request URL.

```js
export default async (ctx) => {
    // highlight-start
    // Retrieve user and repository name from the URL parameters
    const { user, repo = 'RSSHub' } = ctx.req.param();
    // highlight-end

    ctx.set('data', {
        // Your RSS output here
    });
};
```

In this code, `user` will be set to the value of `user` parameter, and `repo` will be set to the value of `repo` parameter if it exists, and `RSSHub` otherwise.

### Getting data from the web page

After receiving the user input, we need to make a request to the web page to retrieve the information we need. In most cases, we'll use `got` from `@/utils/got` (a customized [got](https://www.npmjs.com/package/got) wrapper) to make HTTP requests. You can find more information on how to use got in the [got documentation](https://github.com/sindresorhus/got/tree/v11#usage).

To begin, we'll make an HTTP GET request to the API and load the HTML response into Cheerio, a library that helps us parse and manipulate HTML.

```js
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.req.param();

    // Note that the ".data" property contains the full HTML source of the target page returned by the request
    // highlight-start
    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = load(response);
    // highlight-end
```

Next, we'll use Cheerio selectors to select the relevant HTML elements, parse the data we need, and convert it into an array.

```js
    // We use a Cheerio selector to select all 'div' elements with the class name 'js-navigation-container'
    // that contain child elements with the class name 'flex-auto'.
    // highlight-start
    const items = $('div.js-navigation-container .flex-auto')
        // We use the `toArray()` method to retrieve all the DOM elements selected as an array.
        .toArray()
        // We use the `map()` method to traverse the array and parse the data we need from each element.
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // We need an absolute URL for `link`, but `a.attr('href')` returns a relative URL.
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });
    // highlight-end

    ctx.set('data', {
        // Your RSS output here
    });
```

### Outputting the RSS

Once we have the data from the web page, we need to further process it to generate RSS in accordance with the RSS specification. Mainly, we need the channel title, channel link, item title, item link, item description, and item publication date.

Pass them to the `ctx.set('data', obj)` object, and RSSHub's middleware will take care of the rest.

Here's an example code:

```js
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.req.param();

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = load(response);

    const items = $('div.js-navigation-container .flex-auto')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    // highlight-start
    ctx.set('data', {
        // channel title
        title: `${user}/${repo} issues`,
        // channel link
        link: `${baseUrl}/${user}/${repo}/issues`,
        // each feed item
        item: items,
    });
    // highlight-end
};
```

### Better Reading Experience

The previous code provides only part of the information for each feed item. To provide a better reading experience, we can add the full article to each feed item, in this case the issue body.

Here's the updated code:

```js
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.req.param();

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = load(response);

    // highlight-next-line
    const list = $('div.js-navigation-container .flex-auto')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    // highlight-start
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                // Select the first element with the class name 'comment-body'
                item.description = $('.comment-body').first().html();

                // Every property of a list item defined above is reused here
                // and we add a new property 'description'
                return item;
            })
        )
    );
    // highlight-end

    ctx.set('data', {
        title: `${user}/${repo} issues`,
        link: `https://github.com/${user}/${repo}/issues`,
        // highlight-next-line
        item: items,
    });
};

```

Now the RSS feed will have a similar reading experience to the original website.

:::tip

Note that in the previous section, we only needed to send one HTTP request using an API to get all the data we needed. However, in this section, we need to send `1 + n` HTTP requests, where `n` is the number of feed items in the list from the first request.

Some websites may not want to receive too many requests in a short amount of time, which can cause them to return an error message like `429 Too Many Requests`.

:::

## Using the common configured route

### Create the main file

First, we need a few data:

1.  The RSS source link
2.  The data source link
3.  The RSS feed title (not the title of individual items)

Open your code editor and create a new file. Since we're going to create an RSS feed for GitHub issues, it's suggested that you save the file as `issue.ts`, but you can name it whatever you like.

Here's some basic code to get you started:

```js
// Import necessary modules
import buildData from '@/utils/common-config';

export default async (ctx) => {
    ctx.set('data', await buildData({
        link: '', // The RSS source link
        url: '', // The data source link
        // Variables can be used here, such as %xxx% will be parsed into
        // variables with values of the same name under **params**
        title: '%title%',
        params: {
            title: '', // Additional title
        },
    }));
};
```

Our RSS feed currently lacks content. The `item` must be set to add the content. Here's an example:

```js
import buildData from '@/utils/common-config';

export default async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.req.param();
    const link = `https://github.com/${user}/${repo}/issues`;

    ctx.set('data', await buildData({
        link,
        url: link,
        title: `${user}/${repo} issues`, // you can also use $('head title').text()
        params: {
            title: `${user}/${repo} issues`,
            baseUrl: 'https://github.com',
        },
        // highlight-start
        item: {
            item: 'div.js-navigation-container .flex-auto',
            // You need to use template literals if you want to use variables
            title: `$('a').first().text() + ' - %title%'`, // Only supports js statements like $().xxx()
            link: `'%baseUrl%' + $('a').first().attr('href')`, // .text() means get the text of the element
            // description: ..., we don't have description for now
            pubDate: `parseDate($('relative-time').attr('datetime'))`,
        },
        // highlight-end
    }));
};
```

You'll notice that the code is similar to the [Obtaining data from the webpage](#getting-data-from-the-web-page) section above. However, this RSS feed doesn't contain the full article of the issue.

### Retrieving full articles

To get the full article of each issue, you need to add a few more lines of code. Here is an example:

```js
import buildData from '@/utils/common-config';
// highlight-start
import got from '@/utils/got';
import { load } from 'cheerio';
// highlight-end

export default async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.req.param();
    const link = `https://github.com/${user}/${repo}/issues`;

    const data = await buildData({
        link,
        url: link,
        title: `${user}/${repo} issues`,
        params: {
            title: `${user}/${repo} issues`,
            baseUrl: 'https://github.com',
        },
        item: {
            item: 'div.js-navigation-container .flex-auto',
            title: `$('a').first().text() + ' - %title%'`,
            link: `'%baseUrl%' + $('a').first().attr('href')`,
            pubDate: `parseDate($('relative-time').attr('datetime'))`,
        },
    });

    // highlight-start
    await Promise.all(
        data.item.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: resonse } = await got(item.link);
                const $ = load(resonse);
                item.description = $('.comment-body').first().html();
                return item;
            })
        )
    );

    ctx.set('data', data);
    // highlight-end
};
```

You can see that the above code is very similar to the [previous section](#better-reading-experience) which retrieves full articles by adding a few more lines of code. It is recommended that you use the method in the [previous section](#better-reading-experience) whenever possible, as it is more flexible than using `@/utils/common-config`.

## Using puppeteer

Using puppeteer is another approach to obtain data from websites. However, it is recommended that you try the [above methods](#via-html-web-page-using-got) first. It is also recommended that you read [via HTML web page using got](#via-html-web-page-using-got) first since this section is an extension of the previous section and will not explain some basic concepts.

### Creat the main file

To get started with puppeteer, create a new file in your code editor and save it with an appropriate name, such as `issue.ts`. Then, require the necessary modules and set up the basic structure of the function:

```js
// Require some useful modules
import { load } from 'cheerio'; // an HTML parser with a jQuery-like API
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';

export default async (ctx) => {
    // Your logic here

    ctx.set('data', {
        // Your RSS output here
    });
};
```

### Replace got with puppeteer

Now, we will be using `puppeteer` instead of `got` to retrieve data from the web page.

<Tabs>
<TabItem value="puppeteer" label="puppeteer">

```js
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.req.param();

    // highlight-start
    // require puppeteer utility class and initialise a browser instance
    const browser = await puppeteer();
    // open a new tab
    const page = await browser.newPage();
    // intercept all requests
    await page.setRequestInterception(true);
    // only allow certain types of requests to proceed
    page.on('request', (request) => {
        // in this case, we only allow document requests to proceed
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    // visit the target link
    const link = `${baseUrl}/${user}/${repo}/issues`;
    // got requests will be logged automatically
    // but puppeteer requests are not
    // so we need to log them manually
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        // specify how long to wait for the page to load
        waitUntil: 'domcontentloaded',
    });
    // retrieve the HTML content of the page
    const response = await page.content();
    // close the tab
    page.close();
    // highlight-end

    const $ = load(response);

    // const item = ...;

    // highlight-start
    // don't forget to close the browser instance at the end of the function
    browser.close();
    // highlight-end

    ctx.set('data', {
        // Your RSS output here
    });
}
```

</TabItem>
<TabItem value="got" label="got">

```js
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.req.param();

    // highlight-next-line
    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = load(response);

    ctx.set('data', {
        // Your RSS output here
    });
}
```

</TabItem>
</Tabs>

### Retrieving full articles

Retrieving the full articles of each issue using a new browser page is similar to the [previous section](#better-reading-experience). We can use the following code:

```js
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.req.param();

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    const link = `${baseUrl}/${user}/${repo}/issues`;
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();

    const $ = load(response);

    const list = $('div.js-navigation-container .flex-auto')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // highlight-start
                // reuse the browser instance and open a new tab
                const page = await browser.newPage();
                // set up request interception to only allow document requests
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });

                logger.http(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                // close the tab after retrieving the HTML content
                page.close();
                // highlight-end

                const $ = load(response);

                item.description = $('.comment-body').first().html();

                return item;
            })
        )
    );

    // highlight-start
    // close the browser instance after all requests are done
    browser.close();
    // highlight-end

    ctx.set('data', {
        title: `${user}/${repo} issues`,
        link: `https://github.com/${user}/${repo}/issues`,
        item: items,
    });
};
```

### Additional Resources

Here are some resources you can use to learn more about puppeteer:

-   [puppeteer's good ol' docs](https://github.com/puppeteer/puppeteer/blob/v15.2.0/docs/api.md)
-   [puppeteer's current docs](https://pptr.dev)

#### Intercepting requests

When scraping web pages, you may encounter images, fonts, and other resources that you don't need. These resources can slow down the page load time and use up valuable CPU and memory resources. To avoid this, you can enable request interception in puppeteer.

Here's how to do it:

```js
await page.setRequestInterception(true);
page.on('request', (request) => {
    request.resourceType() === 'document' ? request.continue() : request.abort();
});
// These two statements must be placed before page.goto()
```

You can find all the possible values of `request.resourceType()` [here](https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceType). When using these values in your code, make sure to use **lowercase** letters.

#### Wait Until

In the code above, you'll see that `waitUntil: 'domcontentloaded'` is used in the page.goto() function. This is a Puppeteer option that tells it when to consider a navigation successful. You can find all the possible values and their meanings [here](https://pptr.dev/api/puppeteer.page.goto/#remarks).

It's worth noting that `domcontentloaded`waits for a shorter time than the default value `load`, and `networkidle0` may not be suitable for websites that keep sending background telemetry or fetching data.

Additionally, it's important to avoid waiting for a specific timeout and instead wait for a selector to appear. Waiting for a timeout is inaccurate, as it depends on the load of the Puppeteer instance.
