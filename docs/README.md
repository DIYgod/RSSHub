---
search: zh-Hans
---

# RSSHub

🍭 使用 RSS 连接全世界

RSSHub 是一个轻量、易于扩展的 RSS 生成器，可以给任何奇奇怪怪的内容生成 RSS 订阅源

## 参与我们

如果有任何想法或需求，可以在 [issue](https://github.com/DIYgod/RSSHub/issues) 中告诉我们，同时我们欢迎各种 pull requests

可以通过以下途径参与讨论：

- [Telegram 群](https://t.me/rsshub)
- [QQ 群](https://jq.qq.com/?_wv=1027&k=5kIvhps): 711799039

## 使用

域名为 rss.now.sh，缓存时间 5 分钟

下面是目前支持的内容

### bilibili

#### 番剧

举例: https://rss.now.sh/bilibili/bangumi/21680

路由: `/bilibili/bangumi/:seasonid`

参数: seasonid，番剧 id，可在番剧主页 URL 中找到

#### UP 主投稿

举例: https://rss.now.sh/bilibili/user/video/2267573

路由: `/bilibili/user/video/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

#### UP 主动态

举例: https://rss.now.sh/bilibili/user/dynamic/2267573

路由: `/bilibili/user/dynamic/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

#### UP 主收藏夹

举例: https://rss.now.sh/bilibili/user/fav/2267573

路由: `/bilibili/user/fav/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

#### UP 主投币视频

举例: https://rss.now.sh/bilibili/user/coin/2267573

路由: `/bilibili/user/coin/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

#### 分区视频

举例: https://rss.now.sh/bilibili/partion/33

路由: `/bilibili/partion/:tid`

参数: tid，分区 id

动画

| MAD·AMV | MMD·3D | 短片·手书·配音 | 综合   |
| ------- | ------ | -------- | ---- |
| 24      | 25     | 47       | 27   |

番剧

| 连载动画 | 完结动画 | 资讯   | 官方延伸 |
| ---- | ---- | ---- | ---- |
| 33   | 32   | 51   | 152  |

国创

| 国产动画 | 国产原创相关 | 布袋戏  | 资讯   |
| ---- | ------ | ---- | ---- |
| 153  | 168    | 169  | 170  |

音乐

| 原创音乐 | 翻唱   | VOCALOID·UTAU | 演奏   | 三次元音乐 | OP/ED/OST | 音乐选集 |
| ---- | ---- | ------------- | ---- | ----- | --------- | ---- |
| 28   | 31   | 30            | 59   | 29    | 54        | 130  |

舞蹈

| 宅舞   | 三次元舞蹈 | 舞蹈教程 |
| ---- | ----- | ---- |
| 20   | 154   | 156  |

游戏

| 单机游戏 | 电子竞技 | 手机游戏 | 网络游戏 | 桌游棋牌 | GMV  | 音游   | Mugen |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- |
| 17   | 171  | 172  | 65   | 173  | 121  | 136  | 19    |

科技

| 趣味科普人文 | 野生技术协会 | 演讲·公开课 | 星海   | 数码   | 机械   | 汽车   |
| ------ | ------ | ------ | ---- | ---- | ---- | ---- |
| 124    | 122    | 39     | 96   | 95   | 98   | 176  |

生活

| 搞笑   | 日常   | 美食圈  | 动物圈  | 手工   | 绘画   | ASMR | 运动   | 其他   |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 138  | 21   | 76   | 75   | 161  | 162  | 175  | 163  | 174  |

鬼畜

| 鬼畜调教 | 音MAD | 人力VOCALOID | 教程演示 |
| ---- | ---- | ---------- | ---- |
| 22   | 26   | 126        | 127  |

s

| 美妆   | 服饰   | 健身   | 资讯   |
| ---- | ---- | ---- | ---- |
| 157  | 158  | 164  | 159  |

广告

| 广告   |
| ---- |
| 166  |

娱乐

| 综艺   | 明星   | Korea相关 |
| ---- | ---- | ------- |
| 71   | 137  | 131     |

影视

| 影视杂谈 | 影视剪辑 | 短片   | 预告·资讯 | 特摄   |
| ---- | ---- | ---- | ----- | ---- |
| 182  | 183  | 85   | 184   | 86   |


### 微博

#### 博主

举例: https://rss.now.sh/weibo/user/3306934123

路由: `/weibo/user/:uid`

参数: uid，用户 id，博主主页打开控制台执行 `/uid=(\d+)/. exec(document.querySelector('.opt_box .btn_bed').getAttribute('action-data'))[1]` 获取

### 网易云音乐

#### 歌单歌曲

举例: https://rss.now.sh/ncm/playlist/35798529

路由: `/ncm/playlist/:id`

参数: id，歌单 id，可在歌单页 URL 中找到

#### 用户歌单

举例: https://rss.now.sh/ncm/user/playlist/45441555

路由: `/ncm/user/playlist/:uid`

参数: uid，用户 uid，可在用户主页 URL 中找到

#### 歌手专辑

举例: https://rss.now.sh/ncm/artist/2116

路由: `/ncm/artist/:id`

参数: id，歌手 id，可在歌手详情页 URL 中找到

### 掘金

#### 分类

举例: https://rss.now.sh/juejin/category/frontend

路由: `/juejin/category/:category`

参数: category，分类名

| 前端       | Android | iOS  | 后端      | 设计     | 产品      | 工具资源    | 阅读      | 人工智能 |
| -------- | ------- | ---- | ------- | ------ | ------- | ------- | ------- | ---- |
| frontend | android | ios  | backend | design | product | freebie | article | ai   |

### 简书

#### 首页

举例: https://rss.now.sh/jianshu/home

路由: `/jianshu/home`

参数: 无

#### 7 日热门

举例: https://rss.now.sh/jianshu/trending/weekly

路由: `/jianshu/trending/weekly`

参数: 无

#### 30 日热门

举例: https://rss.now.sh/jianshu/trending/monthly

路由: `/jianshu/trending/monthly`

参数: 无

#### 专题

举例: https://rss.now.sh/jianshu/collection/xYuZYD

路由: `/jianshu/collection/:id`

参数: id，专题 id，可在专题页 URL 中找到

#### 作者

举例: https://rss.now.sh/jianshu/user/yZq3ZV

路由: `/jianshu/user/:id`

参数: id，作者 id，可在作者主页 URL 中找到


### 知乎

#### 收藏夹

举例: https://rss.now.sh/zhihu/collection/26444956

路由: `/zhihu/collection/:id`

参数: id，收藏夹 id，可在收藏夹页面 URL 中找到

#### 用户动态

举例: https://rss.now.sh/zhihu/people/activities/diygod

路由: `/zhihu/people/activities/:id`

参数: id，用户 id，可在用户主页 URL 中找到

#### 专栏

举例: https://rss.now.sh/zhihu/zhuanlan/googledevelopers

路由: `/zhihu/zhuanlan/:id`

参数: id，专栏 id，可在专栏主页 URL 中找到

### 自如

#### 房源

举例: https://rss.now.sh/ziroom/room/sh/1/2/五角场

路由: `/ziroom/room/:city/:iswhole/:room/:keyword`

参数

city: 城市，北京 bj；上海 sh；深圳 sz；杭州 hz；南京 nj；广州 gz；成都 cd；武汉 wh；天津 tj

iswhole: 是否整租

room: 房间数

keyword: 关键词

### 快递

<p class="warning">
  快递送达后请及时取消订阅，以免不必要地浪费服务器资源
</p>

举例: https://rss.now.sh/express/youzhengguoji/CV054432809US

路由: `/express/:company/:number`

参数

company: 快递公司代码，参考 [API URL 所支持的快递公司及参数说明](https://www.kuaidi100.com/download/api_kuaidi100_com%2820140729%29.doc)

number: 快递单号

### 贴吧

<p class="warning">
  吧名如果包含中文，应该使用 `encodeURIComponent` 编码后使用
</p>

#### 帖子列表

举例: https://rss.now.sh/tieba/forum/女图

路由: `/tieba/forum/:kw`

参数: kw，吧名

### 妹子图

#### 首页（最新）

举例: https://rss.now.sh/mzitu

路由: `/mzitu/`

#### 分类

举例: https://rss.now.sh/mzitu/category/hot

路由: `/mzitu/category/:category`

参数：category，分类名

| 热门     | 推荐 | 性感妹子  | 日本妹子      | 台湾妹子     | 清纯妹子 |
| -------- | ------- | ---- | ------- | ------ | ------- |
| hot | best | xinggan  | japan | taiwan | mm  |


#### 所有专题

举例: https://rss.now.sh/mzitu/tags

路由: `/mzitu/tags`

#### 专题详情

举例: https://rss.now.sh/mzitu/tag/shishen

路由: `/mzitu/tag/:tag`

参数: tag，专题名，可在专题页 URL 中找到

#### 详情

举例: https://rss.now.sh/mzitu/post/129452

路由: `/mzitu/post/:id`

参数: id，详情 id，可在详情页 URL 中找到

### pixiv

#### 用户动态

举例: https://rss.now.sh/pixiv/user/11

路由: `/pixiv/user/:id`

参数: id，用户 id，可在用户主页 URL 中找到

### 豆瓣

#### 正在上映的电影

举例: https://rss.now.sh/douban/movie/playing

路由: `/douban/movie/playing`

参数: 无

#### 正在上映的高分电影

举例: https://rss.now.sh/douban/movie/playing/7.5

路由

`/douban/movie/playing/:score`

`/douban/movie/playing/:score/:city`

参数

score: 返回大于等于这个分数的电影

city: 城市的中文名，可选，默认北京

#### 即将上映的电影

举例: https://rss.now.sh/douban/movie/later

路由: `/douban/movie/later`

参数: 无

#### 北美票房榜

举例: https://rss.now.sh/douban/movie/ustop

路由: `/douban/movie/ustop`

参数: 无

### 煎蛋

#### 无聊图

举例: https://rss.now.sh/jandan/pic

路由: `/jandan/pic`

参数: 无

## 搭建

环境：需要 Node.js v7.6.0 或更高版本，若启用 Redis 缓存需要先启动 Redis

安装依赖：`yarn`

修改配置：配置文件为 `config.js`

启动程序：`node index.js`
