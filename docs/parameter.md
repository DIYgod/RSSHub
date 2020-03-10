# 通用参数

::: tip 提示

所有通用参数可以使用 `&` 连接组合使用, 效果叠加

:::

## 内容过滤

可以使用以下 URL query 过滤内容, 支持正则

filter 选出想要的内容

-   filter: 过滤标题和描述

-   filter_title: 过滤标题

-   filter_description: 过滤描述

-   filter_author: 过滤作者

-   filter_time: 过滤时间，仅支持数字，单位为秒。返回指定时间范围内的内容。如果条目没有输出`pubDate`或者格式不正确将不会被过滤

举例 1: <https://rsshub.app/bilibili/user/coin/2267573?filter=微小微|赤九玖|暴走大事件>
举例 2: <https://rsshub.app/nga/forum/485?filter_time=600>

filterout 去掉不要的内容

-   filterout: 过滤标题和描述

-   filterout_title: 过滤标题

-   filterout_description: 过滤描述

-   filterout_author: 过滤作者

举例: <https://rsshub.app/bilibili/user/coin/2267573?filterout=微小微|赤九玖|暴走大事件>

filter_case_sensitive 过滤是否区分大小写，filter 和 filterout 同时适用

默认为 true，区分大小写

举例 1: <https://rsshub.app/bilibili/user/coin/2267573?filter=diyGOD|RSShub&filter_case_sensitive=false>

## 条数限制

可以使用 limit 参数限制最大条数, 主要用于排行榜类 RSS

举例: bilibili 排行榜前 10 <https://rsshub.app/bilibili/ranking/0/3?limit=10>

## 全文输出

可以使用 mode 参数来开启自动提取全文内容功能

举例: bilibili 专栏全文输出 <https://rsshub.app/bilibili/user/article/334958638?mode=fulltext>

## 输出 Telegram 即时预览链接

可以输出 Telegram 可识别的即时预览链接, 主要用于文章类 RSS

Telegram 即时预览模式需要在官网制作页面处理模板，请前往[官网](https://instantview.telegram.org/)了解更多

-   tgiv: 模板 hash，可从模板制作页面分享出来的链接末尾获取（`&rhash=`后面跟着的字符串）

举例: <https://rsshub.app/novel/biquge/94_94525?tgiv=bd3c42818a7f7e>

## 输出 Sci-hub 链接

可以输出 Sci-hub 链接，用于知名期刊或输出 DOI 的科学期刊类 RSS。

-   scihub: 任意值开启

举例: <https://rsshub.app/pnas/latest?scihub=1>

## 输出格式

RSSHub 同时支持 RSS 2.0 和 Atom 输出格式, 在路由末尾添加 `.rss` 或 `.atom` 即可请求对应输出格式, 缺省为 RSS 2.0

举例:

-   缺省 RSS 2.0 - <https://rsshub.app/jianshu/home>
-   RSS 2.0 - <https://rsshub.app/jianshu/home.rss>
-   Atom - <https://rsshub.app/jianshu/home.atom>
-   和 filter 或其他 URL query 一起使用 <https://rsshub.app/bilibili/user/coin/2267573.atom?filter=微小微|赤九玖|暴走大事件>
