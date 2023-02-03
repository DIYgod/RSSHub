---
sidebarDepth: 2
---
# Create your own RSSHub route

As mentioned earlier, we will create a RSS feed for [GitHub Repo Issues](/en/programming.html#github-repo-issues) as an example. All of four data collection methods mentioned will be shown.

1. [Using API](#using-api)
2. [Via HTML web page using got](#via-html-web-page-using-got)
3. [Using the common configured route](#using-the-common-configured-route)
4. [Using puppeteer](#using-puppeteer)

## Using API

### Check the API documentation

Different sites have different APIs. You can check the API documentation for the site you want to create an RSS for. In this case, we will use the [GitHub Issues API](https://docs.github.com/en/rest/issues/issues#list-repository-issues).

### Create the main file

Open your code editor and create a new file. Since we are going to create an RSS for GitHub issues, it is suggested that you save the file as `issue.js`, but you can also name it whatever you like.

Here's the basic code to get you started:

<code-group>
<code-block title="issue.js">

```js
// Require the necessary modules
const got = require('@/utils/got'); // a customised got
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // Your logic here

    ctx.state.data = {
        // Your RSS output here
    };
};
```

</code-block>
</code-group>

### Retrieving user input

As mentioned earlier, we want users to enter a GitHub username and a repository name, and fall back to `RSSHub` if they don't enter the repository name in the request URL.

<code-group>
<code-block title="Object destructuring" active>

```js{2}
module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    ctx.state.data = {
        // Your RSS output here
    };
};
```

</code-block>
<code-block title="Traditional assignment">

```js{2,3}
module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo ?? 'RSSHub';

    ctx.state.data = {
        // Your RSS output here
    };
};
```

</code-block>
</code-group>

### Getting data from the API

Once we have the user input, we can use it to make a request to the API. In most of the cases, you will need to use `got` from `@/utils/got`(a customised [got](https://www.npmjs.com/package/got) wrapper) to make HTTP requests. See [got documentation](https://github.com/sindresorhus/got/tree/v11#usage) for more information.

<code-group>
<code-block title="Object destructuring" active>

```js{3-16}
module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    // Initiate an HTTP GET request to the API
    // Note that .data is the data object returned by the request
    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            // This example uses HTML for simplicity instead of the 
            // recommended 'application/vnd.github+json', which returns 
            // Markdown and requires additional processing.
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            // This allows users to set the number of feed items they want
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });

    ctx.state.data = {
        // Your RSS output here
    };
};
```

</code-block>
<code-block title="Traditional assignment">

```js{4-14}
module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo ?? 'RSSHub';
    // Initiate an HTTP GET request to the API
    const response = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });
    // response.data is the data object returned by the above request
    const data = response.data;

    ctx.state.data = {
        // Your RSS output here
    };
};
```

</code-block>
</code-group>

### Outputting the RSS

Once we have the data from the API, we need to process it further to generate RSS in accordance with RSS specification. Mainly we need the channel title, channel link as well as item title, item link, item description and item publication date.

Assign them to the `ctx.state.data` object and RSSHub's middleware will do the rest.

Your final code should look like this:

<code-group>
<code-block title="Final code" active>

```js{16-30,32-39}
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });

    // extract the data from the API response
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

    ctx.state.data = {
        // channel title
        title: `${user}/${repo} issues`,
        // channel link
        link: `https://github.com/${user}/${repo}/issues`,
        // each feed item
        item: items,
    };
};
```

</code-block>
<code-block title="Alternative">

```js{16-36}
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });

    ctx.state.data = {
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
    };
};
```

</code-block>
</code-group>

## Via HTML web page using got

### Creat the main file

Open your code editor and create a new file. Since we are going to create a RSS for GitHub issues, it is suggested that you save the file as `issue.js` but you can also name it whatever you like.

Here's the basic code to get you started:

```js
// Require the necessary modules
const got = require('@/utils/got'); // a customised got
const cheerio = require('cheerio'); // an HTML parser with a jQuery-like API
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // Your logic here

    ctx.state.data = {
        // Your RSS output here
    };
};
```

### Retrieving user input

As mentioned before, we want users to enter a GitHub username and a repository name, and fall back to `RSSHub` if they don't enter the repository name in the request URL.

```js{2}
module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    ctx.state.data = {
        // Your RSS output here
    };
};
```

### Getting data from the web page

Once we have the user input, we can use it to make a request to the web page. In most of the cases, you will need to use got from `@/utils/got`(a customised [got](https://www.npmjs.com/package/got) wrapper) to make HTTP requests. You can read the [got documentation](https://github.com/sindresorhus/got/tree/v11#usage) for more information.

First, we will make an HTTP GET request to the API and load the returned HTML into cheerio.

```js{5-6}
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    // Note that .data is the full HTML source of the target page, returned by the request
    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);
