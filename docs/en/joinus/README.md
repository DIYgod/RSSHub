---
sidebar: auto
---

# Join Us

We welcome all pull requests. Suggestions and feedback are also welcomed [here](https://github.com/DIYgod/RSSHub/issues).

## Submit new RSS source

1.  Add a new route in [/router.js](https://github.com/DIYgod/RSSHub/blob/master/router.js)

1.  Add the script to the corresponding directory [/routes/](https://github.com/DIYgod/RSSHub/tree/master/routes)

1.  Update [Documentation (/docs/en/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/docs/en/README.md), preview the docs via `npm run docs:dev`

    -   Documentation uses vue component:
        -   `name`: route name
        -   `author`: route authors, separated by a single space
        -   `example`: route example
        -   `path`: route path
        -   `:paramsDesc`: route parameters description, in array, supports markdown
            1. parameter description must be in the order of its appearance in route path
            1. missing description will cause errors in `npm run docs:dev`
            1. `'` `"` must be escaped as `\'` `\"`
            1. it's redundant to indicate `optional/required` as the component will prepend based on `?`
    -   Documentation examples:

        -   Multiple parameters:

        ```vue
        <routeEn name="Issue" author="HenryQW" path="/github/issue/:user/:repo" example="/github/issue/DIYgod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />
        ```

        <routeEn name="Issue" author="HenryQW" path="/github/issue/:user/:repo" example="/github/issue/DIYgod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />

        -   Use component slot for complicated description:

        ```vue
        <routeEn
            name="Flight Deals"
            author="HenryQW"
            path="/hopper/:lowestOnly/:from/:to?"
            example="/hopper/1/LHR/PEK"
            :paramsDesc="[
                'set to `1` will return the cheapest deal only, instead of all deals, so you don\'t get spammed',
                'origin airport IATA code',
                'destination airport IATA code, if unset the destination will be set to `anywhere`',
            ]"
        >
            This route returns a list of flight deals (in most cases, 6 flight deals) for a period defined by Hopper's algorithm, which means the travel date will be totally random (could be tomorrow or 10 months from now). For
            airport IATA code please refer to [Wikipedia List of airports by IATA code](https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_A)
        </routeEn>
        ```

        <routeEn name="Flight Deals" author="HenryQW" path="/hopper/:lowestOnly/:from/:to?" example="/hopper/1/LHR/PEK" :paramsDesc="['set to `1` will return the cheapest deal only, instead of all deals, so you don\'t get spammed', 'origin airport IATA code', 'destination airport IATA code, if unset the destination will be set to `anywhere`']" >

        This route returns a list of flight deals (in most cases, 6 flight deals) for a period defined by Hopper's algorithm, which means the travel date will be totally random (could be tomorrow or 10 months from now).

        For airport IATA code please refer to [Wikipedia List of airports by IATA code](https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_A)

        </routeEn>

1)  Execute `npm run format` to lint the code before you commit and open a pull request

## Write the script

RSSHub provides 3 methods for acquiring data, these methods are sorted by **recommended**:

### Access the target data source API

Use [axios](https://github.com/axios/axios) to access the target data source API, assign the acquired title, link, description and datetime to ctx.state.data (refer to Data for the list of parameters) , typically it looks like this: [/routes/bilibili/bangumi.js](https://github.com/DIYgod/RSSHub/blob/master/routes/bilibili/bangumi.js)

### Acquire data from HTML

If an API is not provided, data need to be scraped from HTML. Use [axios](https://github.com/axios/axios) to acquire the HTML and then use [cheerio](https://github.com/cheeriojs/cheerio) for scraping the relevant data and assign them to ctx.state.data, typically it looks like this: [/routes/jianshu/home.js](https://github.com/DIYgod/RSSHub/blob/master/routes/jianshu/home.js)

### Page rendering

::: tip tip

This method is comparatively less performant and consumes more resources, only use when necessary or your pull requests might be rejected.

:::

Some websites provides no API and pages require rendering too, use [puppeteer](https://github.com/GoogleChrome/puppeteer) render the pages via Headless Chrome and then use [cheerio](https://github.com/cheeriojs/cheerio) for scraping the relevant data and assign them to ctx.state.data, typically it looks like this: [/routes/sspai/series.js](https://github.com/DIYgod/RSSHub/blob/master/routes/sspai/series.js)

### Enable caching

All routes has a default cache expiry time set in `config.js`, it should be increased when the data source is not subject to frequent updates.

Add to cache:

```js
ctx.cache.set((key: string), (value: string), (time: number)); // time: the cache expiry time in seconds
```

Access the cache:

```js
const value = await ctx.cache.get((key: string));
```

In this example: [/routes/zhihu/daily.js](https://github.com/DIYgod/RSSHub/blob/master/routes/zhihu/daily.js), the full text of each article is required resulting in many requests being sent. The update frequency for this source is known (daily), we can safely set the cache to a day to avoid wasting resources.

### Data

Assign the acquired data to ctx.state.data, the middleware [template.js](https://github.com/DIYgod/RSSHub/blob/master/middleware/template.js) will then process the data and render the RSS output [/views/rss.art](https://github.com/DIYgod/RSSHub/blob/master/views/rss.art), the list of parameters:

```js
ctx.state.data = {
    title: '', // The feed title
    link: '', // The feed link
    description: '', // The feed description
    language: '', // The language of the channel
    item: [
        // An article of the feed
        {
            title: '', //  The article title
            author: '', // Author of the article
            category: '', // Article category
            // category: [''], // Multiple category
            description: '', // The article summury or content
            pubDate: '', // The article publishing datetime
            guid: '', // The article unique identifier, optional, default to the article link below
            link: '', // The article link
        },
    ],
};
```

#### Podcast feed

Used for audio type feed, these **additional** datas can make your podcast subscribeable:

```js
ctx.state.data = {
    itunes_author: '', // The channel's author, you must fill this data.
    itunes_category: '', // Channel category
    image: '', // Channel's image
    item: [
        {
            itunes_item_image: '', // The item image
            enclosure_url: '', // The item's audio link
            enclosure_length: '', // The audio length, the unit is seconds.
            enclosure_type: '', // 'audio/mpeg' or 'audio/x-m4a' or others
        },
    ],
};
```

#### BT feed

Used for download type feed, these **additional** datas can make your BT client subscribeable and can auto download:

```js
ctx.state.data = {
    item: [
        {
            enclosure_url: '', // Magnet URI
            enclosure_length: '', // The audio length, the unit is seconds, optional
            enclosure_type: 'application/x-bittorrent', // Fixed to 'application/x-bittorrent'
        },
    ],
};
```

</details>

## Join the discussion

1.  [Telegram Group](https://t.me/rsshub)
