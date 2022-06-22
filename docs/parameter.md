# 通用参数

::: tip 提示

通用参数实际上是 URI 中的 query，可以使用 `&` 连接组合使用，效果叠加。

通用参数需要置于路由路径的最后。有些路由在路由路径（route path）的最后引入了<span color=green>**自定义参数**</span>，<span color=violet>**通用参数**</span>也需要置于它们之后。

举例:

<a href="https://rsshub.app/twitter/user/durov/readable=1&includeRts=0?brief=100&limit=5"><https://rsshub.app/twitter/user/durov/><span color=green><b>readable=1\&includeRts=0</b></span>?<span color=violet><b>brief=100\&limit=5</b></span></a>

如果设置了<span color=magenta>**输出格式**</span>（`.atom`, `.rss`, `.debug.json`），则需要置于路由路径（含<span color=green>**自定义参数**</span>）与<span color=violet>**其它通用参数**</span>之间。

举例:

<a href="https://rsshub.app/twitter/user/durov/readable=1&includeRts=0.atom?brief=100&limit=5"><https://rsshub.app/twitter/user/durov/><span color=green><b>readable=1\&includeRts=0</b></span><span color=magenta><b>.atom</b></span>?<span color=violet><b>brief=100\&limit=5</b></span></a>

:::

## 内容过滤

::: warning 注意

请务必显式进行[彻底的 URL 编码](https://gchq.github.io/CyberChef/#recipe=URL_Encode\(true\))。切勿依赖浏览器的自动 URL 编码，某些字符，如 `+`, `&`，将不会被自动编码，进而导致最终解析结果不正确。

:::

可以使用以下 URL query 过滤内容，支持通过正则表达式过滤

`filter` 选出想要的内容

-   `filter`: 过滤标题和描述

-   `filter_title`: 过滤标题

-   `filter_description`: 过滤描述

-   `filter_author`: 过滤作者

-   `filter_time`: 过滤时间，仅支持数字，单位为秒。返回指定时间范围内的内容。如果条目没有输出`pubDate`或者格式不正确将不会被过滤

举例 1: `https://rsshub.app/bilibili/fav/2267573/801952073?filter=编曲|摄影`
举例 2: <https://rsshub.app/nga/forum/489?filter_time=600>

`filterout` 去掉不要的内容

-   `filterout`: 过滤标题和描述

-   `filterout_title`: 过滤标题

-   `filterout_description`: 过滤描述

-   `filterout_author`: 过滤作者

举例: `https://rsshub.app/bilibili/fav/2267573/801952073?filterout=编曲|摄影`

`filter_case_sensitive` 过滤是否区分大小写，`filter` 和 `filterout`同时适用

默认为 `true`，区分大小写

举例 1: <https://rsshub.app/bilibili/user/coin/2267573?filter=diyGOD|RSShub&filter_case_sensitive=false>

## 条数限制

可以使用 `limit` 参数限制最大条数，主要用于排行榜类 RSS

举例: bilibili 排行榜前 10 <https://rsshub.app/bilibili/ranking/0/3?limit=10>

## 全文输出

可以使用 `mode` 参数来开启自动提取全文内容功能

举例: bilibili 专栏全文输出 <https://rsshub.app/bilibili/user/article/334958638?mode=fulltext>

## 访问控制

可以使用 `code` 或 `key` 进行访问控制。参考[访问控制配置](install/#pei-zhi-fang-wen-kong-zhi-pei-zhi-fang-wen-mi-yue-ma)。

## 输出 Telegram 即时预览链接

可以输出 Telegram 可识别的即时预览链接，主要用于文章类 RSS

Telegram 即时预览模式需要在官网制作页面处理模板，请前往[官网](https://instantview.telegram.org/)了解更多

-   `tgiv`: 模板 hash，可从模板制作页面分享出来的链接末尾获取（`&rhash=`后面跟着的字符串）

举例: <https://rsshub.app/novel/biquge/94_94525?tgiv=bd3c42818a7f7e>

## 输出 Sci-hub 链接

可以输出 Sci-hub 链接，用于知名期刊或输出 DOI 的科学期刊类 RSS。

-   `scihub`: 任意值开启

举例: <https://rsshub.app/pnas/latest?scihub=1>

## 中文简繁体转换

-   `opencc`: `s2t` 简体转繁体、`t2s` 繁体转简体，其它可选值见 [simple-wasm - Configurations](https://github.com/fengkx/simplecc-wasm#%E9%85%8D%E7%BD%AE-configurations)

举例: <https://rsshub.app/dcard/posts/popular?opencc=t2s>

## 多媒体处理

::: warning 注意

这是个测试中的 API

下方操作允许任意用户注入链接模版到最终输出结果，针对于 Web 环境来说这是有害的（XSS）。但是 RSS 阅读器内通常是有限制的环境，通常不会带来副作用，但同时一般路由通常不会需要这些功能。如果需要开启，请将  `ALLOW_USER_HOTLINK_TEMPLATE` 环境变量设置为 `true`

:::

-   `image_hotlink_template`: 用于处理描述中图片的 URL，绕过防盗链等限制，留空不生效。用法参考 [#2769](https://github.com/DIYgod/RSSHub/issues/2769)。可以使用 [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL#Properties) 的所有属性（加上后缀 `_ue` 则会对其进行 URL 编码），格式为 JS 变量模板。例子：`${protocol}//${host}${pathname}`, `https://i3.wp.com/${host}${pathname}`, `https://images.weserv.nl?url=${href_ue}`
-   `multimedia_hotlink_template`: 用法同 `image_hotlink_template`，但应用于音频和视频。注意：该服务必须跟随跳转、允许反代音频和视频，且必须在反代时丢弃 `Referer` 请求头。[这里有一个符合要求的易于自行搭建的项目](https://github.com/Rongronggg9/rsstt-img-relay/blob/main/README_zh-CN.md)，该项目接受直接拼接 URL，即 `https://example.com/${href}`，其中 `example.com` 应替换为自行搭建的服务的域名
-   `wrap_multimedia_in_iframe`: 将音频和视频包裹在 `<iframe>` 中，以阻止阅读器发送 `Referer` 请求头。支持该变通解决方案的阅读器较少，且可能造成显示错误。有些阅读器，如 RSS Guard、Akregator，可能不支持前一种方法，则可尝试此方法。设置为`1`生效

[FAQ](/faq.html) 中有更多信息。

## 输出格式

RSSHub 同时支持 RSS 2.0 和 Atom 输出格式，在路由末尾添加 `.rss` 或 `.atom` 即可请求对应输出格式，缺省为 RSS 2.0

举例:

-   缺省 RSS 2.0 - <https://rsshub.app/jianshu/home>
-   RSS 2.0 - <https://rsshub.app/jianshu/home.rss>
-   Atom - <https://rsshub.app/jianshu/home.atom>
-   和 filter 或其他 URL query 一起使用 - `https://rsshub.app/bilibili/user/coin/2267573.atom?filter=微小微|赤九玖|暴走大事件`

### debug

在路由末尾添加 `.debug.json`且实例运行在`debugInfo=true`的情况下，RSShub 将会返回插件设置在`ctx.state.json`的内容

这功能皆在方便开发者调试问题，方便用户自行开发需要的功能。插件作者可以酌情考虑使用，没有格式要求。

举例：

-   `/furstar/characters/cn.debug.json`

## 输出简讯

可以使用 `brief` 参数输出特定字数 ( ≥ `100` 字 ) 的纯文本内容

举例：

-   输出 100 字简讯: `?brief=100`
