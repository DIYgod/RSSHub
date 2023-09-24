# Parameters

:::tip

Parameters here are actually URI query and can be linked together with `&` to generate a complex feed.

Parameters here need to be placed after the route path. Some routes may have <b><span style={{color: "green"}}>custom route parameters</span></b> and <b><span style={{color: "violet"}}>parameters here</span></b> need to be placed after them.

E.g.

<Link to="https://rsshub.app/twitter/user/durov/readable=1&includeRts=0?brief=100&limit=5">https://rsshub.app/twitter/user/durov/<span style={{color: "green"}}><b>readable=1&includeRts=0</b></span>?<span style={{color: "violet"}}><b>brief=100&limit=5</b></span></Link>

If a <b><span style={{color: "magenta"}}>output format</span></b> (`.atom`, `.rss`, `.json`, `.debug.json`) is set, it needs to be placed between the route path (including <b><span style={{color: "green"}}>custom route parameters</span></b>) and <b><span style={{color: "violet"}}>other parameters</span></b>.

E.g.

<Link to="https://rsshub.app/twitter/user/durov/readable=1&includeRts=0.atom?brief=100&limit=5">https://rsshub.app/twitter/user/durov/<span style={{color: "green"}}><b>readable=1&includeRts=0</b></span><span style={{color: "magenta"}}><b>.atom</b></span>?<span style={{color: "violet"}}><b>brief=100&limit=5</b></span></Link>

:::

## Filtering

:::caution

Please make sure you've [fully URL-encoded](https://gchq.github.io/CyberChef/#recipe=URL_Encode(true)) the parameters. Do not rely on the browser's automatic URL encoding. Some characters, such as `+`, `&`, will not be automatically encoded, resulting in the final parsing result not being correct.

:::

:::caution