```

Parse the HTML and convert it to an array.

```js{3-21}
    // Use cheerio selector to select all 'div' elements with the class name 'js-navigation-container'
    // which contain child elements with the class name 'flex-auto'
    const item = $('div.js-navigation-container .flex-auto')
        // Use toArray() method to convert an array of Cheerio node objects into an array of nodes
        .toArray()
        // Use map() to traverse the array and parse out the result of each element
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // a.attr('href') is a relative URL. However, we need an absolute URL for `link`
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    ctx.state.data = {
        // Your RSS output here
    };
```

### Outputting the RSS

Once we have the data from the web page, we need to process it further to generate RSS in accordance with RSS specification. Mainly we need the channel title, channel link as well as item title, item link, item description and item publication date.

Assign them to the `ctx.state.data` object and RSSHub's middleware will do the rest.

Your code should look something like this:

```js{29-36}
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);

    const item = $('div.js-navigation-container .flex-auto')
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

    ctx.state.data = {
        // channel title
        title: `${user}/${repo} issues`,
        // channel link
        link: `https://github.com/${user}/${repo}/issues`,
        // each feed item
        item: items,
    };
};
```

### One more thing

Although the code above looks good to go, it only provides part of the information in a feed item. For those who want a better reading experience, we can add the full article to each feed item, which in this case is the issue body.

```js{12,29-43,48}
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);

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
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                // Select the first element with the class name 'comment-body'
                item.description = $('.comment-body').first().html();

                // Every property of a list item defined above is reused here
                // and we add a new property 'description'
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${user}/${repo} issues`,
        link: `https://github.com/${user}/${repo}/issues`,
        item: items,
    };
};
```

Now this RSS feed will have a similar reading experience to the original website.

::: tip Note
Note that we only send `1` HTTP request when using API to get everything we need in the previous section. However, in this section, we send `1 + n` HTTP requests where `n` is the number of feed items in the list from the first request.

Some websites may not like this behaviour and may return errors like `429 Too Many Requests`.
:::

## Using the common configured route

### Create the main file

First, we need a few data:

1.  RSS source link
2.  Data source link
3.  RSS feed title (not item title)

Open your code editor and create a new file. Since we are going to create an RSS for GitHub issues, it is suggested that you save the file as `issue.js`, but you can also name it whatever you like.

Here's the basic code to get you started:

```js
// Require the necessary modules
const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    ctx.state.data = await buildData({
        link: '', // RSS source link
        url: '', // Data source link
        // Variables are used here, such as %xxx% will be parsed into
        // variables with values of the same name under **params**
        title: '%title%', 
        params: {
            title: '', // additional title
        },
    });
};
```

Our RSS has nocontent at the moment. The content will be added by setting the `item`. Here is an example:

```js{15-21}
const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    const link = `https://github.com/${user}/${repo}/issues`;

    ctx.state.data = await buildData({
        link,
        url: link,
        title: `${user}/${repo} issues`, // you can also use $('head title').text()
        params: {
            title: `${user}/${repo} issues`,
            baseUrl: 'https://github.com',
        },
        item: {
            item: 'div.js-navigation-container .flex-auto',
            title: `$('a').first().text() + ' - %title%'`, // Only supports js statements like $().xxx()
            link: `'%baseUrl%' + $('a').first().attr('href')`, // .text() means get the text of the element
            // description: `$('.post .context').html()`, // .attr() means get the specified attribute
            pubDate: `parseDate($('relative-time').attr('datetime'))`,
        },
    });
};
```

You will notice that the code is quite similar to [Obtaining data from the webpage](#via-html-webpage-using-got-obtaining-data-from-the-webpage) in the previous section. However, this RSS does not contain the full article of the issue.

### Retrieving full articles

To get the full article of each issue, you need to add a few more lines of code:

```js{2-3,25-34}
const buildData = require('@/utils/common-config');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    const link = `https://github.com/${user}/${repo}/issues`;

    ctx.state.data = await buildData({
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

    await Promise.all(
        ctx.state.data.item.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: resonse } = await got(item.link);
                const $ = cheerio.load(resonse);
                item.description = $('.comment-body').first().html();
                return item;
            })
        )
    );
};
```

Again, you will see that the above code is very similar to the [previous section](#via-html-web-page-using-got-one-more-thing). It is recommended that you use [the above method](#via-html-web-page-using-got) whenever possible, as it is more flexible than using `@/utils/common-config`.

## Using puppeteer

Before using this approach, you should have tried the [above methods](#via-html-web-page-using-got). It is also recommended that you read [via HTML web page using got](#via-html-web-page-using-got) first since this section is an extension of the previous section and will not explain some basic concepts.

### Creat the main file

Open your code editor and create a new file. Since we are going to create a RSS for GitHub issues, it is suggested that you save the file as `issue.js` but you can also name it whatever you like.

Here's the basic code to get you started:

```js
// Require some useful modules
const cheerio = require('cheerio'); // an HTML parser with a jQuery-like API
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    // Your logic here

    ctx.state.data = {
        // Your RSS output here
    };
};
```

### Replace got with puppeteer

Now, we are going to use puppeteer to get data from the web page instead of using got.

<code-group>
<code-block title="puppeteer">

```js{9-32,38}
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    // require puppeteer utility class, initialise a browser instance
    const browser = await require('@/utils/puppeteer')();
    // open a new tab
    const page = await browser.newPage();
    // intercept all requests
    await page.setRequestInterception(true);
    // only allow certain types of requests to proceed
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    // access the target link
    const link = `${baseUrl}/${user}/${repo}/issues`;
    // got requests will be logged automatically
    // but puppeteer requests are not
    // so we need to log them manually
    logger.debug(`Requesting ${link}`);
    await page.goto(link, {
        // specify how long to wait for the page to load
        waitUntil: 'domcontentloaded',
    });
    // retrieve the HTML content of the page
    const response = await page.content();
    // close the tab
    page.close();

    const $ = cheerio.load(response);

    // const item = ...;

    browser.close();

    ctx.state.data = {
        // Your RSS output here
    };
}
```

</code-block>
<code-block title="got">

```js{9}
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);

    ctx.state.data = {
        // Your RSS output here
    };
}
```

</code-block>
</code-group>

### Retrieving full articles

Retreiving the full article of each issue is also similar to [the previous section](#via-html-web-page-using-got-one-more-thing) but using a new browser page instead of `got`.

```js{46-60,71-73}
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    const link = `${baseUrl}/${user}/${repo}/issues`;
    logger.debug(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();

    const $ = cheerio.load(response);

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
            ctx.cache.tryGet(item.link, async () => {
                // reuse the browser instance
                // and open a new tab
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });

                logger.debug(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                // close the tab after retrieving the HTML content
                page.close();

                const $ = cheerio.load(response);

                item.description = $('.comment-body').first().html();

                return item;
            })
        )
    );

    // remember to shut down the browser instance
    // after requests are done
    browser.close();

    ctx.state.data = {
        title: `${user}/${repo} issues`,
        link: `https://github.com/${user}/${repo}/issues`,
        item: items,
    };
};
```

### Extra

-   [puppeteer's good ol' docs](https://github.com/puppeteer/puppeteer/blob/v15.2.0/docs/api.md)
-   [puppeteer's current docs](https://pptr.dev)

#### Intercepting requests

It is highly recommended that you enable request interception to filter out unwanted requests such as images, fonts, CSS, etc. This will greatly reduce the time it takes for the web page to load in the browser, saving CPU and memory resources. 

```js
await page.setRequestInterception(true);
page.on('request', (request) => {
    request.resourceType() === 'document' ? request.continue() : request.abort();
});
// These two statements must be placed before page.goto()

```

Visit the [old puppeteer docs](https://github.com/puppeteer/puppeteer/blob/v15.2.0/docs/api.md#httprequestresourcetype) for more information about `request.resourceType()`.
