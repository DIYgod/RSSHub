# 📚 Reading

## All Poetry {#all-poetry}

### Poems {#all-poetry-poems}

<Route author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" paramsDesc={['Ordering, `best` or `newest`, `best` by default']}/>

## Free Computer Books {#free-computer-books}

### Selected New Books {#free-computer-books-selected-new-books}

<Route author="cubroe" example="/freecomputerbooks" path="/freecomputerbooks" radar="1" />

### Current Book List {#free-computer-books-current-book-list}

<Route author="cubroe" example="/freecomputerbooks/compscAlgorithmBooks" path="/freecomputerbooks/:category" paramsDesc={['A category id., which should be the HTML file name (but **without** the `.html` suffix) in the URL path of a book list page.']} radar="1" />

## hameln {#hameln}

### chapter {#hameln-chapter}

<Route author="huangliangshusheng" example="/hameln/chapter/264928" path="/hameln/chapter/:id" paramsDesc={['Novel id, can be found in URL']}>

Eg: [https://syosetu.org/novel/264928](https://syosetu.org/novel/264928)

</Route>

## Inoreader {#inoreader}

### HTML Clip {#inoreader-html-clip}

<Route author="BeautyyuYanli" example="/inoreader/html_clip/1006346356/News?limit=3" path="/html_clip/:user/:tag" paramsDesc={['user id, the interger after user/ in the example URL','tag, the string after tag/ in the example URL']}>

Use common query parameter `limit=n` to limit the number of articles, default to 20

Eg: [https://www.inoreader.com/stream/user/1006346356/tag/News/view/html?limit=3](https://www.inoreader.com/stream/user/1006346356/tag/News/view/html?limit=3)

</Route>

### RSS {#inoreader-rss}

<Route author="NavePnow" example="/inoreader/rss/1005137674/user-favorites" path="/inoreader/rss/:user/:tag" paramsDesc={['user id, the interger after user/ in the example URL','tag, the string after tag/ in the example URL']}>

## kakuyomu {#kakuyomu}

### episode {#kakuyomu-episode}

<Route author="huangliangshusheng" example="/kakuyomu/episode/1177354054883783581" path="/kakuyomu/episode/:id" paramsDesc={['Novel id, can be found in URL']}>

Eg: [https://kakuyomu.jp/works/1177354054883783581](https://kakuyomu.jp/works/1177354054883783581)

</Route>

## Kindle Unlimited {#kindle-unlimited}

### 会员限时免费读书单 {#kindle-unlimited-hui-yuan-xian-shi-mian-fei-du-shu-dan}

<Route author="nczitzk" example="/amazon/ku/this" path="/amazon/ku/:type?" paramsDesc={['书单类型，见下表']}>

| 本月书单 | 好评返场 | 次月预告 |
| -------- | -------- | -------- |
| this     | back     | next     |

</Route>

## Literotica {#literotica}

### New Stories {#literotica-new-stories}

<Route author="nczitzk" example="/literotica/new" path="/literotica/new"/>

### Category {#literotica-category}

<Route author="nczitzk" example="/literotica/category/anal-sex-stories" path="/literotica/category/:category?" paramsDesc={['Category, can be found in URL']}/>

## MagazineLib {#magazinelib}

### Latest Magazine {#magazinelib-latest-magazine}

<Route author="NavePnow" example="/magazinelib/latest-magazine/new+yorker" path="/magazinelib/latest-magazine/:query?" paramsDesc={['query, search page querystring']}/>

For instance, when doing search at [https://magazinelib.com](https://magazinelib.com) and you get url `https://magazinelib.com/?s=new+yorker`, the query is `new+yorker`

</Route>

## Mobilism {#mobilism}

### eBook Releases {#mobilism-ebook-releases}

<Route author="nitezs" example="/mobilism/forums/books/romance" path="/mobilism/forums/books/:type/:fulltext?" paramsDesc={['Category', 'Retrieve fulltext, specify `y` to enable']}>

| Category                 | Parameter  |
| ------------------------ | ---------- |
| Romance                  | romance    |
| Sci-Fi/Fantasy/Horror    | scifi      |
| General Fiction/Classics | classics   |
| Magazines & Newspapers   | magazines  |
| Audiobooks               | audioBooks |
| Comics                   | comics     |

</Route>

## Penguin Random House {#penguin-random-house}

### Book Lists {#penguin-random-house-book-lists}

<Route author="StevenRCE0" example="/penguin-random-house/the-read-down" path="/penguin-random-house/the-read-down" />

### Articles {#penguin-random-house-articles}

<Route author="StevenRCE0" example="/penguin-random-house/articles" path="/penguin-random-house/articles" />

## SoBooks {#sobooks}

### 首页 {#sobooks-shou-ye}

<Route author="nczitzk" example="/sobooks" path="/sobooks/:category?" paramsDesc={['分类, 见下表']}>

| 分类     | 分类名           |
| -------- | ---------------- |
| 小说文学 | xiaoshuowenxue   |
| 历史传记 | lishizhuanji     |
| 人文社科 | renwensheke      |
| 励志成功 | lizhichenggong   |
| 经济管理 | jingjiguanli     |
| 学习教育 | xuexijiaoyu      |
| 生活时尚 | shenghuoshishang |
| 英文原版 | yingwenyuanban   |

</Route>

### 标签 {#sobooks-biao-qian}

<Route author="nczitzk" example="/sobooks/tag/小说" path="/sobooks/tag/:id?" paramsDesc={['标签, 见下表，默认为小说']}>

热门标签

| 小说 | 文学 | 历史 | 日本 | 科普 | 管理 | 推理 | 社会 | 经济   |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |
| 传记 | 美国 | 悬疑 | 哲学 | 心理 | 商业 | 金融 | 思维 | 经典   |
| 随笔 | 投资 | 文化 | 励志 | 科幻 | 成长 | 中国 | 英国 | 政治   |
| 漫画 | 纪实 | 艺术 | 科学 | 生活 | 职场 | 散文 | 法国 | 互联网 |
| 营销 | 奇幻 | 二战 | 股票 | 女性 | 德国 | 学习 | 战争 | 创业   |
| 绘本 | 名著 | 爱情 | 军事 | 理财 | 教育 | 世界 | 人物 | 沟通   |

</Route>

### 归档 {#sobooks-gui-dang}

<Route author="nczitzk" example="/sobooks/date/2020-11" path="/sobooks/date/:date?" paramsDesc={['日期，见例子，默认为当前年月']}/>

## syosetu {#syosetu}

### chapter {#syosetu-chapter}

<Route author="huangliangshusheng" example="/syosetu/chapter/n1976ey" path="/syosetu/chapter/:id" paramsDesc={['Novel id, can be found in URL']}>

Eg: `https://ncode.syosetu.com/n1976ey/`

</Route>

## UU 看书 {#uu-kan-shu}

### 小说更新 {#uu-kan-shu-xiao-shuo-geng-xin}

<Route author="jacky2001114" example="/novel/uukanshu/49621" path="/novel/uukanshu/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到']}/>

## 爱思想 {#ai-si-xiang}

### 栏目 {#ai-si-xiang-lan-mu}

<Route author="HenryQW nczitzk" example="/aisixiang/column/722" path="/aisixiang/column/:id" paramsDesc={['栏目 ID, 可在对应栏目 URL 中找到']}/>

### 专题 {#ai-si-xiang-zhuan-ti}

<Route author="nczitzk" example="/aisixiang/zhuanti/211" path="/aisixiang/zhuanti/:id" paramsDesc={['专题 ID, 可在对应专题 URL 中找到']}>

:::tip

更多专题请见 [关键词](http://www.aisixiang.com/zhuanti/)

:::

</Route>

### 排行 {#ai-si-xiang-pai-hang}

<Route author="HenryQW nczitzk" example="/aisixiang/toplist/1/7" path="/aisixiang/toplist/:id?/:period?" paramsDesc={['类型', '范围, 仅适用于点击排行榜, 可选一天(1)，一周(7)，一月(30)，所有(-1)，默认为一天']}>

| 文章点击排行 | 最近更新文章 | 文章推荐排行 |
| ------------ | ------------ | ------------ |
| 1            | 10           | 11           |

</Route>

### 思想库（专栏） {#ai-si-xiang-si-xiang-ku-zhuan-lan}

<Route author="hoilc nczitzk" example="/aisixiang/thinktank/WuQine/论文" path="/aisixiang/thinktank/:id/:type?" paramsDesc={['专栏 ID，一般为作者拼音，可在URL中找到', '栏目类型，参考下表，默认为全部']}>

| 论文 | 时评 | 随笔 | 演讲 | 访谈 | 著作 | 读书 | 史论 | 译作 | 诗歌 | 书信 | 科学 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |

</Route>

## 爱下电子书 {#ai-xia-dian-zi-shu}

### 最新章节 {#ai-xia-dian-zi-shu-zui-xin-zhang-jie}

<Route author="JeasonLau Maecenas" example="/axdzs/诡秘之主" path="/axdzs/:novel" paramsDesc={['小说的中文名, 可在对应小说页 URL 中找到']}  />

## 笔趣阁 {#bi-qu-ge}

:::tip

此处的 **笔趣阁** 指网络上使用和 **笔趣阁** 样式相似模板的小说阅读网站，包括但不限于下方列举的网址。

:::

| 网址                                                | 名称       |
| -------------------------------------------------- | ---------- |
| [https://www.xbiquwx.la](https://www.xbiquwx.la)   | 笔尖中文   |
| [http://www.biqu5200.net](http://www.biqu5200.net)  | 笔趣阁     |
| [https://www.xbiquge.so](https://www.xbiquge.so)   | 笔趣阁     |
| [https://www.biqugeu.net](https://www.biqugeu.net)  | 顶点小说网 |
| [http://www.b520.cc](http://www.b520.cc)       | 笔趣阁     |
| [https://www.ahfgb.com](https://www.ahfgb.com)    | 笔趣鸽     |
| [https://www.ibiquge.la](https://www.ibiquge.la)   | 香书小说   |
| [https://www.biquge.tv](https://www.biquge.tv)    | 笔趣阁     |
| [https://www.bswtan.com](https://www.bswtan.com)   | 笔书网     |
| [https://www.biquge.co](https://www.biquge.co)    | 笔趣阁     |
| [https://www.bqzhh.com](https://www.bqzhh.com)    | 笔趣阁     |
| [http://www.biqugse.com](http://www.biqugse.com)   | 笔趣阁     |
| [https://www.ibiquge.info](https://www.ibiquge.info) | 爱笔楼     |
| [https://www.ishuquge.com](https://www.ishuquge.com) | 书趣阁     |
| [https://www.mayiwxw.com](https://www.mayiwxw.com)  | 蚂蚁文学   |

### 小说 {#bi-qu-ge-xiao-shuo}

<Route author="nczitzk" example="/biquge/http://www.biqu5200.net/0_7/" path="/biquge/:url" paramsDesc={['小说 Url，即对应小说详情页的 Url，可在地址栏中找到']} anticrawler="1" radar="1" rssbud="1">

:::tip

#### 使用方法 {#bi-qu-ge-xiao-shuo-shi-yong-fang-fa}

如订阅 [《大主宰》](http://www.biqu5200.net/0\_7/)，此时在 [biqu5200.net](http://www.biqu5200.net) 中查询得到对应小说详情页 URL 为 `http://www.biqu5200.net/0_7/`。此时，路由为 [`/biquge/http://www.biqu5200.net/0_7/`](https://rsshub.app/biquge/http://www.biqu5200.net/0_7/)

又如同样订阅 [《大主宰》](https://www.shuquge.com/txt/70/index.html)，此时在 [shuquge.com](https://www.shuquge.com) 中查询得到对应小说详情页 URL 为 `https://www.shuquge.com/txt/70/index.html`。此时，把末尾的 `index.html` 去掉，路由为 [`/biquge/https://www.shuquge.com/txt/70/`](https://rsshub.app/biquge/https://www.shuquge.com/txt/70/)

#### 关于章节数 {#bi-qu-ge-xiao-shuo-guan-yu-zhang-jie-shu}

路由默认返回最新 **1** 个章节，如有需要一次性获取多个章节，可在路由后指定 `limit` 参数。如上面的例子：订阅 [《大主宰》](http://www.biqu5200.net/0\_7/) 并获取最新的 **10** 个章节。此时，路由为 [`/biquge/http://www.biqu5200.net/0_7/?limit=10`](https://rsshub.app/biquge/http://www.biqu5200.net/0_7/?limit=10)

需要注意的是，单次获取的所有章节更新时间统一设定为最新章节的更新时间。也就是说，获取最新的 **10** 个章节时，除了最新 **1** 个章节的更新时间是准确的（和网站一致的），其他 **9** 个章节的更新时间是不准确的。

另外，若设置获取章节数目过多，可能会触发网站反爬，导致路由不可用。

:::

:::caution

上方列举的网址可能部分不可用，这取决于该网站的维护者是否持续运营网站。请选择可以正常访问的网址，获取更新的前提是该网站可以正常访问。

:::

</Route>

## 博客来 {#bo-ke-lai}

### 新书出版 {#bo-ke-lai-xin-shu-chu-ban}

<Route author="CokeMine" example="/bookscomtw/newbooks/books_nbtopm_15" path="/bookscomtw/newbooks/:category" paramsDesc={['书籍类型 category, 可在对应博客来新书页 URL 中找到']}/>

## 超星 {#chao-xing}

### 期刊 {#chao-xing-qi-kan}

<Route author="nczitzk" example="/chaoxing/qk/6b5c39b3dd84352be512e29df0297437" path="/chaoxing/qk/:id/:needContent?" paramsDesc={['期刊 id，可在期刊页 URL 中找到', '需要获取文章全文，填写 true/yes 表示需要，默认需要']} anticrawler="1" radar="1" rssbud="1">

:::tip

全部期刊可以在 [这里](http://qk.chaoxing.com/space/index) 找到，你也可以从 [学科分类](https://qikan.chaoxing.com/jourclassify) 和 [期刊导航](https://qikan.chaoxing.com/search/openmag) 中发现更多期刊。

如订阅 [**上海文艺**](http://m.chaoxing.com/mqk/list?sw=&mags=6b5c39b3dd84352be512e29df0297437&isort=20&from=space)，其 URL 为 `http://m.chaoxing.com/mqk/list?mags=6b5c39b3dd84352be512e29df0297437`。`6b5c39b3dd84352be512e29df0297437` 即为期刊 id，所得路由为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437)

:::

:::caution

你可以设置参数 **需要获取文章全文** 为 `true` `yes` `t` `y` 等值（或者忽略这个参数），RSS 的条目会携带期刊中的 **文章全文**，而不仅仅是 **文章概要**。但因为发起访问请求过多会被该网站屏蔽，你可以将其关闭（设置该参数为 `false` `no` `f` `n` 等值），这将会大大减少请求次数从而更难触发网站的反爬机制。

路由默认会获取 **30** 个条目。在路由后指定 `?limit=<条目数量>` 减少或增加单次获取条目数量，同样可以减少请求次数，如设置为一次获取 **10** 个条目，路由可以更改为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10)

在根据上文设置 **需要获取文章全文** 为不需要时，你可以将 `limit` 值增大，从而获取更多的条目，此时因为不获取全文也不会触发反爬机制，如 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100)

:::

</Route>

## 吹牛部落 {#chui-niu-bu-luo}

### 栏目 {#chui-niu-bu-luo-lan-mu}

<Route author="LogicJake" example="/chuiniu/column/0b1c4cf6e7f24e8da11e37882de73704" path="/chuiniu/column/:id" paramsDesc={['栏目 id, 可在对应栏目页 URL 中找到']}>

:::caution

正文内容需要用户登录后的 x-member 值，详情见部署页面的配置模块。若无相关配置或 x-member 失效，则只显示文章摘要。

:::

</Route>

### 专栏列表 {#chui-niu-bu-luo-zhuan-lan-lie-biao}

<Route author="LogicJake" example="/chuiniu/column_list" path="/chuiniu/column_list"/>

## 刺猬猫 {#ci-wei-mao}

### 章节 {#ci-wei-mao-zhang-jie}

<Route author="Netrvin" example="/ciweimao/chapter/100045750" path="/ciweimao/chapter/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到']}/>

## 单向空间 {#dan-xiang-kong-jian}

### 单读 {#dan-xiang-kong-jian-dan-du}

<Route author="imkero" example="/owspace/read/0" path="/owspace/read/:type?" paramsDesc={['栏目分类，不填则默认为首页']}>

| 首页 | 文字 | 影像 | 声音 | 单向历 | 谈论 |
| ---- | ---- | ---- | ---- | ------ | ---- |
| 0    | 1    | 2    | 3    | 4      | 6    |

</Route>

## 稻草人书屋 {#dao-cao-ren-shu-wu}

### 章节更新 {#dao-cao-ren-shu-wu-zhang-jie-geng-xin}

<Route author="JeasonLau" example="/dcrsw/zhongjidouluo/2" path="/dcrsw/:name/:count?" paramsDesc={['小说名，可在对应小说页URL中找到', '显示的章节数，缺省为`3`']}>

:::caution

count 的取值范围为 1-12，为防止请求次数过多，推荐设置为 5 以下。
:::

</Route>

## 第一版主 {#di-yi-ban-zhu}

### 小说 {#di-yi-ban-zhu-xiao-shuo}

<Route author="x1a0xv4n" example="/novel/d1bz/2/2608_6" path="/novel/d1bz/:category/:id" paramsDesc={['小说分类，可在对应小说页 URL 中找到，例如`2`', '小说id，可在对应小说页 URL 中找到，例如`2608_6`']}/>

## 东立出版 {#dong-li-chu-ban}

### NEWS 资讯 {#dong-li-chu-ban-news-zi-xun}

<Route author="CokeMine" example="/tongli/news/6" path="/tongli/news/:type" paramsDesc={['分类, 可以在“話題新聞”链接中找到']}/>

## 飞地 {#fei-di}

### 分类 {#fei-di-fen-lei}

<Route author="LogicJake" example="/enclavebooks/category/1" path="/enclavebooks/category/:id" paramsDesc={['类别 id，可在[分类api](https://app.enclavebooks.cn/v2/discovery)返回数据中的category查看']}/>

### 用户创作 {#fei-di-yong-hu-chuang-zuo}

<Route author="junbaor" example="/enclavebooks/user/103702" path="/enclavebooks/user/:uid" paramsDesc={['用户ID, 自行抓包寻找']}/>

### 用户收藏 {#fei-di-yong-hu-shou-cang}

<Route author="junbaor" example="/enclavebooks/collection/103702" path="/enclavebooks/collection/:uid" paramsDesc={['用户ID, 自行抓包寻找']}/>

## 禁忌书屋 {#jin-ji-shu-wu}

### 首页 {#jin-ji-shu-wu-shou-ye}

<Route author="nczitzk" example="/cool18/bbs4" path="/cool18/bbs4"/>

### 精华区 {#jin-ji-shu-wu-jing-hua-qu}

<Route author="nczitzk" example="/cool18/bbs4/gold" path="/cool18/bbs4/gold"/>

### 栏目分类 {#jin-ji-shu-wu-lan-mu-fen-lei}

<Route author="nczitzk" example="/cool18/bbs4/type/都市" path="/cool18/bbs4/type/:keyword?" paramsDesc={['分类，见下表，默认为首页']}>

| 都市 | 校园 | 乡野 | 古风 | 异国 | 玄幻 | 红杏 | 伦理 | 浪漫 | 暴虐 | 摄心 | 其他 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |

</Route>

### 搜索关键字 {#jin-ji-shu-wu-sou-suo-guan-jian-zi}

<Route author="nczitzk" example="/cool18/bbs4/keywords/都市" path="/cool18/bbs4/keywords/:keyword?" paramsDesc={['关键字']}/>

## 孔夫子旧书网 {#kong-fu-zi-jiu-shu-wang}

### 用户动态 {#kong-fu-zi-jiu-shu-wang-yong-hu-dong-tai}

<Route author="nczitzk" example="/kongfz/people/5032170" path="/kongfz/people/:id" paramsDesc={['用户 id, 可在对应用户页 URL 中找到']}/>

### 店铺上架 {#kong-fu-zi-jiu-shu-wang-dian-pu-shang-jia}

<Route author="nczitzk" example="/kongfz/shop/238901/1" path="/kongfz/shop/:id/:cat?" paramsDesc={['店铺 id, 可在对应店铺页 URL 中找到', '分类 id，可在对应分类页 URL 中找到，默认为店铺最新上架']}/>

## 快眼看书 {#kuai-yan-kan-shu}

### 小说更新 {#kuai-yan-kan-shu-xiao-shuo-geng-xin}

<Route author="squkw" example="/novel/booksky/98619" path="/novel/booksky/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到, 例如 `98619`']}>

举例网址：`http://booksky.so/BookDetail.aspx?Level=1&bid=98619`

</Route>

## 哩哔轻小说 {#li-bi-qing-xiao-shuo}

### 小说更新 {#li-bi-qing-xiao-shuo-xiao-shuo-geng-xin}

<Route author="misakicoca" path="/linovelib/novel/:id" example="/linovelib/novel/2547" paramsDesc={['小说 id，对应书架开始阅读 URL 中找到']}/>

## 飘天文学 {#piao-tian-wen-xue}

### 章节 {#piao-tian-wen-xue-zhang-jie}

<Route author="LJason77" example="/novel/ptwxz/10/10272" path="/novel/ptwxz/:id1/:id2" paramsDesc={['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `10`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `10272`']} >

举例网址：`https://www.ptwxz.com/bookinfo/10/10272.html`

</Route>

## 起点 {#qi-dian}

### 章节 {#qi-dian-zhang-jie}

<Route author="fuzy112" example="/qidian/chapter/1010400217" path="/qidian/chapter/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到']}/>

### 讨论区 {#qi-dian-tao-lun-qu}

<Route author="fuzy112" example="/qidian/forum/1010400217" path="/qidian/forum/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到']}/>

### 限时免费 {#qi-dian-xian-shi-mian-fei}

<Route author="LogicJake" example="/qidian/free" path="/qidian/free/:type?" paramsDesc={['默认不填为起点中文网，填 mm 为起点女生网']}/>

### 限时免费下期预告 {#qi-dian-xian-shi-mian-fei-xia-qi-yu-gao}

<Route author="LogicJake" example="/qidian/free-next" path="/qidian/free-next/:type?" paramsDesc={['默认不填为起点中文网，填 mm 为起点女生网']}/>

### 作者 {#qi-dian-zuo-zhe}

<Route author="miles170" example="/qidian/author/9639927" path="/qidian/author/:id" paramsDesc={['作者 id, 可在作者页面 URL 找到']}/>

## 起点图 {#qi-dian-tu}

### 首订 {#qi-dian-tu-shou-ding}

<Route author="nczitzk" example="/qidiantu/shouding" path="/qidiantu/shouding"/>

### 榜单 {#qi-dian-tu-bang-dan}

<Route author="nczitzk" example="/qidiantu" path="/qidiantu/:category?/:type?/:is_history?" paramsDesc={['分类', '类型', '是否查看历史榜单，填写 true/yes 表示是，默认否']}>

:::tip

参数 **是否查看历史榜单** 设置为 `true` `yes` `t` `y` 等值后，RSS 会返回历史榜单。

如 [`/qidiantu/1/1/t`](https://rsshub.app/qidiantu/1/1/t) 将会返回 [起点首页 - 封推 的历史推荐记录](https://www.qidiantu.com/bang/1/1/) 的结果。

而 [`/qidiantu/1/1`](https://rsshub.app/qidiantu/1/1) 将会返回最新一期 [收藏增长 (起点首页 - 封推)](https://www.qidiantu.com/bang/1/1/2021-12-14) 的结果（编写文档时最新一期为 2021-12-14）。

:::

</Route>

## 青空文庫 {#qing-kong-wen-ku}

### 青空文庫新着リスト {#qing-kong-wen-ku-qing-kong-wen-ku-xin-zhe-%E3%83%AA%E3%82%B9%E3%83%88}

<Route author="sgqy" example="/aozora/newbook/10" path="/aozora/newbook/:count?" paramsDesc={['更新数量. 设置每次下载列表大小. 范围是 1 到 50.']}>

书籍网站每日一更。信息更新时间为书籍最初出版时间，排序可能不符合网络发表时间，请认准未读消息.

</Route>

## 轻小说文库 {#qing-xiao-shuo-wen-ku}

### 章节 {#qing-xiao-shuo-wen-ku-zhang-jie}

<Route author="zsakvo" example="/wenku8/chapter/74" path="/wenku8/chapter/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到']}/>

### 最新卷 {#qing-xiao-shuo-wen-ku-zui-xin-juan}

<Route author="huangliangshusheng" example="/wenku8/volume/1163" path="/wenku8/volume/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到']}/>

### 首页分类 {#qing-xiao-shuo-wen-ku-shou-ye-fen-lei}

<Route author="Fatpandac" example="/wenku8/lastupdate" path="/wenku8/:categoty?" paramsDesc={['首页分类，见下表，默认为今日更新']} selfhost="1">

:::caution

首页需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

|  今日更新  | 完结全本 | 新书一览 | 动画化作品 | 热门轻小说 |  轻小说列表 |
| :--------: | :------: | :------: | :--------: | :--------: | :---------: |
| lastupdate | fullflag | postdate |    anime   |  allvisit  | articlelist |

</Route>

## 日本語多読道場 {#ri-ben-yu-duo-du-dao-chang}

### 等级 {#ri-ben-yu-duo-du-dao-chang-deng-ji}

<Route author="eternasuno" example="/yomujp/n1" path="/yomujp/:level?" paramsDesc={['等级，n1~n6，为空默认全部']} />

## 生物帮 {#sheng-wu-bang}

### 所有栏目 {#sheng-wu-bang-suo-you-lan-mu}

<Route author="xfangbao" example="/biobio/nature/cell-reports" path="/biobio/:column/:id" paramsDesc={['', '']} />

具体栏目编号，去网站上看标签

| 网址                                             | 对应路由                            |
| ------------------------------------------------ | ----------------------------------- |
| `http://science.bio1000.com/ecology-environment` | /biobio/science/ecology-environment |
| `http://www.bio1000.com/gnjz`                    | /biobio/gnjz                        |

## 生物谷 {#sheng-wu-gu}

### 所有栏目 {#sheng-wu-gu-suo-you-lan-mu}

<Route author="xfangbao" example="/shengwugu/biology" path="/shengwugu/:uid/" paramsDesc={['分栏代码, 可在 URL 找到']} />

具体栏目编号，去网站上看标签

| 网址                            | 对应路由           |
| ------------------------------- | ------------------ |
| `http://news.bioon.com/biology` | /shengwugu/biology |

## 书伴 {#shu-ban}

### 分类 {#shu-ban-fen-lei}

<Route author="OdinZhang" example="/bookfere/skills" path="/bookfere/:category" paramsDesc={['分类名']}>

| 每周一书 | 使用技巧 | 图书推荐 | 新闻速递 | 精选短文 |
| -------- | -------- | -------- | -------- | -------- |
| weekly   | skills   | books    | news     | essay    |

</Route>

## 文学迷 {#wen-xue-mi}

### 小说更新 {#wen-xue-mi-xiao-shuo-geng-xin}

<Route author="lengthmin" example="/novel/wenxuemi/6/6144" path="/novel/wenxuemi/:id1/:id2" paramsDesc={['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `6`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `6144`']}>

举例网址：`https://www.wenxuemi.com/files/article/html/6/6144/`

</Route>

## 虛詞 {#xu-ci}

### 版块 {#xu-ci-ban-kuai}

<Route author="LogicJake" example="/p-articles/section/critics-art" path="/p-articles/section/:section" paramsDesc={['版块链接, 可在对应版块 URL 中找到, 子版块链接用`-`连接']}/>

### 作者 {#xu-ci-zuo-zhe}

<Route author="LogicJake" example="/p-articles/contributors/朗天" path="/p-articles/contributors/:author" paramsDesc={['作者 id, 可在作者页面 URL 找到']}/>

## 斋书苑 {#zhai-shu-yuan}

### 最新章节 {#zhai-shu-yuan-zui-xin-zhang-jie}

<Route author="suiyuran" example="/novel/zhaishuyuan/17858" path="/novel/zhaishuyuan/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到, 例如 `17858`']} radar="1" rssbud="1">

举例网址：`https://www.zhaishuyuan.com/book/17858`

</Route>

## 纵横 {#zong-heng}

### 章节 {#zong-heng-zhang-jie}

<Route author="georeth" example="/zongheng/chapter/672340" path="/zongheng/chapter/:id" paramsDesc={['小说 id, 可在对应小说页 URL 中找到']}/>

## 左岸读书 {#zuo-an-du-shu}

### 主页 {#zuo-an-du-shu-zhu-ye}

<Route author="kt286" example="/zreading" path="/zreading" />
