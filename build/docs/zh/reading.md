# 📚 阅读

## Free Computer Books <Site url="freecomputerbooks.com"/>

### Book List <Site url="freecomputerbooks.com" size="sm" />

<Route namespace="freecomputerbooks" :data='{"path":"/:category?","name":"Book List","url":"freecomputerbooks.com","maintainers":["cubroe"],"example":"/freecomputerbooks/compscAlgorithmBooks","parameters":{"category":"A category id., which should be the HTML file name (but **without** the `.html` suffix) in the URL path of a book list page."},"categories":["reading"],"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportRadar":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["freecomputerbooks.com/","freecomputerbooks.com/index.html"],"target":""}],"location":"index.ts"}' :test='{"code":0}' />

## hameln <Site url="syosetu.org"/>

### chapter <Site url="syosetu.org" size="sm" />

<Route namespace="hameln" :data='{"path":"/chapter/:id","categories":["reading"],"example":"/hameln/chapter/264928","parameters":{"id":"Novel id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["syosetu.org/novel/:id"]}],"name":"chapter","maintainers":["huangliangshusheng"],"description":"Eg: [https://syosetu.org/novel/264928](https://syosetu.org/novel/264928)","location":"chapter.ts"}' :test='{"code":0}' />

Eg: [https://syosetu.org/novel/264928](https://syosetu.org/novel/264928)

## Inoreader <Site url="inoreader.com"/>

### RSS <Site url="inoreader.com" size="sm" />

<Route namespace="inoreader" :data='{"path":"/rss/:user/:tag","categories":["reading"],"example":"/inoreader/rss/1005137674/user-favorites","parameters":{"user":"user id, the interger after user/ in the example URL","tag":"tag, the string after tag/ in the example URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"RSS","maintainers":["EthanWng97"],"location":"rss.ts"}' :test='{"code":0}' />

### Unknown <Site url="inoreader.com" size="sm" />

<Route namespace="inoreader" :data='{"path":"/html_clip/:user/:tag","name":"Unknown","maintainers":[],"location":"index.ts"}' :test='undefined' />

## Literotica <Site url="literotica.com"/>

### New Stories <Site url="literotica.com/" size="sm" />

<Route namespace="literotica" :data='{"path":"/new","categories":["reading"],"example":"/literotica/new","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["literotica.com/"]}],"name":"New Stories","maintainers":["nczitzk"],"url":"literotica.com/","location":"new.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Unknown <Site url="literotica.com" size="sm" />

<Route namespace="literotica" :data='{"path":"/category/:category","radar":[{"source":["literotica.com/c/:category","literotica.com/"]}],"name":"Unknown","maintainers":["nczitzk"],"location":"category.ts"}' :test='undefined' />

## MagazineLib <Site url="magazinelib.com"/>

### Latest Magazine <Site url="magazinelib.com" size="sm" />

<Route namespace="magazinelib" :data='{"path":"/latest-magazine/:query?","categories":["reading"],"example":"/magazinelib/latest-magazine/new+yorker","parameters":{"query":"query, search page querystring"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Latest Magazine","maintainers":["EthanWng97"],"description":"For instance, when doing search at [https://magazinelib.com](https://magazinelib.com) and you get url `https://magazinelib.com/?s=new+yorker`, the query is `new+yorker`","location":"latest-magazine.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

For instance, when doing search at [https://magazinelib.com](https://magazinelib.com) and you get url `https://magazinelib.com/?s=new+yorker`, the query is `new+yorker`

## Penguin Random House <Site url="penguinrandomhouse.com"/>

### Articles <Site url="penguinrandomhouse.com/articles" size="sm" />

<Route namespace="penguin-random-house" :data='{"path":"/articles","categories":["reading"],"example":"/penguin-random-house/articles","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["penguinrandomhouse.com/articles"]}],"name":"Articles","maintainers":["StevenRCE0"],"url":"penguinrandomhouse.com/articles","location":"articles.ts"}' :test='undefined' />

### Book Lists <Site url="penguinrandomhouse.com/the-read-down" size="sm" />

<Route namespace="penguin-random-house" :data='{"path":"/the-read-down","categories":["reading"],"example":"/penguin-random-house/the-read-down","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["penguinrandomhouse.com/the-read-down"]}],"name":"Book Lists","maintainers":["StevenRCE0"],"url":"penguinrandomhouse.com/the-read-down","location":"thereaddown.ts"}' :test='undefined' />

## SF 轻小说 <Site url="book.sfacg.com"/>

### 章节 <Site url="book.sfacg.com" size="sm" />

<Route namespace="sfacg" :data='{"path":"/novel/chapter/:id","categories":["reading"],"example":"/sfacg/novel/chapter/672431","parameters":{"id":"小说 id, 可在对应小说页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["book.sfacg.com/Novel/:id/*"]}],"name":"章节","maintainers":["keocheung"],"location":"novel-chapter.ts"}' :test='{"code":0}' />

## SoBooks <Site url="sobooks.net"/>

### 标签 <Site url="sobooks.net" size="sm" />

<Route namespace="sobooks" :data='{"path":"/tag/:id?","categories":["reading"],"example":"/sobooks/tag/小说","parameters":{"id":"标签, 见下表，默认为小说"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sobooks.net/books/tag/:tag"],"target":"/tag/:tag"}],"name":"标签","maintainers":["nczitzk"],"description":"热门标签\n\n  | 小说 | 文学 | 历史 | 日本 | 科普 | 管理 | 推理 | 社会 | 经济   |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |\n  | 传记 | 美国 | 悬疑 | 哲学 | 心理 | 商业 | 金融 | 思维 | 经典   |\n  | 随笔 | 投资 | 文化 | 励志 | 科幻 | 成长 | 中国 | 英国 | 政治   |\n  | 漫画 | 纪实 | 艺术 | 科学 | 生活 | 职场 | 散文 | 法国 | 互联网 |\n  | 营销 | 奇幻 | 二战 | 股票 | 女性 | 德国 | 学习 | 战争 | 创业   |\n  | 绘本 | 名著 | 爱情 | 军事 | 理财 | 教育 | 世界 | 人物 | 沟通   |","location":"tag.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

热门标签

  | 小说 | 文学 | 历史 | 日本 | 科普 | 管理 | 推理 | 社会 | 经济   |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |
  | 传记 | 美国 | 悬疑 | 哲学 | 心理 | 商业 | 金融 | 思维 | 经典   |
  | 随笔 | 投资 | 文化 | 励志 | 科幻 | 成长 | 中国 | 英国 | 政治   |
  | 漫画 | 纪实 | 艺术 | 科学 | 生活 | 职场 | 散文 | 法国 | 互联网 |
  | 营销 | 奇幻 | 二战 | 股票 | 女性 | 德国 | 学习 | 战争 | 创业   |
  | 绘本 | 名著 | 爱情 | 军事 | 理财 | 教育 | 世界 | 人物 | 沟通   |

### 归档 <Site url="sobooks.net" size="sm" />

<Route namespace="sobooks" :data='{"path":"/date/:date?","categories":["reading"],"example":"/sobooks/date/2020-11","parameters":{"date":"日期，见例子，默认为当前年月"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sobooks.net/:category"],"target":"/:category"}],"name":"归档","maintainers":["nczitzk"],"location":"date.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 首页 <Site url="sobooks.net" size="sm" />

<Route namespace="sobooks" :data='{"path":"/:category?","categories":["reading"],"example":"/sobooks","parameters":{"category":"分类, 见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sobooks.net/:category"],"target":"/:category"}],"name":"首页","maintainers":["nczitzk"],"description":"| 分类     | 分类名           |\n  | -------- | ---------------- |\n  | 小说文学 | xiaoshuowenxue   |\n  | 历史传记 | lishizhuanji     |\n  | 人文社科 | renwensheke      |\n  | 励志成功 | lizhichenggong   |\n  | 经济管理 | jingjiguanli     |\n  | 学习教育 | xuexijiaoyu      |\n  | 生活时尚 | shenghuoshishang |\n  | 英文原版 | yingwenyuanban   |","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

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

## syosetu <Site url="ncode.syosetu.com"/>

### chapter <Site url="ncode.syosetu.com" size="sm" />

<Route namespace="syosetu" :data='{"path":"/chapter/:id","categories":["reading"],"example":"/syosetu/chapter/n1976ey","parameters":{"id":"Novel id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["novel18.syosetu.com/:id"]}],"name":"chapter","maintainers":["huangliangshusheng"],"description":"Eg: `https://ncode.syosetu.com/n1976ey/`","location":"chapter.ts"}' :test='{"code":0}' />

Eg: `https://ncode.syosetu.com/n1976ey/`

## 爱思想 <Site url="aisixiang.com"/>

### Unknown <Site url="aisixiang.com" size="sm" />

<Route namespace="aisixiang" :data='{"path":["/ranking/:id?/:period?","/toplist/:id?/:period?"],"name":"Unknown","maintainers":["HenryQW","nczitzk"],"description":"| 文章点击排行 | 最近更新文章 | 文章推荐排行 |\n  | ------------ | ------------ | ------------ |\n  | 1            | 10           | 11           |","location":"toplist.ts"}' :test='undefined' />

| 文章点击排行 | 最近更新文章 | 文章推荐排行 |
  | ------------ | ------------ | ------------ |
  | 1            | 10           | 11           |

### Unknown <Site url="aisixiang.com" size="sm" />

<Route namespace="aisixiang" :data='{"path":["/ranking/:id?/:period?","/toplist/:id?/:period?"],"name":"Unknown","maintainers":["HenryQW","nczitzk"],"description":"| 文章点击排行 | 最近更新文章 | 文章推荐排行 |\n  | ------------ | ------------ | ------------ |\n  | 1            | 10           | 11           |","location":"toplist.ts"}' :test='undefined' />

| 文章点击排行 | 最近更新文章 | 文章推荐排行 |
  | ------------ | ------------ | ------------ |
  | 1            | 10           | 11           |

### 栏目 <Site url="aisixiang.com" size="sm" />

<Route namespace="aisixiang" :data='{"path":"/column/:id","categories":["reading"],"example":"/aisixiang/column/722","parameters":{"id":"栏目 ID, 可在对应栏目 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"栏目","maintainers":["HenryQW","nczitzk"],"location":"column.ts"}' :test='{"code":0}' />

### 思想库（专栏） <Site url="aisixiang.com" size="sm" />

<Route namespace="aisixiang" :data='{"path":"/thinktank/:id/:type?","categories":["reading"],"example":"/aisixiang/thinktank/WuQine/论文","parameters":{"id":"专栏 ID，一般为作者拼音，可在URL中找到","type":"栏目类型，参考下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"思想库（专栏）","maintainers":["hoilc","nczitzk"],"description":"| 论文 | 时评 | 随笔 | 演讲 | 访谈 | 著作 | 读书 | 史论 | 译作 | 诗歌 | 书信 | 科学 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |","location":"thinktank.ts"}' :test='{"code":0}' />

| 论文 | 时评 | 随笔 | 演讲 | 访谈 | 著作 | 读书 | 史论 | 译作 | 诗歌 | 书信 | 科学 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |

### 专题 <Site url="aisixiang.com" size="sm" />

<Route namespace="aisixiang" :data='{"path":"/zhuanti/:id","categories":["reading"],"example":"/aisixiang/zhuanti/211","parameters":{"id":"专题 ID, 可在对应专题 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"专题","maintainers":["nczitzk"],"description":":::tip\n  更多专题请见 [关键词](http://www.aisixiang.com/zhuanti/)\n  :::","location":"zhuanti.ts"}' :test='{"code":1,"message":"expected 312282271813 to be less than 311040000000"}' />

:::tip
  更多专题请见 [关键词](http://www.aisixiang.com/zhuanti/)
  :::

## 哔哩轻小说 <Site url="linovelib.com"/>

### 卷 <Site url="linovelib.com" size="sm" />

<Route namespace="linovelib" :data='{"path":"/volume/:id","categories":["reading"],"example":"/linovelib/volume/8","parameters":{"id":"小说 ID，可在小说页 URL 中找到"},"radar":[{"source":["www.linovelib.com/novel/:id/catalog"]}],"name":"卷","maintainers":["rkscv"],"location":"volume.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 小说更新 <Site url="linovelib.com" size="sm" />

<Route namespace="linovelib" :data='{"path":"/novel/:id","categories":["reading"],"example":"/linovelib/novel/2547","parameters":{"id":"小说 id，对应书架开始阅读 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"小说更新","maintainers":["misakicoca"],"location":"novel.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 超星 <Site url="chaoxing.com"/>

### 期刊 <Site url="chaoxing.com" size="sm" />

<Route namespace="chaoxing" :data='{"path":"/qk/:id/:needContent?","categories":["reading"],"example":"/chaoxing/qk/6b5c39b3dd84352be512e29df0297437","parameters":{"id":"期刊 id，可在期刊页 URL 中找到","needContent":"需要获取文章全文，填写 true/yes 表示需要，默认需要"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"期刊","maintainers":["nczitzk"],"description":":::tip\n  全部期刊可以在 [这里](http://qk.chaoxing.com/space/index) 找到，你也可以从 [学科分类](https://qikan.chaoxing.com/jourclassify) 和 [期刊导航](https://qikan.chaoxing.com/search/openmag) 中发现更多期刊。\n\n  如订阅 [**上海文艺**](http://m.chaoxing.com/mqk/list?sw=&mags=6b5c39b3dd84352be512e29df0297437&isort=20&from=space)，其 URL 为 `http://m.chaoxing.com/mqk/list?mags=6b5c39b3dd84352be512e29df0297437`。`6b5c39b3dd84352be512e29df0297437` 即为期刊 id，所得路由为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437)\n  :::\n\n  :::warning\n  你可以设置参数 **需要获取文章全文** 为 `true` `yes` `t` `y` 等值（或者忽略这个参数），RSS 的条目会携带期刊中的 **文章全文**，而不仅仅是 **文章概要**。但因为发起访问请求过多会被该网站屏蔽，你可以将其关闭（设置该参数为 `false` `no` `f` `n` 等值），这将会大大减少请求次数从而更难触发网站的反爬机制。\n\n  路由默认会获取 **30** 个条目。在路由后指定 `?limit=<条目数量>` 减少或增加单次获取条目数量，同样可以减少请求次数，如设置为一次获取 **10** 个条目，路由可以更改为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10)\n\n  在根据上文设置 **需要获取文章全文** 为不需要时，你可以将 `limit` 值增大，从而获取更多的条目，此时因为不获取全文也不会触发反爬机制，如 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100)\n  :::","location":"qk.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

:::tip
  全部期刊可以在 [这里](http://qk.chaoxing.com/space/index) 找到，你也可以从 [学科分类](https://qikan.chaoxing.com/jourclassify) 和 [期刊导航](https://qikan.chaoxing.com/search/openmag) 中发现更多期刊。

  如订阅 [**上海文艺**](http://m.chaoxing.com/mqk/list?sw=&mags=6b5c39b3dd84352be512e29df0297437&isort=20&from=space)，其 URL 为 `http://m.chaoxing.com/mqk/list?mags=6b5c39b3dd84352be512e29df0297437`。`6b5c39b3dd84352be512e29df0297437` 即为期刊 id，所得路由为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437)
  :::

  :::warning
  你可以设置参数 **需要获取文章全文** 为 `true` `yes` `t` `y` 等值（或者忽略这个参数），RSS 的条目会携带期刊中的 **文章全文**，而不仅仅是 **文章概要**。但因为发起访问请求过多会被该网站屏蔽，你可以将其关闭（设置该参数为 `false` `no` `f` `n` 等值），这将会大大减少请求次数从而更难触发网站的反爬机制。

  路由默认会获取 **30** 个条目。在路由后指定 `?limit=<条目数量>` 减少或增加单次获取条目数量，同样可以减少请求次数，如设置为一次获取 **10** 个条目，路由可以更改为 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437?limit=10)

  在根据上文设置 **需要获取文章全文** 为不需要时，你可以将 `limit` 值增大，从而获取更多的条目，此时因为不获取全文也不会触发反爬机制，如 [`/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100`](https://rsshub.app/chaoxing/qk/6b5c39b3dd84352be512e29df0297437/false?limit=100)
  :::

## 刺猬猫 <Site url="wap.ciweimao.com"/>

### 章节 <Site url="wap.ciweimao.com" size="sm" />

<Route namespace="ciweimao" :data='{"path":"/chapter/:id","categories":["reading"],"example":"/ciweimao/chapter/100043404","parameters":{"id":"小说 id, 可在对应小说页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wap.ciweimao.com/book/:id"]}],"name":"章节","maintainers":["keocheung"],"location":"chapter.ts"}' :test='{"code":0}' />

## 東立出版社 <Site url="tongli.com.tw"/>

### 新聞 <Site url="tongli.com.tw" size="sm" />

<Route namespace="tongli" :data='{"path":"/news/:type","categories":["reading"],"example":"/tongli/news/6","parameters":{"type":"分類，可以在“新聞”鏈接中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新聞","maintainers":["CokeMine"],"location":"news.ts"}' :test='{"code":0}' />

## 欢乐书客 <Site url="hbooker.com"/>

### 章节 <Site url="hbooker.com" size="sm" />

<Route namespace="hbooker" :data='{"path":"/chapter/:id","categories":["reading"],"example":"/hbooker/chapter/100113279","parameters":{"id":"小说 id, 可在对应小说页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hbooker.com/book/:id"]}],"name":"章节","maintainers":["keocheung"],"location":"chapter.ts"}' :test='{"code":0}' />

## 晋江文学城 <Site url="jjwxc.net"/>

### 作者最新作品 <Site url="jjwxc.net" size="sm" />

<Route namespace="jjwxc" :data='{"path":"/author/:id?","categories":["reading"],"example":"/jjwxc/author/4364484","parameters":{"id":"作者 id，可在对应作者页中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"作者最新作品","maintainers":["nczitzk"],"location":"author.ts"}' :test='{"code":0}' />

### 作品 <Site url="jjwxc.net" size="sm" />

<Route namespace="jjwxc" :data='{"path":"/book/:id?","categories":["reading"],"example":"/jjwxc/book/7013024","parameters":{"id":"作品 id，可在对应作品页中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"作品","maintainers":["nczitzk"],"location":"book.ts"}' :test='{"code":0}' />

## 明月中文网 <Site url="56kog.com"/>

### 榜单 <Site url="56kog.com" size="sm" />

<Route namespace="56kog" :data='{"path":"/top/:category?","categories":["reading"],"example":"/56kog/top/weekvisit","parameters":{"category":"分类，见下表，默认为周点击榜"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"榜单","maintainers":["nczitzk"],"description":"| [周点击榜](https://www.56kog.com/top/weekvisit.html) | [总收藏榜](https://www.56kog.com/top/goodnum.html) | [最新 入库](https://www.56kog.com/top/postdate.html) |\n  | ---------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |\n  | weekvisit                                            | goodnum                                            | postdate                                             |","location":"top.ts"}' :test='undefined' />

| [周点击榜](https://www.56kog.com/top/weekvisit.html) | [总收藏榜](https://www.56kog.com/top/goodnum.html) | [最新 入库](https://www.56kog.com/top/postdate.html) |
  | ---------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
  | weekvisit                                            | goodnum                                            | postdate                                             |

### 分类 <Site url="56kog.com" size="sm" />

<Route namespace="56kog" :data='{"path":"/class/:category?","categories":["reading"],"example":"/56kog/class/1_1","parameters":{"category":"分类，见下表，默认为玄幻魔法"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["nczitzk"],"description":"| [玄幻魔法](https://www.56kog.com/class/1_1.html) | [武侠修真](https://www.56kog.com/class/2_1.html) | [历史军事](https://www.56kog.com/class/4_1.html) | [侦探推理](https://www.56kog.com/class/5_1.html) | [网游动漫](https://www.56kog.com/class/6_1.html) |\n  | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |\n  | 1_1                                             | 2_1                                             | 4_1                                             | 5_1                                             | 6_1                                             |\n\n  | [恐怖灵异](https://www.56kog.com/class/8_1.html) | [都市言情](https://www.56kog.com/class/3_1.html) | [科幻](https://www.56kog.com/class/7_1.html) | [女生小说](https://www.56kog.com/class/9_1.html) | [其他](https://www.56kog.com/class/10_1.html) |\n  | ------------------------------------------------ | ------------------------------------------------ | -------------------------------------------- | ------------------------------------------------ | --------------------------------------------- |\n  | 8_1                                             | 3_1                                             | 7_1                                         | 9_1                                             | 10_1                                         |","location":"class.ts"}' :test='undefined' />

| [玄幻魔法](https://www.56kog.com/class/1_1.html) | [武侠修真](https://www.56kog.com/class/2_1.html) | [历史军事](https://www.56kog.com/class/4_1.html) | [侦探推理](https://www.56kog.com/class/5_1.html) | [网游动漫](https://www.56kog.com/class/6_1.html) |
  | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
  | 1_1                                             | 2_1                                             | 4_1                                             | 5_1                                             | 6_1                                             |

  | [恐怖灵异](https://www.56kog.com/class/8_1.html) | [都市言情](https://www.56kog.com/class/3_1.html) | [科幻](https://www.56kog.com/class/7_1.html) | [女生小说](https://www.56kog.com/class/9_1.html) | [其他](https://www.56kog.com/class/10_1.html) |
  | ------------------------------------------------ | ------------------------------------------------ | -------------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
  | 8_1                                             | 3_1                                             | 7_1                                         | 9_1                                             | 10_1                                         |

## 起点 <Site url="book.qidian.com"/>

### 讨论区 <Site url="book.qidian.com" size="sm" />

<Route namespace="qidian" :data='{"path":"/forum/:id","categories":["reading"],"example":"/qidian/forum/1010400217","parameters":{"id":"小说 id, 可在对应小说页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["book.qidian.com/info/:id"]}],"name":"讨论区","maintainers":["fuzy112"],"location":"forum.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 限时免费下期预告 <Site url="www.qidian.com/free" size="sm" />

<Route namespace="qidian" :data='{"path":"/free-next/:type?","categories":["reading"],"example":"/qidian/free-next","parameters":{"type":"默认不填为起点中文网，填 mm 为起点女生网"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.qidian.com/free"],"target":"/free"}],"name":"限时免费下期预告","maintainers":["LogicJake"],"url":"www.qidian.com/free","location":"free-next.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 限时免费 <Site url="www.qidian.com/free" size="sm" />

<Route namespace="qidian" :data='{"path":"/free/:type?","categories":["reading"],"example":"/qidian/free","parameters":{"type":"默认不填为起点中文网，填 mm 为起点女生网"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.qidian.com/free"],"target":"/free"}],"name":"限时免费","maintainers":["LogicJake"],"url":"www.qidian.com/free","location":"free.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 章节 <Site url="book.qidian.com" size="sm" />

<Route namespace="qidian" :data='{"path":"/chapter/:id","categories":["reading"],"example":"/qidian/chapter/1010400217","parameters":{"id":"小说 id, 可在对应小说页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["book.qidian.com/info/:id"]}],"name":"章节","maintainers":["fuzy112"],"location":"chapter.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 作者 <Site url="book.qidian.com" size="sm" />

<Route namespace="qidian" :data='{"path":"/author/:id","categories":["reading"],"example":"/qidian/author/9639927","parameters":{"id":"作者 id, 可在作者页面 URL 找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["my.qidian.com/author/:id"]}],"name":"作者","maintainers":["miles170"],"location":"author.ts"}' :test='{"code":0}' />

## 轻小说文库 <Site url="www.wenku8.net"/>

### Unknown <Site url="www.wenku8.net" size="sm" />

<Route namespace="wenku8" :data='{"path":"/:category?","name":"Unknown","maintainers":["Fatpandac"],"location":"index.ts"}' :test='undefined' />

### 章节 <Site url="www.wenku8.net" size="sm" />

<Route namespace="wenku8" :data='{"path":"/chapter/:id","categories":["reading"],"example":"/wenku8/chapter/74","parameters":{"id":"小说 id, 可在对应小说页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"章节","maintainers":["zsakvo"],"location":"chapter.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 最新卷 <Site url="www.wenku8.net" size="sm" />

<Route namespace="wenku8" :data='{"path":"/volume/:id","categories":["reading"],"example":"/wenku8/volume/1163","parameters":{"id":"小说 id, 可在对应小说页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新卷","maintainers":["huangliangshusheng"],"location":"volume.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 日本語多読道場 <Site url="yomujp.com"/>

### 等级 <Site url="yomujp.com/" size="sm" />

<Route namespace="yomujp" :data='{"path":"/:level?","categories":["reading"],"example":"/yomujp/n1","parameters":{"level":"等级，n1~n6，为空默认全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yomujp.com/","yomujp.com/:level"],"target":"/:level"}],"name":"等级","maintainers":["eternasuno"],"url":"yomujp.com/","location":"level.ts"}' :test='{"code":0}' />

## 书伴 <Site url="bookfere.com"/>

### 分类 <Site url="bookfere.com" size="sm" />

<Route namespace="bookfere" :data='{"path":"/:category","categories":["reading"],"example":"/bookfere/skills","parameters":{"category":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["OdinZhang"],"description":"| 每周一书 | 使用技巧 | 图书推荐 | 新闻速递 | 精选短文 |\n  | -------- | -------- | -------- | -------- | -------- |\n  | weekly   | skills   | books    | news     | essay    |","location":"category.ts"}' :test='{"code":0}' />

| 每周一书 | 使用技巧 | 图书推荐 | 新闻速递 | 精选短文 |
  | -------- | -------- | -------- | -------- | -------- |
  | weekly   | skills   | books    | news     | essay    |

