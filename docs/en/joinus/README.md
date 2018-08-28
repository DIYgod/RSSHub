---
sidebar: auto
---

# Join Us

We welcome all pull requests. Suggestions and feedback are also welcomed [here](https://github.com/DIYgod/RSSHub/issues).

## Submit new RSS source

1.  Add a new route in [/router.js](https://github.com/DIYgod/RSSHub/blob/master/router.js)

1.  Add the script to the corresponding directory [/routes/](https://github.com/DIYgod/RSSHub/tree/master/routes)

1.  Update [README (/en/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/en/README.md) and [Documentation (/docs/en/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/docs/en/README.md), preview the docs via `npm run docs:dev`

1.  Execute `npm run format` to lint the code before you commit and open a pull request

## Write the script

### Access the target data source API

Use [axios](https://github.com/axios/axios) to access the target data source API, assign the acquired title, link, description and datetime to ctx.state.data（refer to Data for the list of parameters）, typically it looks like this: [/routes/bilibili/bangumi.js](https://github.com/DIYgod/RSSHub/blob/master/routes/bilibili/bangumi.js)

### Acquire data from HTML

If an API is not provided, data need to be scraped from HTML. Use [axios](https://github.com/axios/axios) to acquire the HTML and then use [cheerio](https://github.com/cheeriojs/cheerio) for scraping the relevant data and assign them to ctx.state.data, typically it looks like this: [/routes/jianshu/home.js](https://github.com/DIYgod/RSSHub/blob/master/routes/jianshu/home.js)

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
    item: [
        // An article of the feed
        {
            title: '', //  The article title
            description: '', // The article content
            pubDate: '', // The article publishing datetime
            guid: '', // The article unique identifier, optional, default to the article link below
            link: '', // The article link
        },
    ],
};
```

<details><summary>If you want to make a podcast RSS</summary><br>

Reference article:

-   [Create a podcast - Apple](https://help.apple.com/itc/podcasts_connect/?lang=en#/itca5b22233a)
-   [Podcast best practices - Apple](https://help.apple.com/itc/podcasts_connect/?lang=en#/itc2b3780e76)
-   Itunes podcast XML generator ：https://codepen.io/jon-walstedt/pen/jsIup
-   Feed Validation Service ：https://podba.se/validate/?url=https://rsshub.app/ximalaya/album/299146/

these datas can make your podcast subscribeable：

```js
ctx.state.data = {
    title: '', // The feed title
    link: '', // The feed link
    itunes_author: '', // The channel's author, you must fill this data.
    itunes_category： '',// Channel category
    image: '', // Channel's image
    description: '', // The feed description
    item: [
        // An item of the feed
        {
            title: '', // The item title
            description: '', // The item content
            pubDate: '', // The item publishing datetime
            guid: '', // The item unique identifier, optional, default to the item link below.
            link: '', // The item link
            itunes_item_image: '', // The item image
            enclosure_url: '', // The item's audio link
            enclosure_length: '', // The audio length, the unit is seconds.
            enclosure_type: '', // 'audio/mpeg' or 'audio/m4a' or others
            itunes_duration: '', // Covert the 'enclosure_length' to hh:mm:ss (1:33:52)
        },
    ],
};
```

</details>

## Join the discussion

1.  [Telegram Group](https://t.me/rsshub)
