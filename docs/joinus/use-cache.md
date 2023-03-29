# 使用缓存

所有路由都有一个缓存，该缓存在短时间后过期。您可以通过环境变量来修改 `lib/config.js` 文件中的 `CACHE_EXPIRE` 值使用来更改缓存的持续时间。然而，对于那些内容更新较少的接口，最好是使用 `CACHE_CONTENT_EXPIRE` 来指定较长的缓存过期时间。

例如，为了获取每个 GitHub Issue 的第一个评论的正文，您可以向 `${baseUrl}/${user}/${repo}/issues/${id}` 发出请求，因为 `${baseUrl}/${user}/${repo}/issues` 无法提供此数据。推荐将此数据存储在缓存中，以避免重复向服务器发出请求。

以下是如何使用缓存获取数据的示例代码：

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

以上代码片段来自 [制作自己的 RSSHub 路由](/joinus/new-rss/start-code.html)，展示了如何使用缓存获取每个问题的第一个评论的全文。使用 `ctx.cache.tryGet()` 来确定数据是否已经在缓存中。如果不在，则代码会获取数据并将其存储在缓存中。

上一个语句返回的对象将被重复使用，并且会添加一个额外的 `description` 属性。每个 `item.link` 的返回缓存将是`{ title, link, pubDate, author, category, description }`。下一次请求相同路由时，将直接返回处理过后的缓存而不是向服务器发出请求并重新计算数据。

::: warning 注意
在 `tryGet()` 函数之外声明的变量的任何赋值都不会在缓存命中的情况下被处理。例如，以下代码将无法按预期工作：

```js
    let variable = 'value';
    await ctx.cache.tryGet('cache:key', async () => {
        variable = 'new value';
        const newVariable = 'new variable';
        return newVariable;
    })
    console.log(variable); // 缓存未命中: 'new value', 缓存命中: 'value'
       
```

:::

## API

### ctx.cache.tryGet(key, getValueFunc \[, maxAge \[, refresh ]])

#### 参数

| 名称         | 类型                   | 描述                                                                                       |
| ------------ | ---------------------- | ------------------------------------------------------------------------------------------ |
| key          | `string`               | *（必填）* 用于存储和获取缓存的键。您可以使用 `:` 作为分隔符创建层次结构。                 |
| getValueFunc | `function` \| `string` | *（必填）* 当发生缓存未命中时返回要缓存的数据的函数。                                      |
| maxAge       | `number`               | *（可选）* 缓存的最大过期时间（以秒为单位）。如果没有指定，将使用 `CACHE_CONTENT_EXPIRE`。 |
| refresh      | `boolean`              | *（可选）* 是否在缓存命中时更新缓存过期时间。默认为 `true`。                               |

#### 定义在

[lib/middleware/cache/index.js](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/cache/index.js#L58)

::: tip 提示
以下是使用缓存的高级方法。大多数情况下，您应使用 `ctx.cache.tryGet()`。

请注意，当使用 `ctx.cache.get()` 获取缓存时，您需要使用 `JSON.parse()`。
:::

### ctx.cache.get(key \[, refresh ])

#### 参数

| 名称    | 类型      | 描述                                                                 |
| ------- | --------- | -------------------------------------------------------------------- |
| key     | `string`  | *（必填）* 用于检索缓存的键。您可以使用 `:` 作为分隔符创建层次结构。 |
| refresh | `boolean` | *（可选）* 是否在缓存命中时更新缓存过期时间。默认为`true`。          |

### ctx.cache.set(key, value \[, maxAge ])

#### 参数

| 名称   | 类型                  | 描述                                                                                      |
| ------ | --------------------- | ----------------------------------------------------------------------------------------- |
| key    | `string`              | *（必填）* 用于存储缓存的键。您可以使用`:`作为分隔符创建层次结构。                        |
| value  | `function`\| `string` | *（必填）* 要缓存的值。                                                                   |
| maxAge | `number`              | *（可选）* 缓存的最大过期时间 (以秒为单位)。如果没有指定，将使用 `CACHE_CONTENT_EXPIRE`。 |
