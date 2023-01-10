---
sidebarDepth: 2
---
# Create your own RSSHub route

As said before, we will be creating a RSS feed for [GitHub Repo Issues](/en/programming.html#github-repo-issues) as an example. All of the four data acquisition methods mentioned will be shown.

1. [Using API](#using-api)
2. [Via HTML webpage using got](#via-html-webpage-using-got)

## Using API

### Check the API documentation

Different websites have different APIs. You can refer to the API documentation of the website you want to create a RSS for. In this case, we will be using the [GitHub Issues API](https://docs.github.com/en/rest/issues/issues#list-repository-issues).

### Creating the main file

Open your code editor and create a new file. Since we are going to create a RSS for GitHub issues, it is suggested to save the file as `issue.js` but you can also name it as you like.

Here's the base code to get you started:

<code-group>
<code-block title="issue.js">

```js
// Require the necessary modules
const got = require('@/utils/got'); // a customized got
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

### Obtaining user input

As said before, we want users to enter the GitHub username and repository name and fall back to `RSSHub` if users don't enter the repository name in the request URL.

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

### Obtaining data from the API

Now we have the user input, we can use it to make a request to the API. In most of the cases, you will need to use `got` from `@/utils/got`(a customised [got](https://www.npmjs.com/package/got) wrapper) to make HTTP requests. You can refer to the [got documentation](https://github.com/sindresorhus/got/tree/v11#usage) for more information.

<code-group>
<code-block title="Object destructuring" active>

```js{3-16}
module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    // Initiate a HTTP GET request to the API
    // Note that .data is the data object returned from the request
    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            // In this example, HTML is picked for simplicity instead
            // of the recommended 'application/vnd.github+json' which
            // will return Markdown and requires additional processing
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
    // Initiate a HTTP GET request to the API
    const response = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });
    // response.data is the data object returned from the request above
    const data = response.data;

    ctx.state.data = {
        // Your RSS output here
    };
};
```

</code-block>
</code-group>

### Outputting the RSS

Now we have the data from the API, we need to process it further to generate RSS in accordance with RSS specification. Mainly channel title, channel link as well as item title, item link, item description and item publish date are required.

Assign them to the `ctx.state.data` object and RSSHub's middleware will handle the rest.

The final code should look like this:

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

## Via HTML webpage using got

### Creating the main file

Open your code editor and create a new file. Since we are going to create a RSS for GitHub issues, it is suggested to save the file as `issue.js` but you can also name it as you like.

Here's the base code to get you started:

```js
// Require the necessary modules
const got = require('@/utils/got'); // a customized got
const cheerio = require('cheerio'); // a HTML parser with jQuery-like API
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // Your logic here

    ctx.state.data = {
        // Your RSS output here
    };
};
```

### Obtaining user input

As said before, we want users to enter the GitHub username and repository name and fall back to `RSSHub` if users don't enter the repository name in the request URL.

```js{2}
module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    ctx.state.data = {
        // Your RSS output here
    };
};
```

### Obtaining data from the webpage

Now we have the user input, we can use it to make a request to the webpage. In most of the cases, you will need to use got from `@/utils/got`(a customised [got](https://www.npmjs.com/package/got) wrapper) to make HTTP requests. You can refer to the [got documentation](https://github.com/sindresorhus/got/tree/v11#usage) for more information.

First, we initiate a HTTP GET request to the API and load the HTML returned into cheerio.

```js{5-6}
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    // Note that .data is the entire HTML source of the target page, returned from the request
    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);
```

Parse the HTML and convert it into an array.

```js{3-21}
    // Use cheerio selector to select all 'div' elements contain class name 'js-navigation-container'
    // which contains child elements with class name 'flex-auto'
    const item = $('div.js-navigation-container .flex-auto')
        // Use toArray() method to transform a cheerio node object array into a node array
        .toArray()
        // Use map() to traverse the array and parse out the result of each element
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // a.attr('href') is a relative URL. However, we need an absolute URL for link
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

Now we have the data from the webpage, we need to process it further to generate RSS in accordance with RSS specification. Mainly channel title, channel link as well as item title, item link, item description and item publish date are required.

Assign them to the `ctx.state.data` object and RSSHub's middleware will handle the rest.

Your code should look like this:

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

Although the above code looks good to go, it only provides part of the information of a feed item. For those who are seeking for a better reading experience, we can add the full article to each feed item which is the issue body in this case.

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

                // Select the first element with class name 'comment-body'
                item.description = $('.comment-body').first().html();

                // Every property of a list item defined above is reused here
                // and we are adding a new property 'description' to it
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

Now this RSS feed will have a similar reading experience as the original webpage.

::: tip Note
Note that we only send `1` HTTP request when using API to get everything we need in previous section. However, in this section, we are sending `1 + n` HTTP requests where `n` is the number of feed items in the list from the first request.

Some websites may not like this behavior and may return errors like `429 Too Many Requests`.
:::

## Using the common configured route

### Creating the main file

First, we need a few data:

1.  RSS source link
2.  Data source link
3.  RSS feed title (not item title)

Open your code editor and create a new file. Since we are going to create a RSS for GitHub issues, it is suggested to save the file as `issue.js` but you can also name it as you like.

Here's the base code to get you started:

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

Our RSS does not have any content for now. The content are done by setting the `item`. Here is an example:

```js{15-21}
const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    const link = `https://github.com/${user}/${repo}/issues`;

    ctx.state.data = await buildData({
        link,
        url: link,
        title: `${user}/${repo} issues`, // you can use $('head title').text() as well
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

You will find that the code is quite similar with [Obtaining data from the webpage](#via-html-webpage-using-got-obtaining-data-from-the-webpage) in previous section. However, this RSS does not includes the full article of the issue.

### Full article

In order to obtain the full article of each issue, you need to add a few more lines of code:

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

Once again, you will see that the above code is really similar to the [previous section](#via-html-webpage-using-got-one-more-thing). You are suggested to use the above [data method](#via-html-webpage-using-got) when possible as it has more flexibility over `@/utils/common-config`.
