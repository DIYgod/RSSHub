---
pageClass: routes
---

# 阅读

## All Poetry

### Poems

<Route author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['排序方式, `best` 或 `newest`, 缺省 `best`']"/>

## hameln

### 章节更新

<Route author="huangliangshusheng" example="/hameln/chapter/264928" path="/hameln/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']">

举例网址：<https://syosetu.org/novel/264928/>

</Route>

## kakuyomu

### 章节更新

<Route author="huangliangshusheng" example="/kakuyomu/episode/1177354054883783581" path="/kakuyomu/episode/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']">

举例网址：<https://kakuyomu.jp/works/1177354054883783581>

</Route>

## Kindle Unlimited

### 会员限时免费读书单

<Route author="nczitzk" example="/amazon/ku/this" path="/amazon/ku/:type?" :paramsDesc="['书单类型，见下表']">

| 本月书单 | 好评返场 | 次月预告 |
| ---- | ---- | ---- |
| this | back | next |

</Route>

## Literotica

### New Stories

<Route author="nczitzk" example="/literotica/new" path="/literotica/new"/>

### Category

<Route author="nczitzk" example="/literotica/category/anal-sex-stories" path="/literotica/category/:category?" :paramsDesc="['分类，可在对应分类页地址栏中找到']"/>

## Mobilism

### 电子书

<Route author="nitezs" example="/mobilism/forums/books/romance" path="/mobilism/forums/books/:type/:fulltext?" :paramsDesc="['分类','是否获取全文，如需获取全文参数传入 `y`']">

| 分类名      | 参数         |
| -------- | ---------- |
| 浪漫       | romance    |
| 科幻、幻想、恐怖 | scifi      |
| 普通小说、经典  | classics   |
| 杂志、报纸    | magazines  |
| 有声读物     | audioBooks |
| 漫画       | comics     |

</Route>

## Penguin Random House

### Book Lists

<Route author="StevenRCE0" example="/penguin-random-house/the-read-down" path="/penguin-random-house/the-read-down" />

### Articles

<Route author="StevenRCE0" example="/penguin-random-house/articles" path="/penguin-random-house/articles" />

## SoBooks

### 首页

<Route author="nczitzk" example="/sobooks" path="/sobooks/:category?" :paramsDesc="['分类, 见下表']">

| 分类   | 分类名              |
| ---- | ---------------- |
| 小说文学 | xiaoshuowenxue   |
| 历史传记 | lishizhuanji     |
| 人文社科 | renwensheke      |
| 励志成功 | lizhichenggong   |
| 经济管理 | jingjiguanli     |
| 学习教育 | xuexijiaoyu      |
| 生活时尚 | shenghuoshishang |
| 英文原版 | yingwenyuanban   |

</Route>

### 标签

<Route author="nczitzk" example="/sobooks/tag/小说" path="/sobooks/tag/:id?" :paramsDesc="['标签, 见下表，默认为小说']">

热门标签

| 小说 | 文学 | 历史 | 日本 | 科普 | 管理 | 推理 | 社会 | 经济  |
| -- | -- | -- | -- | -- | -- | -- | -- | --- |
| 传记 | 美国 | 悬疑 | 哲学 | 心理 | 商业 | 金融 | 思维 | 经典  |
| 随笔 | 投资 | 文化 | 励志 | 科幻 | 成长 | 中国 | 英国 | 政治  |
| 漫画 | 纪实 | 艺术 | 科学 | 生活 | 职场 | 散文 | 法国 | 互联网 |
| 营销 | 奇幻 | 二战 | 股票 | 女性 | 德国 | 学习 | 战争 | 创业  |
| 绘本 | 名著 | 爱情 | 军事 | 理财 | 教育 | 世界 | 人物 | 沟通  |

</Route>

### 归档

<Route author="nczitzk" example="/sobooks/date/2020-11" path="/sobooks/date/:date?" :paramsDesc="['日期，见例子，默认为当前年月']"/>

## syosetu

### 章节更新

<Route author="huangliangshusheng" example="/syosetu/chapter/n1976ey" path="/syosetu/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']">

举例网址：<https://ncode.syosetu.com/n1976ey/>

</Route>

## UU 看书

### 小说更新

<Route author="jacky2001114" example="/novel/uukanshu/49621" path="/novel/uukanshu/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 爱思想

### 栏目

