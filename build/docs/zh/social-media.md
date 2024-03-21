# 💬 社交媒体

## Bilibili <Site url="www.bilibili.com"/>

### B 站每周必看 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/weekly/:disableEmbed?","categories":["social-media"],"example":"/bilibili/weekly","parameters":{"disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"B 站每周必看","maintainers":["ttttmr"],"location":"weekly-recommend.ts"}' />

### link 公告 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/link/news/:product","categories":["social-media"],"example":"/bilibili/link/news/live","parameters":{"product":"公告分类, 包括 直播:live 小视频:vc 相簿:wh"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"link 公告","maintainers":["Qixingchen"],"location":"link-news.ts"}' />

### UP 主专栏 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/article/:uid","categories":["social-media"],"example":"/bilibili/user/article/334958638","parameters":{"uid":"用户 id, 可在 UP 主主页中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"]}],"name":"UP 主专栏","maintainers":["lengthmin","Qixingchen"],"location":"article.ts"}' />

### UP 主投币视频 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/coin/:uid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/user/coin/208259","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"],"target":"/user/coin/:uid"}],"name":"UP 主投币视频","maintainers":["DIYgod"],"location":"coin.ts"}' />

### UP 主动态 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/dynamic/:uid/:routeParams?","categories":["social-media"],"example":"/bilibili/user/dynamic/2267573","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","routeParams":"额外参数；请参阅以下说明和表格"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"],"target":"/user/dynamic/:uid"}],"name":"UP 主动态","maintainers":["DIYgod","zytomorrow","CaoMeiYouRen","JimenezLi"],"description":"| 键           | 含义                              | 接受的值       | 默认值 |\n  | ------------ | --------------------------------- | -------------- | ------ |\n  | showEmoji    | 显示或隐藏表情图片                | 0/1/true/false | false  |\n  | disableEmbed | 关闭内嵌视频                      | 0/1/true/false | false  |\n  | useAvid      | 视频链接使用 AV 号 (默认为 BV 号) | 0/1/true/false | false  |\n  | directLink   | 使用内容直链                      | 0/1/true/false | false  |\n\n  用例：`/bilibili/user/dynamic/2267573/showEmoji=1&disableEmbed=1&useAvid=1`\n\n  :::tip 动态的专栏显示全文\n  动态的专栏显示全文请使用通用参数里的 `mode=fulltext`\n\n  举例: bilibili 专栏全文输出 /bilibili/user/dynamic/2267573/?mode=fulltext\n  :::","location":"dynamic.ts"}' />

| 键           | 含义                              | 接受的值       | 默认值 |
  | ------------ | --------------------------------- | -------------- | ------ |
  | showEmoji    | 显示或隐藏表情图片                | 0/1/true/false | false  |
  | disableEmbed | 关闭内嵌视频                      | 0/1/true/false | false  |
  | useAvid      | 视频链接使用 AV 号 (默认为 BV 号) | 0/1/true/false | false  |
  | directLink   | 使用内容直链                      | 0/1/true/false | false  |

  用例：`/bilibili/user/dynamic/2267573/showEmoji=1&disableEmbed=1&useAvid=1`

  :::tip 动态的专栏显示全文
  动态的专栏显示全文请使用通用参数里的 `mode=fulltext`

  举例: bilibili 专栏全文输出 /bilibili/user/dynamic/2267573/?mode=fulltext
  :::

### UP 主非默认收藏夹 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/fav/:uid/:fid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/fav/756508/50948568","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","fid":"收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"UP 主非默认收藏夹","maintainers":["Qixingchen"],"location":"fav.ts"}' />

### UP 主粉丝 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/followers/:uid/:loginUid","categories":["social-media"],"example":"/bilibili/user/followers/2267573/3","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","loginUid":"用于登入的用户id,需要配置对应的 Cookie 值"},"features":{"requireConfig":[{"name":"BILIBILI_COOKIE_*","description":"BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：\n1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)\n2.  打开控制台，切换到 Network 面板，刷新\n3.  点击 dynamic_new 请求，找到 Cookie\n4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie"}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"],"target":"/user/followers/:uid"}],"name":"UP 主粉丝","maintainers":["Qixingchen"],"description":":::warning\n  UP 主粉丝现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"followers.ts"}' />

:::warning
  UP 主粉丝现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### UP 主关注用户 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/followings/:uid/:loginUid","categories":["social-media"],"example":"/bilibili/user/followings/2267573/3","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","loginUid":"用于登入的用户id,需要配置对应的 Cookie 值"},"features":{"requireConfig":[{"name":"BILIBILI_COOKIE_*","description":"BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：\n    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)\n    2.  打开控制台，切换到 Network 面板，刷新\n    3.  点击 dynamic_new 请求，找到 Cookie\n    4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie"}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"],"target":"/user/followings/:uid"}],"name":"UP 主关注用户","maintainers":["Qixingchen"],"description":":::warning\n  UP 主关注用户现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"followings.ts"}' />

:::warning
  UP 主关注用户现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### UP 主点赞视频 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/like/:uid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/user/like/208259","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"],"target":"/user/like/:uid"}],"name":"UP 主点赞视频","maintainers":["ygguorun"],"location":"like.ts"}' />

### UP 主频道的视频列表 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/channel/:uid/:sid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/user/channel/2267573/396050","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","sid":"频道 id, 可在频道的 URL 中找到","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"UP 主频道的视频列表","maintainers":["weirongxu"],"location":"user-channel.ts"}' />

### UP 主频道的合集 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/collection/:uid/:sid/:disableEmbed?/:sortReverse?/:page?","categories":["social-media"],"example":"/bilibili/user/collection/245645656/529166","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","sid":"合集 id, 可在合集页面的 URL 中找到","disableEmbed":"默认为开启内嵌视频, 任意值为关闭","sortReverse":"默认:默认排序 1:升序排序","page":"页码, 默认1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"UP 主频道的合集","maintainers":["shininome"],"location":"user-collection.ts"}' />

### UP 主默认收藏夹 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/fav/:uid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/user/fav/2267573","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid","space.bilibili.com/:uid/favlist"],"target":"/user/fav/:uid"}],"name":"UP 主默认收藏夹","maintainers":["DIYgod"],"location":"user-fav.ts"}' />

### UP 主投稿 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/video/:uid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/user/video/2267573","parameters":{"uid":"用户 id, 可在 UP 主主页中找到","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"],"target":"/user/video/:uid"}],"name":"UP 主投稿","maintainers":["DIYgod"],"description":":::tip 动态的专栏显示全文\n  可以使用 [UP 主动态](#bilibili-up-zhu-dong-tai)路由作为代替绕过反爬限制\n  :::","location":"video.ts"}' />

