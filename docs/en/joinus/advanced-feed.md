# RSS Feed Fundamentals

This guide is intended for advanced users who want to know how to create an RSS feed in detail.  If you're new to creating RSS feeds, we recommend reading [Create Your Own RSSHub Route](/en/joinus/new-rss/start-code.html) first.

Once you have collected the data you want to include in your RSS feed, you can pass it to `ctx.state.data`. RSSHub's middleware [`template.js`](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/template.js) will then process the data and render the RSS output in the required format (which is RSS 2.0 by default). In addition to the fields mentioned in [Create your own RSSHub route](/en/joinus/new-rss/start-code.html), you can customize your RSS feed further using the following fields.

It's important to note that not all fields are applicable to all output formats since RSSHub supports multiple output formats. The table below shows which fields are compatible with different output formats. We use the following symbols to denote compatibility: `A` for Atom, `J` for JSON Feed, `R` for RSS 2.0.

Channel level

The following table lists the fields you can use to customize your RSS feed at channel level:

| Field       | Description                                                                   | Default      | Compatibility |
| :---------- | :----------                                                                   | :----------- | :------------ |
| **`title`**       | *(Recommended)* The name of the feed, which should be plain text only   | `RSSHub`     | A, J, R |
| **`link`**        | *(Recommended)* The URL of the website associated with the feed, which should link to a human-readable website | `https://rsshub.app`  | A, J, R |
| **`description`** | *(Optional)* The summary of the feed, which should be plain text only   | If not specified, defaults to **`title`** | J, R |
| **`language`**    | *(Optional)* The primary language of the feed, which should be a value from [RSS Language Codes](https://www.rssboard.org/rss-language-codes) or ISO 639 language codes | `zh-cn`               | J, R |
| **`image`**       | *(Recommended)* The URL of the image that represents the channel, which should be relatively large and square | `undefinded` | J, R |
| **`icon`**        | *(Optional)* The icon of an Atom feed                                   | `undefinded` | J |
| **`logo`**        | *(Optional)* The logo of an RSS feed                                    | `undefinded` | J |
| **`subtitle`**    | *(Optional)* The subtitle of an Atom feed                               | `undefinded` | A |
| **`author`**      | *(Optional)* The author of an Atom feed or the authors of a JSON feed   | `RSSHub`     | A, J |
| **`itunes_author`** | *(Optional)* The author of a podcast feed                             | `undefinded` | R |
| **`itunes_category`** | *(Optional)* The category of a podcast feed                         | `undefinded` | R |
| **`itunes_explicit`** | *(Optional)* Use this to indicate that a feed contains [explicit](https://help.apple.com/itc/podcasts_connect/#/itcfafb6d665) content. | `undefinded` | R |
| **`allowEmpty`** | *(Optional)* Whether to allow empty feeds. If set to `true`, the feed will be generated even if there are no items | `undefinded` | A, J, R |

Each item in an RSS feed is represented by an object with a set of fields that describe it. The table below lists the available fields:

| Field       | Description                                                                   | Default        | Compatibility |
| :---------- | :----------                                                                   | :------------- | :------------ |
| **`title`**       | *(Required)* The title of the item, which should be plain text only              | `undefinded`   | A, J, R |
| **`link`**        | *(Recommended)* The URL of the item, which should link to a human-readable website | `undefinded` | A, J, R |
| **`description`** | *(Recommended)* The content of the item. For an Atom feed, it's the `atom:content` element. For a JSON feed, it's the `content_html` field | `undefinded` | A, J, R |
| **`author`**      | *(Optional)* The author of the item                                      | `undefinded`   | A, J, R |
| **`category`**    | *(Optional)* The category of the item. You can use a plain string or an array of strings | `undefinded` | A, J, R |
| **`guid`**        | *(Optional)* The unique identifier of the item                           | **`link || title`** | A, J, R |
| **`pubDate`**     | *(Recommended)* The publication date of the item, which should be a [Date object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) following [the standard](/en/joinus/pub-date.html) | `undefinded` | A, J, R |
| **`updated`**     | *(Optional)* The date of the last modification of the item, which should be a [Date object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) | `undefinded` | A, J |
| **`itunes_item_image`** | *(Optional)* The URL of an image associated with the item                           | `undefinded` | R |
| **`itunes_duration`** | *(Optional)* The length of an audio or video item in seconds (or in the format H:mm:ss), which should be a number or string | `undefinded` | J, R |
| **`enclosure_url`** | *(Optional)* The URL of an enclosure associated with the item                                  | `undefinded` | J, R |
| **`enclosure_length`** | *(Optional)* The size of the enclosure file in **byte**, which should be a number                                | `undefinded` | J, R |
| **`enclosure_type`** | *(Optional)* The MIME type of the enclosure file, which should be a string                           | `undefinded` | J, R |
| **`upvotes`** | *(Optional)*  The number of upvotes the item has received, which should be a number                               | `undefinded` | A |
| **`downvotes`** | *(Optional)* The number of downvotes the item has received, which should be a number                          | `undefinded` | A |
| **`comments`** | *(Optional)*  The number of comments for the item, which should be a number                             | `undefinded` | A |
| **`media.*`** | *(Optional)* The media associated with the item. See [Media RSS](https://www.rssboard.org/media-rss) for more details | `undefinded` | R |
| **`doi`** | *(Optional)* The Digital Object Identifier of the item, which should be a string in the format `10.xxxx/xxxxx.xxxx` | `undefinded` | R |

::: warning Formatting Considerations
When specifying certain fields in an RSS feed, it's important to keep in mind some formatting considerations. Specifically, you should avoid including any linebreaks, consecutive whitespace, or leading/trailing whitespace in the following fields: **`title`**, **`subtitle`** (only for Atom), **`author`** (only for Atom), **`item.title`**, and **`item.author`**.

While most RSS readers will automatically trim these fields, some may not process them properly. Therefore, to ensure compatibility with all RSS readers, we recommend trimming these fields before outputting them. If your route cannot tolerate trimming these fields, you should consider changing their format.

Additionally, while other fields will not be forced to be trimmed, we suggest avoiding violations of the above formatting rules as much as possible. If you are using Cheerio to extract content from web pages, be aware that Cheerio will retain line breaks and indentation. For the **`item.description`** field, in particular, any intended linebreaks should be converted to `<br>` tags to prevent them from being trimmed by the RSS reader. If you're extracting an RSS feed from JSON data, be aware that the JSON may contain linebreaks that need to be displayed, so you should convert them to `<br>` tags in this case.

It's important to keep these formatting considerations in mind to ensure your RSS feed is compatible with all RSS readers.
:::

## Create a BitTorrent/Magnet Feed

RSSHub allows you to create BitTorrent/Magnet feeds, which can be useful for triggering automated downloads. To create a BitTorrent/Magnet feed, you'll need to add **additional** fields to your RSS feed that are in accordance with many downloaders' subscription formats.

Here's an example of how to create a BitTorrent/Magnet feed:

```js
ctx.state.data = {
    item: [
        {
            enclosure_url: '', // This should be the Magnet URI
            enclosure_length: '', // The file size in bytes (this field is optional)
            enclosure_type: 'application/x-bittorrent', // This field should be fixed to 'application/x-bittorrent'
        },
    ],
};
```

By including these fields in your RSS feed, you'll be able to create BitTorrent/Magnet feeds that can be automatically downloaded by compatible downloaders.

### Update the documentation

If you're adding support for BitTorrent/Magnet feeds in your RSSHub route, it's important to update the documentation to reflect this change. To do this, you'll need to set the `supportBT` attribute of the `RouteEn` component to `"1"`. Here's an example:

```vue
<RouteEn author="..." example="..." path="..." supportBT="1" />
```

By setting the `supportBT` attribute to `"1"`, you'll be able to update your documentation to accurately reflect your route's support for BitTorrent/Magnet feeds.

## Create a Journal Feed

RSSHub supports creating journal feeds that can replace `item.link` with a Sci-hub link if users provide the [common parameter](/en/parameter.html#sci-hub-link) `scihub`. To create a journal feed, you'll need to include an **additional** field in your RSS feed:

```js
ctx.state.data = {
    item: [
        {
            doi: '', // This should be the DOI of the item (e.g., '10.47366/sabia.v5n1a3')
        },
    ],
};
```

By including this `doi` field in your RSS feed, you'll be able to create journal feeds that are compatible with RSSHub's Sci-hub functionality.

### Update the documentation

To update the documentation for your route with support for journal feeds, you'll need to set the `supportScihub` attribute of the RouteEn component to `"1"`. Here's an example:

```vue
<RouteEn author="..." example="..." path="..." supportScihub="1" />
```

By setting the `supportSciHub` attribute to `"1"`, the documentation for your route will accurately reflect its support for creating journal feeds with Sci-hub links.

## Create a Podcast Feed

RSSHub supports creating podcast feeds that can be used with many podcast players' subscription formats. To create a podcast feed, you'll need to include several **additional** fields in your RSS feed:

```js
ctx.state.data = {
    itunes_author: '', // This field is **required** and should specify the podcast author's name
    itunes_category: '', // This field specifies the channel category
    image: '', // This field specifies the channel's cover image or album art
    item: [
        {
            itunes_item_image: '', // This field specifies the item's cover image
            itunes_duration: '', // This field is optional and specifies the length of the audio in seconds or the format H:mm:ss
            enclosure_url: '', // This should be the item's direct audio link
            enclosure_length: '', // This field is optional and specifies the size of the file in **bytes**
            enclosure_type: '', // This field specifies the MIME type of the audio file (common types are 'audio/mpeg' for .mp3, 'audio/x-m4a' for .m4a, and 'video/mp4' for .mp4)
        },
    ],
};
```

By including these fields in your RSS feed, you'll be able to create podcast feeds that are compatible with many podcast players.

::: tip Further Reading

-   [A Podcaster’s Guide to RSS](https://help.apple.com/itc/podcasts_connect/#/itcb54353390)
-   [RSS feed guidelines for Google Podcasts](https://support.google.com/podcast-publishers/answer/9889544)

:::

### Update the documentation

To update the documentation for your route with support for podcast feeds, you'll need to set the `supportPodcast` attribute of the `RouteEn` component to `"1"`. Here's an example:

```vue
<RouteEn author="..." example="..." path="..." supportPodcast="1" />
```

By setting the `supportPodcast` attribute to `"1"`, the documentation for your route will accurately reflect its support for creating podcast feeds.

## Create a Media Feed

RSSHub supports creating [Media RSS](https://www.rssboard.org/media-rss) feeds that are compatible with many [Media RSS](https://www.rssboard.org/media-rss) software subscription formats. To create a [Media RSS](https://www.rssboard.org/media-rss) feed, you'll need to include those **additional** fields in your RSS feed.

Here's an example of how to create a [Media RSS](https://www.rssboard.org/media-rss) feed:

```js
ctx.state.data = {
    item: [
        {
            media: {
                content: {
                    url: '...', // This should be the URL of the media content
                    type: '...', // This should be the MIME type of the media content (e.g., 'audio/mpeg' for an .mp3 file)
                },
                thumbnail: {
                    url: '...', // This should be the URL of the thumbnail image
                },
                '...': {
                    '...': '...', // Additional media properties can be included here
                }
            },
        },
    ],
};
```

By including these fields in your RSS feed, you'll be able to create [Media RSS](https://www.rssboard.org/media-rss) feeds that are compatible with many [Media RSS](https://www.rssboard.org/media-rss) software subscription formats.

## Create an Atom Feed with Interactions

RSSHub supports creating Atom feeds that include interactions like upvotes, downvotes, and comments. To create an Atom feed with interactions, you'll need to include **additional** fields in your RSS feed that specify the interaction counts for each item.

Here's an example of how to create an Atom feed with interactions:

```js
ctx.state.data = {
    item: [
        {
            upvotes: 0, // This should be the number of upvotes for this item
            downvotes: 0, // This should be the number of downvotes for this item
            comments: 0, // This should be the number of comments for this item
        },
    ],
};
```

By including these fields in your Atom feed, you'll be able to create Atom feeds with interactions that are compatible with many Atom feed readers.