<Route author="HenryQW" example="/aisixiang/column/722" path="/aisixiang/column/:id" :paramsDesc="['栏目 ID, 可在对应栏目 URL 中找到']"/>

### 排行榜

<Route author="HenryQW" example="/aisixiang/ranking/1/7" path="/aisixiang/ranking/:type?/:range?" :paramsDesc="['排行榜类型', '排行榜范围, 仅适用于点击排行榜, 可选日(1)，周(7)，月(30)']">

| 文章点击排行 | 最近更新文章 | 文章推荐排行 |
| ------ | ------ | ------ |
| 1      | 10     | 11     |

</Route>

### 思想库（专栏）

<Route author="hoilc" example="/aisixiang/thinktank/WuQine/lunw" path="/aisixiang/thinktank/:name/:type?" :paramsDesc="['专栏 ID，一般为作者拼音，可在URL中找到', '栏目类型，参考下表，默认为`lunw`']">

| 论文   | 时评   | 随笔    | 演讲   | 访谈    | 著作     | 读书    | 史论     | 译作    | 诗歌    | 书信     | 科学    |
| ---- | ---- | ----- | ---- | ----- | ------ | ----- | ------ | ----- | ----- | ------ | ----- |
| lunw | ship | shuib | yanj | fangt | zhuanz | dushu | shilun | yizuo | shige | shuxin | kexue |

</Route>

## 爱下电子书

### 最新章节

<Route author="JeasonLau Maecenas" example="/axdzs/诡秘之主" path="/axdzs/:novel" :paramsDesc="['小说的中文名, 可在对应小说页 URL 中找到']"  />

## 笔趣阁

::: tip 看我

此处的 **笔趣阁** 指网络上使用和 **笔趣阁** 样式相似模板的小说阅读网站，包括但不限于下方列举的网址。

:::

| 网址                         | 名称    |
| -------------------------- | ----- |
| <https://www.xbiquwx.la>   | 笔尖中文  |
| <http://www.biqu5200.net>  | 笔趣阁   |
| <https://www.xbiquge.so>   | 笔趣阁   |
| <https://www.biqugeu.net>  | 顶点小说网 |
| <http://www.b520.cc>       | 笔趣阁   |
| <https://www.ahfgb.com>    | 笔趣鸽   |
| <https://www.ibiquge.la>   | 香书小说  |
| <https://www.biquge.tv>    | 笔趣阁   |
| <https://www.bswtan.com>   | 笔书网   |
| <https://www.biquge.co>    | 笔趣阁   |
| <https://www.bqzhh.com>    | 笔趣阁   |
| <http://www.biqugse.com>   | 笔趣阁   |
| <https://www.ibiquge.info> | 爱笔楼   |
| <https://www.ishuquge.com> | 书趣阁   |
| <https://www.mayiwxw.com>  | 蚂蚁文学  |

### 小说

<Route author="nczitzk" example="/biquge/http://www.biqu5200.net/0_7/" path="/biquge/:url" :paramsDesc="['小说 Url，即对应小说详情页的 Url，可在地址栏中找到']" anticrawler="1" radar="1" rssbud="1">

::: tip 看我

#### 使用方法

