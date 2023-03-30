# Using Cache

All routes have a cache that expires after a short duration. You can change how long the cache lasts by modifying the `CACHE_EXPIRE` value in the `lib/config.js` file using environment variables. However, for interfaces that have less frequently updated content, it's better to specify a longer cache expiration time using `CACHE_CONTENT_EXPIRE` instead.

For example, to retrieve the full text of the first comment for each issue, you can make a request to `${baseUrl}/${user}/${repo}/issues/${id}`, since this data is unavailable through `${baseUrl}/${user}/${repo}/issues`. It's recommended to store this data in the cache to avoid making repeated requests to the server.

Here's an example of how you can use the cache to retrieve the data:

```js
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                
                item.description = $('.comment-body').first().html();

                return item;
            })
        )
    );
```

The above code snippet from [Create Your Own RSSHub Route](/en/joinus/new-rss/start-code.html#via-html-web-page-using-got-better-reading-experience) shows how to use the cache to get the full text of the first comment of each issue. `ctx.cache.tryGet()` is used to determine if the data is already available within the cache. If it's not, the code retrieves the data and stores it in the cache.

The object returned from the previous statement will be reused, and an extra `description` property will be added to it. The returned cache for each `item.link` will be `{ title, link, pubDate, author, category, description }`. The next time the same path is requested, this processed cache will be used instead of making a request to the server and recomputing the data.

::: warning Warning
Any assignments to variables that are declared outside of the `tryGet()` function will not be processed under a cache-hit scenario. For example, the following code will not work as expected:

```js
    let variable = 'value';
    await ctx.cache.tryGet('cache:key', async () => {
        variable = 'new value';
        const newVariable = 'new variable';
        return newVariable;
    })
    console.log(variable); // cache miss: 'new value', cache hit: 'value'
       
```

:::

## API

### ctx.cache.tryGet(key, getValueFunc [, maxAge [, refresh ]])

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key  | `string` | *(Required)* The key used to store and retrieve the cache. You can use `:` as a separator to create a hierarchy. |
| getValueFunc | `function` \| `string` | *(Required)* A function that returns data to be cached when a cache miss occurs.
| maxAge | `number` | *(Optional)* The maximum age of the cache in seconds. If not specified, `CACHE_CONTENT_EXPIRE` will be used. |
| refresh | `boolean` | *(Optional)* Whether to renew the cache expiration time when the cache is hit. `true` by default. |

#### Defined in

[lib/middleware/cache/index.js](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/cache/index.js#L58)

::: tip Tips
Below are advanced methods for using cache. You should use `ctx.cache.tryGet()` most of the time.

Note that you need to use `JSON.parse()` when retrieving the cache using `ctx.cache.get()`.
:::

### ctx.cache.get(key [, refresh ])

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key  | `string` | *(Required)* The key used to retrieve the cache. You can use `:` as a separator to create a hierarchy. |
| refresh | `boolean` | *(Optional)* Whether to renew the cache expiration time when the cache is hit. `true` by default. |

### ctx.cache.set(key, value [, maxAge ])

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key  | `string` | *(Required)* The key used to store the cache. You can use `:` as a separator to create a hierarchy. |
| value | `function`\| `string` | *(Required)* The value to be cached. |
| maxAge | `number` | *(Optional)* The maximum age of the cache in seconds. If not specified, `CACHE_CONTENT_EXPIRE` will be used. |