:::tip 动态的专栏显示全文
  可以使用 [UP 主动态](#bilibili-up-zhu-dong-tai)路由作为代替绕过反爬限制
  :::

### 番剧 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/bangumi/media/:mediaid","name":"番剧","parameters":{"mediaid":"番剧媒体 id, 番剧主页 URL 中获取"},"example":"/bilibili/bangumi/media/9192","categories":["social-media"],"maintainers":["DIYgod"],"location":"bangumi.ts"}' />

### 分区视频排行榜 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/partion/ranking/:tid/:days?/:disableEmbed?","categories":["social-media"],"example":"/bilibili/partion/ranking/171/3","parameters":{"tid":"分区 id, 见上方表格","days":"缺省为 7, 指最近多少天内的热度排序","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分区视频排行榜","maintainers":["lengthmin"],"location":"partion-ranking.ts"}' />

### 分区视频 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/partion/:tid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/partion/33","parameters":{"tid":"分区 id","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分区视频","maintainers":["DIYgod"],"description":"动画\n\n  | MAD·AMV | MMD·3D | 短片・手书・配音 | 特摄 | 综合 |\n  | ------- | ------ | ---------------- | ---- | ---- |\n  | 24      | 25     | 47               | 86   | 27   |\n\n  番剧\n\n  | 连载动画 | 完结动画 | 资讯 | 官方延伸 |\n  | -------- | -------- | ---- | -------- |\n  | 33       | 32       | 51   | 152      |\n\n  国创\n\n  | 国产动画 | 国产原创相关 | 布袋戏 | 动态漫・广播剧 | 资讯 |\n  | -------- | ------------ | ------ | -------------- | ---- |\n  | 153      | 168          | 169    | 195            | 170  |\n\n  音乐\n\n  | 原创音乐 | 翻唱 | VOCALOID·UTAU | 电音 | 演奏 | MV  | 音乐现场 | 音乐综合 | ~~OP/ED/OST~~ |\n  | -------- | ---- | ------------- | ---- | ---- | --- | -------- | -------- | ------------- |\n  | 28       | 31   | 30            | 194  | 59   | 193 | 29       | 130      | 54            |\n\n  舞蹈\n\n  | 宅舞 | 街舞 | 明星舞蹈 | 中国舞 | 舞蹈综合 | 舞蹈教程 |\n  | ---- | ---- | -------- | ------ | -------- | -------- |\n  | 20   | 198  | 199      | 200    | 154      | 156      |\n\n  游戏\n\n  | 单机游戏 | 电子竞技 | 手机游戏 | 网络游戏 | 桌游棋牌 | GMV | 音游 | Mugen |\n  | -------- | -------- | -------- | -------- | -------- | --- | ---- | ----- |\n  | 17       | 171      | 172      | 65       | 173      | 121 | 136  | 19    |\n\n  知识\n\n  | 科学科普 | 社科人文 | 财经 | 校园学习 | 职业职场 | 野生技术协会 |\n  | -------- | -------- | ---- | -------- | -------- | ------------ |\n  | 201      | 124      | 207  | 208      | 209      | 122          |\n\n  ~~科技~~\n\n  | ~~演讲・公开课~~ | ~~星海~~ | ~~机械~~ | ~~汽车~~ |\n  | ---------------- | -------- | -------- | -------- |\n  | 39               | 96       | 98       | 176      |\n\n  数码\n\n  | 手机平板 | 电脑装机 | 摄影摄像 | 影音智能 |\n  | -------- | -------- | -------- | -------- |\n  | 95       | 189      | 190      | 191      |\n\n  生活\n\n  | 搞笑 | 日常 | 美食圈 | 动物圈 | 手工 | 绘画 | 运动 | 汽车 | 其他 | ~~ASMR~~ |\n  | ---- | ---- | ------ | ------ | ---- | ---- | ---- | ---- | ---- | -------- |\n  | 138  | 21   | 76     | 75     | 161  | 162  | 163  | 176  | 174  | 175      |\n\n  鬼畜\n\n  | 鬼畜调教 | 音 MAD | 人力 VOCALOID | 教程演示 |\n  | -------- | ------ | ------------- | -------- |\n  | 22       | 26     | 126           | 127      |\n\n  时尚\n\n  | 美妆 | 服饰 | 健身 | T 台 | 风向标 |\n  | ---- | ---- | ---- | ---- | ------ |\n  | 157  | 158  | 164  | 159  | 192    |\n\n  ~~广告~~\n\n  | ~~广告~~ |\n  | -------- |\n  | 166      |\n\n  资讯\n\n  | 热点 | 环球 | 社会 | 综合 |\n  | ---- | ---- | ---- | ---- |\n  | 203  | 204  | 205  | 206  |\n\n  娱乐\n\n  | 综艺 | 明星 | Korea 相关 |\n  | ---- | ---- | ---------- |\n  | 71   | 137  | 131        |\n\n  影视\n\n  | 影视杂谈 | 影视剪辑 | 短片 | 预告・资讯 |\n  | -------- | -------- | ---- | ---------- |\n  | 182      | 183      | 85   | 184        |\n\n  纪录片\n\n  | 全部 | 人文・历史 | 科学・探索・自然 | 军事 | 社会・美食・旅行 |\n  | ---- | ---------- | ---------------- | ---- | ---------------- |\n  | 177  | 37         | 178              | 179  | 180              |\n\n  电影\n\n  | 全部 | 华语电影 | 欧美电影 | 日本电影 | 其他国家 |\n  | ---- | -------- | -------- | -------- | -------- |\n  | 23   | 147      | 145      | 146      | 83       |\n\n  电视剧\n\n  | 全部 | 国产剧 | 海外剧 |\n  | ---- | ------ | ------ |\n  | 11   | 185    | 187    |","location":"partion.ts"}' />

动画

  | MAD·AMV | MMD·3D | 短片・手书・配音 | 特摄 | 综合 |
  | ------- | ------ | ---------------- | ---- | ---- |
  | 24      | 25     | 47               | 86   | 27   |

  番剧

  | 连载动画 | 完结动画 | 资讯 | 官方延伸 |
  | -------- | -------- | ---- | -------- |
  | 33       | 32       | 51   | 152      |

  国创

  | 国产动画 | 国产原创相关 | 布袋戏 | 动态漫・广播剧 | 资讯 |
  | -------- | ------------ | ------ | -------------- | ---- |
  | 153      | 168          | 169    | 195            | 170  |

  音乐

  | 原创音乐 | 翻唱 | VOCALOID·UTAU | 电音 | 演奏 | MV  | 音乐现场 | 音乐综合 | ~~OP/ED/OST~~ |
  | -------- | ---- | ------------- | ---- | ---- | --- | -------- | -------- | ------------- |
  | 28       | 31   | 30            | 194  | 59   | 193 | 29       | 130      | 54            |

  舞蹈

  | 宅舞 | 街舞 | 明星舞蹈 | 中国舞 | 舞蹈综合 | 舞蹈教程 |
  | ---- | ---- | -------- | ------ | -------- | -------- |
  | 20   | 198  | 199      | 200    | 154      | 156      |

  游戏

  | 单机游戏 | 电子竞技 | 手机游戏 | 网络游戏 | 桌游棋牌 | GMV | 音游 | Mugen |
  | -------- | -------- | -------- | -------- | -------- | --- | ---- | ----- |
  | 17       | 171      | 172      | 65       | 173      | 121 | 136  | 19    |

  知识

  | 科学科普 | 社科人文 | 财经 | 校园学习 | 职业职场 | 野生技术协会 |
  | -------- | -------- | ---- | -------- | -------- | ------------ |
  | 201      | 124      | 207  | 208      | 209      | 122          |

  ~~科技~~

  | ~~演讲・公开课~~ | ~~星海~~ | ~~机械~~ | ~~汽车~~ |
  | ---------------- | -------- | -------- | -------- |
  | 39               | 96       | 98       | 176      |

  数码

  | 手机平板 | 电脑装机 | 摄影摄像 | 影音智能 |
  | -------- | -------- | -------- | -------- |
  | 95       | 189      | 190      | 191      |

  生活

  | 搞笑 | 日常 | 美食圈 | 动物圈 | 手工 | 绘画 | 运动 | 汽车 | 其他 | ~~ASMR~~ |
  | ---- | ---- | ------ | ------ | ---- | ---- | ---- | ---- | ---- | -------- |
  | 138  | 21   | 76     | 75     | 161  | 162  | 163  | 176  | 174  | 175      |

  鬼畜

  | 鬼畜调教 | 音 MAD | 人力 VOCALOID | 教程演示 |
  | -------- | ------ | ------------- | -------- |
  | 22       | 26     | 126           | 127      |

  时尚

  | 美妆 | 服饰 | 健身 | T 台 | 风向标 |
  | ---- | ---- | ---- | ---- | ------ |
  | 157  | 158  | 164  | 159  | 192    |

  ~~广告~~

  | ~~广告~~ |
  | -------- |
  | 166      |

  资讯

  | 热点 | 环球 | 社会 | 综合 |
  | ---- | ---- | ---- | ---- |
  | 203  | 204  | 205  | 206  |

  娱乐

  | 综艺 | 明星 | Korea 相关 |
  | ---- | ---- | ---------- |
  | 71   | 137  | 131        |

  影视

  | 影视杂谈 | 影视剪辑 | 短片 | 预告・资讯 |
  | -------- | -------- | ---- | ---------- |
  | 182      | 183      | 85   | 184        |

  纪录片

  | 全部 | 人文・历史 | 科学・探索・自然 | 军事 | 社会・美食・旅行 |
  | ---- | ---------- | ---------------- | ---- | ---------------- |
  | 177  | 37         | 178              | 179  | 180              |

  电影

  | 全部 | 华语电影 | 欧美电影 | 日本电影 | 其他国家 |
  | ---- | -------- | -------- | -------- | -------- |
  | 23   | 147      | 145      | 146      | 83       |

  电视剧

  | 全部 | 国产剧 | 海外剧 |
  | ---- | ------ | ------ |
  | 11   | 185    | 187    |

### 歌单 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/audio/:id","categories":["social-media"],"example":"/bilibili/audio/10624","parameters":{"id":"歌单 id, 可在歌单页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"歌单","maintainers":["LogicJake"],"location":"audio.ts"}' />

### 会员购作品 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/mall/ip/:id","categories":["social-media"],"example":"/bilibili/mall/ip/0_3000294","parameters":{"id":"作品 id, 可在作品列表页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"会员购作品","maintainers":["DIYgod"],"location":"mall-ip.ts"}' />

### 会员购新品上架 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/mall/new/:category?","categories":["social-media"],"example":"/bilibili/mall/new/1","parameters":{"category":"分类，默认全部，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"会员购新品上架","maintainers":["DIYgod"],"description":"| 全部 | 手办 | 魔力赏 | 周边 | 游戏 |\n  | ---- | ---- | ------ | ---- | ---- |\n  | 0    | 1    | 7      | 3    | 6    |","location":"mall-new.ts"}' />

| 全部 | 手办 | 魔力赏 | 周边 | 游戏 |
  | ---- | ---- | ------ | ---- | ---- |
  | 0    | 1    | 7      | 3    | 6    |

### 会员购票务 <Site url="show.bilibili.com/platform" size="sm" />

<Route namespace="bilibili" :data='{"path":"/platform/:area?/:p_type?/:uid?","categories":["social-media"],"example":"/bilibili/platform/-1","parameters":{"area":"省市-国标码,默认为-1即全国","p_type":"类型：见下表，默认为全部类型","uid":"用户id，可以不填，不过不填不设置cookie，搜索结果与登入账号后搜索结果不一样。可以在url中找到，需要配置cookie值，只需要SESSDATA的值即可"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["show.bilibili.com/platform"]}],"name":"会员购票务","maintainers":["nightmare-mio"],"url":"show.bilibili.com/platform","description":"| 类型     |\n| -------- |\n| 演出     |\n| 展览     |\n| 本地生活 |","location":"platform.ts"}' />

| 类型     |
| -------- |
| 演出     |
| 展览     |
| 本地生活 |

### 漫画更新 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/manga/update/:comicid","categories":["social-media"],"example":"/bilibili/manga/update/26009","parameters":{"comicid":"漫画 id, 可在 URL 中找到, 支持带有`mc`前缀"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["manga.bilibili.com/detail/:comicid"]}],"name":"漫画更新","maintainers":["hoilc"],"location":"manga-update.ts"}' />

### 排行榜 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/ranking/:rid?/:day?/:arc_type?/:disableEmbed?","name":"排行榜","maintainers":["DIYgod"],"categories":["social-media"],"example":"/bilibili/ranking/0/3/1","parameters":{"rid":"排行榜分区 id, 默认 0","day":"时间跨度, 可为 1 3 7 30","arc_type":"投稿时间, 可为 0(全部投稿) 1(近期投稿) , 默认 1","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"description":"| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 数码 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |\n    | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |\n    | 0    | 1    | 168      | 3    | 129  | 4    | 36   | 188  | 160  | 119  | 155  | 5    | 181  |","location":"ranking.ts"}' />

| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 数码 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |
    | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    | 0    | 1    | 168      | 3    | 129  | 4    | 36   | 188  | 160  | 119  | 155  | 5    | 181  |

### 热搜 <Site url="www.bilibili.com/" size="sm" />

<Route namespace="bilibili" :data='{"path":"/hot-search","categories":["social-media"],"example":"/bilibili/hot-search","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.bilibili.com/"]}],"name":"热搜","maintainers":["CaoMeiYouRen"],"url":"www.bilibili.com/","location":"hot-search.ts"}' />

### 视频弹幕 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/video/danmaku/:bvid/:pid?","categories":["social-media"],"example":"/bilibili/video/danmaku/BV1vA411b7ip/1","parameters":{"bvid":"视频AV号,可在视频页 URL 中找到","pid":"分P号,不填默认为1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"视频弹幕","maintainers":["Qixingchen"],"location":"danmaku.ts"}' />

### 视频选集列表 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/video/page/:bvid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/video/page/BV1i7411M7N9","parameters":{"bvid":"可在视频页 URL 中找到","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"视频选集列表","maintainers":["sxzz"],"location":"page.ts"}' />

### 视频评论 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/video/reply/:bvid","categories":["social-media"],"example":"/bilibili/video/reply/BV1vA411b7ip","parameters":{"bvid":"可在视频页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"视频评论","maintainers":["Qixingchen"],"location":"reply.ts"}' />

### 视频搜索 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/vsearch/:kw/:order?/:disableEmbed?/:tid?","categories":["social-media"],"example":"/bilibili/vsearch/RSSHub","parameters":{"kw":"检索关键字","order":"排序方式, 综合:totalrank 最多点击:click 最新发布:pubdate(缺省) 最多弹幕:dm 最多收藏:stow","disableEmbed":"默认为开启内嵌视频, 任意值为关闭","tid":"分区 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"视频搜索","maintainers":["Symty"],"description":"分区 id 的取值请参考下表：\n\n  | 全部分区 | 动画 | 番剧 | 国创 | 音乐 | 舞蹈 | 游戏 | 知识 | 科技 | 运动 | 汽车 | 生活 | 美食 | 动物圈 | 鬼畜 | 时尚 | 资讯 | 娱乐 | 影视 | 纪录片 | 电影 | 电视剧 |\n  | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ------ |\n  | 0        | 1    | 13   | 167  | 3    | 129  | 4    | 36   | 188  | 234  | 223  | 160  | 211  | 217    | 119  | 155  | 202  | 5    | 181  | 177    | 23   | 11     |","location":"vsearch.ts"}' />

分区 id 的取值请参考下表：

  | 全部分区 | 动画 | 番剧 | 国创 | 音乐 | 舞蹈 | 游戏 | 知识 | 科技 | 运动 | 汽车 | 生活 | 美食 | 动物圈 | 鬼畜 | 时尚 | 资讯 | 娱乐 | 影视 | 纪录片 | 电影 | 电视剧 |
  | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ------ |
  | 0        | 1    | 13   | 167  | 3    | 129  | 4    | 36   | 188  | 234  | 223  | 160  | 211  | 217    | 119  | 155  | 202  | 5    | 181  | 177    | 23   | 11     |

### 用户关注专栏 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/followings/article/:uid","categories":["social-media"],"example":"/bilibili/followings/article/99800931","parameters":{"uid":"用户 id"},"features":{"requireConfig":[{"name":"BILIBILI_COOKIE_*","description":"BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：\n    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)\n    2.  打开控制台，切换到 Network 面板，刷新\n    3.  点击 dynamic_new 请求，找到 Cookie\n    4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie"}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户关注专栏","maintainers":["woshiluo"],"description":":::warning\n  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"followings-article.ts"}' />

:::warning
  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### 用户关注动态 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/followings/dynamic/:uid/:routeParams?","categories":["social-media"],"example":"/bilibili/followings/dynamic/109937383","parameters":{"uid":"用户 id","routeParams":"额外参数；请参阅 [#UP 主动态](#bilibili-up-zhu-dong-tai) 的说明和表格"},"features":{"requireConfig":[{"name":"BILIBILI_COOKIE_*","description":"BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：\n    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)\n    2.  打开控制台，切换到 Network 面板，刷新\n    3.  点击 dynamic_new 请求，找到 Cookie\n    4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie"}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户关注动态","maintainers":["TigerCubDen","JimenezLi"],"description":":::warning\n  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"followings-dynamic.ts"}' />

:::warning
  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### 用户关注视频动态 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/followings/video/:uid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/followings/video/2267573","parameters":{"uid":"用户 id","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":[{"name":"BILIBILI_COOKIE_*","description":"BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：\n    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)\n    2.  打开控制台，切换到 Network 面板，刷新\n    3.  点击 dynamic_new 请求，找到 Cookie\n    4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie"}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户关注视频动态","maintainers":["LogicJake"],"description":":::warning\n  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"followings-video.ts"}' />

:::warning
  用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### 用户追漫更新 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/manga/followings/:uid/:limits?","categories":["social-media"],"example":"/bilibili/manga/followings/26009","parameters":{"uid":"用户 id","limits":"抓取最近更新前多少本漫画，默认为10"},"features":{"requireConfig":[{"name":"BILIBILI_COOKIE_*","description":"BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：\n    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)\n    2.  打开控制台，切换到 Network 面板，刷新\n    3.  点击 dynamic_new 请求，找到 Cookie\n    4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie"}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户追漫更新","maintainers":["yindaheng98"],"description":":::warning\n  用户追漫需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"manga-followings.ts"}' />

:::warning
  用户追漫需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### 用户追番列表 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/bangumi/:uid/:type?","categories":["social-media"],"example":"/bilibili/user/bangumi/208259","parameters":{"uid":"用户 id","type":"1为番，2为剧，留空为1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["space.bilibili.com/:uid"],"target":"/user/bangumi/:uid"}],"name":"用户追番列表","maintainers":["wdssmq"],"location":"user-bangumi.ts"}' />

### 用户所有视频 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/user/video-all/:uid/:disableEmbed?","name":"用户所有视频","maintainers":[],"categories":["social-media"],"location":"video-all.ts"}' />

### 用户稍后再看 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/watchlater/:uid/:disableEmbed?","categories":["social-media"],"example":"/bilibili/watchlater/2267573","parameters":{"uid":"用户 id","disableEmbed":"默认为开启内嵌视频, 任意值为关闭"},"features":{"requireConfig":[{"name":"BILIBILI_COOKIE_*","description":"BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，`{uid}` 替换为 uid，如 `BILIBILI_COOKIE_2267573`，获取方式：\n    1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)\n    2.  打开控制台，切换到 Network 面板，刷新\n    3.  点击 dynamic_new 请求，找到 Cookie\n    4.  视频和专栏，UP 主粉丝及关注只要求 `SESSDATA` 字段，动态需复制整段 Cookie"}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户稍后再看","maintainers":["JimenezLi"],"description":":::warning\n  用户稍后再看需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"watchlater.ts"}' />

:::warning
  用户稍后再看需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### 专栏文集 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/readlist/:listid","categories":["social-media"],"example":"/bilibili/readlist/25611","parameters":{"listid":"文集 id, 可在专栏文集 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"专栏文集","maintainers":["hoilc"],"location":"readlist.ts"}' />

### 综合热门 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/popular/all","categories":["social-media"],"example":"/bilibili/popular/all","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"综合热门","maintainers":["ziminliu"],"location":"popular.ts"}' />

## Bluesky (bsky) <Site url="bsky.app"/>

### Keywords <Site url="bsky.app" size="sm" />

<Route namespace="bsky" :data='{"path":"/keyword/:keyword","categories":["social-media"],"example":"/bsky/keyword/hello","parameters":{"keyword":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Keywords","maintainers":["untitaker"],"location":"keyword.ts"}' />

### Post <Site url="bsky.app" size="sm" />

<Route namespace="bsky" :data='{"path":"/profile/:handle","categories":["social-media"],"example":"/bsky/profile/bsky.app","parameters":{"handle":"User handle, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bsky.app/profile/:handle"]}],"name":"Post","maintainers":["TonyRL"],"location":"posts.ts"}' />

## Crossbell <Site url="crossbell.io"/>

### Feeds of following <Site url="crossbell.io" size="sm" />

<Route namespace="crossbell" :data='{"path":"/feeds/following/:characterId","categories":["social-media"],"example":"/crossbell/feeds/following/10","parameters":{"characterId":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Feeds of following","maintainers":["DIYgod"],"location":"feeds/following.ts"}' />

### Notes of character <Site url="crossbell.io/*" size="sm" />

<Route namespace="crossbell" :data='{"path":"/notes/character/:characterId","categories":["social-media"],"example":"/crossbell/notes/character/10","parameters":{"characterId":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["crossbell.io/*"],"target":"/notes"}],"name":"Notes of character","maintainers":["DIYgod"],"url":"crossbell.io/*","location":"notes/character.ts"}' />

### Notes <Site url="crossbell.io/*" size="sm" />

<Route namespace="crossbell" :data='{"path":"/notes","categories":["social-media"],"example":"/crossbell/notes","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["crossbell.io/*"]}],"name":"Notes","maintainers":["DIYgod"],"url":"crossbell.io/*","location":"notes/index.ts"}' />

### Notes of source <Site url="crossbell.io/*" size="sm" />

<Route namespace="crossbell" :data='{"path":"/notes/source/:source","categories":["social-media"],"example":"/crossbell/notes/source/xlog","parameters":{"source":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["crossbell.io/*"],"target":"/notes"}],"name":"Notes of source","maintainers":["DIYgod"],"url":"crossbell.io/*","location":"notes/source.ts"}' />

## Curius <Site url="curius.app"/>

### User <Site url="curius.app" size="sm" />

<Route namespace="curius" :data='{"path":"/links/:name","categories":["social-media"],"example":"/curius/links/yuu-yuu","parameters":{"name":"Username, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["curius.app/:name"]}],"name":"User","maintainers":["Ovler-Young"],"location":"links.ts"}' />

## Daily.dev <Site url="daily.dev"/>

### Most Discussed <Site url="daily.dev/popular" size="sm" />

<Route namespace="daily" :data='{"path":"/discussed","categories":["social-media"],"example":"/daily/discussed","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["daily.dev/popular"],"target":""}],"name":"Most Discussed","maintainers":["Rjnishant530"],"url":"daily.dev/popular","location":"discussed.ts"}' />

### Most upvoted <Site url="daily.dev/popular" size="sm" />

<Route namespace="daily" :data='{"path":"/upvoted","categories":["social-media"],"example":"/daily/upvoted","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["daily.dev/popular"],"target":""}],"name":"Most upvoted","maintainers":["Rjnishant530"],"url":"daily.dev/popular","location":"upvoted.ts"}' />

### Unknown <Site url="daily.dev/popular" size="sm" />

<Route namespace="daily" :data='{"path":"/","radar":[{"source":["daily.dev/popular"],"target":""}],"name":"Unknown","maintainers":["Rjnishant530"],"url":"daily.dev/popular","location":"index.ts"}' />

## Discord <Site url="discord.com"/>

### Channel Messages <Site url="discord.com" size="sm" />

<Route namespace="discord" :data='{"path":"/channel/:channelId","categories":["social-media"],"example":"/discord/channel/950465850056536084","parameters":{"channelId":"Channel ID"},"features":{"requireConfig":[{"name":"DISCORD_AUTHORIZATION","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["discord.com/channels/:guildId/:channelId/:messageID","discord.com/channels/:guildId/:channelId"]}],"name":"Channel Messages","maintainers":["TonyRL"],"location":"channel.ts"}' />

## Fansly <Site url="fansly.com"/>

### Hashtag <Site url="fansly.com" size="sm" />

<Route namespace="fansly" :data='{"path":"/tag/:tag","categories":["social-media"],"example":"/fansly/tag/free","parameters":{"tag":"Hashtag"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fansly.com/explore/tag/:tag"]}],"name":"Hashtag","maintainers":["TonyRL"],"location":"tag.ts"}' />

### User Timeline <Site url="fansly.com" size="sm" />

<Route namespace="fansly" :data='{"path":"/user/:username","categories":["social-media"],"example":"/fansly/user/AeriGoMoo","parameters":{"username":"User ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fansly.com/:username/posts","fansly.com/:username/media"]}],"name":"User Timeline","maintainers":["TonyRL"],"location":"post.ts"}' />

## GETTR <Site url="gettr.com"/>

### User timeline <Site url="gettr.com" size="sm" />

<Route namespace="gettr" :data='{"path":"/user/:id","categories":["social-media"],"example":"/gettr/user/jasonmillerindc","parameters":{"id":"User id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gettr.com/user/:id"]}],"name":"User timeline","maintainers":["TonyRL"],"location":"user.ts"}' />

## Instagram <Site url="www.instagram.com"/>

:::tip
It's highly recommended to deploy with Redis cache enabled.
:::

### User Profile / Hashtag - Private API <Site url="www.instagram.com" size="sm" />

<Route namespace="instagram" :data='{"path":"/:category/:key","categories":["social-media"],"example":"/instagram/user/stefaniejoosten","parameters":{"category":"Feed category, see table above","key":"Username / Hashtag name"},"features":{"requireConfig":[{"name":"IG_PROXY","optional":true,"description":""}],"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User Profile / Hashtag - Private API","maintainers":["oppilate","DIYgod"],"description":":::warning\nDue to [Instagram Private API](https://github.com/dilame/instagram-private-api) restrictions, you have to setup your credentials on the server. 2FA is not supported. See [deployment guide](https://docs.rsshub.app/install/) for more.\n:::","location":"private-api/index.ts"}' />

:::warning
Due to [Instagram Private API](https://github.com/dilame/instagram-private-api) restrictions, you have to setup your credentials on the server. 2FA is not supported. See [deployment guide](https://docs.rsshub.app/install/) for more.
:::

### User Profile / Hashtag <Site url="www.instagram.com" size="sm" />

<Route namespace="instagram" :data='{"path":"/2/:category/:key","categories":["social-media"],"example":"/instagram/2/user/stefaniejoosten","parameters":{"category":"Feed category, see table below","key":"Username / Hashtag name"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User Profile / Hashtag","maintainers":["TonyRL"],"description":":::tip\nYou may need to setup cookie for a less restrictive rate limit and private profiles.\n:::\n\n\n| User timeline | Hashtag |\n| ------------- | ------- |\n| user          | tags    |","location":"web-api/index.ts"}' />

:::tip
You may need to setup cookie for a less restrictive rate limit and private profiles.
:::


| User timeline | Hashtag |
| ------------- | ------- |
| user          | tags    |

## Instagram <Site url="www.picuki.com"/>

:::tip
It's highly recommended to deploy with Redis cache enabled.
:::

### User Profile - Picuki <Site url="www.picuki.com" size="sm" />

<Route namespace="picuki" :data='{"path":"/profile/:id/:functionalFlag?","categories":["social-media"],"example":"/picuki/profile/stefaniejoosten","parameters":{"id":"Instagram id","functionalFlag":"functional flag, see the table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.picuki.com/profile/:id"],"target":"/profile/:id"}],"name":"User Profile - Picuki","maintainers":["hoilc","Rongronggg9","devinmugen"],"description":"| functionalFlag | Video embedding                         | Fetching Instagram Stories |\n  | -------------- | --------------------------------------- | -------------------------- |\n  | 0              | off, only show video poster as an image | off                        |\n  | 1 (default)    | on                                      | off                        |\n  | 10             | on                                      | on                         |\n\n  :::warning\n  Instagram Stories do not have a reliable guid. It is possible that your RSS reader show the same story more than once.\n  Though, every Story expires after 24 hours, so it may be not so serious.\n  :::","location":"profile.ts"}' />

| functionalFlag | Video embedding                         | Fetching Instagram Stories |
  | -------------- | --------------------------------------- | -------------------------- |
  | 0              | off, only show video poster as an image | off                        |
  | 1 (default)    | on                                      | off                        |
  | 10             | on                                      | on                         |

  :::warning
  Instagram Stories do not have a reliable guid. It is possible that your RSS reader show the same story more than once.
  Though, every Story expires after 24 hours, so it may be not so serious.
  :::

## Keep <Site url="gotokeep.com"/>

### 运动日记 <Site url="gotokeep.com" size="sm" />

<Route namespace="keep" :data='{"path":"/user/:id","categories":["social-media"],"example":"/keep/user/556b02c1ab59390afea671ea","parameters":{"id":"Keep 用户 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gotokeep.com/users/:id"]}],"name":"运动日记","maintainers":["Dectinc","DIYgod"],"location":"user.ts"}' />

## Lemmy 

### Community 

<Route namespace="lemmy" :data='{"path":"/:community/:sort?","categories":["social-media"],"example":"/lemmy/technology@lemmy.world/Hot","parameters":{"community":"Lemmmy community, for example technology@lemmy.world","sort":"Sort by, defaut to Active"},"features":{"requireConfig":[{"name":"ALLOW_USER_SUPPLY_UNSAFE_DOMAIN","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Community","maintainers":["wb14123"],"location":"index.ts"}' />

## Lofter <Site url="www.lofter.com"/>

### Tag <Site url="www.lofter.com" size="sm" />

<Route namespace="lofter" :data='{"path":"/tag/:name?/:type?","categories":["social-media"],"example":"/lofter/tag/cosplay/date","parameters":{"name":"tag name, such as `名侦探柯南`, `摄影` by default","type":"ranking type, see below, new by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Tag","maintainers":["hoilc","nczitzk"],"description":"| new  | date | week | month | total |\n  | ---- | ---- | ---- | ----- | ----- |\n  | 最新 | 日榜 | 周榜 | 月榜  | 总榜  |","location":"tag.ts"}' />

| new  | date | week | month | total |
  | ---- | ---- | ---- | ----- | ----- |
  | 最新 | 日榜 | 周榜 | 月榜  | 总榜  |

### User <Site url="www.lofter.com" size="sm" />

<Route namespace="lofter" :data='{"path":"/user/:name?","categories":["social-media"],"example":"/lofter/user/i","parameters":{"name":"Lofter user name, can be found in the URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User","maintainers":["hondajojo","nczitzk"],"location":"user.ts"}' />

## Mastodon <Site url="mastodon.social"/>

:::tip
Official user RSS:

-   RSS: `https://**:instance**/users/**:username**.rss` ([Example](https://pawoo.net/users/pawoo_support.rss))
-   Atom: ~~`https://**:instance**/users/**:username**.atom`~~ (Only for pawoo.net, [example](https://pawoo.net/users/pawoo_support.atom))

These feed do not include boosts (a.k.a. reblogs). RSSHub provides a feed for user timeline based on the Mastodon API, but to use that, you may need to create application on a Mastodon instance, and configure your RSSHub instance. Check the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.
:::

### Instance timeline (local) <Site url="mastodon.social" size="sm" />

<Route namespace="mastodon" :data='{"path":"/timeline/:site/:only_media?","categories":["social-media"],"example":"/mastodon/timeline/pawoo.net/true","parameters":{"site":"instance address, only domain, no `http://` or `https://` protocol header","only_media":"whether only display media content, default to false, any value to true"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Instance timeline (local)","maintainers":["hoilc"],"description":"If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`.","location":"timeline-local.ts"}' />

If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`.

### Instance timeline (federated) <Site url="mastodon.social" size="sm" />

<Route namespace="mastodon" :data='{"path":"/remote/:site/:only_media?","categories":["social-media"],"example":"/mastodon/remote/pawoo.net/true","parameters":{"site":"instance address, only domain, no `http://` or `https://` protocol header","only_media":"whether only display media content, default to false, any value to true"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Instance timeline (federated)","maintainers":["hoilc"],"description":"If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`.","location":"timeline-remote.ts"}' />

If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`.

### Unknown <Site url="mastodon.social" size="sm" />

<Route namespace="mastodon" :data='{"path":"/account_id/:site/:account_id/statuses/:only_media?","name":"Unknown","maintainers":["notofoe"],"location":"account-id.ts"}' />

### User timeline <Site url="mastodon.social" size="sm" />

<Route namespace="mastodon" :data='{"path":"/acct/:acct/statuses/:only_media?","categories":["social-media"],"example":"/mastodon/acct/CatWhitney@mastodon.social/statuses","parameters":{"acct":"Webfinger account URI, like `user@host`","only_media":"whether only display media content, default to false, any value to true"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User timeline","maintainers":["notofoe"],"description":"Started from Mastodon v4.0.0, the use of the `search` API in the route no longer requires a user token.\nIf the domain of your Webfinger account URI is the same as the API host of the instance (i.e., no delegation called in some other protocols), then no configuration is required and the route is available out of the box.\nHowever, you can still specify these route-specific configurations if you need to override them.","location":"acct.ts"}' />

Started from Mastodon v4.0.0, the use of the `search` API in the route no longer requires a user token.
If the domain of your Webfinger account URI is the same as the API host of the instance (i.e., no delegation called in some other protocols), then no configuration is required and the route is available out of the box.
However, you can still specify these route-specific configurations if you need to override them.

## Misskey <Site url="misskey.io"/>

### Featured Notes <Site url="misskey.io" size="sm" />

<Route namespace="misskey" :data='{"path":"/notes/featured/:site","categories":["social-media"],"example":"/misskey/notes/featured/misskey.io","parameters":{"site":"instance address, domain only, without `http://` or `https://` protocol header"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Featured Notes","maintainers":["Misaka13514"],"location":"featured-notes.ts"}' />

## pixiv <Site url="www.pixiv.net"/>

### Following timeline <Site url="www.pixiv.net/bookmark_new_illust.php" size="sm" />

<Route namespace="pixiv" :data='{"path":"/user/illustfollows","categories":["social-media"],"example":"/pixiv/user/illustfollows","parameters":{},"features":{"requireConfig":[{"name":"PIXIV_REFRESHTOKEN","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.pixiv.net/bookmark_new_illust.php"]}],"name":"Following timeline","maintainers":["ClarkeCheng"],"url":"www.pixiv.net/bookmark_new_illust.php","description":":::warning\n  Only for self-hosted\n  :::","location":"illustfollow.ts"}' />

:::warning
  Only for self-hosted
  :::

### Keyword <Site url="www.pixiv.net" size="sm" />

<Route namespace="pixiv" :data='{"path":"/search/:keyword/:order?/:mode?","categories":["social-media"],"example":"/pixiv/search/Nezuko/popular/2","parameters":{"keyword":"keyword","order":"rank mode, empty or other for time order, popular for popular order","mode":"filte R18 content"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Keyword","maintainers":["DIYgod"],"description":"| only not R18 | only R18 | no filter      |\n  | ------------ | -------- | -------------- |\n  | safe         | r18      | empty or other |","location":"search.ts"}' />

| only not R18 | only R18 | no filter      |
  | ------------ | -------- | -------------- |
  | safe         | r18      | empty or other |

### Rankings <Site url="www.pixiv.net" size="sm" />

<Route namespace="pixiv" :data='{"path":"/ranking/:mode/:date?","categories":["social-media"],"example":"/pixiv/ranking/week","parameters":{"mode":"rank type","date":"format: `2018-4-25`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Rankings","maintainers":["EYHN"],"description":"| daily rank | weekly rank | monthly rank | male rank | female rank | AI-generated work Rankings | original rank  | rookie user rank |\n  | ---------- | ----------- | ------------ | --------- | ----------- | -------------------------- | -------------- | ---------------- |\n  | day        | week        | month        | day_male | day_female | day_ai                    | week_original | week_rookie     |\n\n  | R-18 daily rank | R-18 AI-generated work | R-18 male rank | R-18 female rank | R-18 weekly rank | R-18G rank |\n  | --------------- | ---------------------- | -------------- | ---------------- | ---------------- | ---------- |\n  | day_r18        | day_r18_ai           | day_male_r18 | day_female_r18 | week_r18        | week_r18g |","location":"ranking.ts"}' />

| daily rank | weekly rank | monthly rank | male rank | female rank | AI-generated work Rankings | original rank  | rookie user rank |
  | ---------- | ----------- | ------------ | --------- | ----------- | -------------------------- | -------------- | ---------------- |
  | day        | week        | month        | day_male | day_female | day_ai                    | week_original | week_rookie     |

  | R-18 daily rank | R-18 AI-generated work | R-18 male rank | R-18 female rank | R-18 weekly rank | R-18G rank |
  | --------------- | ---------------------- | -------------- | ---------------- | ---------------- | ---------- |
  | day_r18        | day_r18_ai           | day_male_r18 | day_female_r18 | week_r18        | week_r18g |

### User Bookmark <Site url="www.pixiv.net" size="sm" />

<Route namespace="pixiv" :data='{"path":"/user/bookmarks/:id","categories":["social-media"],"example":"/pixiv/user/bookmarks/15288095","parameters":{"id":"user id, available in user&#39;s homepage URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.pixiv.net/users/:id/bookmarks/artworks"]}],"name":"User Bookmark","maintainers":["EYHN"],"location":"bookmarks.ts"}' />

### User Novels <Site url="www.pixiv.net" size="sm" />

<Route namespace="pixiv" :data='{"path":"/user/novels/:id","categories":["social-media"],"example":"/pixiv/user/novels/27104704","parameters":{"id":"User id, available in user&#39;s homepage URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.pixiv.net/users/:id/novels"]}],"name":"User Novels","maintainers":["TonyRL"],"location":"novels.ts"}' />

### User Activity <Site url="www.pixiv.net" size="sm" />

<Route namespace="pixiv" :data='{"path":"/user/:id","categories":["social-media"],"example":"/pixiv/user/15288095","parameters":{"id":"user id, available in user&#39;s homepage URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.pixiv.net/users/:id"]}],"name":"User Activity","maintainers":["DIYgod"],"location":"user.ts"}' />

## Plurk <Site url="plurk.com"/>

### Anonymous <Site url="plurk.com/anonymous" size="sm" />

<Route namespace="plurk" :data='{"path":"/anonymous","categories":["social-media"],"example":"/plurk/anonymous","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["plurk.com/anonymous"]}],"name":"Anonymous","maintainers":["TonyRL"],"url":"plurk.com/anonymous","location":"anonymous.ts"}' />

### Hotlinks <Site url="plurk.com/hotlinks" size="sm" />

<Route namespace="plurk" :data='{"path":"/hotlinks","categories":["social-media"],"example":"/plurk/hotlinks","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["plurk.com/hotlinks"]}],"name":"Hotlinks","maintainers":["TonyRL"],"url":"plurk.com/hotlinks","location":"hotlinks.ts"}' />

### Plurk News <Site url="plurk.com/news" size="sm" />

<Route namespace="plurk" :data='{"path":"/news/:lang?","categories":["social-media"],"example":"/plurk/news/:lang?","parameters":{"lang":"Language, see the table above, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["plurk.com/news"],"target":"/news"}],"name":"Plurk News","maintainers":["TonyRL"],"url":"plurk.com/news","location":"news.ts"}' />

### Search <Site url="plurk.com" size="sm" />

<Route namespace="plurk" :data='{"path":"/search/:keyword","categories":["social-media"],"example":"/plurk/search/FGO","parameters":{"keyword":"Search keyword"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Search","maintainers":["TonyRL"],"location":"search.ts"}' />

### Top <Site url="plurk.com" size="sm" />

<Route namespace="plurk" :data='{"path":"/top/:category?/:lang?","categories":["social-media"],"example":"/plurk/top/topReplurks","parameters":{"category":"Category, see the table below, `topReplurks` by default","lang":"Language, see the table below, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Top","maintainers":["TonyRL"],"description":"| Top Replurks | Top Favorites | Top Responded |\n  | ------------ | ------------- | ------------- |\n  | topReplurks  | topFavorites  | topResponded  |\n\n  | English | 中文（繁體） |\n  | ------- | ------------ |\n  | en      | zh           |","location":"top.ts"}' />

| Top Replurks | Top Favorites | Top Responded |
  | ------------ | ------------- | ------------- |
  | topReplurks  | topFavorites  | topResponded  |

  | English | 中文（繁體） |
  | ------- | ------------ |
  | en      | zh           |

### Topic <Site url="plurk.com" size="sm" />

<Route namespace="plurk" :data='{"path":"/topic/:topic","categories":["social-media"],"example":"/plurk/topic/standwithukraine","parameters":{"topic":"Topic ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["plurk.com/topic/:topic"]}],"name":"Topic","maintainers":["TonyRL"],"location":"topic.ts"}' />

### User <Site url="plurk.com" size="sm" />

<Route namespace="plurk" :data='{"path":"/user/:user","categories":["social-media"],"example":"/plurk/user/plurkoffice","parameters":{"user":"User ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User","maintainers":["TonyRL"],"location":"user.ts"}' />

## Rattibha <Site url="rattibha.com"/>

### User Threads <Site url="rattibha.com" size="sm" />

<Route namespace="rattibha" :data='{"path":"/user/:user","categories":["social-media"],"example":"/rattibha/user/elonmusk","parameters":{"user":"Twitter username, without @"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["rattibha.com/:user"]}],"name":"User Threads","maintainers":["yshalsager"],"location":"user.ts"}' />

## Telegram <Site url="t.me"/>

### Channel <Site url="t.me" size="sm" />

<Route namespace="telegram" :data='{"path":"/channel/:username/:routeParams?","categories":["social-media"],"example":"/telegram/channel/awesomeDIYgod/searchQuery=twitter","parameters":{"username":"channel username","routeParams":"extra parameters, see the table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["t.me/s/:username"],"target":"/channel/:username"}],"name":"Channel","maintainers":["DIYgod","Rongronggg9"],"description":"| Key                   | Description                                                           | Accepts                                              | Defaults to       |\n  | --------------------- | --------------------------------------------------------------------- | ---------------------------------------------------- | ----------------- |\n  | showLinkPreview       | Show the link preview from Telegram                                   | 0/1/true/false                                       | true              |\n  | showViaBot            | For messages sent via bot, show the bot                               | 0/1/true/false                                       | true              |\n  | showReplyTo           | For reply messages, show the target of the reply                      | 0/1/true/false                                       | true              |\n  | showFwdFrom           | For forwarded messages, show the forwarding source                    | 0/1/true/false                                       | true              |\n  | showFwdFromAuthor     | For forwarded messages, show the author of the forwarding source      | 0/1/true/false                                       | true              |\n  | showInlineButtons     | Show inline buttons                                                   | 0/1/true/false                                       | false             |\n  | showMediaTagInTitle   | Show media tags in the title                                          | 0/1/true/false                                       | true              |\n  | showMediaTagAsEmoji   | Show media tags as emoji                                              | 0/1/true/false                                       | true              |\n  | includeFwd            | Include forwarded messages                                            | 0/1/true/false                                       | true              |\n  | includeReply          | Include reply messages                                                | 0/1/true/false                                       | true              |\n  | includeServiceMsg     | Include service messages (e.g. message pinned, channel photo updated) | 0/1/true/false                                       | true              |\n  | includeUnsupportedMsg | Include messages unsupported by t.me                                  | 0/1/true/false                                       | false             |\n  | searchQuery           | search query                                                          | keywords; replace `#` by `%23` for hashtag searching | (search disabled) |\n\n  Specify different option values than default values can meet different needs, URL\n\n  ```\n  https://rsshub.app/telegram/channel/NewlearnerChannel/showLinkPreview=0&showViaBot=0&showReplyTo=0&showFwdFrom=0&showFwdFromAuthor=0&showInlineButtons=0&showMediaTagInTitle=1&showMediaTagAsEmoji=1&includeFwd=0&includeReply=1&includeServiceMsg=0&includeUnsupportedMsg=0\n  ```\n\n  generates an RSS without any link previews and annoying metadata, with emoji media tags in the title, without forwarded messages (but with reply messages), and without messages you don&#39;t care about (service messages and unsupported messages), for people who prefer pure subscriptions.\n\n  :::tip\n  For backward compatibility reasons, invalid `routeParams` will be treated as `searchQuery` .\n\n  Due to Telegram restrictions, some channels involving pornography, copyright, and politics cannot be subscribed. You can confirm by visiting `https://t.me/s/:username`.\n  :::","location":"channel.ts"}' />

| Key                   | Description                                                           | Accepts                                              | Defaults to       |
  | --------------------- | --------------------------------------------------------------------- | ---------------------------------------------------- | ----------------- |
  | showLinkPreview       | Show the link preview from Telegram                                   | 0/1/true/false                                       | true              |
  | showViaBot            | For messages sent via bot, show the bot                               | 0/1/true/false                                       | true              |
  | showReplyTo           | For reply messages, show the target of the reply                      | 0/1/true/false                                       | true              |
  | showFwdFrom           | For forwarded messages, show the forwarding source                    | 0/1/true/false                                       | true              |
  | showFwdFromAuthor     | For forwarded messages, show the author of the forwarding source      | 0/1/true/false                                       | true              |
  | showInlineButtons     | Show inline buttons                                                   | 0/1/true/false                                       | false             |
  | showMediaTagInTitle   | Show media tags in the title                                          | 0/1/true/false                                       | true              |
  | showMediaTagAsEmoji   | Show media tags as emoji                                              | 0/1/true/false                                       | true              |
  | includeFwd            | Include forwarded messages                                            | 0/1/true/false                                       | true              |
  | includeReply          | Include reply messages                                                | 0/1/true/false                                       | true              |
  | includeServiceMsg     | Include service messages (e.g. message pinned, channel photo updated) | 0/1/true/false                                       | true              |
  | includeUnsupportedMsg | Include messages unsupported by t.me                                  | 0/1/true/false                                       | false             |
  | searchQuery           | search query                                                          | keywords; replace `#` by `%23` for hashtag searching | (search disabled) |

  Specify different option values than default values can meet different needs, URL

  ```
  https://rsshub.app/telegram/channel/NewlearnerChannel/showLinkPreview=0&showViaBot=0&showReplyTo=0&showFwdFrom=0&showFwdFromAuthor=0&showInlineButtons=0&showMediaTagInTitle=1&showMediaTagAsEmoji=1&includeFwd=0&includeReply=1&includeServiceMsg=0&includeUnsupportedMsg=0
  ```

  generates an RSS without any link previews and annoying metadata, with emoji media tags in the title, without forwarded messages (but with reply messages), and without messages you don't care about (service messages and unsupported messages), for people who prefer pure subscriptions.

  :::tip
  For backward compatibility reasons, invalid `routeParams` will be treated as `searchQuery` .

  Due to Telegram restrictions, some channels involving pornography, copyright, and politics cannot be subscribed. You can confirm by visiting `https://t.me/s/:username`.
  :::

### Sticker Pack <Site url="t.me" size="sm" />

<Route namespace="telegram" :data='{"path":"/stickerpack/:name","categories":["social-media"],"example":"/telegram/stickerpack/DIYgod","parameters":{"name":"Sticker Pack name, available in the sharing URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Sticker Pack","maintainers":["DIYgod"],"location":"stickerpack.ts"}' />

### Telegram Blog <Site url="telegram.org/blog" size="sm" />

<Route namespace="telegram" :data='{"path":"/blog","categories":["social-media"],"example":"/telegram/blog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["telegram.org/blog"]}],"name":"Telegram Blog","maintainers":["fengkx"],"url":"telegram.org/blog","location":"blog.ts"}' />

## Threads <Site url="threads.net"/>

### User timeline <Site url="threads.net" size="sm" />

<Route namespace="threads" :data='{"path":"/:user/:routeParams?","categories":["social-media"],"example":"/threads/zuck","parameters":{"user":"Username","routeParams":"Extra parameters, see the table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User timeline","maintainers":["ninboy"],"description":"Specify options (in the format of query string) in parameter `routeParams` to control some extra features for threads\n\n  | Key                            | Description                                                                                                                  | Accepts                | Defaults to |\n  | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------- |\n  | `showAuthorInTitle`            | Show author name in title                                                                                                    | `0`/`1`/`true`/`false` | `true`      |\n  | `showAuthorInDesc`             | Show author name in description (RSS body)                                                                                   | `0`/`1`/`true`/`false` | `true`      |\n  | `showQuotedAuthorAvatarInDesc` | Show avatar of quoted author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | `0`/`1`/`true`/`false` | `false`     |\n  | `showAuthorAvatarInDesc`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)        | `0`/`1`/`true`/`false` | `falseP`    |\n  | `showEmojiForQuotesAndReply`   | Use \"🔁\" instead of \"QT\", \"↩️\" instead of \"Re\"                                                                               | `0`/`1`/`true`/`false` | `true`      |\n  | `showQuotedInTitle`            | Show quoted tweet in title                                                                                                   | `0`/`1`/`true`/`false` | `true`      |\n  | `replies`                      | Show replies                                                                                                                 | `0`/`1`/`true`/`false` | `true`      |\n\n  Specify different option values than default values to improve readability. The URL\n\n  ```\n  https://rsshub.app/threads/zuck/showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForQuotesAndReply=1&showQuotedInTitle=1\n  ```","location":"index.ts"}' />

Specify options (in the format of query string) in parameter `routeParams` to control some extra features for threads

  | Key                            | Description                                                                                                                  | Accepts                | Defaults to |
  | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------- |
  | `showAuthorInTitle`            | Show author name in title                                                                                                    | `0`/`1`/`true`/`false` | `true`      |
  | `showAuthorInDesc`             | Show author name in description (RSS body)                                                                                   | `0`/`1`/`true`/`false` | `true`      |
  | `showQuotedAuthorAvatarInDesc` | Show avatar of quoted author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | `0`/`1`/`true`/`false` | `false`     |
  | `showAuthorAvatarInDesc`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)        | `0`/`1`/`true`/`false` | `falseP`    |
  | `showEmojiForQuotesAndReply`   | Use "🔁" instead of "QT", "↩️" instead of "Re"                                                                               | `0`/`1`/`true`/`false` | `true`      |
  | `showQuotedInTitle`            | Show quoted tweet in title                                                                                                   | `0`/`1`/`true`/`false` | `true`      |
  | `replies`                      | Show replies                                                                                                                 | `0`/`1`/`true`/`false` | `true`      |

  Specify different option values than default values to improve readability. The URL

  ```
  https://rsshub.app/threads/zuck/showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForQuotesAndReply=1&showQuotedInTitle=1
  ```

## TikTok <Site url="tiktok.com"/>

### User <Site url="tiktok.com" size="sm" />

<Route namespace="tiktok" :data='{"path":"/user/:user/:iframe?","categories":["social-media"],"example":"/tiktok/user/@linustech/true","parameters":{"user":"User ID, including @","iframe":"Use the official iframe to embed the video, which allows you to view the video if the default option does not work. Default to `false`"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tiktok.com/:user"],"target":"/user/:user"}],"name":"User","maintainers":["TonyRL"],"location":"user.ts"}' />

## Twitter <Site url="twitter.com"/>

Specify options (in the format of query string) in parameter `routeParams` to control some extra features for Tweets

| Key                            | Description                                                                                                                          | Accepts                | Defaults to                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------------------------------------- |
| `readable`                     | Enable readable layout                                                                                                               | `0`/`1`/`true`/`false` | `false`                                   |
| `authorNameBold`               | Display author name in bold                                                                                                          | `0`/`1`/`true`/`false` | `false`                                   |
| `showAuthorInTitle`            | Show author name in title                                                                                                            | `0`/`1`/`true`/`false` | `false` (`true` in `/twitter/followings`) |
| `showAuthorInDesc`             | Show author name in description (RSS body)                                                                                           | `0`/`1`/`true`/`false` | `false` (`true` in `/twitter/followings`) |
| `showQuotedAuthorAvatarInDesc` | Show avatar of quoted Tweet's author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | `0`/`1`/`true`/`false` | `false`                                   |
| `showAuthorAvatarInDesc`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)                | `0`/`1`/`true`/`false` | `false`                                   |
| `showEmojiForRetweetAndReply`  | Use "🔁" instead of "RT", "↩️" & "💬" instead of "Re"                                                                                | `0`/`1`/`true`/`false` | `false`                                   |
| `showSymbolForRetweetAndReply` | Use " RT " instead of "", " Re " instead of ""                                                                                       | `0`/`1`/`true`/`false` | `true`                                    |
| `showRetweetTextInTitle`       | Show quote comments in title (if `false`, only the retweeted tweet will be shown in the title)                                       | `0`/`1`/`true`/`false` | `true`                                    |
| `addLinkForPics`               | Add clickable links for Tweet pictures                                                                                               | `0`/`1`/`true`/`false` | `false`                                   |
| `showTimestampInDescription`   | Show timestamp in description                                                                                                        | `0`/`1`/`true`/`false` | `false`                                   |
| `showQuotedInTitle`            | Show quoted tweet in title                                                                                                           | `0`/`1`/`true`/`false` | `false`                                   |
| `widthOfPics`                  | Width of Tweet pictures                                                                                                              | Unspecified/Integer    | Unspecified                               |
| `heightOfPics`                 | Height of Tweet pictures                                                                                                             | Unspecified/Integer    | Unspecified                               |
| `sizeOfAuthorAvatar`           | Size of author's avatar                                                                                                              | Integer                | `48`                                      |
| `sizeOfQuotedAuthorAvatar`     | Size of quoted tweet's author's avatar                                                                                               | Integer                | `24`                                      |
| `excludeReplies`               | Exclude replies, only available in `/twitter/user`                                                                                   | `0`/`1`/`true`/`false` | `false`                                   |
| `includeRts`                   | Include retweets, only available in `/twitter/user`                                                                                  | `0`/`1`/`true`/`false` | `true`                                    |
| `forceWebApi`                  | Force using Web API even if Developer API is configured, only available in `/twitter/user` and `/twitter/keyword`                    | `0`/`1`/`true`/`false` | `false`                                   |
| `count`                        | `count` parameter passed to Twitter API, only available in `/twitter/user`                                                           | Unspecified/Integer    | Unspecified                               |

Specify different option values than default values to improve readability. The URL

```
https://rsshub.app/twitter/user/durov/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweetAndReply=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showQuotedInTitle=1&heightOfPics=150
```

generates

<img loading="lazy" src="/img/readable-twitter.png" alt="Readable Twitter RSS of Durov" />

Currently supports two authentication methods:

- Using TWITTER_COOKIE (recommended): Configure the cookies of logged-in Twitter Web, at least including the fields auth_token and ct0. RSSHub will use this information to directly access Twitter's web API to obtain data.

- Using TWITTER_USERNAME TWITTER_PASSWORD: Configure the Twitter username and password. RSSHub will use this information to log in to Twitter and obtain data using the mobile API. Please note that if you have not logged in with the current IP address before, it is easy to trigger Twitter's risk control mechanism.


### Home timeline <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/home/:routeParams?","categories":["social-media"],"example":"/twitter/home","features":{"requireConfig":[{"name":"TWITTER_USERNAME","description":"Please see above for details."},{"name":"TWITTER_PASSWORD","description":"Please see above for details."},{"name":"TWITTER_COOKIE","description":"Please see above for details."}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Home timeline","maintainers":["DIYgod"],"radar":[{"source":["twitter.com/home"],"target":"/home"}],"location":"home.ts"}' />

### Keyword <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/keyword/:keyword/:routeParams?","categories":["social-media"],"example":"/twitter/keyword/RSSHub","parameters":{"keyword":"keyword","routeParams":"extra parameters, see the table above"},"features":{"requireConfig":[{"name":"TWITTER_USERNAME","description":"Please see above for details."},{"name":"TWITTER_PASSWORD","description":"Please see above for details."},{"name":"TWITTER_COOKIE","description":"Please see above for details."}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Keyword","maintainers":["DIYgod","yindaheng98","Rongronggg9"],"radar":[{"source":["twitter.com/search"]}],"location":"keyword.ts"}' />

### List timeline <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/list/:id/:routeParams?","categories":["social-media"],"example":"/twitter/list/ladyleet/javascript","parameters":{"id":"username","name":"list name","routeParams":"extra parameters, see the table above"},"features":{"requireConfig":[{"name":"TWITTER_USERNAME","description":"Please see above for details."},{"name":"TWITTER_PASSWORD","description":"Please see above for details."},{"name":"TWITTER_COOKIE","description":"Please see above for details."}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"List timeline","maintainers":["DIYgod","xyqfer"],"radar":[{"source":["twitter.com/i/lists/:id"],"target":"/list/:id"}],"location":"list.ts"}' />

### Trends <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/trends/:woeid?","categories":["social-media"],"example":"/twitter/trends/23424856","parameters":{"woeid":"Yahoo! Where On Earth ID. default to woeid=1 (World Wide)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Trends","maintainers":["sakamossan"],"location":"trends.ts"}' />

### Tweet Details <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/tweet/:id/status/:status/:original?","categories":["social-media"],"example":"/twitter/tweet/DIYgod/status/1650844643997646852","parameters":{"id":"username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`","status":"tweet ID","original":"extra parameters, data type of return, if the value is not `0`/`false` and `config.isPackage` is `true`, return the original data of twitter"},"features":{"requireConfig":[{"name":"TWITTER_USERNAME","description":"Please see above for details."},{"name":"TWITTER_PASSWORD","description":"Please see above for details."}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Tweet Details","maintainers":["LarchLiu","Rongronggg9"],"location":"tweet.ts"}' />

### User likes <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/likes/:id/:routeParams?","categories":["social-media"],"example":"/twitter/likes/DIYgod","parameters":{"id":"username","routeParams":"extra parameters, see the table above"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User likes","maintainers":["xyqfer"],"location":"likes.ts"}' />

### User media <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/media/:id/:routeParams?","categories":["social-media"],"example":"/twitter/media/DIYgod","parameters":{"id":"username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`","routeParams":"extra parameters, see the table above."},"features":{"requireConfig":[{"name":"TWITTER_USERNAME","description":"Please see above for details."},{"name":"TWITTER_PASSWORD","description":"Please see above for details."},{"name":"TWITTER_COOKIE","description":"Please see above for details."}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User media","maintainers":["DIYgod","yindaheng98","Rongronggg9"],"radar":[{"source":["twitter.com/:id/media"],"target":"/media/:id"}],"location":"media.ts"}' />

### User timeline <Site url="twitter.com" size="sm" />

<Route namespace="twitter" :data='{"path":"/user/:id/:routeParams?","categories":["social-media"],"example":"/twitter/user/DIYgod","parameters":{"id":"username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`","routeParams":"extra parameters, see the table above; particularly when `routeParams=exclude_replies`, replies are excluded; `routeParams=exclude_rts` excludes retweets,`routeParams=exclude_rts_replies` exclude replies and retweets; for default include all."},"features":{"requireConfig":[{"name":"TWITTER_USERNAME","description":"Please see above for details."},{"name":"TWITTER_PASSWORD","description":"Please see above for details."},{"name":"TWITTER_COOKIE","description":"Please see above for details."}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User timeline","maintainers":["DIYgod","yindaheng98","Rongronggg9"],"radar":[{"source":["twitter.com/:id"],"target":"/user/:id"}],"location":"user.ts"}' />

## Vimeo <Site url="vimeo.com"/>

### Category <Site url="vimeo.com" size="sm" />

<Route namespace="vimeo" :data='{"path":"/category/:category/:staffpicks?","categories":["social-media"],"example":"/vimeo/category/documentary/staffpicks","parameters":{"category":"Category name can get from url like `documentary` in [https://vimeo.com/categories/documentary/videos](https://vimeo.com/categories/documentary/videos) ","staffpicks":"type `staffpicks` to sort with staffpicks"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Category","maintainers":["MisteryMonster"],"location":"category.ts"}' />

### Channel <Site url="vimeo.com" size="sm" />

<Route namespace="vimeo" :data='{"path":"/channel/:channel","categories":["social-media"],"example":"/vimeo/channel/bestoftheyear","parameters":{"channel":"channel name can get from url like `bestoftheyear` in  [https://vimeo.com/channels/bestoftheyear/videos](https://vimeo.com/channels/bestoftheyear/videos) ."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["vimeo.com/channels/:channel","vimeo.com/channels/:channel/videos","vimeo.com/channels/:channel/videos/:sort/:format"]}],"name":"Channel","maintainers":["MisteryMonster"],"location":"channel.ts"}' />

### User Profile <Site url="vimeo.com" size="sm" />

<Route namespace="vimeo" :data='{"path":"/user/:username/:cat?","categories":["social-media"],"example":"/vimeo/user/filmsupply/picks","parameters":{"username":"In this example [https://vimeo.com/filmsupply](https://vimeo.com/filmsupply)  is `filmsupply`","cat":"deafult for all latest videos, others categories in this example such as `Docmentary`, `Narrative`, `Drama`. Set `picks` for promote orders, just orderd like web page. When `picks` added, published date won&#39;t show up"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User Profile","maintainers":["MisteryMonster"],"description":":::tip Special category name attention\n  Some of the categories contain slash like `3D/CG` , must change the slash `/` to the vertical bar`|`.\n  :::","location":"usr-videos.ts"}' />

:::tip Special category name attention
  Some of the categories contain slash like `3D/CG` , must change the slash `/` to the vertical bar`|`.
  :::

## YouTube Live <Site url="charts.youtube.com"/>

### Channel <Site url="charts.youtube.com" size="sm" />

<Route namespace="youtube" :data='{"path":"/channel/:id/:embed?","categories":["social-media"],"example":"/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ","parameters":{"id":"YouTube channel id","embed":"Default to embed the video, set to any value to disable embedding"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.youtube.com/channel/:id"],"target":"/channel/:id"}],"name":"Channel","maintainers":["DIYgod"],"description":":::tip\nYouTube provides official RSS feeds for channels, for instance [https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ](https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ).\n:::","location":"channel.ts"}' />

:::tip
YouTube provides official RSS feeds for channels, for instance [https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ](https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ).
:::

### Community <Site url="charts.youtube.com" size="sm" />

<Route namespace="youtube" :data='{"path":"/community/:handle","categories":["social-media"],"example":"/youtube/community/@JFlaMusic","parameters":{"handle":"YouTube handles or channel id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Community","maintainers":["TonyRL"],"location":"community.ts"}' />

### Music Charts <Site url="charts.youtube.com" size="sm" />

<Route namespace="youtube" :data='{"path":"/charts/:category?/:country?/:embed?","categories":["social-media"],"example":"/youtube/charts","parameters":{"category":"Chart, see table below, default to `TopVideos`","country":"Country Code, see table below, default to global","embed":"Default to embed the video, set to any value to disable embedding"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Music Charts","maintainers":["TonyRL"],"description":"Chart\n\n  | Top artists | Top songs | Top music videos | Trending       |\n  | ----------- | --------- | ---------------- | -------------- |\n  | TopArtists  | TopSongs  | TopVideos        | TrendingVideos |\n\n  Country Code\n\n  | Argentina | Australia | Austria | Belgium | Bolivia | Brazil | Canada |\n  | --------- | --------- | ------- | ------- | ------- | ------ | ------ |\n  | ar        | au        | at      | be      | bo      | br     | ca     |\n\n  | Chile | Colombia | Costa Rica | Czechia | Denmark | Dominican Republic | Ecuador |\n  | ----- | -------- | ---------- | ------- | ------- | ------------------ | ------- |\n  | cl    | co       | cr         | cz      | dk      | do                 | ec      |\n\n  | Egypt | El Salvador | Estonia | Finland | France | Germany | Guatemala |\n  | ----- | ----------- | ------- | ------- | ------ | ------- | --------- |\n  | eg    | sv          | ee      | fi      | fr     | de      | gt        |\n\n  | Honduras | Hungary | Iceland | India | Indonesia | Ireland | Israel | Italy |\n  | -------- | ------- | ------- | ----- | --------- | ------- | ------ | ----- |\n  | hn       | hu      | is      | in    | id        | ie      | il     | it    |\n\n  | Japan | Kenya | Luxembourg | Mexico | Netherlands | New Zealand | Nicaragua |\n  | ----- | ----- | ---------- | ------ | ----------- | ----------- | --------- |\n  | jp    | ke    | lu         | mx     | nl          | nz          | ni        |\n\n  | Nigeria | Norway | Panama | Paraguay | Peru | Poland | Portugal | Romania |\n  | ------- | ------ | ------ | -------- | ---- | ------ | -------- | ------- |\n  | ng      | no     | pa     | py       | pe   | pl     | pt       | ro      |\n\n  | Russia | Saudi Arabia | Serbia | South Africa | South Korea | Spain | Sweden | Switzerland |\n  | ------ | ------------ | ------ | ------------ | ----------- | ----- | ------ | ----------- |\n  | ru     | sa           | rs     | za           | kr          | es    | se     | ch          |\n\n  | Tanzania | Turkey | Uganda | Ukraine | United Arab Emirates | United Kingdom | United States |\n  | -------- | ------ | ------ | ------- | -------------------- | -------------- | ------------- |\n  | tz       | tr     | ug     | ua      | ae                   | gb             | us            |\n\n  | Uruguay | Zimbabwe |\n  | ------- | -------- |\n  | uy      | zw       |","location":"charts.ts"}' />

Chart

  | Top artists | Top songs | Top music videos | Trending       |
  | ----------- | --------- | ---------------- | -------------- |
  | TopArtists  | TopSongs  | TopVideos        | TrendingVideos |

  Country Code

  | Argentina | Australia | Austria | Belgium | Bolivia | Brazil | Canada |
  | --------- | --------- | ------- | ------- | ------- | ------ | ------ |
  | ar        | au        | at      | be      | bo      | br     | ca     |

  | Chile | Colombia | Costa Rica | Czechia | Denmark | Dominican Republic | Ecuador |
  | ----- | -------- | ---------- | ------- | ------- | ------------------ | ------- |
  | cl    | co       | cr         | cz      | dk      | do                 | ec      |

  | Egypt | El Salvador | Estonia | Finland | France | Germany | Guatemala |
  | ----- | ----------- | ------- | ------- | ------ | ------- | --------- |
  | eg    | sv          | ee      | fi      | fr     | de      | gt        |

  | Honduras | Hungary | Iceland | India | Indonesia | Ireland | Israel | Italy |
  | -------- | ------- | ------- | ----- | --------- | ------- | ------ | ----- |
  | hn       | hu      | is      | in    | id        | ie      | il     | it    |

  | Japan | Kenya | Luxembourg | Mexico | Netherlands | New Zealand | Nicaragua |
  | ----- | ----- | ---------- | ------ | ----------- | ----------- | --------- |
  | jp    | ke    | lu         | mx     | nl          | nz          | ni        |

  | Nigeria | Norway | Panama | Paraguay | Peru | Poland | Portugal | Romania |
  | ------- | ------ | ------ | -------- | ---- | ------ | -------- | ------- |
  | ng      | no     | pa     | py       | pe   | pl     | pt       | ro      |

  | Russia | Saudi Arabia | Serbia | South Africa | South Korea | Spain | Sweden | Switzerland |
  | ------ | ------------ | ------ | ------------ | ----------- | ----- | ------ | ----------- |
  | ru     | sa           | rs     | za           | kr          | es    | se     | ch          |

  | Tanzania | Turkey | Uganda | Ukraine | United Arab Emirates | United Kingdom | United States |
  | -------- | ------ | ------ | ------- | -------------------- | -------------- | ------------- |
  | tz       | tr     | ug     | ua      | ae                   | gb             | us            |

  | Uruguay | Zimbabwe |
  | ------- | -------- |
  | uy      | zw       |

### Playlist <Site url="charts.youtube.com" size="sm" />

<Route namespace="youtube" :data='{"path":"/playlist/:id/:embed?","categories":["social-media"],"example":"/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z","parameters":{"id":"YouTube playlist id","embed":"Default to embed the video, set to any value to disable embedding"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Playlist","maintainers":["HenryQW"],"location":"playlist.ts"}' />

### Subscriptions <Site url="www.youtube.com/feed/subscriptions" size="sm" />

<Route namespace="youtube" :data='{"path":"/subscriptions/:embed?","categories":["social-media"],"example":"/youtube/subscriptions","parameters":{"embed":"Default to embed the video, set to any value to disable embedding"},"features":{"requireConfig":[{"name":"YOUTUBE_KEY","description":""},{"name":"YOUTUBE_CLIENT_ID","description":""},{"name":"YOUTUBE_CLIENT_SECRET","description":""},{"name":"YOUTUBE_REFRESH_TOKEN","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.youtube.com/feed/subscriptions","www.youtube.com/feed/channels"],"target":"/subscriptions"}],"name":"Subscriptions","maintainers":["TonyRL"],"url":"www.youtube.com/feed/subscriptions","location":"subscriptions.ts"}' />

### Unknown <Site url="charts.youtube.com" size="sm" />

<Route namespace="youtube" :data='{"path":"/c/:username/:embed?","radar":[{"source":["www.youtube.com/c/:id"],"target":"/c/:id"}],"name":"Unknown","maintainers":[],"location":"custom.ts"}' />

### User <Site url="charts.youtube.com" size="sm" />

<Route namespace="youtube" :data='{"path":"/user/:username/:embed?","categories":["social-media"],"example":"/youtube/user/JFlaMusic","parameters":{"username":"YouTuber id","embed":"Default to embed the video, set to any value to disable embedding"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.youtube.com/user/:username"],"target":"/user/:username"}],"name":"User","maintainers":["DIYgod"],"location":"user.ts"}' />

## 唱吧 <Site url="changba.com"/>

### 用户 <Site url="changba.com" size="sm" />

<Route namespace="changba" :data='{"path":"/:userid","categories":["social-media"],"example":"/changba/skp6hhF59n48R-UpqO3izw","parameters":{"userid":"用户ID, 可在对应分享页面的 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["changba.com/s/:userid"]}],"name":"用户","maintainers":[],"location":"user.ts"}' />

## 抖音直播 <Site url="douyin.com"/>

:::warning
反爬严格，需要启用 puppeteer。抖音的视频 CDN 会验证 Referer，意味着许多阅读器都无法直接播放内嵌视频，以下是一些变通解决方案：

1.  启用内嵌视频 (`embed=1`), 参考 [通用参数 -> 多媒体处理](/parameter#多媒体处理) 配置 `multimedia_hotlink_template` **或** `wrap_multimedia_in_iframe`。
2.  关闭内嵌视频 (`embed=0`)，手动点击 `视频直链` 超链接，一般情况下均可成功播放视频。若仍然出现 HTTP 403，请复制 URL 以后到浏览器打开。
3.  点击原文链接打开抖音网页版的视频详情页播放视频。
:::

额外参数

| 键      | 含义             | 值                     | 默认值  |
| ------- | ---------------- | ---------------------- | ------- |
| `embed` | 是否启用内嵌视频 | `0`/`1`/`true`/`false` | `false` |

### 标签 <Site url="douyin.com" size="sm" />

<Route namespace="douyin" :data='{"path":"/hashtag/:cid/:routeParams?","categories":["social-media"],"example":"/douyin/hashtag/1592824105719812","parameters":{"cid":"标签 ID，可在标签页面 URL 中找到","routeParams":"额外参数，query string 格式，请参阅上面的表格"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["douyin.com/hashtag/:cid"],"target":"/hashtag/:cid"}],"name":"标签","maintainers":["TonyRL"],"location":"hashtag.ts"}' />

### 博主 <Site url="douyin.com" size="sm" />

<Route namespace="douyin" :data='{"path":"/user/:uid/:routeParams?","categories":["social-media"],"example":"/douyin/user/MS4wLjABAAAARcAHmmF9mAG3JEixq_CdP72APhBlGlLVbN-1eBcPqao","parameters":{"uid":"uid，可在用户页面 URL 中找到","routeParams":"额外参数，query string 格式，请参阅上面的表格"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["douyin.com/user/:uid"],"target":"/user/:uid"}],"name":"博主","maintainers":["Max-Tortoise","Rongronggg9"],"location":"user.ts"}' />

## 豆瓣 <Site url="www.douban.com"/>

### Unknown <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/explore/column/:id","name":"Unknown","maintainers":[],"location":"other/explore-column.ts"}' />

### Unknown <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/people/:userid/status/:routeParams?","name":"Unknown","maintainers":[],"location":"people/status.ts"}' />

### 北美票房榜 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/movie/ustop","categories":["social-media"],"example":"/douban/movie/ustop","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"北美票房榜","maintainers":["DIYgod"],"location":"other/ustop.ts"}' />

### 豆瓣书店 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/bookstore","categories":["social-media"],"example":"/douban/bookstore","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"豆瓣书店","maintainers":["xyqfer"],"location":"other/bookstore.ts"}' />

### 豆瓣电影人 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/celebrity/:id/:sort?","categories":["social-media"],"example":"/douban/celebrity/1274261","parameters":{"id":"电影人 id","sort":"排序方式，缺省为 `time`（时间排序），可为 `vote` （评价排序）"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"豆瓣电影人","maintainers":["minimalistrojan"],"location":"other/celebrity.ts"}' />

### 豆瓣电影分类 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/movie/classification/:sort?/:score?/:tags?","categories":["social-media"],"example":"/douban/movie/classification/R/7.5/Netflix,2020","parameters":{"sort":"排序方式，默认为U","score":"最低评分，默认不限制","tags":"分类标签，多个标签之间用英文逗号分隔，常见的标签到豆瓣电影的分类页面查看，支持自定义标签"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"豆瓣电影分类","maintainers":["zzwab"],"description":"排序方式可选值如下\n\n| 近期热门 | 标记最多 | 评分最高 | 最近上映 |\n| -------- | -------- | -------- | -------- |\n| U        | T        | S        | R        |","location":"other/classification.ts"}' />

排序方式可选值如下

| 近期热门 | 标记最多 | 评分最高 | 最近上映 |
| -------- | -------- | -------- | -------- |
| U        | T        | S        | R        |

### 豆瓣读书论坛 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/:id/discussion","categories":["social-media"],"example":"/douban/36328704/discussion","parameters":{"id":"书本id;默认论坛文章使用\"按回应时间排序\",仅第一页文章"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["book.douban.com/:id/discussion"]}],"name":"豆瓣读书论坛","maintainers":["nightmare-mio"],"location":"other/discussion.ts"}' />

### 豆瓣豆列 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/doulist/:id","categories":["social-media"],"example":"/douban/doulist/37716774","parameters":{"id":"豆列id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"豆瓣豆列","maintainers":["LogicJake","honue"],"location":"other/doulist.ts"}' />

### 豆瓣小组 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/group/:groupid/:type?","categories":["social-media"],"example":"/douban/group/648102","parameters":{"groupid":"豆瓣小组的 id","type":"缺省 最新，essence 最热，elite 精华"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.douban.com/group/:groupid"],"target":"/group/:groupid"}],"name":"豆瓣小组","maintainers":["DIYgod"],"location":"other/group.ts"}' />

### 豆瓣招聘 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/jobs/:type","categories":["social-media"],"example":"/douban/jobs/campus","parameters":{"type":"招聘类型，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"豆瓣招聘","maintainers":["Fatpandac"],"description":"| 社会招聘 | 校园招聘 | 实习生招聘 |\n  | :------: | :------: | :--------: |\n  |  social  |  campus  |   intern   |","location":"other/jobs.ts"}' />

| 社会招聘 | 校园招聘 | 实习生招聘 |
  | :------: | :------: | :--------: |
  |  social  |  campus  |   intern   |

### 豆瓣榜单与集合 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/list/:type?/:routeParams?","categories":["social-media"],"example":"/douban/list/subject_real_time_hotest","parameters":{"type":"榜单类型，见下表。默认为实时热门书影音","routeParams":"额外参数；请参阅以下说明和表格"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.douban.com/subject_collection/:type"],"target":"/list/:type"}],"name":"豆瓣榜单与集合","maintainers":["5upernova-heng","honue"],"description":"| 榜单 / 集合        | 路由                          |\n  | ------------------ | ----------------------------- |\n  | 实时热门书影音     | subject_real_time_hotest   |\n  | 影院热映           | movie_showing                |\n  | 实时热门电影       | movie_real_time_hotest     |\n  | 实时热门电视       | tv_real_time_hotest        |\n  | 一周口碑电影榜     | movie_weekly_best           |\n  | 华语口碑剧集榜     | tv_chinese_best_weekly     |\n  | 全球口碑剧集榜     | tv_global_best_weekly      |\n  | 国内口碑综艺榜     | show_chinese_best_weekly   |\n  | 国外口碑综艺榜     | show_global_best_weekly    |\n  | 热播新剧国产剧     | tv_domestic                  |\n  | 热播新剧欧美剧     | tv_american                  |\n  | 热播新剧日剧       | tv_japanese                  |\n  | 热播新剧韩剧       | tv_korean                    |\n  | 热播新剧动画       | tv_animation                 |\n  | 虚构类小说热门榜   | book_fiction_hot_weekly    |\n  | 非虚构类小说热门榜 | book_nonfiction_hot_weekly |\n  | 热门单曲榜         | music_single                 |\n  | 华语新碟榜         | music_chinese                |\n  | ...                | ...                           |\n\n  | 额外参数 | 含义                   | 接受的值 | 默认值 |\n  | -------- | ---------------------- | -------- | ------ |\n  | playable | 仅看有可播放片源的影片 | 0/1      | 0      |\n  | score    | 筛选评分               | 0-10     | 0      |\n\n  用例：`/douban/list/tv_korean/playable=1&score=8`\n\n  > 上面的榜单 / 集合并没有列举完整。\n  >\n  > 如何找到榜单对应的路由参数：\n  > 在豆瓣手机 APP 中，对应地榜单页面右上角，点击分享链接。链接路径 `subject_collection` 后的路径就是路由参数 `type`。\n  > 如：小说热门榜的分享链接为：`https://m.douban.com/subject_collection/ECDIHUN4A`，其对应本 RSS 路由的 `type` 为 `ECDIHUN4A`，对应的订阅链接路由：[`/douban/list/ECDIHUN4A`](https://rsshub.app/douban/list/ECDIHUN4A)","location":"other/list.ts"}' />

| 榜单 / 集合        | 路由                          |
  | ------------------ | ----------------------------- |
  | 实时热门书影音     | subject_real_time_hotest   |
  | 影院热映           | movie_showing                |
  | 实时热门电影       | movie_real_time_hotest     |
  | 实时热门电视       | tv_real_time_hotest        |
  | 一周口碑电影榜     | movie_weekly_best           |
  | 华语口碑剧集榜     | tv_chinese_best_weekly     |
  | 全球口碑剧集榜     | tv_global_best_weekly      |
  | 国内口碑综艺榜     | show_chinese_best_weekly   |
  | 国外口碑综艺榜     | show_global_best_weekly    |
  | 热播新剧国产剧     | tv_domestic                  |
  | 热播新剧欧美剧     | tv_american                  |
  | 热播新剧日剧       | tv_japanese                  |
  | 热播新剧韩剧       | tv_korean                    |
  | 热播新剧动画       | tv_animation                 |
  | 虚构类小说热门榜   | book_fiction_hot_weekly    |
  | 非虚构类小说热门榜 | book_nonfiction_hot_weekly |
  | 热门单曲榜         | music_single                 |
  | 华语新碟榜         | music_chinese                |
  | ...                | ...                           |

  | 额外参数 | 含义                   | 接受的值 | 默认值 |
  | -------- | ---------------------- | -------- | ------ |
  | playable | 仅看有可播放片源的影片 | 0/1      | 0      |
  | score    | 筛选评分               | 0-10     | 0      |

  用例：`/douban/list/tv_korean/playable=1&score=8`

  > 上面的榜单 / 集合并没有列举完整。
  >
  > 如何找到榜单对应的路由参数：
  > 在豆瓣手机 APP 中，对应地榜单页面右上角，点击分享链接。链接路径 `subject_collection` 后的路径就是路由参数 `type`。
  > 如：小说热门榜的分享链接为：`https://m.douban.com/subject_collection/ECDIHUN4A`，其对应本 RSS 路由的 `type` 为 `ECDIHUN4A`，对应的订阅链接路由：[`/douban/list/ECDIHUN4A`](https://rsshub.app/douban/list/ECDIHUN4A)

### 豆瓣每月推荐片单 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/recommended/:type?/:routeParams?","categories":["social-media"],"example":"/douban/recommended/tv","parameters":{"type":"片单类型剧集/电影，tv或movie，默认为tv","routeParams":"额外参数；请参阅以下说明和表格"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"豆瓣每月推荐片单","maintainers":["honue"],"description":"| 额外参数 | 含义                   | 接受的值 | 默认值 |\n  | -------- | ---------------------- | -------- | ------ |\n  | playable | 仅看有可播放片源的影片 | 0/1      | 0      |\n  | score    | 筛选评分               | 0-10     | 0      |\n\n  用例：`/douban/recommended/tv/playable=0&score=8`\n\n  :::tip\n  整合了 /douban/list/ 路由，省去每月手动更新 id 参数，因为当月推荐剧集片单中，会有还未播出 / 开评分剧集、海外平台播出剧集，请自行考虑是否使用额外参数。\n  :::","location":"other/recommended.ts"}' />

| 额外参数 | 含义                   | 接受的值 | 默认值 |
  | -------- | ---------------------- | -------- | ------ |
  | playable | 仅看有可播放片源的影片 | 0/1      | 0      |
  | score    | 筛选评分               | 0-10     | 0      |

  用例：`/douban/recommended/tv/playable=0&score=8`

  :::tip
  整合了 /douban/list/ 路由，省去每月手动更新 id 参数，因为当月推荐剧集片单中，会有还未播出 / 开评分剧集、海外平台播出剧集，请自行考虑是否使用额外参数。
  :::

### 话题 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/topic/:id/:sort?","categories":["social-media"],"example":"/douban/topic/48823","parameters":{"id":"话题id","sort":"排序方式，hot或new，默认为new"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"话题","maintainers":["LogicJake"],"location":"other/topic.ts"}' />

### 即将上映的电影 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/movie/later","categories":["social-media"],"example":"/douban/movie/later","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"即将上映的电影","maintainers":["DIYgod"],"location":"other/later.ts"}' />

### 浏览发现 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/explore","categories":["social-media"],"example":"/douban/explore","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"浏览发现","maintainers":["clarkzsd"],"location":"other/explore.ts"}' />

### 频道书影音 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/channel/:id/subject/:nav","categories":["social-media"],"example":"/douban/channel/30168934/subject/0","parameters":{"id":"频道id","nav":"书影音分类"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"频道书影音","maintainers":["umm233"],"description":"| 电影 | 电视剧 | 图书 | 唱片 |\n  | ---- | ------ | ---- | ---- |\n  | 0    | 1      | 2    | 3    |","location":"channel/subject.ts"}' />

| 电影 | 电视剧 | 图书 | 唱片 |
  | ---- | ------ | ---- | ---- |
  | 0    | 1      | 2    | 3    |

### 频道专题 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/channel/:id/:nav?","categories":["social-media"],"example":"/douban/channel/30168934/hot","parameters":{"id":"频道id","nav":"专题分类，可选，默认为 default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"频道专题","maintainers":["umm233"],"description":"| 默认    | 热门 | 最新 |\n  | ------- | ---- | ---- |\n  | default | hot  | new  |","location":"channel/topic.ts"}' />

| 默认    | 热门 | 最新 |
  | ------- | ---- | ---- |
  | default | hot  | new  |

### 热门图书排行 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/book/rank/:type?","categories":["social-media"],"example":"/douban/book/rank/fiction","parameters":{"type":"图书类型，默认合并列表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"热门图书排行","maintainers":["xyqfer","queensferryme"],"description":"| 全部 | 虚构    | 非虚构     |\n  | ---- | ------- | ---------- |\n  |      | fiction | nonfiction |","location":"book/rank.ts"}' />

| 全部 | 虚构    | 非虚构     |
  | ---- | ------- | ---------- |
  |      | fiction | nonfiction |

### 热门同城活动 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/event/hot/:locationId","categories":["social-media"],"example":"/douban/event/hot/118172","parameters":{"locationId":"位置 id, [同城首页](https://www.douban.com/location)打开控制台执行 `window.__loc_id__` 获取"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"热门同城活动","maintainers":["xyqfer"],"location":"event/hot.ts"}' />

### 日记最新回应 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/replies/:uid","categories":["social-media"],"example":"/douban/replies/xiaoyaxiaoya","parameters":{"uid":"用户id，可在用户日记页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"日记最新回应","maintainers":["nczitzk"],"location":"other/replies.ts"}' />

### 商务印书馆新书速递 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/commercialpress/latest","categories":["social-media"],"example":"/douban/commercialpress/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"商务印书馆新书速递","maintainers":["xyqfer"],"location":"commercialpress/latest.ts"}' />

### 新书速递 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/book/latest/:type?","categories":["social-media"],"example":"/douban/book/latest/fiction","parameters":{"type":"专题分类，可选，默认为 `all`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新书速递","maintainers":["fengkx","lyqluis"],"description":"\n    | 文学         | 小说    | 历史文化 | 社会纪实  | 科学新知 | 艺术设计 | 商业经管 | 绘本漫画 |\n    | ------------ | ------- | -------- | --------- | -------- | -------- | -------- | -------- |\n    | prose_poetry | fiction | history  | biography | science  | art      | business | comics   |","location":"book/latest.ts"}' />


    | 文学         | 小说    | 历史文化 | 社会纪实  | 科学新知 | 艺术设计 | 商业经管 | 绘本漫画 |
    | ------------ | ------- | -------- | --------- | -------- | -------- | -------- | -------- |
    | prose_poetry | fiction | history  | biography | science  | art      | business | comics   |

### 一周口碑榜 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/movie/weekly/:type?","categories":["social-media"],"example":"/douban/movie/weekly","parameters":{"type":"分类，可在榜单页 URL 中找到，默认为一周口碑电影榜"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"一周口碑榜","maintainers":["numm233","nczitzk"],"description":"| 一周口碑电影榜      | 华语口碑剧集榜            |\n  | ------------------- | ------------------------- |\n  | movie_weekly_best | tv_chinese_best_weekly |","location":"other/weekly-best.ts"}' />

| 一周口碑电影榜      | 华语口碑剧集榜            |
  | ------------------- | ------------------------- |
  | movie_weekly_best | tv_chinese_best_weekly |

### 用户想看 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/people/:userid/wish/:routeParams?","categories":["social-media"],"example":"/douban/people/exherb/wish","parameters":{"userid":"用户id","routeParams":"额外参数；见下"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户想看","maintainers":["exherb"],"description":"对于豆瓣用户想看的内容，在 `routeParams` 参数中以 query string 格式设置如下选项可以控制输出的样式\n\n  | 键         | 含义       | 接受的值 | 默认值 |\n  | ---------- | ---------- | -------- | ------ |\n  | pagesCount | 查询页面数 |          | 1      |","location":"people/wish.ts"}' />

对于豆瓣用户想看的内容，在 `routeParams` 参数中以 query string 格式设置如下选项可以控制输出的样式

  | 键         | 含义       | 接受的值 | 默认值 |
  | ---------- | ---------- | -------- | ------ |
  | pagesCount | 查询页面数 |          | 1      |

### 正在上映的电影 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":["/movie/playing","/movie/playing/:score"],"categories":["social-media"],"example":"/douban/movie/playing","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"正在上映的电影","maintainers":["DIYgod"],"location":"other/playing.ts"}' />

### 正在上映的电影 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":["/movie/playing","/movie/playing/:score"],"categories":["social-media"],"example":"/douban/movie/playing","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"正在上映的电影","maintainers":["DIYgod"],"location":"other/playing.ts"}' />

### 最新增加的音乐 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/music/latest/:area?","categories":["social-media"],"example":"/douban/music/latest/chinese","parameters":{"area":"区域类型，默认全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新增加的音乐","maintainers":["fengkx","xyqfer"],"description":"| 华语    | 欧美    | 日韩        |\n  | ------- | ------- | ----------- |\n  | chinese | western | japankorean |","location":"other/latest-music.ts"}' />

| 华语    | 欧美    | 日韩        |
  | ------- | ------- | ----------- |
  | chinese | western | japankorean |

### 最新回应过的日记 <Site url="www.douban.com" size="sm" />

<Route namespace="douban" :data='{"path":"/replied/:uid","categories":["social-media"],"example":"/douban/replied/xiaoyaxiaoya","parameters":{"uid":"用户id，可在用户日记页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新回应过的日记","maintainers":["nczitzk"],"location":"other/replied.ts"}' />

## 方格子 <Site url="vocus.cc"/>

### 出版專題 <Site url="vocus.cc" size="sm" />

<Route namespace="vocus" :data='{"path":"/publication/:id","categories":["social-media"],"example":"/vocus/publication/bass","parameters":{"id":"出版專題 id，可在出版專題主页的 URL 找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["vocus.cc/:id/home","vocus.cc/:id/introduce"]}],"name":"出版專題","maintainers":["Maecenas"],"location":"publication.ts"}' />

### 用户个人文章 <Site url="vocus.cc" size="sm" />

<Route namespace="vocus" :data='{"path":"/user/:id","categories":["social-media"],"example":"/vocus/user/tsetyan","parameters":{"id":"用户 id，可在用户主页的 URL 找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户个人文章","maintainers":["LogicJake"],"location":"user.ts"}' />

## 即刻 <Site url="m.okjike.com"/>

### 圈子 - 纯文字 <Site url="m.okjike.com" size="sm" />

<Route namespace="jike" :data='{"path":"/topic/text/:id","categories":["social-media"],"example":"/jike/topic/text/553870e8e4b0cafb0a1bef68","parameters":{"id":"圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["web.okjike.com/topic/:id"]}],"name":"圈子 - 纯文字","maintainers":["HenryQW"],"location":"topic-text.ts"}' />

### 圈子 <Site url="m.okjike.com" size="sm" />

<Route namespace="jike" :data='{"path":"/topic/:id/:showUid?","categories":["social-media"],"example":"/jike/topic/556688fae4b00c57d9dd46ee","parameters":{"id":"圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到","showUid":"是否在内容中显示用户信息，设置为 1 则开启"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["web.okjike.com/topic/:id"],"target":"/topic/:id"}],"name":"圈子","maintainers":["DIYgod","prnake"],"location":"topic.ts"}' />

### 用户动态 <Site url="m.okjike.com" size="sm" />

<Route namespace="jike" :data='{"path":"/user/:id","categories":["social-media"],"example":"/jike/user/3EE02BC9-C5B3-4209-8750-4ED1EE0F67BB","parameters":{"id":"用户 id, 可在即刻分享出来的单条动态页点击用户头像进入个人主页，然后在个人主页的 URL 中找到，或者在单条动态页使用 RSSHub Radar 插件"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["web.okjike.com/u/:uid"],"target":"/user/:uid"}],"name":"用户动态","maintainers":["DIYgod","prnake"],"location":"user.ts"}' />

## 简书 <Site url="www.jianshu.com"/>

### 首页 <Site url="www.jianshu.com/" size="sm" />

<Route namespace="jianshu" :data='{"path":"/home","categories":["social-media"],"example":"/jianshu/home","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.jianshu.com/"]}],"name":"首页","maintainers":["DIYgod","HenryQW","JimenezLi"],"url":"www.jianshu.com/","location":"home.ts"}' />

### 专题 <Site url="www.jianshu.com" size="sm" />

<Route namespace="jianshu" :data='{"path":"/collection/:id","categories":["social-media"],"example":"/jianshu/collection/xYuZYD","parameters":{"id":"专题 id, 可在专题页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.jianshu.com/c/:id"]}],"name":"专题","maintainers":["DIYgod","HenryQW","JimenezLi"],"location":"collection.ts"}' />

### 作者 <Site url="www.jianshu.com" size="sm" />

<Route namespace="jianshu" :data='{"path":"/user/:id","categories":["social-media"],"example":"/jianshu/user/yZq3ZV","parameters":{"id":"作者 id, 可在作者主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.jianshu.com/u/:id"]}],"name":"作者","maintainers":["DIYgod","HenryQW","JimenezLi"],"location":"user.ts"}' />

## 酷安 <Site url="coolapk.com"/>

### 话题 <Site url="coolapk.com" size="sm" />

<Route namespace="coolapk" :data='{"path":"/huati/:tag","categories":["social-media"],"example":"/coolapk/huati/iPhone","parameters":{"tag":"话题名称"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"话题","maintainers":["xizeyoupan"],"location":"huati.ts"}' />

### 看看号 <Site url="coolapk.com" size="sm" />

<Route namespace="coolapk" :data='{"path":"/dyh/:dyhId","categories":["social-media"],"example":"/coolapk/dyh/1524","parameters":{"dyhId":"看看号ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"看看号","maintainers":["xizeyoupan"],"description":":::tip\n  仅限于采集**站内订阅**的看看号的内容。看看号 ID 可在看看号界面右上分享 - 复制链接得到。\n  :::","location":"dyh.ts"}' />

:::tip
  仅限于采集**站内订阅**的看看号的内容。看看号 ID 可在看看号界面右上分享 - 复制链接得到。
  :::

### 热榜 <Site url="coolapk.com" size="sm" />

<Route namespace="coolapk" :data='{"path":"/hot/:type?/:period?","categories":["social-media"],"example":"/coolapk/hot","parameters":{"type":"默认为`jrrm`","period":"默认为`daily`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"热榜","maintainers":["xizeyoupan"],"description":"| 参数名称 | 今日热门 | 点赞榜 | 评论榜 | 收藏榜 | 酷图榜 |\n  | -------- | -------- | ------ | ------ | ------ | ------ |\n  | type     | jrrm     | dzb    | plb    | scb    | ktb    |\n\n  | 参数名称 | 日榜  | 周榜   |\n  | -------- | ----- | ------ |\n  | period   | daily | weekly |\n\n  :::tip\n  今日热门没有周榜，酷图榜日榜的参数会变成周榜，周榜的参数会变成月榜。\n  :::","location":"hot.ts"}' />

| 参数名称 | 今日热门 | 点赞榜 | 评论榜 | 收藏榜 | 酷图榜 |
  | -------- | -------- | ------ | ------ | ------ | ------ |
  | type     | jrrm     | dzb    | plb    | scb    | ktb    |

  | 参数名称 | 日榜  | 周榜   |
  | -------- | ----- | ------ |
  | period   | daily | weekly |

  :::tip
  今日热门没有周榜，酷图榜日榜的参数会变成周榜，周榜的参数会变成月榜。
  :::

### 头条 <Site url="coolapk.com" size="sm" />

<Route namespace="coolapk" :data='{"path":"/toutiao/:type?","categories":["social-media"],"example":"/coolapk/toutiao","parameters":{"type":"默认为history"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"头条","maintainers":["xizeyoupan"],"description":"| 参数名称 | 历史头条 | 最新   |\n  | -------- | -------- | ------ |\n  | type     | history  | latest |","location":"toutiao.ts"}' />

| 参数名称 | 历史头条 | 最新   |
  | -------- | -------- | ------ |
  | type     | history  | latest |

### 图文 <Site url="coolapk.com" size="sm" />

<Route namespace="coolapk" :data='{"path":["/tuwen/:type?","/tuwen-xinxian"],"categories":["social-media"],"example":"/coolapk/tuwen","parameters":{"type":"默认为hot"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"图文","maintainers":["xizeyoupan"],"description":"| 参数名称 | 编辑精选 | 最新   |\n  | -------- | -------- | ------ |\n  | type     | hot      | latest |","location":"tuwen.ts"}' />

| 参数名称 | 编辑精选 | 最新   |
  | -------- | -------- | ------ |
  | type     | hot      | latest |

### 图文 <Site url="coolapk.com" size="sm" />

<Route namespace="coolapk" :data='{"path":["/tuwen/:type?","/tuwen-xinxian"],"categories":["social-media"],"example":"/coolapk/tuwen","parameters":{"type":"默认为hot"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"图文","maintainers":["xizeyoupan"],"description":"| 参数名称 | 编辑精选 | 最新   |\n  | -------- | -------- | ------ |\n  | type     | hot      | latest |","location":"tuwen.ts"}' />

| 参数名称 | 编辑精选 | 最新   |
  | -------- | -------- | ------ |
  | type     | hot      | latest |

### 用户 <Site url="coolapk.com" size="sm" />

<Route namespace="coolapk" :data='{"path":"/user/:uid/dynamic","categories":["social-media"],"example":"/coolapk/user/3177668/dynamic","parameters":{"uid":"在个人界面右上分享-复制链接获取"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户","maintainers":["xizeyoupan"],"location":"user-dynamic.ts"}' />

## 腾讯新闻较真查证平台 <Site url="ac.qq.com"/>

### 用户作品评论动态 <Site url="ac.qq.com" size="sm" />

<Route namespace="qq" :data='{"path":"/kg/reply/:playId","categories":["social-media"],"example":"/qq/kg/reply/OhXHMdO1VxLWQOOm","parameters":{"playId":"音频页 ID, 可在对应页面的 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户作品评论动态","maintainers":["zhangxiang012"],"location":"kg/reply.ts"}' />

### 用户作品列表 <Site url="ac.qq.com" size="sm" />

<Route namespace="qq" :data='{"path":"/kg/:userId","categories":["social-media"],"example":"/qq/kg/639a9a86272c308e33","parameters":{"userId":"用户 ID, 可在对应页面的 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":true,"supportScihub":false},"name":"用户作品列表","maintainers":["zhangxiang012"],"location":"kg/user.ts"}' />

## 微博绿洲 <Site url="weibo.com"/>

:::warning
微博会针对请求的来源地区返回不同的结果。一个已知的例子为：部分视频因未知原因仅限中国大陆境内访问 (CDN 域名为 `locallimit.us.sinaimg.cn` 而非 `f.video.weibocdn.com`)。若一条微博含有这种视频且 RSSHub 实例部署在境外，抓取到的微博可能不含视频。将 RSSHub 部署在境内有助于抓取这种视频，但阅读器也必须处于境内网络环境以加载视频。
:::

对于微博内容，在 `routeParams` 参数中以 query string 格式指定选项，可以控制输出的样式

| 键                         | 含义                                                               | 接受的值       | 默认值                              |
| -------------------------- | ------------------------------------------------------------------ | -------------- | ----------------------------------- |
| readable                   | 是否开启细节排版可读性优化                                         | 0/1/true/false | false                               |
| authorNameBold             | 是否加粗作者名字                                                   | 0/1/true/false | false                               |
| showAuthorInTitle          | 是否在标题处显示作者                                               | 0/1/true/false | false（`/weibo/keyword/`中为 true） |
| showAuthorInDesc           | 是否在正文处显示作者                                               | 0/1/true/false | false（`/weibo/keyword/`中为 true） |
| showAuthorAvatarInDesc     | 是否在正文处显示作者头像（若阅读器会提取正文图片，不建议开启）     | 0/1/true/false | false                               |
| showEmojiForRetweet        | 显示 “🔁” 取代 “转发” 两个字                                       | 0/1/true/false | false                               |
| showRetweetTextInTitle     | 在标题出显示转发评论（置为 false 则在标题只显示被转发微博）        | 0/1/true/false | true                                |
| addLinkForPics             | 为图片添加可点击的链接                                             | 0/1/true/false | false                               |
| showTimestampInDescription | 在正文处显示被转发微博的时间戳                                     | 0/1/true/false | false                               |
| widthOfPics                | 微博配图宽（生效取决于阅读器）                                     | 不指定 / 数字  | 不指定                              |
| heightOfPics               | 微博配图高（生效取决于阅读器）                                     | 不指定 / 数字  | 不指定                              |
| sizeOfAuthorAvatar         | 作者头像大小                                                       | 数字           | 48                                  |
| displayVideo               | 是否直接显示微博视频和 Live Photo，只在博主或个人时间线 RSS 中有效 | 0/1/true/false | true                                |
| displayArticle             | 是否直接显示微博文章，只在博主或个人时间线 RSS 中有效              | 0/1/true/false | false                               |
| displayComments            | 是否直接显示热门评论，只在博主或个人时间线 RSS 中有效              | 0/1/true/false | false                               |
| showEmojiInDescription     | 是否展示正文中的微博表情，关闭则替换为 `[表情名]`                  | 0/1/true/false | true                                |
| showLinkIconInDescription  | 是否展示正文中的链接图标                                           | 0/1/true/false | true                                |
| preferMobileLink           | 是否使用移动版链接（默认使用 PC 版）                               | 0/1/true/false | false                               |

指定更多与默认值不同的参数选项可以改善 RSS 的可读性，如

[https://rsshub.app/weibo/user/1642909335/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweet=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showTimestampInDescription=1&heightOfPics=150](https://rsshub.app/weibo/user/1642909335/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweet=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showTimestampInDescription=1&heightOfPics=150)

的效果为

<img loading="lazy" src="/img/readable-weibo.png" alt="微博小秘书的可读微博 RSS" />

### 博主 <Site url="weibo.com" size="sm" />

<Route namespace="weibo" :data='{"path":"/user/:uid/:routeParams?","categories":["social-media"],"example":"/weibo/user/1195230310","parameters":{"uid":"用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取","routeParams":"额外参数；请参阅上面的说明和表格；特别地，当 `routeParams=1` 时开启微博视频显示"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["m.weibo.cn/u/:uid","m.weibo.cn/profile/:uid"],"target":"/user/:uid"}],"name":"博主","maintainers":["DIYgod","iplusx","Rongronggg9"],"description":":::warning\n  部分博主仅登录可见，未提供 Cookie 的情况下不支持订阅，可以通过打开 `https://m.weibo.cn/u/:uid` 验证。如需要订阅该部分博主，可配置 Cookie 后订阅。\n\n  未提供 Cookie 的情况下偶尔会触发反爬限制，提供 Cookie 可缓解该情况。\n\n  微博用户 Cookie 的配置可参照部署文档\n  :::","location":"user.ts"}' />

:::warning
  部分博主仅登录可见，未提供 Cookie 的情况下不支持订阅，可以通过打开 `https://m.weibo.cn/u/:uid` 验证。如需要订阅该部分博主，可配置 Cookie 后订阅。

  未提供 Cookie 的情况下偶尔会触发反爬限制，提供 Cookie 可缓解该情况。

  微博用户 Cookie 的配置可参照部署文档
  :::

### 超话 <Site url="weibo.com" size="sm" />

<Route namespace="weibo" :data='{"path":"/super_index/:id/:type?/:routeParams?","categories":["social-media"],"example":"/weibo/super_index/1008084989d223732bf6f02f75ea30efad58a9/sort_time","parameters":{"id":"超话ID","type":"类型：见下表","routeParams":"额外参数；请参阅上面的说明和表格"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["weibo.com/p/:id/super_index"],"target":"/super_index/:id"}],"name":"超话","maintainers":["zengxs","Rongronggg9"],"description":"| type       | 备注             |\n| ---------- | ---------------- |\n| soul       | 精华             |\n| video      | 视频（暂不支持） |\n| album      | 相册（暂不支持） |\n| hot_sort  | 热门             |\n| sort_time | 最新帖子         |\n| feed       | 最新评论         |","location":"super-index.ts"}' />

| type       | 备注             |
| ---------- | ---------------- |
| soul       | 精华             |
| video      | 视频（暂不支持） |
| album      | 相册（暂不支持） |
| hot_sort  | 热门             |
| sort_time | 最新帖子         |
| feed       | 最新评论         |

### 个人时间线 <Site url="weibo.com" size="sm" />

<Route namespace="weibo" :data='{"path":"/timeline/:uid/:feature?/:routeParams?","categories":["social-media"],"example":"/weibo/timeline/3306934123","parameters":{"uid":"用户的uid","feature":"过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。","routeParams":"额外参数；请参阅上面的说明和表格"},"features":{"requireConfig":[{"name":"WEIBO_APP_KEY","description":""},{"name":"WEIBO_REDIRECT_URL","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"个人时间线","maintainers":["zytomorrow","DIYgod","Rongronggg9"],"description":":::warning\n  需要对应用户打开页面进行授权生成 token 才能生成内容\n\n  自部署需要申请并配置微博 key，具体见部署文档\n  :::","location":"timeline.ts"}' />

:::warning
  需要对应用户打开页面进行授权生成 token 才能生成内容

  自部署需要申请并配置微博 key，具体见部署文档
  :::

### 关键词 <Site url="weibo.com" size="sm" />

<Route namespace="weibo" :data='{"path":"/keyword/:keyword/:routeParams?","categories":["social-media"],"example":"/weibo/keyword/DIYgod","parameters":{"keyword":"你想订阅的微博关键词","routeParams":"额外参数；请参阅上面的说明和表格"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"关键词","maintainers":["DIYgod","Rongronggg9"],"location":"keyword.ts"}' />

### 热搜榜 <Site url="s.weibo.com/top/summary" size="sm" />

<Route namespace="weibo" :data='{"path":"/search/hot/:fulltext?","categories":["social-media"],"example":"/weibo/search/hot","parameters":{"fulltext":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["s.weibo.com/top/summary"]}],"name":"热搜榜","maintainers":["xyqfer","shinemoon"],"url":"s.weibo.com/top/summary","description":"-   使用`/weibo/search/hot`可以获取热搜条目列表；\n-   使用`/weibo/search/hot/fulltext`可以进一步获取热搜条目下的摘要信息（不含图片视频）；\n-   使用`/weibo/search/hot/fulltext?pic=true`可以获取图片缩略（但需要配合额外的手段，例如浏览器上的 Header Editor 等来修改 referer 参数为`https://weibo.com`，以规避微博的外链限制，否则图片无法显示。）\n-   使用`/weibo/search/hot/fulltext?pic=true&fullpic=true`可以获取 Original 图片（但需要配合额外的手段，例如浏览器上的 Header Editor 等来修改 referer 参数为`https://weibo.com`，以规避微博的外链限制，否则图片无法显示。）","location":"search/hot.ts"}' />

-   使用`/weibo/search/hot`可以获取热搜条目列表；
-   使用`/weibo/search/hot/fulltext`可以进一步获取热搜条目下的摘要信息（不含图片视频）；
-   使用`/weibo/search/hot/fulltext?pic=true`可以获取图片缩略（但需要配合额外的手段，例如浏览器上的 Header Editor 等来修改 referer 参数为`https://weibo.com`，以规避微博的外链限制，否则图片无法显示。）
-   使用`/weibo/search/hot/fulltext?pic=true&fullpic=true`可以获取 Original 图片（但需要配合额外的手段，例如浏览器上的 Header Editor 等来修改 referer 参数为`https://weibo.com`，以规避微博的外链限制，否则图片无法显示。）

### 用户 <Site url="weibo.com" size="sm" />

<Route namespace="weibo" :data='{"path":"/oasis/user/:userid","categories":["social-media"],"example":"/weibo/oasis/user/1990895721","parameters":{"userid":"用户 id, 可在用户主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["m.weibo.cn/u/:uid","m.weibo.cn/profile/:uid"],"target":"/user/:uid"}],"name":"用户","maintainers":["kt286"],"location":"oasis/user.ts"}' />

### 自定义分组 <Site url="weibo.com" size="sm" />

<Route namespace="weibo" :data='{"path":"/group/:gid/:gname?/:routeParams?","categories":["social-media"],"example":"/weibo/group/4541216424989965","parameters":{"gid":"分组id, 在网页版分组地址栏末尾`?gid=`处获取","gname":"分组显示名称; 默认为: `微博分组`","routeParams":"额外参数；请参阅上面的说明和表格"},"features":{"requireConfig":[{"name":"WEIBO_COOKIES","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"自定义分组","maintainers":["monologconnor","Rongronggg9"],"description":":::warning\n  由于微博官方未提供自定义分组相关 api, 此方案必须使用用户`Cookie`进行抓取\n\n  因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知\n\n  微博用户 Cookie 的配置可参照部署文档\n  :::","location":"group.ts"}' />

:::warning
  由于微博官方未提供自定义分组相关 api, 此方案必须使用用户`Cookie`进行抓取

  因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

  微博用户 Cookie 的配置可参照部署文档
  :::

### 最新关注时间线 <Site url="weibo.com/" size="sm" />

<Route namespace="weibo" :data='{"path":"/friends/:routeParams?","categories":["social-media"],"example":"/weibo/friends","parameters":{"routeParams":"额外参数；请参阅上面的说明和表格"},"features":{"requireConfig":[{"name":"WEIBO_COOKIES","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["weibo.com/"],"target":"/friends"}],"name":"最新关注时间线","maintainers":["CaoMeiYouRen"],"url":"weibo.com/","description":":::warning\n  此方案必须使用用户`Cookie`进行抓取\n\n  因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知\n\n  微博用户 Cookie 的配置可参照部署文档\n  :::","location":"friends.ts"}' />

:::warning
  此方案必须使用用户`Cookie`进行抓取

  因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

  微博用户 Cookie 的配置可参照部署文档
  :::

## 小红书 <Site url="xiaohongshu.com"/>

### Unknown <Site url="xiaohongshu.com" size="sm" />

<Route namespace="xiaohongshu" :data='{"path":"/user/:user_id/notes/fulltext","radar":[{"source":["xiaohongshu.com/user/profile/:user_id"],"target":"/user/:user_id/notes"}],"name":"Unknown","maintainers":[],"location":"notes.ts"}' />

### Unknown <Site url="xiaohongshu.com" size="sm" />

<Route namespace="xiaohongshu" :data='{"path":"/user/:user_id/:category","name":"Unknown","maintainers":[],"location":"user.ts"}' />

### 专辑 <Site url="xiaohongshu.com" size="sm" />

<Route namespace="xiaohongshu" :data='{"path":"/board/:board_id","categories":["social-media"],"example":"/xiaohongshu/board/5db6f79200000000020032df","parameters":{"board_id":"专辑 ID"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xiaohongshu.com/board/:board_id"]}],"name":"专辑","maintainers":["lotosbin"],"location":"board.ts"}' />

## 新榜 <Site url="newrank.cn"/>

:::warning
部署时需要配置 NEWRANK_COOKIE，具体见部署文档
请勿过高频抓取，新榜疑似对每天调用 token 总次数进行了限制，超限会报错
:::

### 抖音短视频 <Site url="newrank.cn" size="sm" />

<Route namespace="newrank" :data='{"path":"/douyin/:dyid","categories":["social-media"],"example":"/newrank/douyin/110266463747","parameters":{"dyid":"抖音ID，可在新榜账号详情 URL 中找到"},"features":{"requireConfig":[{"name":"NEWRANK_COOKIE","description":""}],"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"抖音短视频","maintainers":["lessmoe"],"description":":::warning\n免费版账户抖音每天查询次数 20 次，如需增加次数可购买新榜会员或等待未来多账户支持\n:::","location":"douyin.ts"}' />

:::warning
免费版账户抖音每天查询次数 20 次，如需增加次数可购买新榜会员或等待未来多账户支持
:::

### 微信公众号 <Site url="newrank.cn" size="sm" />

<Route namespace="newrank" :data='{"path":"/wechat/:wxid","categories":["social-media"],"example":"/newrank/wechat/chijiread","parameters":{"wxid":"微信号，若微信号与新榜信息不一致，以新榜为准"},"features":{"requireConfig":[{"name":"NEWRANK_COOKIE","description":""}],"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"微信公众号","maintainers":["lessmoe"],"location":"wechat.ts"}' />

## 知乎 <Site url="www.zhihu.com"/>

### xhu - 用户动态 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/xhu/people/activities/:hexId","categories":["social-media"],"example":"/zhihu/xhu/people/activities/246e6cf44e94cefbf4b959cb5042bc91","parameters":{"hexId":"用户的 16 进制 id，获取方式见下方说明"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/people/:id"],"target":"/people/activities/:id"}],"name":"xhu - 用户动态","maintainers":["JimenezLi"],"description":"[xhu](https://github.com/REToys/xhu)\n\n  :::tip\n  用户的 16 进制 id 获取方式：\n\n  1.  可以通过 RSSHub Radar 扩展获取；\n  2.  或者在用户主页打开 F12 控制台，执行以下代码：`console.log(/\"id\":\"([0-9a-f]*?)\",\"urlToken\"/.exec(document.getElementById(&#39;js-initialData&#39;).innerHTML)[1]);` 即可获取用户的 16 进制 id。\n  :::","location":"xhu/activities.ts"}' />

[xhu](https://github.com/REToys/xhu)

  :::tip
  用户的 16 进制 id 获取方式：

  1.  可以通过 RSSHub Radar 扩展获取；
  2.  或者在用户主页打开 F12 控制台，执行以下代码：`console.log(/"id":"([0-9a-f]*?)","urlToken"/.exec(document.getElementById('js-initialData').innerHTML)[1]);` 即可获取用户的 16 进制 id。
  :::

### xhu - 用户回答 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/xhu/people/answers/:hexId","categories":["social-media"],"example":"/zhihu/xhu/people/answers/246e6cf44e94cefbf4b959cb5042bc91","parameters":{"hexId":"用户的 16 进制 id，获取方式同 [xhu - 用户动态](#zhi-hu-xhu-yong-hu-dong-tai)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/people/:id/answers"],"target":"/people/answers/:id"}],"name":"xhu - 用户回答","maintainers":["JimenezLi"],"location":"xhu/answers.ts"}' />

### xhu - 收藏夹 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/xhu/collection/:id","categories":["social-media"],"example":"/zhihu/xhu/collection/26444956","parameters":{"id":"收藏夹 id, 可在收藏夹页面 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/collection/:id"]}],"name":"xhu - 收藏夹","maintainers":["JimenezLi"],"location":"xhu/collection.ts"}' />

### xhu - 用户文章 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/xhu/people/posts/:hexId","categories":["social-media"],"example":"/zhihu/xhu/people/posts/246e6cf44e94cefbf4b959cb5042bc91","parameters":{"hexId":"用户的 16 进制 id，获取方式同 [xhu - 用户动态](#zhi-hu-xhu-yong-hu-dong-tai)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"xhu - 用户文章","maintainers":["JimenezLi"],"location":"xhu/posts.ts"}' />

### xhu - 问题 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/xhu/question/:questionId/:sortBy?","categories":["social-media"],"example":"/zhihu/xhu/question/264051433","parameters":{"questionId":"问题 id","sortBy":"排序方式：`default`, `created`, `updated`。默认为 `default`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/question/:questionId"],"target":"/xhu/question/:questionId"}],"name":"xhu - 问题","maintainers":["JimenezLi"],"location":"xhu/question.ts"}' />

### xhu - 话题 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/xhu/topic/:topicId","categories":["social-media"],"example":"/zhihu/xhu/topic/19566035","parameters":{"topicId":"话题ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/topic/:topicId/:type"]}],"name":"xhu - 话题","maintainers":["JimenezLi"],"location":"xhu/topic.ts"}' />

### xhu- 专栏 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/xhu/zhuanlan/:id","categories":["social-media"],"example":"/zhihu/xhu/zhuanlan/githubdaily","parameters":{"id":"专栏 id, 可在专栏主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zhuanlan.zhihu.com/:id"],"target":"/zhuanlan/:id"}],"name":"xhu- 专栏","maintainers":["JimenezLi"],"location":"xhu/zhuanlan.ts"}' />

### 话题 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/topic/:topicId/:isTop?","categories":["social-media"],"example":"/zhihu/topic/19828946","parameters":{"topicId":"话题 id","isTop":"仅精华，默认为否，其他值为是"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/topic/:topicId/:type"],"target":"/topic/:topicId"}],"name":"话题","maintainers":["xyqfer"],"location":"topic.ts"}' />

### 收藏夹 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/collection/:id/:getAll?","categories":["social-media"],"example":"/zhihu/collection/26444956","parameters":{"id":"收藏夹 id，可在收藏夹页面 URL 中找到","getAll":"获取全部收藏内容，任意值为打开"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/collection/:id"],"target":"/collection/:id"}],"name":"收藏夹","maintainers":["huruji","Colin-XKL","Fatpandac"],"location":"collection.ts"}' />

### 问题 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/question/:questionId/:sortBy?","categories":["social-media"],"example":"/zhihu/question/59895982","parameters":{"questionId":"问题 id","sortBy":"排序方式：`default`, `created`, `updated`。默认为 `default`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/question/:questionId"],"target":"/question/:questionId"}],"name":"问题","maintainers":[],"location":"question.ts"}' />

### 用户动态 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/people/activities/:id","categories":["social-media"],"example":"/zhihu/people/activities/diygod","parameters":{"id":"作者 id，可在用户主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/people/:id"]}],"name":"用户动态","maintainers":["DIYgod"],"location":"activities.ts"}' />

### 用户回答 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/people/answers/:id","categories":["social-media"],"example":"/zhihu/people/answers/diygod","parameters":{"id":"作者 id，可在用户主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/people/:id/answers"]}],"name":"用户回答","maintainers":["DIYgod","prnake"],"location":"answers.ts"}' />

### 用户文章 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/posts/:usertype/:id","categories":["social-media"],"example":"/zhihu/posts/people/frederchen","parameters":{"usertype":"作者 id，可在用户主页 URL 中找到","id":"用户类型usertype，参考用户主页的URL。目前有两种，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/:usertype/:id/posts"]}],"name":"用户文章","maintainers":["whtsky","Colin-XKL"],"description":"| 普通用户 | 机构用户 |\n| -------- | -------- |\n| people   | org      |","location":"posts.ts"}' />

| 普通用户 | 机构用户 |
| -------- | -------- |
| people   | org      |

### 用户关注时间线 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/timeline","categories":["social-media"],"example":"/zhihu/timeline","parameters":{},"features":{"requireConfig":[{"name":"ZHIHU_COOKIES","description":""}],"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户关注时间线","maintainers":["SeanChao"],"description":":::warning\n  用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"timeline.ts"}' />

:::warning
  用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### 用户想法 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/people/pins/:id","categories":["social-media"],"example":"/zhihu/people/pins/kan-dan-45","parameters":{"id":"作者 id，可在用户主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/people/:id/pins"]}],"name":"用户想法","maintainers":["xyqfer"],"location":"pin/people.ts"}' />

### 知乎日报 - 合集 <Site url="daily.zhihu.com/*" size="sm" />

<Route namespace="zhihu" :data='{"path":"/daily/section/:sectionId","categories":["social-media"],"example":"/zhihu/daily/section/2","parameters":{"sectionId":"合集 id，可在 https://news-at.zhihu.com/api/7/sections 找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["daily.zhihu.com/*"],"target":"/daily"}],"name":"知乎日报 - 合集","maintainers":["ccbikai"],"url":"daily.zhihu.com/*","location":"daily-section.ts"}' />

### 知乎日报 <Site url="daily.zhihu.com/*" size="sm" />

<Route namespace="zhihu" :data='{"path":"/daily","categories":["social-media"],"example":"/zhihu/daily","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["daily.zhihu.com/*"]}],"name":"知乎日报","maintainers":["DHPO"],"url":"daily.zhihu.com/*","location":"daily.ts"}' />

### 知乎分类热榜 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/hot/:category?","categories":["social-media"],"example":"/zhihu/hot","parameters":{"category":"分类，见下表，默认为全站"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"知乎分类热榜","maintainers":["nczitzk"],"description":"| 全站  | 国际  | 科学    | 汽车 | 视频   | 时尚    | 时事  | 数码    | 体育  | 校园   | 影视 |\n  | ----- | ----- | ------- | ---- | ------ | ------- | ----- | ------- | ----- | ------ | ---- |\n  | total | focus | science | car  | zvideo | fashion | depth | digital | sport | school | film |","location":"hot.ts"}' />

| 全站  | 国际  | 科学    | 汽车 | 视频   | 时尚    | 时事  | 数码    | 体育  | 校园   | 影视 |
  | ----- | ----- | ------- | ---- | ------ | ------- | ----- | ------- | ----- | ------ | ---- |
  | total | focus | science | car  | zvideo | fashion | depth | digital | sport | school | film |

### 知乎热榜 <Site url="www.zhihu.com/hot" size="sm" />

<Route namespace="zhihu" :data='{"path":"/hotlist","categories":["social-media"],"example":"/zhihu/hotlist","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/hot"]}],"name":"知乎热榜","maintainers":["DIYgod"],"url":"www.zhihu.com/hot","location":"hotlist.ts"}' />

### 知乎书店 - 知乎周刊 <Site url="www.zhihu.com/pub/weekly" size="sm" />

<Route namespace="zhihu" :data='{"path":"/weekly","categories":["social-media"],"example":"/zhihu/weekly","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/pub/weekly"]}],"name":"知乎书店 - 知乎周刊","maintainers":["LogicJake"],"url":"www.zhihu.com/pub/weekly","location":"weekly.ts"}' />

### 知乎书店 - 新书 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/bookstore/newest","categories":["social-media"],"example":"/zhihu/bookstore/newest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"知乎书店 - 新书","maintainers":["xyqfer"],"location":"bookstore/newest.ts"}' />

### 知乎想法 - 24 小时新闻汇总 <Site url="daily.zhihu.com/*" size="sm" />

<Route namespace="zhihu" :data='{"path":"/pin/daily","categories":["social-media"],"example":"/zhihu/pin/daily","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["daily.zhihu.com/*"],"target":"/daily"}],"name":"知乎想法 - 24 小时新闻汇总","maintainers":["xyqfer"],"url":"daily.zhihu.com/*","location":"pin/daily.ts"}' />

### 知乎想法热榜 <Site url="www.zhihu.com/zhihu/bookstore/newest" size="sm" />

<Route namespace="zhihu" :data='{"path":"/pin/hotlist","categories":["social-media"],"example":"/zhihu/pin/hotlist","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zhihu.com/zhihu/bookstore/newest"]}],"name":"知乎想法热榜","maintainers":["xyqfer"],"url":"www.zhihu.com/zhihu/bookstore/newest","location":"pin/hotlist.ts"}' />

### 专栏 <Site url="www.zhihu.com" size="sm" />

<Route namespace="zhihu" :data='{"path":"/zhuanlan/:id","categories":["social-media"],"example":"/zhihu/zhuanlan/googledevelopers","parameters":{"id":"专栏 id，可在专栏主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zhuanlan.zhihu.com/:id"]}],"name":"专栏","maintainers":["DIYgod"],"location":"zhuanlan.ts"}' />