如订阅 [《大主宰》](http://www.biqu5200.net/0\_7/)，此时在 [biqu5200.net](http://www.biqu5200.net) 中查询得到对应小说详情页 URL 为 <http://www.biqu5200.net/0_7/>。此时，路由为 [`/biquge/http://www.biqu5200.net/0_7/`](https://rsshub.app/biquge/http://www.biqu5200.net/0\_7/)

又如同样订阅 [《大主宰》](https://www.shuquge.com/txt/70/index.html)，此时在 [shuquge.com](https://www.shuquge.com) 中查询得到对应小说详情页 URL 为 <https://www.shuquge.com/txt/70/index.html>。此时，把末尾的 `index.html` 去掉，路由为 [`/biquge/https://www.shuquge.com/txt/70/`](https://rsshub.app/biquge/https://www.shuquge.com/txt/70/)

#### 关于章节数

路由默认返回最新 **1** 个章节，如有需要一次性获取多个章节，可在路由后指定 `limit` 参数。如上面的例子：订阅 [《大主宰》](http://www.biqu5200.net/0\_7/) 并获取最新的 **10** 个章节。此时，路由为 [`/biquge/http://www.biqu5200.net/0_7/?limit=10`](https://rsshub.app/biquge/http://www.biqu5200.net/0\_7/?limit=10)

需要注意的是，单次获取的所有章节更新时间统一设定为最新章节的更新时间。也就是说，获取最新的 **10** 个章节时，除了最新 **1** 个章节的更新时间是准确的（和网站一致的），其他 **9** 个章节的更新时间是不准确的。

另外，若设置获取章节数目过多，可能会触发网站反爬，导致路由不可用。

:::

::: warning 提示

上方列举的网址可能部分不可用，这取决于该网站的维护者是否持续运营网站。请选择可以正常访问的网址，获取更新的前提是该网站可以正常访问。

:::

</Route>

## 博客来

### 新书出版

<Route author="CokeMine" example="/bookscomtw/newbooks/books_nbtopm_15" path="/bookscomtw/newbooks/:category" :paramsDesc="['书籍类型 category, 可在对应博客来新书页 URL 中找到']"/>

## 超星

### 期刊

<Route author="nczitzk" example="/chaoxing/qk/6b5c39b3dd84352be512e29df0297437" path="/chaoxing/qk/:id/:needContent?" :paramsDesc="['期刊 id，可在期刊页 URL 中找到', '需要获取文章全文，填写 true/yes 表示需要，默认需要']" anticrawler="1" radar="1" rssbud="1">

::: tip 看我

全部期刊可以在 [这里](http://qk.chaoxing.com/space/index) 找到，你也可以从 [学科分类](https://qikan.chaoxing.com/jourclassify) 和 [期刊导航](https://qikan.chaoxing.com/search/openmag) 中发现更多期刊。

如订阅 [**上海文艺**](http://m.chaoxing.com/mqk/list?sw=\&mags=6b5c39b3dd84352be512e29df0297437\&isort=20\&from=space)，其 URL 为 <http://m.chaoxing.com/mqk/list?mags=6b5c39b3dd84352be512e29df0297437>。`6b5c39b3dd84352be512e29df0297437` 即为期刊 id，所得路由为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437)

:::

::: warning 提示

你可以设置参数 **需要获取文章全文** 为 `true` `yes` `t` `y` 等值（或者忽略这个参数），RSS 的条目会携带期刊中的 **文章全文**，而不仅仅是 **文章概要**。但因为发起访问请求过多会被该网站屏蔽，你可以将其关闭（设置该参数为 `false` `no` `f` `n` 等值），这将会大大减少请求次数从而更难触发网站的反爬机制。

路由默认会获取 **30** 个条目。在路由后指定 `?limit=<条目数量>` 减少或增加单次获取条目数量，同样可以减少请求次数，如设置为一次获取 **10** 个条目，路由可以更改为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10)

在根据上文设置 **需要获取文章全文** 为不需要时，你可以将 `limit` 值增大，从而获取更多的条目，此时因为不获取全文也不会触发反爬机制，如 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100)

:::

</Route>

## 吹牛部落

### 栏目

<Route author="LogicJake" example="/chuiniu/column/0b1c4cf6e7f24e8da11e37882de73704" path="/chuiniu/column/:id" :paramsDesc="['栏目 id, 可在对应栏目页 URL 中找到']">

::: warning 注意

正文内容需要用户登录后的 x-member 值，详情见部署页面的配置模块。若无相关配置或 x-member 失效，则只显示文章摘要。
:::

</Route>

### 专栏列表

<Route author="LogicJake" example="/chuiniu/column_list" path="/chuiniu/column_list"/>

## 刺猬猫

### 章节

<Route author="Netrvin" example="/ciweimao/chapter/100045750" path="/ciweimao/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 单向空间

### 单读

<Route author="KeNorizon" example="/owspace/read/0" path="/owspace/read/:type?" :paramsDesc="['栏目分类，不填则默认为首页']">

| 首页 | 文字 | 影像 | 声音 | 单向历 | 谈论 |
| -- | -- | -- | -- | --- | -- |
| 0  | 1  | 2  | 3  | 4   | 6  |

</Route>

## 稻草人书屋

### 章节更新

<Route author="JeasonLau" example="/dcrsw/zhongjidouluo/2" path="/dcrsw/:name/:count?" :paramsDesc="['小说名，可在对应小说页URL中找到', '显示的章节数，缺省为`3`']">

::: warning 注意

count 的取值范围为 1-12，为防止请求次数过多，推荐设置为 5 以下。
:::

</Route>

## 第一版主

### 小说

<Route author="x1a0xv4n" example="/novel/d1bz/2/2608_6" path="/novel/d1bz/:category/:id" :paramsDesc="['小说分类，可在对应小说页 URL 中找到，例如`2`', '小说id，可在对应小说页 URL 中找到，例如`2608_6`']"/>

## 东立出版

### NEWS 资讯

<Route author="CokeMine" example="/tongli/news/6" path="/tongli/news/:type" :paramsDesc="['分类, 可以在“話題新聞”链接中找到']"/>

## 飞地

### 分类

<Route author="LogicJake" example="/enclavebooks/category/1" path="/enclavebooks/category/:id" :paramsDesc="['类别 id，可在[分类api](https://app.enclavebooks.cn/v2/discovery)返回数据中的category查看']"/>

### 用户创作

<Route author="junbaor" example="/enclavebooks/user/103702" path="/enclavebooks/user/:uid" :paramsDesc="['用户ID, 自行抓包寻找']"/>

### 用户收藏

<Route author="junbaor" example="/enclavebooks/collection/103702" path="/enclavebooks/collection/:uid" :paramsDesc="['用户ID, 自行抓包寻找']"/>

## 禁忌书屋

### 首页

<Route author="nczitzk" example="/cool18/bbs4" path="/cool18/bbs4"/>

### 精华区

<Route author="nczitzk" example="/cool18/bbs4/gold" path="/cool18/bbs4/gold"/>

### 栏目分类

<Route author="nczitzk" example="/cool18/bbs4/type/都市" path="/cool18/bbs4/type/:keyword?" :paramsDesc="['分类，见下表，默认为首页']">

| 都市 | 校园 | 乡野 | 古风 | 异国 | 玄幻 | 红杏 | 伦理 | 浪漫 | 暴虐 | 摄心 | 其他 |
| -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |

</Route>

### 搜索关键字

<Route author="nczitzk" example="/cool18/bbs4/keywords/都市" path="/cool18/bbs4/keywords/:keyword?" :paramsDesc="['关键字']"/>

## 孔夫子旧书网

### 用户动态

<Route author="nczitzk" example="/kongfz/people/5032170" path="/kongfz/people/:id" :paramsDesc="['用户 id, 可在对应用户页 URL 中找到']"/>

### 店铺上架

<Route author="nczitzk" example="/kongfz/shop/238901/1" path="/kongfz/shop/:id/:cat?" :paramsDesc="['店铺 id, 可在对应店铺页 URL 中找到', '分类 id，可在对应分类页 URL 中找到，默认为店铺最新上架']"/>

## 快眼看书

### 小说更新

<Route author="squkw" example="/novel/booksky/98619" path="/novel/booksky/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到, 例如 `98619`']">

举例网址：<http://booksky.so/BookDetail.aspx?Level=1&bid=98619>

</Route>

## 哩哔轻小说

### 小说更新

<Route author="misakicoca" path="/linovelib/novel/:id" example="/linovelib/novel/2547" :paramsDesc="['小说 id，对应书架开始阅读 URL 中找到']"/>

## 飘天文学

### 章节

<Route author="LJason77" example="/novel/ptwxz/10/10272" path="/novel/ptwxz/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `10`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `10272`']" >

举例网址：<https://www.ptwxz.com/bookinfo/10/10272.html>

</Route>

## 起点

### 章节

<Route author="Chingyat" example="/qidian/chapter/1010400217" path="/qidian/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 讨论区

<Route author="Chingyat" example="/qidian/forum/1010400217" path="/qidian/forum/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 限时免费

<Route author="LogicJake" example="/qidian/free" path="/qidian/free/:type?" :paramsDesc="['默认不填为起点中文网，填 mm 为起点女生网']"/>

### 限时免费下期预告

<Route author="LogicJake" example="/qidian/free-next" path="/qidian/free-next/:type?" :paramsDesc="['默认不填为起点中文网，填 mm 为起点女生网']"/>

### 作者

<Route author="miles170" example="/qidian/author/9639927" path="/qidian/author/:id" :paramsDesc="['作者 id, 可在作者页面 URL 找到']"/>

## 起点图

### 首订

<Route author="nczitzk" example="/qidiantu/shouding" path="/qidiantu/shouding"/>

### 榜单

<Route author="nczitzk" example="/qidiantu" path="/qidiantu/:category?/:type?/:is_history?" :paramsDesc="['分类', '类型', '是否查看历史榜单，填写 true/yes 表示是，默认否']">

::: tip 提示

参数 **是否查看历史榜单** 设置为 `true` `yes` `t` `y` 等值后，RSS 会返回历史榜单。

如 [`/qidiantu/1/1/t`](https://rsshub.app/qidiantu/1/1/t) 将会返回 [起点首页 - 封推 的历史推荐记录](https://www.qidiantu.com/bang/1/1/) 的结果。

而 [`/qidiantu/1/1`](https://rsshub.app/qidiantu/1/1) 将会返回最新一期 [收藏增长 (起点首页 - 封推)](https://www.qidiantu.com/bang/1/1/2021-12-14) 的结果（编写文档时最新一期为 2021-12-14）。

:::

</Route>

## 青空文庫

### 青空文庫新着リスト

<Route author="sgqy" example="/aozora/newbook/10" path="/aozora/newbook/:count?" :paramsDesc="['更新数量. 设置每次下载列表大小. 范围是 1 到 50.']">

书籍网站每日一更。信息更新时间为书籍最初出版时间，排序可能不符合网络发表时间，请认准未读消息.

</Route>

## 轻小说文库

### 章节

<Route author="zsakvo" example="/wenku8/chapter/74" path="/wenku8/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 最新卷

<Route author="huangliangshusheng" example="/wenku8/volume/1163" path="/wenku8/volume/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 首页分类

<Route author="Fatpandac" example="/wenku8/lastupdate" path="/wenku8/:categoty?" :paramsDesc="['首页分类，见下表，默认为今日更新']" selfhost="1">

::: warning 注意

首页需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

|    今日更新    |   完结全本   |   新书一览   | 动画化作品 |   热门轻小说  |    轻小说列表    |
| :--------: | :------: | :------: | :---: | :------: | :---------: |
| lastupdate | fullflag | postdate | anime | allvisit | articlelist |

</Route>

## 生物帮

### 所有栏目

<Route author="xfangbao" example="/biobio/nature/cell-reports" path="/biobio/:column/:id" :paramsDesc="['', '']" />

具体栏目编号，去网站上看标签

| 网址                                               | 对应路由                                |
| ------------------------------------------------ | ----------------------------------- |
| <http://science.bio1000.com/ecology-environment> | /biobio/science/ecology-environment |
| <http://www.bio1000.com/gnjz>                    | /biobio/gnjz                        |

## 生物谷

### 所有栏目

<Route author="xfangbao" example="/shengwugu/biology" path="/shengwugu/:uid/" :paramsDesc="['分栏代码, 可在 URL 找到']" />

具体栏目编号，去网站上看标签

| 网址                              | 对应路由               |
| ------------------------------- | ------------------ |
| <http://news.bioon.com/biology> | /shengwugu/biology |

## 书伴

### 分类

<Route author="OdinZhang" example="/bookfere/skills" path="/bookfere/:category" :paramsDesc="['分类名']">

| 每周一书   | 使用技巧   | 图书推荐  | 新闻速递 | 精选短文  |
| ------ | ------ | ----- | ---- | ----- |
| weekly | skills | books | news | essay |

</Route>

## 文学迷

### 小说更新

<Route author="lengthmin" example="/novel/wenxuemi/6/6144" path="/novel/wenxuemi/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `6`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `6144`']">

举例网址：<https://www.wenxuemi.com/files/article/html/6/6144/>

</Route>

## 虛詞

### 版块

<Route author="LogicJake" example="/p-articles/section/critics-art" path="/p-articles/section/:section" :paramsDesc="['版块链接, 可在对应版块 URL 中找到, 子版块链接用`-`连接']"/>

### 作者

<Route author="LogicJake" example="/p-articles/contributors/朗天" path="/p-articles/contributors/:author" :paramsDesc="['作者 id, 可在作者页面 URL 找到']"/>

## 斋书苑

### 最新章节

<Route author="suiyuran" example="/novel/zhaishuyuan/17858" path="/novel/zhaishuyuan/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到, 例如 `17858`']" radar="1" rssbud="1">

举例网址：<https://www.zhaishuyuan.com/book/17858>

</Route>

## 纵横

### 章节

<Route author="georeth" example="/zongheng/chapter/672340" path="/zongheng/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 左岸读书

### 主页

<Route author="kt286" example="/zreading" path="/zreading" />
