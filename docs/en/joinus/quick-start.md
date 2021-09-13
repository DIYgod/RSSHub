---
sidebar: auto
---

# Join Us

We welcome all pull requests. Suggestions and feedback are also welcomed [here](https://github.com/DIYgod/RSSHub/issues).

## Join the discussion

1.  [Telegram Group](https://t.me/rsshub)
2.  [GitHub Issues](https://github.com/DIYgod/RSSHub/issues)

## Submit new RSS rule

Before you start writing RSS rule, please make sure that the source site does not provide RSS. Some web pages will include a link element with type `application/atom+xml` or `application/rss+xml` in the HTML header to indicate the RSS link.

### Debug

First `yarn` or`npm install` to install dependencies, then execute `yarn dev` or`npm run dev`, open `http://localhost:1200` to see the effect, and the page will refresh automatically if files modified.

### Add route

Firstly, add a route in [/lib/router.js](https://github.com/DIYgod/RSSHub/blob/master/lib/router.js)

### Code the script

Create a new js script in [/lib/routes/](https://github.com/DIYgod/RSSHub/tree/master/lib/routes) corresponding to route path

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
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
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

    Data have to be acquired via HTML webpage if **no API was provided**, for example: [/lib/routes/douban/explore.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/douban/explore.js)

    Acquiring data by scrapping the HTML using got:

    ```js
    // Initiate a HTTP GET request
    const response = await got({
        method: 'get',
        url: 'https://www.douban.com/explore',
    });

    const data = response.data; // response.data is the entire HTML source of the target page, returned from the previous request
    ```

    Parsing the HTML using cheerio:

    ```js
    const $ = cheerio.load(data); // Load the HTML returned into cheerio
    const list = $('div[data-item_id]');
    // use cheerio selector, select all 'div' elements with 'data-item_id' attribute, the result is an array of cheerio node objects
    // use cheerio get() method to transform a cheerio node object array into a node array

    // PS：every cheerio node is a HTML DOM
    // PPS：cheerio selector is almost identical to jquery selector
    // Refer to cheerio docs：https://cheerio.js.org/
    ```

    Use map to traverse the array and parse out the result of each item

    ```js
    ctx.state.data = {
        title: '豆瓣-浏览发现',
        link: 'https://www.douban.com/explore',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('a.cover').attr('style').replace('background-image:url(', '').replace(')', '');
                    return {
                        title: item.find('.title a').first().text(),
                        description: `作者：${item.find('.usr-pic a').last().text()}<br>描述：${item.find('.content p').text()}<br><img src="${itemPicUrl}">`,
                        link: item.find('.title a').attr('href'),
                    };
                })
                .get(),
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
                title: $(item).find('.item-title a').text().trim(),
                // the article link
                link: url.resolve(link, $(item).find('.item-title a').attr('href')),
                // the article author
                author: $(item).find('.item-author').text().trim(),
            }))
            .get(), // use cheerio get() method to transform a cheerio node object array into a node array
    };

    // the route is now done

    // PS: the route acts as a notifier of new articles, it does not provide access to the content behind the paywall, thus not content were fetched
    ```

    4. **Use general configuration routing**

    A large number of websites can generate RSS through a configuration paradigm.

    The general configuration is to easily generate RSS by reading json data through cheerio (**CSS selector, jQuery function**)

    First we need a few data:

    1. RSS source link
    2. Data source link
    3. RSS title (not item title)

    ```js
    const buildData = require('@/utils/common-config');
    module.exports = async (ctx) => {
        ctx.state.data = await buildData({
            link: '', // RSS source link
            url: '', // Data source link
            title: '%title%', // Variables are used here, such as **% xxx%** will be parsed into variables with values of the same name under **params**
            params: {
                title: '', // RSS title
            },
        });
    };
    ```

    Our RSS does not have any content for now, the content needs to be completed by `item`
    Here is an example

    ```js
    const buildData = require('@/utils/common-config');

    module.exports = async (ctx) => {
        const link = `https://www.uraaka-joshi.com/`;
        ctx.state.data = await buildData({
            link,
            url: link,
            title: `%title%`,
            params: {
                title: '裏垢女子まとめ',
            },
            item: {
                item: '.content-main .stream .stream-item',
                title: `$('.post-account-group').text() + ' - %title%'`, // Only supports js statements like $().xxx()
                link: `$('.post-account-group').attr('href')`, // .text() means get the text of the element, .attr() means get the specified attribute
                description: `$('.post .context').html()`, // .text() means get the text of the the html code
                pubDate: `new Date($('.post-time').attr('datetime')).toUTCString()`,
                guid: `new Date($('.post-time').attr('datetime')).getTime()`,
            },
        });
    };
    ```

    So far we have completed a simplest route

---

#### Use Cache

All routes have a cache, the global cache time is set in `lib/config.js`, but the content returned by some interfaces is updated less frequently. At this time, you should set a longer cache time for these data.

For example, the bilibili column needs to get the full text of the article：[/lib/routes/bilibili/followings_article.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/bilibili/followings_article.js)

Since the full text of all articles cannot be got from one API, each article needs to be requested once, and these data are generally unchanged, so these data should be stored in the cache to avoid requesting repeatedly

```js
const description = await ctx.cache.tryGet(link, async () => {
    const result = await got.get(link);

    const $ = cheerio.load(result.data);
    $('img').each(function (i, e) {
        $(e).attr('src', $(e).attr('data-src'));
    });

    return $('.article-holder').html();
});
```

The implementation of tryGet can be seen [here](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/cache.js#L128). The first parameter is the cache key, the second parameter is the cache data acquisition method, and the third parameter is the cache time, it should not be passed in normally. The cache time defaults to [CACHE_CONTENT_EXPIRE](/en/install/#cache-configurations), and each time accessing the cache will recalculate the expiration time

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

### Add the documentation

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

        1. No parameter:

        ```vue
        <RouteEn author="HenryQW" example="/sspai/series" path="/sspai/series" />
        ```

        Preview:

        ***

        <RouteEn author="HenryQW" example="/sspai/series" path="/sspai/series"/>

        ***

        2. Multiple parameters:

        ```vue
        <RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']" />
        ```

        Preview:

        ***

        <RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

        ***

        3. Use component slot for complicated description:

        ```vue
        <RouteEn author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">
        
        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |
        
        </RouteEn>
        ```

        Preview:

        ***

        <RouteEn author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |

        </RouteEn>

        ***

1.  Please be sure to close the tag of `<Route>`!

1.  Execute `npm run format` to lint the code before you commit and open a pull request

## ## Submit new RSSHub Radar rule

TODO
