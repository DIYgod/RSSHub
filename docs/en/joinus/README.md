---
sidebar: auto
---

# Join Us

We welcome all pull requests. Suggestions and feedback are also welcomed [here](https://github.com/DIYgod/RSSHub/issues).

## Submit new RSS source

### Step 1: Code the script

Firstly, add a .js file for the new route in [/lib/router.js](https://github.com/DIYgod/RSSHub/blob/master/lib/router.js)

#### Acquiring Data

-   Typically the data are acquired via HTTP requests (via API or webpage) sent by [got](https://github.com/sindresorhus/got)
-   Occasionally [puppeteer](https://github.com/GoogleChrome/puppeteer) is required for browser stimulation and page rendering in order to acquire the data

-   The acquired data are most likely in JSON or HTML format
-   For HTML format, [cheerio](https://github.com/cheeriojs/cheerio) is used for further processing

-   Below is a list of data acquisition methods, ordered by the **「level of recommendation」**


    1. **Acquire data via API using got**

    Example：[/lib/routes/bilibili/coin.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/bilibili/coin.js)。

    Acquiring data via the official API provided by the data source using got:

    ```js
    // Initiate a HTTP GET request
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/coin/video?vmid=${uid}&jsonp=jsonp`,
    });

    const data = response.data.data; // response.data is the data object returned from the previous request
    // The object contains a nested object called data, thus response.data.data is the actual data needed here
    ```

    One of the leaf objects (response.data.data[0])：

    ```json
    {
        "aid": 33614333,
        "videos": 2,
        "tid": 20,
        "tname": "宅舞",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/5649d7fe6ff7f7b431300fc1a0db80d3f174cacd.jpg",
        "title": "【赤九玖】响喜乱舞【和我一起狂舞吧，团长大人(✧◡✧)】",
        "pubdate": 1539259203,
        "ctime": 1539249536,
        "desc": "编舞出处：av31984673\n真心好喜欢这个舞和这首歌，居然恰巧被邀请跳了，感谢《苍之纪元》官方的邀请。这次cos的是游戏的新角色缪斯。然而时间有限很多地方还有很多不足。也没跳够，以后私下还会继续练习，希望能学到更多动作，也能为了有机会把它跳的更好。 \n摄影：绯山圣瞳九命猫 \n后期：炉火"
        // some more data....
    }
    ```

    Processing the data further to generate objects in accordance with RSS specification, mainly title, link, description, publish time, then assign them to ctx.state.data, [produce RSS feed](#produce-rss-feed)：

    ```js
    ctx.state.data = {
        // the source title
        title: `${name} 的 bilibili 投币视频`,
        // the source link
        link: `https://space.bilibili.com/${uid}`,
        // the source description
        description: `${name} 的 bilibili 投币视频`,
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.title,
            // the article content
            description: `${item.desc}<br><img src="${item.pic}">`,
            // the article publish time
            pubDate: new Date(item.time * 1000).toUTCString(),
            // the article link
            link: `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };

    // the route is now done
    ```

    2. **Acquire data via HTML webpage using got**

    Data have to be acquired via HTML webpage if **no API was provided**, for example: [/lib/routes/jianshu/home.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/jianshu/home.js)。

    Acquiring data by scrapping the HTML using got:

    ```js
    // Initiate a HTTP GET request
    const response = await got({
        method: 'get',
        url: 'https://www.jianshu.com',
    });

    const data = response.data; // response.data is the entire HTML source of the target page, returned from the previous request
    ```

    Parsing the HTML using cheerio:

    ```js
    const $ = cheerio.load(data); // Load the HTML returned into cheerio
    const list = $('.note-list li').get();
    // use cheerio selector, select all 'li' elements with 'class="note-list"', the result is an array of cheerio node objects
    // use cheerio get() method to transform a cheerio node object array into a node array

    // PS：every cheerio node is a HTML DOM
    // PPS：cheerio selector is almost identical to jquery selector
    // Refer to cheerio docs：https://cheerio.js.org/
    ```

    Use /jianshu/utils.js class to extract full-text:

    ```js
    const result = await util.ProcessFeed(list, ctx.cache);
    ```

    The logic for full-text extraction in /jianshu/utils.js class：

    ```js
    // define a function to load the article content
    async function load(link) {
        // get the article asynchronously
        const response = await got.get(link);
        // load the article content
        const $ = cheerio.load(response.data);

        // parse the date
        const date = new Date(
            $('.publish-time')
                .text()
                .match(/\d{4}.\d{2}.\d{2} \d{2}:\d{2}/)
        );

        // handle the timezone
        const timeZone = 8;
        const serverOffset = date.getTimezoneOffset() / 60;
        const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

        // extract the full-text
        const description = $('.show-content-free').html();

        // return the parsed result
        return { description, pubDate };
    }

    // use Promise.all() to initiate requests in parallel
    const result = await Promise.all(
        // loop through every article
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.title');
            // resolve the absolute URL
            const itemUrl = url.resolve(host, $title.attr('href'));

            // form a new object to hold the data
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: $('.nickname').text(),
                guid: itemUrl,
            };

            // use tryGet() to query the cache
            // if the query returns no result, query the data source via load() to get article content
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            // merge two objects to form the final output
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ```

    Assign the value of `result` to `ctx.state.data`

    ```js
    ctx.state.data = {
        title: '简书首页',
        link: 'https://www.jianshu.com',
        // select "content" property of <meta name="description">
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };

    // the route is now done
    ```

    3. **Acquire data via page rendering using puppeteer**

    ::: tip tips

    This method consumes more resources and is less performant, use only when the above methods failed to acquire data, otherwise your pull requests will be rejected!

    :::

    Seldomly, data source **provides no API and the page requires rendering** to acquire data, for example: [/lib/routes/sspai/series.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/sspai/series.js)

    ```js
    // use puppeteer util class, initialise a browser instance
    const browser = await require('@/utils/puppeteer')();
    // open a new page
    const page = await browser.newPage();
    // access the target link
    const link = 'https://sspai.com/series';
    await page.goto(link);
    // render the page
    const html = await page.evaluate(
        () =>
            // process on the rendered page
            document.querySelector('div.new-series-wrapper').innerHTML
    );
    // shutdown the browser
    browser.close();
    ```

    Parsing the HTML using cheerio:

    ```js
    const $ = cheerio.load(html); // Load the HTML returned into cheerio
    const list = $('div.item'); //  // use cheerio selector, select all 'div class="item"' elements, the result is an array of cheerio node objects

    ```

    Assign the value to `ctx.state.data`

    ```js
    ctx.state.data = {
        title: '少数派 -- 最新上架付费专栏',
        link,
        description: '少数派 -- 最新上架付费专栏',
        item: list
            .map((i, item) => ({
                // the article title
                title: $(item)
                    .find('.item-title a')
                    .text()
                    .trim(),
                // the article link
                link: url.resolve(
                    link,
                    $(item)
                        .find('.item-title a')
                        .attr('href')
                ),
                // the article author
                author: $(item)
                    .find('.item-author')
                    .text()
                    .trim(),
            }))
            .get(), // use cheerio get() method to transform a cheerio node object array into a node array
    };

    // the route is now done

    // PS: the route acts as a notifier of new articles, it does not provide access to the content behind the paywall, thus not content were fetched
    ```

---

#### Enable Caching

By default there is a global caching period set in `lib/config.js`, some sources might have a low update frequency, a longer caching period should be set.

-   Save to cache:

```js
ctx.cache.set((key: string), (value: string)); // time is the caching period in seconds.
```

-   Access the cache:

```js
const value = await ctx.cache.get((key: string));
```

For example: [/lib/routes/zhihu/daily.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/zhihu/daily.js), the full-text extraction will be triggered even when the article was not updated.

Given the update frequency is known, set the appropriate caching period to reuse the cache, will save resources and improve performance.

```js
const key = 'daily' + story.id; // story.id is the unique identifier of each article
ctx.cache.set(key, item.description); // set cache
```

When the identical requests come in, reuse the cache：

```js
const key = 'daily' + story.id;
const value = await ctx.cache.get(key); // query the cache to find the unique identifier
if (value) {
    // return the cached data
    item.description = value; // assign the cached data
} else {
    // no cache found
    // initiate request to the data source
}
```

---

#### Produce RSS Feed

Assign the acquired data to ctx.state.data, the middleware [template.js](https://github.com/DIYgod/RSSHub/blob/master/middleware/template.js) will then process the data and render the RSS output [/views/rss.art](https://github.com/DIYgod/RSSHub/blob/master/views/rss.art), the list of parameters:

```js
ctx.state.data = {
    title: '', // The feed title
    link: '', // The feed link
    description: '', // The feed description
    language: '', // The language of the channel
    allowEmpty: false, // default to false, set to true to allow empty item
    item: [
        // An article of the feed
        {
            title: '', //  The article title
            author: '', // Author of the article
            category: '', // Article category
            // category: [''], // Multiple category
            description: '', // The article summary or content
            pubDate: '', // The article publishing datetime
            guid: '', // The article unique identifier, optional, default to the article link below
            link: '', // The article link
        },
    ],
};
```

##### Podcast feed

Used for audio feed, these **additional** data are in accordance with many podcast players' subscription format:

```js
ctx.state.data = {
    itunes_author: '', // The channel's author, you must fill this data.
    itunes_category: '', // Channel category
    image: '', // Channel's image
    item: [
        {
            itunes_item_image: '', // The item image
            enclosure_url: '', // The item's audio link
            enclosure_length: '', // The audio length in seconds.
            enclosure_type: '', // Common types are: 'audio/mpeg' for .mp3, 'audio/x-m4a' for .m4a 'video/mp4' for .mp4
        },
    ],
};
```

##### BT/Magnet feed

Used for downloader feed, these **additional** data are in accordance with many downloaders' subscription format to trigger automated download:

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

##### Media RSS

these **additional** data are in accordance with many [Media RSS](http://www.rssboard.org/media-rss) softwares' subscription format:

For example:

```js
ctx.state.data = {
    item: [
        {
            media: {
                content: {
                    url: post.file_url,
                    type: `image/${mime[post.file_ext]}`,
                },
                thumbnail: {
                    url: post.preview_url,
                },
            },
        },
    ],
};
```

---

### Step 2: Add the script into router

Add the script into [/lib/router.js](https://github.com/DIYgod/RSSHub/blob/master/lib/router.js)

#### Example

1. [bilibili/bangumi](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/bilibili/bangumi.js)

| Name                               | Description                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Route                              | `/bilibili/bangumi/:seasonid`                                                      |
| Data Source                        | bilibili                                                                           |
| Route Name                         | bangumi                                                                            |
| Parameter 1                        | :seasonid required                                                                 |
| Parameter 2                        | n/a                                                                                |
| Parameter 3                        | n/a                                                                                |
| Route Path                         | `./routes/bilibili/bangumi`                                                        |
| the complete code in lib/router.js | `router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi'));` |

2. [github/issue](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/github/issue.js)

| Name                               | Description                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Route                              | `/github/issue/:user/:repo`                                                  |
| Data Source                        | github                                                                       |
| Route Name                         | issue                                                                        |
| Parameter 1                        | :user, required                                                              |
| Parameter 2                        | :repo, required                                                              |
| Parameter 3                        | n/a                                                                          |
| Route Path                         | `./routes/github/issue`                                                      |
| the complete code in lib/router.js | `router.get('/github/issue/:user/:repo', require('./routes/github/issue'));` |

3. [embassy](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/embassy/index.js)

| Name                               | Description                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| Route                              | `/embassy/:country/:city?`                                                   |
| Data Source                        | embassy                                                                      |
| Route Name                         | n/a                                                                          |
| Parameter 1                        | :country, required                                                           |
| Parameter 2                        | ?city, optional                                                              |
| Parameter 3                        | n/a                                                                          |
| Route Path                         | `./routes/embassy/index`                                                     |
| the complete code in lib/router.js | `router.get('/embassy/:country/:city?', require('./routes/embassy/index'));` |

---

### Step 3: Add the documentation

1.  Update [Documentation (/docs/en/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/docs/en/README.md), preview the docs via `npm run docs:dev`

    -   Documentation uses vue component:
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
        <RouteEn author="HenryQW" path="/github/issue/:user/:repo" example="/github/issue/DIYgod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />
        ```

        <RouteEn author="HenryQW" path="/github/issue/:user/:repo" example="/github/issue/DIYgod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />

        -   Use component slot for complicated description:

        ```vue
        <RouteEn
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
        </RouteEn>
        ```

        <RouteEn author="HenryQW" path="/hopper/:lowestOnly/:from/:to?" example="/hopper/1/LHR/PEK" :paramsDesc="['set to `1` will return the cheapest deal only, instead of all deals, so you don\'t get spammed', 'origin airport IATA code', 'destination airport IATA code, if unset the destination will be set to `anywhere`']" >

        This route returns a list of flight deals (in most cases, 6 flight deals) for a period defined by Hopper's algorithm, which means the travel date will be totally random (could be tomorrow or 10 months from now).

        For airport IATA code please refer to [Wikipedia List of airports by IATA code](https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_A)

        </RouteEn>

1.  Execute `npm run format` to lint the code before you commit and open a pull request

---

## Join the discussion

1.  [Telegram Group](https://t.me/rsshub)
2.  [GitHub Issues](https://github.com/DIYgod/RSSHub/issues)

## Some Tips for Development

### VS Code debug configuration

`.vscode/launch.js`

#### Debugging with nodemon

In terminal, run `npm run dev` or `yarn dev` to start debugging.

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Node: Nodemon",
            "processId": "${command:PickProcess}",
            "restart": true,
            "protocol": "inspector"
        }
    ]
}
```

#### Debugging without nodemon

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "${workspaceFolder}/lib/index.js",
            "env": { "NODE_ENV": "dev" }
        }
    ]
}
```
