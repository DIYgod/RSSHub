# RSS 基础

本指南面向希望深入了解如何制作 RSS 订阅源的高级用户。如果您是第一次制作 RSS 订阅源，我们建议先阅读 [制作自己的 RSSHub 路由](/joinus/new-rss/start-code.html)。

一旦您获取了要包含在您的 RSS 订阅源中的数据，就可以将其传递给 `ctx.state.data`。然后RSSHub的中间件 [`template.js`](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/template.js) 将处理数据并以所需的格式呈现 RSS 输出（默认为RSS 2.0）。除了 [制作自己的 RSSHub 路由](/joinus/new-rss/start-code.html) 中提到的字段外，您还可以使用以下字段进一步自定义 RSS 订阅源。

需要注意的是，并非所有字段都适用于所有的输出格式，因为 RSSHub 支持多种输出格式。下表显示了不同输出格式兼容的字段。我们使用以下符号表示兼容性：`A` 表示 Atom，`J` 表示 JSON Feed，`R` 表示 RSS 2.0。

频道级别

以下表格列出了你可以用来定制你的 RSS 订阅源频道级别的字段：

| 字段            | 描述                  | 默认值 | 兼容性 |
| :----------      | :----------         | :----------- | :------------ |
| **`title`**       | *（推荐）* 源的名称，应为纯文本   | `RSSHub`     | A, J, R |
| **`link`**        | *（推荐）* 与源关联的网站网址，应链接到一个可读的网站 | `https://rsshub.app`  | A, J, R |
| **`description`** | *（可选）* 源的摘要，应为纯文本   | 如果未指定，默认为 **`title`** | J, R |
| **`language`**    | *（可选）* 源的主要语言，应为 [RSS语言代码](https://www.rssboard.org/rss-language-codes) 或 ISO 639 语言代码之一 | `zh-cn`               | J, R |
| **`image`**       | *（推荐）* 表示频道的高清图片的网址 | `undefinded` | J, R |
| **`icon`**        | *（可选）* Atom 源的图标           | `undefinded` | J |
| **`logo`**        | *（可选）* RSS 源的标志           | `undefinded` | J |
| **`subtitle`**    | *（可选）* Atom 源的副标题         | `undefinded` | A |
| **`author`**      | *（可选）* Atom 源的作者或 JSON Feed 的作者 | `RSSHub`     | A, J |
| **`itunes_author`** | *（可选）* 播客源的作者       | `undefinded` | R |
| **`itunes_category`** | *（可选）* 播客源的分类   | `undefinded` | R |
| **`itunes_explicit`** | *（可选）* 播客源是否含有煽情露骨内容     | `undefinded` | R |
| **`allowEmpty`** | *（可选）* 是否允许空源。如果设置为 `true`，即使没有文章，也会生成源 | `undefinded` | A, J, R |

在 RSS 订阅源中，每个条目都由描述它的一组字段表示。下表列出了可用的字段：

| 字段            | 描述                       | 默认值   | 兼容性  |
| :----------      | :----------              | :------ | :------ |
| **`title`**       | *（必填）* 条目的标题，应仅使用纯文本         | `undefinded` | A, J, R |
| **`link`**        | *（推荐）* 条目的链接，应链接到可读的网站 | `undefinded` | A, J, R |
| **`description`** | *（推荐）* 条目的内容。对于 Atom 订阅，应是 `atom:content` 元素。对于 JSON Feed，应是 `content_html` 字段 | `undefinded` | A, J, R |
| **`author`**      | *（可选）* 条目的作者                         | `undefinded` | A, J, R |
| **`category`**    | *（可选）* 条目的分类。字符串或字符串数组皆可 | `undefinded` | A, J, R |
| **`guid`**        | *（可选）* 条目的唯一标识符 | **`link || title`**  | A, J, R |
| **`pubDate`**     | *（推荐）* 条目的发布日期，应该 [遵从规范](/joinus/pub-date.html) 是 [Date object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) | `undefinded` | A, J, R |
| **`updated`**     | *（可选）* 条目的最后修改日期，应该是 [Date object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) | `undefinded` | A, J |
| **`itunes_item_image`** | *（可选）* 条目相关联的图片的网址 | `undefinded` | R |
| **`itunes_duration`** | *（可选）* 音频或视频条目的长度，以秒为单位（或格式为 H:mm:ss），应为数字或字符串 | `undefinded` | J, R |
| **`enclosure_url`** | *（可选）* 条目相关联的附件的网址 | `undefinded` | J, R |
| **`enclosure_length`** | *（可选）* 附件文件的大小（以 **byte** 为单位），应为数字 | `undefinded` | J, R |
| **`enclosure_type`** | *（可选）* 附件文件的 MIME 类型，应为字符串 | `undefinded` | J, R |
| **`upvotes`** | *（可选）* 条目的赞数，应为数字 | `undefinded` | A |
| **`downvotes`** | *（可选）* 条目的踩数，应为数字 | `undefinded` | A |
| **`comments`** | *（可选）* 条目的评论数，应为数字 | `undefinded` | A |
| **`media.*`** | *（可选）* 条目相关的媒体。更多详情请参见 [媒体 RSS](https://www.rssboard.org/media-rss) | `undefinded` | R |
| **`doi`** | *（可选）* 条目的数字对象标识符 (DOI)，应为格式为 `10.xxx/xxxxx.xxxx` 的字符串 | `undefinded` | R |

::: warning 格式考虑
在指定 RSS 订阅源中的某些字段时，重要的是要注意一些格式考虑因素。具体来说，您应避免在以下字段中包含任何换行符、连续的空格或前导／尾随空格：**`title`**，**`subtitle`**（仅适用于 Atom），**`author`**（仅适用于 Atom），**`item.title`** 和 **`item.author`**。

虽然大多数 RSS 阅读器将自动修剪这些空字符，但有些阅读器可能无法正确处理它们。因此，为确保与所有 RSS 阅读器兼容，我们建议在输出这些字段之前将其修剪。如果您制作的路由无法容忍修剪这些空字符，您应考虑更改它们的格式。

另外，虽然其他字段不会被强制修剪，但我们建议尽可能避免违反上述格式规则。如果您正在使用 Cheerio 从网页中提取内容，时刻谨记 Cheerio 会保留换行和缩进。特别是对于 **`item.description`** 字段，任何预期之内的换行都应转换为 `<br>` 标签，以防止其被 RSS 阅读器修剪。尤其是您从 JSON 数据中制作 RSS 订阅时，目标网站返回的 JSON 很有可能含有需要显示的换行符，在这种情况下，应将它们转换为 `<br>` 标签。

请牢记这些格式考虑因素，以确保您的 RSS 订阅源与所有 RSS 阅读器兼容。
:::

## 制作 BitTorrent／磁力订阅源

RSSHub 支持制作 BitTorrent／磁力订阅源，这将帮助你的 RSS 订阅源。要制作 BitTorrent／磁力订阅源，您需要在 RSS 源添加附加字段，以符合 BitTorrent 客户端的订阅格式。

以下是制作 BitTorrent／磁力订阅源的示例：

```js
ctx.state.data = {
    item: [
        {
            enclosure_url: '', // 磁力链接
            enclosure_length: '', // 文件大小（以 bytes 为单位）（可选）
            enclosure_type: 'application/x-bittorrent', // 应固定为 'application/x-bittorrent'
        },
    ],
};
```

在 RSS 源中包含这些字段，您将能够制作被 BitTorrent 客户端识别并自动下载的 BitTorrent／磁力订阅源。

### 更新文档

如果您要在 RSSHub 路由中添加对 BitTorrent／磁力订阅支持，最重要的是在文档以反映此功能。要做到这一点，您需要将 `Route` 组件的 `supportBT` 属性设置为 `"1"`。 以下是一个示例：

```vue
<Route author="..." example="..." path="..." supportBT="1" />
```

通过将 `supportBT` 属性设置为 `"1"`，您将能够准确反映您的路由支持 BitTorrent／磁力订阅。

## 制作期刊订阅源

RSSHub支持制作期刊订阅源。如果用户提供 [通用参数](/parameter.html#shu-chu-sci-hub-lian-jie) `scihub`，则可以将 `item.link` 替换为 Sci-hub 链接。要制作期刊订阅源，您需要在您的 RSS 源中包含一个附加字段：

```js
ctx.state.data = {
    item: [
        {
            doi: '', // 条目的 DOI（例如，'10.47366/sabia.v5n1a3'）
        },
    ],
};
```

通过在 RSS 源中包含 `doi` 字段，您将能够制作与 RSSHub 的 Sci-hub 功能兼容的期刊订阅源。

### 更新文档

要显示您制作的期刊订阅源支持 Sui-hub 功能，您需要将 `Route` 组件的 `supportScihub` 属性设置为 `"1"`。以下是一个示例：

```vue
<Route author="..." example="..." path="..." supportScihub="1" />
```

通过将 `supportSciHub` 属性设置为 `"1"`，路由文档将准确反映其支持提供具有 Sci-hub 链接的期刊订阅源。

## 制作播客订阅源

RSSHub 支持制作与播客播放器订阅格式兼容的播客订阅源。要制作播客订阅源，您需要在RSS源中包含几个附加字段：

```js
ctx.state.data = {
    itunes_author: '', // **必需**，应为主播名称
    itunes_category: '', // 播客分类
    image: '', // 专辑封面，作为播客源时**必填**
    item: [
        {
            itunes_item_image: '', // 条目的封面图像
            itunes_duration: '', // 可选，音频的长度，以秒为单位 或 H:mm:ss 格式
            enclosure_url: '', // 音频直链
            enclosure_length: '', // 可选，文件大小，以 Byte 为单位
            enclosure_type: '', // 音频文件 MIME 类型（常见类型 .mp3 是 'audio/mpeg'，.m4a 是 'audio/x-m4a'，.mp4 是 'video/mp4'）
        },
    ],
};
```

通过在 RSS 源中包含这些字段，您将能够制作与播客播放器兼容的播客订阅源。

::: tip 进一步阅读

-   [A Podcaster’s Guide to RSS](https://help.apple.com/itc/podcasts_connect/#/itcb54353390)
-   [Google 播客的 RSS Feed 指南](https://support.google.com/podcast-publishers/answer/9889544)

:::

### 更新文档

要显示您制作的订阅源与播客播放器兼容，您需要将 `Route` 组件的 `supportPodcast` 属性设置为 `"1"`。以下是一个示例：

```vue
<Route author="..." example="..." path="..." supportPodcast="1" />
```

通过将 `supportPodcast` 属性设置为 `"1"`，路由文档将准确反映其支持播客订阅。

## 制作媒体订阅源

RSSHub支持制作与 [Media RSS](https://www.rssboard.org/media-rss) 格式兼容的媒体订阅源。要制作体订阅源订阅源，您需要在 RSS 源中包含这些附加字段。

以下是制作媒体订阅源的示例：

```js
ctx.state.data = {
    item: [
        {
            media: {
                content: {
                    url: '...', // 媒体内容的 URL
                    type: '...', // 媒体内容的 MIME 类型（例如，对于 .mp3 文件是 'audio/mpeg'）
                },
                thumbnail: {
                    url: '...', // 缩略图 URL
                },
                '...': {
                    '...': '...', // 亦可包含其他媒体属性
                }
            },
        },
    ],
};
```

通过在 RSS 源中包含这些字段，您将能够制作与 [Media RSS](https://www.rssboard.org/media-rss) 格式兼容的媒体订阅源。

## 制作包含互动的 Atom 订阅源

RSSHub支持制作包含互动，如点赞、反对和评论的 Atom 订阅源。要制作带有互动的 Atom 订阅源，您需要在 RSS 源中包含附加字段，用于指定每个条目的互动计数。

以下是制作带有互动的 Atom 订阅源的示例：

```js
ctx.state.data = {
    item: [
        {
            upvotes: 0, // 条目的点赞数
            downvotes: 0, // 条目的踩数
            comments: 0, // 条目的评论数
        },
    ],
};
```

通过在 Atom 源中包含这些字段，您将能够制作包含互动的 Atom 订阅源，这些源与支持 Atom 订阅源的阅读器兼容。