filter supports Regex, and due to the fact that some Regex are vulnerable to DoS (ReDoS), default engine `re2` blocks some of these functionalities available in node `Regexp`. These two engines also behaves a bit different in some corner cases. [Details](https://github.com/uhop/node-re2#limitations-things-re2-does-not-support)

If you need to use a different engine, please refer to [Deploy->Features->FILTER_REGEX_ENGINE](/install/#configuration-features).

:::

The following URL query parameters are supported, Regex support is built-in.

Set `filter` to include the content

-   `filter`: filter `title` and description

-   `filter_title`: filter `title` only

-   `filter_description`: filter `description` only

-   `filter_author`: filter `author` only

-   `filter_category`: filter `category` only

-   `filter_time`: filter `pubDate`, in seconds, return specified time range. Item without `pubDate` will not be filtered.

E.g. [https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black)

Set `filterout` to exclude unwanted content.

-   `filterout`: filter `title` and description

-   `filterout_title`: filter `title` only

-   `filterout_description`: filter `description` only

-   `filterout_author`: filter `author` only

-   `filterout_category`: filter `category` only

E.g. [https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black)

Set `filter_case_sensitive` to determine whether the filtering keywords should be case sensitive. The parameter would apply to both `filter` and `filterout`.

Default: `true`

E.g. [https://rsshub.app/dribbble/popular?filter=BluE|yeLLow|BlaCK&filter_case_sensitive=false](https://rsshub.app/dribbble/popular?filter=BluE|yeLLow|BlaCK&filter_case_sensitive=false)

## Limit Entries

Set `limit` to limit the number of articles in the feed.

E.g. Dribbble Popular Top 10 [https://rsshub.app/dribbble/popular?limit=10](https://rsshub.app/dribbble/popular?limit=10)

## Sorted

Set `sorted` to control whether to sort the output by the publish date (`pubDate`). This is useful for some feeds that pin some entries at the top. Default to `true` i.e. the output is sorted.

E.g. NJU Undergraduate Bulletin Board <https://rsshub.app/nju/jw/ggtz?sorted=false>

## Fulltext

Enable fulltext via `mode` parameter.

E.g. Bilibili article <https://rsshub.app/bilibili/user/article/334958638?mode=fulltext>

## Access Control

Set `key` or `code` to grant access to requests. See [Access Control Configuration](install/#configuration-access-control-configuration-access-key-code).

## Telegram Instant View

Replace website link with Telegram's Instant View link.

Enable Telegram Instant View requires a page template, it can be obtained from Telegram's [Instant View page](https://instantview.telegram.org/)

-   `tgiv`: template hash, obtained from the link of template page generated（the string after `&rhash=`）

E.g. <https://rsshub.app/novel/biquge/94_94525?tgiv=bd3c42818a7f7e>

## Sci-hub link

Output Sci-hub link in scientific journal routes, this supports major journals or routes that output DOIs.

-   `scihub`: set to any value

E.g. <https://rsshub.app/pnas/latest?scihub=1>

## Conversion between Traditional and Simplified Chinese

-   `opencc`: `s2t` (Simplified Chinese to Traditional Chinese)、`t2s` (Traditional Chinese to Simplified Chinese), other optional values refer to [simplecc-wasm - Configurations](https://github.com/fengkx/simplecc-wasm#%E9%85%8D%E7%BD%AE-configurations)

E.g. <https://rsshub.app/dcard/posts/popular?opencc=t2s>

## Multimedia processing

:::caution

This is an experimental API

`image_hotlink_template` and `multimedia_hotlink_template` allow users to supply templates to replace media URLs. Certain routes plus certain RSS readers may result in users needing these features, but it's not very common. Vulnerable characters will be escaped automatically, making XSS attack impossible. The scope of URL replacement is limited to media elements, making any script URL unable to load and unable to cause XSS. As a result, users can only take the control of "where are the media from". These features are commonly side-effect-free. To enable these two parameters, please set  `ALLOW_USER_HOTLINK_TEMPLATE` to `true`

:::

-   `image_hotlink_template`: replace image URL in the description to avoid anti-hotlink protection, leave it blank to disable this function. Usage reference [#2769](https://github.com/DIYgod/RSSHub/issues/2769). You may use any property listed in [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL#Properties) (suffixing with `_ue` results in URL encoding), format of JS template literal. e.g. `${protocol}//${host}${pathname}`, `https://i3.wp.com/${host}${pathname}`, `https://images.weserv.nl?url=${href_ue}`
-   `multimedia_hotlink_template`: the same as `image_hotlink_template` but apply to audio and video. Note: the service must follow redirects, allow reverse-proxy for audio and video, and must drop the `Referer` header when reverse-proxying. [Here is an easy-to-deploy project that fits these requirements](https://github.com/Rongronggg9/rsstt-img-relay). The project accepts simple URL concatenation, e.g. `https://example.com/${href}`, in which `example.com` should be replaced with the domain name of the service you've deployed
-   `wrap_multimedia_in_iframe`: wrap audio and video in `<iframe>` to prevent the reader from sending `Referer` header. This workaround is only compatible with a few readers, such as RSS Guard and Akregator, which may not support the previous method. You can try this method in such a case

There are more details in the [FAQ](/faq).

## Output Formats

RSSHub conforms to RSS 2.0, Atom and JSON Feed Standard, simply append `.rss`, `.atom` or `.json` to the end of the feed address to obtain the feed in corresponding format. The default output format is RSS 2.0.

E.g.

-   Default (RSS 2.0) - [https://rsshub.app/dribbble/popular](https://rsshub.app/dribbble/popular)
-   RSS 2.0 - [https://rsshub.app/dribbble/popular.rss](https://rsshub.app/dribbble/popular.rss)
-   Atom - [https://rsshub.app/dribbble/popular.atom](https://rsshub.app/dribbble/popular.atom)
-   JSON Feed - [https://rsshub.app/twitter/user/DIYgod.json](https://rsshub.app/twitter/user/DIYgod.json)
-   Apply filters or URL query - [https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black)

### debug.json

If the RSSHub instance is running with `debugInfo=true` enabled, suffixing a route with `.debug.json` will result in the value of `ctx.state.json` being returned.

This feature aims to facilitate debugging or developing customized features. A route developer has the freedom to determine whether to adopt it or not, without any format requirement.

For example：

-   `/furstar/characters/cn.debug.json`

### debug.html

By adding `.{index}.debug.html` (where `{index}` is a number starting from 0) at the end of the route and running the instance with `debugInfo=true`, RSSHub will return the content set in the plugin's `ctx.state.data.item[index].description`. You can access this page with a browser to quickly view the extracted information.

Example:

-  `/furstar/characters/cn.0.debug.html`


## Brief introduction

Set the parameter `brief` to generate a brief pure-text introduction with a limited number of characters ( ≥ `100`).

For example：

-   Brief introduction with 100 characters: `?brief=100`
