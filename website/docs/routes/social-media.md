# 💬 Social Media

## 755 {#755}

### 用户时间线 {#755-yong-hu-shi-jian-xian}

<Route author="hoilc" example="/755/user/akimoto-manatsu" path="/755/user/:username" paramsDesc={['用户名, 可在 URL 中找到']}/>

## bilibili {#bilibili}

:::tip Tiny Tiny RSS 用户请注意

Tiny Tiny RSS 会给所有 iframe 元素添加 `sandbox="allow-scripts"` 属性，导致无法加载 bilibili 内嵌视频，如果需要使用内嵌视频请为 Tiny Tiny RSS 安装 [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) 插件

:::

:::tip 关于视频清晰度

内嵌视频的默认清晰度为 480P，如需解锁更高清晰度，请[点此](https://www.bilibili.com/blackboard/html5player.html?cid=253377437&aid=885203421&page=&as_wide=1)在下方登录以设置 Cookie，仅对当前浏览器生效

:::

### 番剧 {#bilibili-fan-ju}

<Route author="DIYgod" example="/bilibili/bangumi/media/9192" path="/bilibili/bangumi/media/:mediaid" paramsDesc={['番剧媒体 id, 番剧主页 URL 中获取']}/>

### 用户追番列表 {#bilibili-yong-hu-zhui-fan-lie-biao}

<Route author="wdssmq" example="/bilibili/user/bangumi/208259" path="/bilibili/user/bangumi/:uid/:type?" paramsDesc={['用户 id','1为番，2为剧，留空为1']} anticrawler="1" radar="1" rssbud="1"/>

### UP 主投稿 {#bilibili-up-zhu-tou-gao}

<Route author="DIYgod" example="/bilibili/user/video/2267573" path="/bilibili/user/video/:uid/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']} anticrawler="1" radar="1" rssbud="1"/>

### UP 主所有视频 {#bilibili-up-zhu-suo-you-shi-pin}

<Route author="CcccFz" example="/bilibili/user/video-all/436361287" path="/bilibili/user/video-all/:uid/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']} anticrawler="1" radar="1" rssbud="1"/>

### UP 主专栏 {#bilibili-up-zhu-zhuan-lan}

<Route author="lengthmin" example="/bilibili/user/article/334958638" path="/bilibili/user/article/:uid" paramsDesc={['用户 id, 可在 UP 主主页中找到']} anticrawler="1" radar="1" rssbud="1"/>

### UP 主动态 {#bilibili-up-zhu-dong-tai}

<Route author="DIYgod zytomorrow CaoMeiYouRen JimenezLi" example="/bilibili/user/dynamic/2267573" path="/bilibili/user/dynamic/:uid/:routeParams?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '额外参数；请参阅以下说明和表格']} radar="1" rssbud="1">

| 键 | 含义 | 接受的值 | 默认值 |
| -- | ---- | ------- | ------ |
| showEmoji | 显示或隐藏表情图片 | 0/1/true/false | false |
| disableEmbed | 关闭内嵌视频 | 0/1/true/false | false |
| useAvid | 视频链接使用AV号(默认为BV号) | 0/1/true/false | false |
| directLink | 使用内容直链 | 0/1/true/false | false |

用例：`/bilibili/user/dynamic/2267573/showEmoji=1&disableEmbed=1&useAvid=1`

:::tip 动态的专栏显示全文

动态的专栏显示全文请使用通用参数里的 `mode=fulltext `

举例: bilibili 专栏全文输出 /bilibili/user/dynamic/2267573/?mode=fulltext

:::

</Route>

### UP 主频道的合集 {#bilibili-up-zhu-pin-dao-de-he-ji}

<Route author="shininome" example="/bilibili/user/collection/245645656/529166" path="/bilibili/user/collection/:uid/:sid/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '合集 id, 可在合集页面的 URL 中找到', '默认为开启内嵌视频, 任意值为关闭']}/>

### UP 主频道的视频列表 {#bilibili-up-zhu-pin-dao-de-shi-pin-lie-biao}

<Route author="weirongxu" example="/bilibili/user/channel/2267573/396050" path="/bilibili/user/channel/:uid/:sid/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '频道 id, 可在频道的 URL 中找到', '默认为开启内嵌视频, 任意值为关闭']} anticrawler="1"/>

### UP 主默认收藏夹 {#bilibili-up-zhu-mo-ren-shou-cang-jia}

<Route author="DIYgod" example="/bilibili/user/fav/2267573" path="/bilibili/user/fav/:uid/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']} radar="1" rssbud="1"/>

### UP 主非默认收藏夹 {#bilibili-up-zhu-fei-mo-ren-shou-cang-jia}

<Route author="Qixingchen" example="/bilibili/fav/756508/50948568" path="/bilibili/fav/:uid/:fid/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能', '默认为开启内嵌视频, 任意值为关闭']}/>

### UP 主投币视频 {#bilibili-up-zhu-tou-bi-shi-pin}

<Route author="DIYgod" example="/bilibili/user/coin/208259" path="/bilibili/user/coin/:uid/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']} anticrawler="1" radar="1" rssbud="1"/>

### UP 主粉丝 {#bilibili-up-zhu-fen-si}

<Route author="Qixingchen" example="/bilibili/user/followers/2267573/3" path="/bilibili/user/followers/:uid/:loginUid" paramsDesc={['用户 id, 可在 UP 主主页中找到','用于登入的用户id,需要配置对应的 Cookie 值']} radar="1" rssbud="1" selfhost="1">

:::caution

UP 主粉丝现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### UP 主关注用户 {#bilibili-up-zhu-guan-zhu-yong-hu}

<Route author="Qixingchen" example="/bilibili/user/followings/2267573/3" path="/bilibili/user/followings/:uid/:loginUid" paramsDesc={['用户 id, 可在 UP 主主页中找到','用于登入的用户id,需要配置对应的 Cookie 值']} radar="1" rssbud="1" selfhost="1">

:::caution

UP 主关注用户现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 分区视频 {#bilibili-fen-qu-shi-pin}

<Route author="DIYgod" example="/bilibili/partion/33" path="/bilibili/partion/:tid/:disableEmbed?" paramsDesc={['分区 id', '默认为开启内嵌视频, 任意值为关闭']} radar="1" rssbud="1">

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

</Route>

### 分区视频排行榜 {#bilibili-fen-qu-shi-pin-pai-hang-bang}

<Route author="lengthmin" example="/bilibili/partion/ranking/171/3" path="/bilibili/partion/ranking/:tid/:days?/:disableEmbed?" paramsDesc={['分区 id, 见上方表格', '缺省为 7, 指最近多少天内的热度排序', '默认为开启内嵌视频, 任意值为关闭']}/>

### 视频选集列表 {#bilibili-shi-pin-xuan-ji-lie-biao}

<Route author="sxzz" example="/bilibili/video/page/BV1i7411M7N9" path="/bilibili/video/page/:bvid/:disableEmbed?" paramsDesc={['可在视频页 URL 中找到', '默认为开启内嵌视频, 任意值为关闭']}/>

### 视频评论 {#bilibili-shi-pin-ping-lun}

<Route author="Qixingchen" example="/bilibili/video/reply/BV1vA411b7ip" path="/bilibili/video/reply/:bvid" paramsDesc={['可在视频页 URL 中找到']}/>

### 视频弹幕 {#bilibili-shi-pin-tan-mu}

<Route author="Qixingchen" example="/bilibili/video/danmaku/BV1vA411b7ip/1" path="/bilibili/video/danmaku/:bvid/:pid?" paramsDesc={['视频AV号,可在视频页 URL 中找到','分P号,不填默认为1']}/>

### link 公告 {#bilibili-link-gong-gao}

<Route author="Qixingchen" example="/bilibili/link/news/live" path="/bilibili/link/news/:product" paramsDesc={['公告分类, 包括 直播:live 小视频:vc 相簿:wh']}/>

### 视频搜索 {#bilibili-shi-pin-sou-suo}

<Route author="Symty" example="/bilibili/vsearch/藤原千花" path="/bilibili/vsearch/:kw/:order?/:disableEmbed?/:tid?" paramsDesc={['检索关键字', '排序方式, 综合:totalrank 最多点击:click 最新发布:pubdate(缺省) 最多弹幕:dm 最多收藏:stow', '默认为开启内嵌视频, 任意值为关闭', '分区 id']}>

分区 id 的取值请参考下表：

| 全部分区 | 动画 | 番剧 | 国创 | 音乐 | 舞蹈 | 游戏 | 知识 | 科技 | 运动 | 汽车 | 生活 | 美食 | 动物圈 | 鬼畜 | 时尚 | 资讯 | 娱乐 | 影视 | 纪录片 | 电影 | 电视剧 |
| -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ------ |
| 0        | 1    | 13   | 167  | 3    | 129  | 4    | 36   | 188  | 234  | 223  | 160  | 211  | 217    | 119  | 155  | 202  | 5    | 181  | 177    | 23   | 11     |

</Route>

### 当前在线 {#bilibili-dang-qian-zai-xian}

<Route author="TigerCubDen" example="/bilibili/online" path="/bilibili/online/:disableEmbed?" paramsDesc={['默认为开启内嵌视频, 任意值为关闭']}/>

### 用户关注动态 {#bilibili-yong-hu-guan-zhu-dong-tai}

<Route author="TigerCubDen JimenezLi" example="/bilibili/followings/dynamic/109937383" path="/bilibili/followings/dynamic/:uid/:routeParams?" paramsDesc={['用户 id', '额外参数；请参阅 [#UP 主动态](#bilibili-up-zhu-dong-tai) 的说明和表格']} selfhost="1">

:::caution

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 用户关注视频动态 {#bilibili-yong-hu-guan-zhu-shi-pin-dong-tai}

<Route author="LogicJake" example="/bilibili/followings/video/2267573" path="/bilibili/followings/video/:uid/:disableEmbed?" paramsDesc={['用户 id', '默认为开启内嵌视频, 任意值为关闭']} selfhost="1">

:::caution

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 用户关注专栏 {#bilibili-yong-hu-guan-zhu-zhuan-lan}

<Route author="woshiluo" example="/bilibili/followings/article/99800931" path="/bilibili/followings/article/:uid" paramsDesc={['用户 id']} selfhost="1">

:::caution

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 用户稍后再看 {#bilibili-yong-hu-shao-hou-zai-kan}

<Route author="JimenezLi" example="/bilibili/watchlater/2267573" path="/bilibili/watchlater/:uid/:disableEmbed?" paramsDesc={['用户 id', '默认为开启内嵌视频, 任意值为关闭']} selfhost="1">

:::caution

用户稍后再看需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 直播开播 {#bilibili-zhi-bo-kai-bo}

见 [#哔哩哔哩直播](/routes/live#bi-li-bi-li-zhi-bo)

### 直播搜索 {#bilibili-zhi-bo-sou-suo}

见 [#哔哩哔哩直播](/routes/live#bi-li-bi-li-zhi-bo)

### 直播分区 {#bilibili-zhi-bo-fen-qu}

见 [#哔哩哔哩直播](/routes/live#bi-li-bi-li-zhi-bo)

### 主站话题列表 {#bilibili-zhu-zhan-hua-ti-lie-biao}

<Route author="Qixingchen" example="/bilibili/blackboard" path="/bilibili/blackboard" />

### 会员购新品上架 {#bilibili-hui-yuan-gou-xin-pin-shang-jia}

<Route author="DIYgod" example="/bilibili/mall/new/1" path="/bilibili/mall/new/:category?" paramsDesc={['分类，默认全部，见下表']}>

| 全部 | 手办 | 魔力赏 | 周边 | 游戏 |
| ---- | ---- | ------ | ---- | ---- |
| 0    | 1    | 7      | 3    | 6    |

</Route>

### 会员购作品 {#bilibili-hui-yuan-gou-zuo-pin}

<Route author="DIYgod" example="/bilibili/mall/ip/0_3000294" path="/bilibili/mall/ip/:id" paramsDesc={['作品 id, 可在作品列表页 URL 中找到']}/>

### 综合热门 {#bilibili-zong-he-re-men}

<Route author="ziminliu" example="/bilibili/popular/all" path="/bilibili/popular/all" />

### 热搜 {#bilibili-re-sou}

<Route author="CaoMeiYouRen" example="/bilibili/hot-search" path="/bilibili/hot-search" />

### 排行榜 {#bilibili-pai-hang-bang}

<Route author="DIYgod" example="/bilibili/ranking/0/3/1" path="/bilibili/ranking/:tid/:days?/:arc_type?/:disableEmbed?" paramsDesc={['排行榜分区 id, 默认 0', '时间跨度, 可为 1 3 7 30', '投稿时间, 可为 0(全部投稿) 1(近期投稿) , 默认 1', '默认为开启内嵌视频, 任意值为关闭']}>

| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 数码 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |
| ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 168      | 3    | 129  | 4    | 36   | 188  | 160  | 119  | 155  | 5    | 181  |

</Route>

### 话题 (频道 / 标签) {#bilibili-hua-ti-pin-dao-biao-qian}

<Route author="Qixingchen" example="/bilibili/topic/2233" path="/bilibili/topic/:topic" paramsDesc={['话题名(又称频道名或标签) 例如 2233 或 COSPLAY']}/>

### 歌单 {#bilibili-ge-dan}

<Route author="LogicJake" example="/bilibili/audio/10624" path="/bilibili/audio/:id" paramsDesc={['歌单 id, 可在歌单页 URL 中找到']}/>

### 专栏文集 {#bilibili-zhuan-lan-wen-ji}

<Route author="hoilc" example="/bilibili/readlist/25611" path="/bilibili/readlist/:listid" paramsDesc={['文集 id, 可在专栏文集 URL 中找到']}/>

### B 站每周必看 {#bilibili-b-zhan-mei-zhou-bi-kan}

<Route author="ttttmr" example="/bilibili/weekly" path="/bilibili/weekly/:disableEmbed?" paramsDesc={['默认为开启内嵌视频, 任意值为关闭']}/>

### 漫画更新 {#bilibili-man-hua-geng-xin}

<Route author="hoilc" example="/bilibili/manga/update/26009" path="/bilibili/manga/update/:comicid" paramsDesc={['漫画 id, 可在 URL 中找到, 支持带有`mc`前缀']}/>

### 用户追漫更新 {#bilibili-yong-hu-zhui-man-geng-xin}

<Route author="yindaheng98" example="/bilibili/manga/followings/26009" path="/bilibili/manga/followings/:uid/:limits?" paramsDesc={['用户 id', '抓取最近更新前多少本漫画，默认为10']} selfhost="1">

:::caution

用户追漫需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 频道排行榜 {#bilibili-pin-dao-pai-hang-bang}

<Route author="3401797899" example="/bilibili/channel/5417/hot" path="/bilibili/channel/:channelid/hot/:disableEmbed?" paramsDesc={['频道id，可在频道链接中找到', '默认为开启内嵌视频, 任意值为关闭']}/>

## Bluesky (bsky) {#bluesky-bsky}

### Keywords {#bluesky-bsky-keywords}

<Route author="untitaker" example="/bsky/keyword/hello" path="/bsky/keyword/:keyword" radar="1" rssbud="1" />

## Crossbell {#crossbell}

### Notes {#crossbell-notes}

<Route author="DIYgod" example="/crossbell/notes" path="/crossbell/notes" radar="1" rssbud="1"/>

### Notes of character {#crossbell-notes-of-character}

<Route author="DIYgod" example="/crossbell/notes/character/10" path="/crossbell/notes/character/:characterId" radar="1" rssbud="1"/>

### Notes of source {#crossbell-notes-of-source}

<Route author="DIYgod" example="/crossbell/notes/source/xlog" path="/crossbell/notes/source/:source" radar="1" rssbud="1"/>

### Feeds of following {#crossbell-feeds-of-following}

<Route author="DIYgod" example="/crossbell/feeds/following/10" path="/crossbell/feeds/following/:characterId" radar="1" rssbud="1"/>

## CuriousCat {#curiouscat}

### User {#curiouscat-user}

<Route author="lucasew" path="/curiouscat/user/:name" example="/curiouscat/user/kretyn" paramsDesc={['name, username that is in the URL']} />

## Curius {#curius}

### User {#curius-user}

<Route author="Ovler-Young" example="/curius/links/yuu-yuu" path="/curius/links/:name" paramsDesc={['Username, can be found in URL']}/>

## Daily.dev {#daily.dev}

### Popular {#daily.dev-popular}

<Route author="Rjnishant530" example="/daily" path="/daily" />

### Most Discussed {#daily.dev-most-discussed}

<Route author="Rjnishant530" example="/daily/discussed" path="/daily/discussed" />

### Most upvoted {#daily.dev-most-upvoted}

<Route author="Rjnishant530" example="/daily/upvoted" path="/daily/upvoted" />

## Dev.to {#dev.to}

### Top Posts {#dev.to-top-posts}

<Route author="dwemerx" example="/dev.to/top/month" path="/dev.to/top/:period" paramsDesc={['period']}>

| dev.to weekly top | dev.to monthly top | dev.to yearly top | dev.to top posts of all time |
| ----------------- | ------------------ | ----------------- | ---------------------------- |
| week              | month              | year              | infinity                     |

</Route>

## Discord {#discord}

### Channel Messages {#discord-channel-messages}

<Route author="TonyRL" path="/discord/channel/:channelId" example="/discord/channel/950465850056536084" paramsDesc={['Channel ID']} radar="1" selfhost="1"/>

## Disqus {#disqus}

### Comment {#disqus-comment}

<Route author="DIYgod" path="/disqus/posts/:forum" example="/disqus/posts/diygod-me" paramsDesc={['forum, disqus name of the target website']} />

## Facebook {#facebook}

### Page {#facebook-page}

<Route author="maple3142" example="/facebook/page/SonetPCR" path="/facebook/page/:id" paramsDesc={['page id']} anticrawler="1"/>

## Fur Affinity {#fur-affinity}

### Home {#fur-affinity-home}

<Route author="TigerCubDen" example="/furaffinity/home" path="/furaffinity/home/:type?/:nsfw?" paramsDesc={['Art Type, default to be `artwork`', 'NSFW Mode, do not filter NSFW contents when value set to `1`']} radar="1">

Type

| artwork | crafts | music | writing |
| ------- | ------ | ----- | ------- |
| artwork | crafts | music | writing |

</Route>

### Browse {#fur-affinity-browse}

<Route author="TigerCubDen" example="/furaffinity/browse" path="/furaffinity/browse/:nsfw?" paramsDesc={['NSFW Mode, do not filter NSFW contents when value set to `1`']} radar="1"/>

### Website Status {#fur-affinity-website-status}

<Route author="TigerCubDen" example="/furaffinity/status" path="/furaffinity/status" radar="1"/>

### Search {#fur-affinity-search}

<Route author="TigerCubDen" example="/furaffinity/search/tiger" path="/furaffinity/search/:keyword/:nsfw?" paramsDesc={['Search keyword, enter any words you want to search, require English', 'NSFW Mode，do not filter NSFW contents when value set to `1`']} radar="1"/>

### Userpage Profile {#fur-affinity-userpage-profile}

<Route author="TigerCubDen" example="/furaffinity/user/tiger-jungle" path="/furaffinity/user/:username" paramsDesc={['Username, can find in userpage']} radar="1"/>

### User's Watching List {#fur-affinity-user-s-watching-list}

<Route author="TigerCubDen" example="/furaffinity/watching/okami9312" path="/furaffinity/watching/:username" paramsDesc={['Username, can find in userpage']} radar="1"/>

### User's Watcher List {#fur-affinity-user-s-watcher-list}

<Route author="TigerCubDen" example="/furaffinity/watchers/malikshadowclaw" path="/furaffinity/watchers/:username" paramsDesc={['Username, can find in userpage']} radar="1"/>

### User's Commission Information {#fur-affinity-user-s-commission-information}

<Route author="TigerCubDen" example="/furaffinity/commissions/flashlioness" path="/furaffinity/commissions/:username" paramsDesc={['Username, can find in userpage']} radar="1"/>

### User's Shouts {#fur-affinity-user-s-shouts}

<Route author="TigerCubDen" example="/furaffinity/shouts/redodgft" path="/furaffinity/shouts/:username" paramsDesc={['Username, can find in userpage']} radar="1"/>

### User's Journals {#fur-affinity-user-s-journals}

<Route author="TigerCubDen" example="/furaffinity/journals/rukis" path="/furaffinity/journals/:username" paramsDesc={['Username, can find in userpage']} radar="1"/>

### User's Gallery {#fur-affinity-user-s-gallery}

<Route author="TigerCubDen" example="/furaffinity/gallery/flashlioness" path="/furaffinity/gallery/:username/:nsfw?" paramsDesc={['Username, can find in userpage', 'NSFW Mode, do not filter NSFW contents when value set to `1`']} radar="1"/>

### User's Scraps {#fur-affinity-user-s-scraps}

<Route author="TigerCubDen" example="/furaffinity/scraps/flashlioness" path="/furaffinity/scraps/:username/:nsfw?" paramsDesc={['Username, can find in userpage', 'NSFW Mode, do not filter NSFW contents when value set to `1`']} radar="1"/>

### User's Favorites {#fur-affinity-user-s-favorites}

<Route author="TigerCubDen" example="/furaffinity/favorites/tiger-jungle" path="/furaffinity/favorites/:username/:nsfw?" paramsDesc={['Username, can find in userpage', 'NSFW Mode, do not filter NSFW contents when value set to `1`']} radar="1"/>

### Submission Comments {#fur-affinity-submission-comments}

<Route author="TigerCubDen" example="/furaffinity/submission_comments/34909983" path="/furaffinity/submission_comments/:id" paramsDesc={['Submission id, can find in URL of submission page']} radar="1"/>

### Journal Comments {#fur-affinity-journal-comments}

<Route author="TigerCubDen" example="/furaffinity/journal_comments/9750669" path="/furaffinity/journal_comments/:id" paramsDesc={['Journal id, can find in URL of journal page']} radar="1"/>

## Gab {#gab}

### User's Posts {#gab-user-s-posts}

<Route author="zphw" example="/gab/user/realdonaldtrump" path="/gab/user/:username" paramsDesc={['Username']} />

### Popular Posts {#gab-popular-posts}

<Route author="zphw" example="/gab/popular/hot" path="/gab/popular/:sort?" paramsDesc={['Sort by, `hot` to be Hot Posts and `top` to be Top Posts. Default: hot']} />

## GETTR {#gettr}

### User timeline {#gettr-user-timeline}

<Route author="TonyRL" example="/gettr/user/jasonmillerindc" path="/gettr/user/:id" paramsDesc={['User id']} radar="1" rssbud="1"/>

## iCity {#icity}

### 用户动态 {#icity-yong-hu-dong-tai}

<Route author="nczitzk" example="/icity/sai" path="/icity/:id" paramsDesc={['用户 id']}/>

## Instagram {#instagram}

:::caution

Due to Instagram Private API restrictions, you have to setup your credentials on the server. 2FA is not supported. See [deployment guide](https://docs.rsshub.app/install/) for more.

If you don't want to setup credentials, you can use [Picnob](#picnob) or [Picuki](#picuki).

:::

### User Profile / Hashtag - Private API {#instagram-user-profile-hashtag-private-api}

<Route author="oppilate DIYgod" example="/instagram/user/stefaniejoosten" path="/instagram/:category/:key" paramsDesc={['Feed category, see table below','Username / Hashtag name']} radar="1" anticrawler="1" selfhost="1">

| User timeline | Hashtag |
| ------------- | ------- |
| user          | tags    |

:::tip

It's highly recommended to deploy with Redis cache enabled.

:::

</Route>

### User Profile / Hashtag - Cookie {#instagram-user-profile-hashtag-cookie}

<Route author="TonyRL" example="/instagram/2/user/stefaniejoosten" path="/instagram/2/:category/:key" paramsDesc={['Feed category, see table above','Username / Hashtag name']} radar="1" anticrawler="1" selfhost="1" />

## Keep {#keep}

### 运动日记 {#keep-yun-dong-ri-ji}

<Route author="Dectinc DIYgod" example="/keep/user/556b02c1ab59390afea671ea" path="/keep/user/:id" paramsDesc={['Keep 用户 id']}/>

## Lemmy {#lemmy}

### Community {#lemmy-community}

<Route author="wb14123" example="/lemmy/technology@lemmy.world/Hot" path="/lemmy/:community/:sort?" paramsDesc={['Lemmmy community, for example technology@lemmy.world', 'Sort by, defaut to Active']} selfhost="1"/>

## Lofter {#lofter}

### User {#lofter-user}

<Route author="hoilc nczitzk" example="/lofter/user/i" path="/lofter/user/:name?" paramsDesc={['Lofter user name, can be found in the URL']}/>

### Tag {#lofter-tag}

<Route author="hoilc nczitzk" example="/lofter/tag/摄影/date" path="/lofter/tag/:name?/:type?" paramsDesc={['tag name, such as `名侦探柯南`, `摄影` by default', 'ranking type, see below, new by default']}>

| new  | date | week | month | total |
| ---- | ---- | ---- | ----- | ----- |
| 最新 | 日榜 | 周榜 | 月榜  | 总榜  |

</Route>

## Mastodon {#mastodon}

:::tip

Official user RSS:

-   RSS: `https://**:instance**/users/**:username**.rss` ([Example](https://pawoo.net/users/pawoo_support.rss))
-   Atom: ~~`https://**:instance**/users/**:username**.atom`~~ (Only for pawoo.net, [example](https://pawoo.net/users/pawoo_support.atom))

These feed do not include boosts (a.k.a. reblogs). RSSHub provides a feed for user timeline based on the Mastodon API, but to use that, you may need to create application on a Mastodon instance, and configure your RSSHub instance. Check the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.

:::

### User timeline {#mastodon-user-timeline}

<Route author="notofoe" example="/mastodon/acct/CatWhitney@mastodon.social/statuses" path="/mastodon/acct/:acct/statuses/:only_media?" paramsDesc={['Webfinger account URI, like `user@host`', 'whether only display media content, default to false, any value to true']}/>

Started from Mastodon v4.0.0, the use of the `search` API in the route no longer requires a user token.
If the domain of your Webfinger account URI is the same as the API host of the instance (i.e., no delegation called in some other protocols), then no configuration is required and the route is available out of the box.
However, you can still specify these route-specific configurations if you need to override them.

### Instance timeline (local) {#mastodon-instance-timeline-local}

<Route author="hoilc" example="/mastodon/timeline/pawoo.net/true" path="/mastodon/timeline/:site/:only_media?" paramsDesc={['instance address, only domain, no `http://` or `https://` protocol header', 'whether only display media content, default to false, any value to true']}/>

If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`.

### Instance timeline (federated) {#mastodon-instance-timeline-federated}

<Route author="hoilc" example="/mastodon/remote/pawoo.net/true" path="/mastodon/remote/:site/:only_media?" paramsDesc={['instance address, only domain, no `http://` or `https://` protocol header', 'whether only display media content, default to false, any value to true']}/>

If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`.

### User timeline (backup) {#mastodon-user-timeline-backup}

<Route author="notofoe" example="/mastodon/account_id/mastodon.social/23634/statuses/only_media" path="/mastodon/account/:site/:account_id/statuses/:only_media?" paramsDesc={['instance address, only domain, no `http://` or `https://` protocol header', 'account id. login your instance, then search for the user profile; the account id is in the url', 'whether only display media content, default to false, any value to true']}/>

If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`.

## Misskey {#misskey}

### Featured Notes {#misskey-featured-notes}

<Route author="Misaka13514" example="/misskey/notes/featured/misskey.io" path="/misskey/notes/featured/:site" paramsDesc={['instance address, domain only, without `http://` or `https://` protocol header']} radar="1" rssbud="1"/>

## piapro {#piapro}

### User latest works {#piapro-user-latest-works}

<Route author="hoilc" example="/piapro/user/shine_longer" path="/piapro/user/:pid" paramsDesc={['User ID, can be found in url']}/>

### Website latest works {#piapro-website-latest-works}

<Route author="hoilc" example="/piapro/public/music/miku/2" path="/piapro/public/:type/:tag?/:category?" paramsDesc={['work type, can be `music`,`illust`,`text`','`tag` parameter in url','category ID, `categoryId` parameter in url']}/>

## Picnob {#picnob}

### User Profile {#picnob-user-profile}

<Route author="TonyRL" example="/picnob/user/stefaniejoosten" path="/picnob/profile/:id" paramsDesc={['Instagram id']} radar="1" rssbud="1" />

## Picuki {#picuki}

### User Profile {#picuki-user-profile}

<Route author="hoilc Rongronggg9" example="/picuki/profile/stefaniejoosten" path="/picuki/profile/:id/:functionalFlag?" paramsDesc={['Instagram id','functional flag, see the table below']} radar="1" rssbud="1">

| functionalFlag | Video embedding                         | Fetching Instagram Stories |
| -------------- | --------------------------------------- | -------------------------- |
| 0              | off, only show video poster as an image | off                        |
| 1 (default)    | on                                      | off                        |
| 10             | on                                      | on                         |

:::caution

Instagram Stories do not have a reliable guid. It is possible that your RSS reader show the same story more than once.
Though, every Story expires after 24 hours, so it may be not so serious.

:::

</Route>

## pixiv {#pixiv}

### User Bookmark {#pixiv-user-bookmark}

<Route author="EYHN" path="/pixiv/user/bookmarks/:id" example="/pixiv/user/bookmarks/15288095" paramsDesc={['user id, available in user\'s homepage URL']} radar="1" rssbud="1"/>

### User Activity {#pixiv-user-activity}

<Route author="EYHN" path="/pixiv/user/:id" example="/pixiv/user/15288095" paramsDesc={['user id, available in user\'s homepage URL']} radar="1" rssbud="1"/>

### User Novels {#pixiv-user-novels}

<Route author="TonyRL" example="/pixiv/user/novels/27104704" path="/pixiv/user/novels/:id" paramsDesc={['User id, available in user\'s homepage URL']} radar="1" rssbud="1"/>

### Rankings {#pixiv-rankings}

<Route author="EYHN" path="/pixiv/ranking/:mode/:date?" example="/pixiv/ranking/week" paramsDesc={['rank type', 'format: `2018-4-25`']} radar="1" rssbud="1">

| daily rank | weekly rank | monthly rank | male rank | female rank | AI-generated work Rankings | original rank | rookie user rank |
| ---------- | ----------- | ------------ | --------- | ----------- | -------------------------- | ------------- | ---------------- |
| day        | week        | month        | day_male  | day_female  | day_ai                     | week_original | week_rookie      |

| R-18 daily rank | R-18 AI-generated work | R-18 male rank | R-18 female rank | R-18 weekly rank | R-18G rank |
| --------------- | ---------------------- | -------------- | ---------------- | ---------------- | ---------- |
| day_r18         | day_r18_ai             | day_male_r18   | day_female_r18   | week_r18         | week_r18g  |

</Route>

### Keyword {#pixiv-keyword}

<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" paramsDesc={['keyword', 'rank mode, empty or other for time order, popular for popular order', 'filte R18 content']} radar="1" rssbud="1">

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</Route>

### Following timeline {#pixiv-following-timeline}

<Route author="ClarkeCheng" example="/pixiv/user/illustfollows" path="/pixiv/user/illustfollows" radar="1" rssbud="1" selfhost="1">

:::caution

Only for self-hosted

:::

</Route>

## pixivFANBOX {#pixivfanbox}

### User {#pixivfanbox-user}

<Route author="sgqy" example="/fanbox/otomeoto" path="/fanbox/:user?" paramsDesc={['User name. Can be found in URL. Default is official news']}/>

## Plurk {#plurk}

### Topic {#plurk-topic}

<Route author="TonyRL" path="/plurk/topic/:topic" example="/plurk/topic/standwithukraine" paramsDesc={['Topic ID, can be found in URL']} radar="1" rssbud="1"/>

### Top {#plurk-top}

<Route author="TonyRL" path="/plurk/top/:category?/:lang?" example="/plurk/top/topReplurks" paramsDesc={['Category, see the table below, `topReplurks` by default', 'Language, see the table below, `en` by default']} radar="1" rssbud="1">

| Top Replurks | Top Favorites | Top Responded |
| ------------ | ------------- | ------------- |
| topReplurks  | topFavorites  | topResponded  |

| English | 中文（繁體） |
| ------- | ------------ |
| en      | zh           |

</Route>

### Anonymous {#plurk-anonymous}

<Route author="TonyRL" path="/plurk/anonymous" example="/plurk/anonymous" radar="1" rssbud="1"/>

### Search {#plurk-search}

<Route author="TonyRL" path="/plurk/search/:keyword" example="/plurk/search/FGO" paramsDesc={['Search keyword']} radar="1" rssbud="1"/>

### Hotlinks {#plurk-hotlinks}

<Route author="TonyRL" path="/plurk/hotlinks" example="/plurk/hotlinks" radar="1" rssbud="1"/>

### Plurk News {#plurk-plurk-news}

<Route author="TonyRL" path="/plurk/news/:lang?" example="/plurk/news/:lang?" paramsDesc={['Language, see the table above, `en` by default']} radar="1" rssbud="1"/>

### User {#plurk-user}

<Route author="TonyRL" path="/plurk/user/:user" example="/plurk/user/plurkoffice" paramsDesc={['User ID, can be found in URL']} radar="1" rssbud="1"/>

## Popi 提问箱 {#popi-ti-wen-xiang}

### 提问箱新回答 {#popi-ti-wen-xiang-ti-wen-xiang-xin-hui-da}

<Route author="AgFlore" example="/popiask/popi6666" path="/popiask/:sharecode/:pagesize?" paramsDesc={['提问箱 ID', '查看条数（默认为 20）']} radar="1" rssbud="1"/>

## Rattibha {#rattibha}

### User Threads {#rattibha-user-threads}

<Route author="yshalsager" example="/rattibha/user/elonmusk" path="/rattibha/user/:user" paramsDesc={['Twitter username, without @']} radar="1" rssbud="1"/>

## Soul {#soul}

### 瞬间更新 {#soul-shun-jian-geng-xin}

<Route author="ImSingee" example="/soul/Y2w2aTNWQVBLOU09" path="/soul/:id" paramsDesc={['用户 id, 分享用户主页时的 URL 的 userIdEcpt 参数']} radar="1" rssbud="1"></Route>

### 热门瞬间 {#soul-re-men-shun-jian}

<Route author="BugWriter2" example="/soul/posts/hot/NXJiSlM5V21kamJWVlgvZUh1NEExdz09" path="/soul/posts/hot/:pid*" paramsDesc={['瞬间 id, 分享用户瞬间时的 URL 的 postIdEcpt 参数']}/>

:::tip

提供不同内容的 `pid`, 可以得到不同的热门瞬间推荐，如果想看多个种类的热门可以用 `/` 把不同的 `pid` 连起来，例如: `NXJiSlM5V21kamJWVlgvZUh1NEExdz09/MkM0amxSTUNiTEpLcHhzSlRzTEI1dz09`

:::

## Tape 小纸条 {#tape-xiao-zhi-tiao}

### 提问箱新回答 {#tape-xiao-zhi-tiao-ti-wen-xiang-xin-hui-da}

<Route author="AgFlore" example="/tapechat/questionbox/TOAH7BBH" path="/tapechat/questionbox/:sharecode/:pagesize?" paramsDesc={['提问箱 ID', '查看条数（默认为 20）']} />

## Telegram {#telegram}

### Channel {#telegram-channel}

<Route author="DIYgod Rongronggg9" path="/telegram/channel/:username/:routeParams?" example="/telegram/channel/awesomeDIYgod/searchQuery=%23DIYgod的豆瓣动态" paramsDesc={['channel username', 'extra parameters, see the table below']} radar="1" rssbud="1">

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

</Route>

### Sticker Pack {#telegram-sticker-pack}

<Route author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" paramsDesc={['Sticker Pack name, available in the sharing URL']}/>

### Telegram Blog {#telegram-telegram-blog}

<Route author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## Threads {#threads}

### User timeline {#threads-user-timeline}

<Route author="ninboy" path="/threads/:user/:routeParams?" example="/threads/zuck" radar="1" rssbud="1" puppeteer="1" paramsDesc={['', '']}>

Specify options (in the format of query string) in parameter `routeParams` to control some extra features for threads

| Key                             | Description                                                                                                                    | Accepts                | Defaults to |
|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------| ---------------------- |-------------|
| `showAuthorInTitle`             | Show author name in title                                                                                                      | `0`/`1`/`true`/`false` | `true`      |
| `showAuthorInDesc`              | Show author name in description (RSS body)                                                                                     | `0`/`1`/`true`/`false` | `true`      |
| `showQuotedAuthorAvatarInDesc`  | Show avatar of quoted author in description (RSS body) (Not recommended if your RSS reader extracts images from description)   | `0`/`1`/`true`/`false` | `false`     |
| `showAuthorAvatarInDesc`        | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)          | `0`/`1`/`true`/`false` | `falseP`    |
| `showEmojiForQuotesAndReply`    | Use "🔁" instead of "QT", "↩️" instead of "Re"                                                                                 | `0`/`1`/`true`/`false` | `true`      |
| `showQuotedInTitle`             | Show quoted tweet in title                                                                                                     | `0`/`1`/`true`/`false` | `true`      |
| `replies`                       | Show replies                                                                                                                   | `0`/`1`/`true`/`false` | `true`      |

Specify different option values than default values to improve readability. The URL

```
https://rsshub.app/threads/zuck/showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForQuotesAndReply=1&showQuotedInTitle=1
```

</Route>

## TikTok {#tiktok}

### User {#tiktok-user}

<Route author="TonyRL" example="/tiktok/user/@linustech/true" path="/tiktok/user/:user/:iframe?" paramsDesc={['User ID, including @', 'Use the official iframe to embed the video, which allows you to view the video if the default option does not work. Default to `false`']} anticrawler="1" puppeteer="1" radar="1" rssbud="1"/>

## Twitter {#twitter}

:::caution

Due to restrictions from Twitter, currently only tweets within 7 days are available in some routes.

Some routes rely on the Twitter Developer API, which requires to be specially configured to enable.\
There are two routes (`/twitter/user` and `/twitter/keyword`) comes with Web API implementation which does not require to be specially configured to enable along with the Developer API implementation. By default, the Developer API is prioritized, but if it is not configured or errors, the Web API will be used. However, there are some differences between the two APIs, e.g. `excludeReplies` in the Developer API will treat [threads](https://blog.twitter.com/official/en_us/topics/product/2017/nicethreads.html) (self-replied tweets) as replies and exclude them, while in the Web API it will not. If you would like to exclude replies but include threads, enable `forceWebApi` in the `/twitter/user` route.

:::

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

<img src="/img/readable-twitter.png" alt="Readable Twitter RSS of Durov" />

### User timeline {#twitter-user-timeline}

<Route author="DIYgod yindaheng98 Rongronggg9" path="/twitter/user/:id/:routeParams?" example="/twitter/user/DIYgod" paramsDesc={['username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`', 'extra parameters, see the table above; particularly when `routeParams=exclude_replies`, replies are excluded; `routeParams=exclude_rts` excludes retweets,`routeParams=exclude_rts_replies` exclude replies and retweets; for default include all.']} radar="1" rssbud="1"/>

### User media {#twitter-user-media}

<Route author="yindaheng98 Rongronggg9" path="/twitter/media/:id/:routeParams?" example="/twitter/media/DIYgod" paramsDesc={['username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`', 'extra parameters, see the table above.']} radar="1" rssbud="1"/>

### User following timeline {#twitter-user-following-timeline}

<Route author="DIYgod" example="/twitter/followings/DIYgod" path="/twitter/followings/:id/:routeParams?" paramsDesc={['username', 'extra parameters, see the table above']} radar="1" rssbud="1" selfhost="1">

:::caution

This route requires Twitter token's corresponding id, therefore it's only available when self-hosting, refer to the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.

:::

</Route>

### List timeline {#twitter-list-timeline}

<Route author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name/:routeParams?" paramsDesc={['username', 'list name', 'extra parameters, see the table above']} radar="1" rssbud="1"/>

### User likes {#twitter-user-likes}

<Route author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id/:routeParams?" paramsDesc={['username', 'extra parameters, see the table above']} radar="1" rssbud="1"/>

### Keyword {#twitter-keyword}

<Route author="DIYgod yindaheng98 Rongronggg9" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword/:routeParams?" paramsDesc={['keyword', 'extra parameters, see the table above']} radar="1" rssbud="1"/>

### Trends {#twitter-trends}

<Route author="sakamossan" example="/twitter/trends/23424856" path="/twitter/trends/:woeid?" paramsDesc={['Yahoo! Where On Earth ID. default to woeid=1 (World Wide)']} radar="1" rssbud="1"/>

### Collection {#twitter-collection}

<Route author="TonyRL" example="/twitter/collection/DIYgod/1527857429467172864" path="/twitter/collection/:uid/:collectionId/:routeParams?" paramsDesc={['username, should match the generated token', 'collection ID, can be found in URL', 'extra parameters, see the table above']} radar="1" rssbud="1" selfhost="1">

:::caution

This route requires Twitter token's corresponding id, therefore it's only available when self-hosting, refer to the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.

:::

</Route>

### Tweet Details {#twitter-tweet-details}

<Route author="LarchLiu Rongronggg9" example="/twitter/tweet/DIYgod/status/1650844643997646852" path="/twitter/tweet/:id/status/:status/:original?" paramsDesc={['username; in particular, if starts with `+`, it will be recognized as a [unique ID](https://github.com/DIYgod/RSSHub/issues/12221), e.g. `+44196397`', 'tweet ID', 'extra parameters, data type of return, if the value is not `0`/`false` and `config.isPackage` is `true`, return the original data of twitter']} radar="1" rssbud="1"/>

## Vimeo {#vimeo}

### User Profile {#vimeo-user-profile}

<Route author="MisteryMonster" example="/vimeo/user/filmsupply/picks" path="/vimeo/user/:username/:cat?" paramsDesc={['In this example [https://vimeo.com/filmsupply](https://vimeo.com/filmsupply)  is `filmsupply`', 'deafult for all latest videos, others categories in this example such as `Docmentary`, `Narrative`, `Drama`. Set `picks` for promote orders, just orderd like web page. When `picks` added, published date won\'t show up']}>

:::tip Special category name attention

Some of the categories contain slash like `3D/CG` , must change the slash `/` to the vertical bar`|`.

:::

</Route>

### Channel {#vimeo-channel}

<Route author="MisteryMonster" example="/vimeo/channel/bestoftheyear" path="/vimeo/channel/:channel" paramsDesc={['channel name can get from url like `bestoftheyear` in  [https://vimeo.com/channels/bestoftheyear/videos](https://vimeo.com/channels/bestoftheyear/videos) .']} radar="1"/>

### Category {#vimeo-category}

<Route author="MisteryMonster" example="/vimeo/category/documentary/staffpicks" path="/vimeo/category/:category/:staffpicks?" paramsDesc={['Category name can get from url like `documentary` in [https://vimeo.com/categories/documentary/videos](https://vimeo.com/categories/documentary/videos) ', 'type `staffpicks` to sort with staffpicks']} radar="1"/>

## VueVlog {#vuevlog}

### 用户 {#vuevlog-yong-hu}

<Route author="kt286" example="/vuevideo/971924215514" path="/vuevideo/:userid" paramsDesc={['用户ID, 可在对应页面的 URL 中找到']}/>

## YouTube {#youtube}

:::tip Tiny Tiny RSS users please notice

Tiny Tiny RSS will add `sandbox="allow-scripts"` to all iframe elements, as a result, YouTube embedded videos cannot be loaded. If you need to use embedded videos, please install plugin [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) for Tiny Tiny RSS.

:::

### User {#youtube-user}

<Route author="DIYgod" path="/youtube/user/:username/:embed?" example="/youtube/user/JFlaMusic" paramsDesc={['YouTuber id', 'Default to embed the video, set to any value to disable embedding']} radar="1" rssbud="1"/>

### Channel {#youtube-channel}

:::tip

YouTube provides official RSS feeds for channels, for instance [https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ](https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ).

:::

<Route author="DIYgod" path="/youtube/channel/:id/:embed?" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" paramsDesc={['YouTube channel id', 'Default to embed the video, set to any value to disable embedding']} radar="1" rssbud="1"/>

### Custom URL {#youtube-custom-url}

<Route author="TonyRL" path="/youtube/c/:id/:embed?" example="/youtube/c/YouTubeCreators" paramsDesc={['YouTube custom URL', 'Default to embed the video, set to any value to disable embedding']} radar="1" rssbud="1"/>

### Playlist {#youtube-playlist}

<Route author="HenryQW" path="/youtube/playlist/:id/:embed?" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" paramsDesc={['YouTube playlist id', 'Default to embed the video, set to any value to disable embedding']} radar="1" rssbud="1"/>

### Community {#youtube-community}

<Route author="TonyRL" path="/youtube/community/:handle" example="/youtube/community/@JFlaMusic" paramsDesc={['YouTube handles or channel id']} radar="1" rssbud="1"/>

### Subscriptions {#youtube-subscriptions}

<Route author="TonyRL" path="/youtube/subscriptions/:embed?" example="/youtube/subscriptions" paramsDesc={['Default to embed the video, set to any value to disable embedding']} selfhost="1" radar="1" rssbud="1"/>

### Music Charts {#youtube-music-charts}

<Route author="TonyRL" path="/youtube/charts/:category?/:country?/:embed?" example="/youtube/charts" paramsDesc={['Chart, see table below, default to `TopVideos`', 'Country Code, see table below, default to global', 'Default to embed the video, set to any value to disable embedding']} radar="1" rssbud="1">

Chart

| Top artists | Top songs | Top music videos | Trending |
| ----------- | --------- | ---------------- | -------- |
| TopArtists | TopSongs | TopVideos | TrendingVideos |


Country Code

| Argentina | Australia | Austria | Belgium | Bolivia | Brazil | Canada |
| --------- | --------- | ------- | ------- | ------- | ------ | ------ |
| ar | au | at | be | bo | br | ca |

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



</Route>

## 巴哈姆特 {#ba-ha-mu-te}

### 个人小屋 {#ba-ha-mu-te-ge-ren-xiao-wu}

<Route author="hoilc" example="/bahamut/creation/tpesamguo/338592" path="/bahamut/creation/:author/:category?" paramsDesc={['作者 ID, 即为个人小屋 URL 中 `owner` 参数','分类ID, 即为创作分类 URL 中 `c` 参数']}/>

### 创作大厅 {#ba-ha-mu-te-chuang-zuo-da-ting}

<Route author="hoilc" example="/bahamut/creation_index/4/0/2" path="/bahamut/creation_index/:category?/:subcategory?/:type?" paramsDesc={['分类 ID, 即为 URL 中 `k1` 参数, 0 或置空为不限','子分类 ID, 即为 URL 中 `k2` 参数, 0或置空为不限', '排行类型, 即为 URL 中 `vt` 参数, 0或置空为達人專欄']}>

分类 ID 参考如下

| 不限 | 日誌 | 小說 | 繪圖 | Cosplay | 同人商品 |
| ---- | ---- | ---- | ---- | ------- | -------- |
| 0    | 1    | 2    | 3    | 4       | 5        |

子分类 ID 比较多不作列举

排行类型参考如下

| 達人專欄 | 最新創作 | 最新推薦 | 熱門創作 | 精選閣樓 |
| -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        |

</Route>

## 币乎 {#bi-hu}

### 用户动态 {#bi-hu-yong-hu-dong-tai}

<Route author="LogicJake" example="/bihu/activaties/1478342200" path="/bihu/activaties/:id" paramsDesc={['用户 id']}/>

## 唱吧 {#chang-ba}

### 用户 {#chang-ba-yong-hu}

<Route author="kt286 xizeyoupan" example="/changba/skp6hhF59n48R-UpqO3izw" path="/changba/:userid" paramsDesc={['用户ID, 可在对应分享页面的 URL 中找到']} radar="1" supportPodcast="1"/>

## 大众点评 {#da-zhong-dian-ping}

### 用户 {#da-zhong-dian-ping-yong-hu}

<Route author="brilon"  example="/dianping/user/35185271" path="/dianping/user/:id" paramsDesc={['用户id，可在 URL 中找到']}/>

## 抖音 {#dou-yin}

:::caution

反爬严格，需要启用 puppeteer。\
抖音的视频 CDN 会验证 Referer，意味着许多阅读器都无法直接播放内嵌视频，以下是一些变通解决方案：

1.  启用内嵌视频 (`embed=1`), 参考 [通用参数 -> 多媒体处理](/parameter#多媒体处理) 配置 `multimedia_hotlink_template` **或** `wrap_multimedia_in_iframe`。
2.  关闭内嵌视频 (`embed=0`)，手动点击 `视频直链` 超链接，一般情况下均可成功播放视频。若仍然出现 HTTP 403，请复制 URL 以后到浏览器打开。
3.  点击原文链接打开抖音网页版的视频详情页播放视频。

:::

额外参数

| 键      | 含义             | 值                     | 默认值  |
| ------- | ---------------- | ---------------------- | ------- |
| `embed` | 是否启用内嵌视频 | `0`/`1`/`true`/`false` | `false` |

### 博主 {#dou-yin-bo-zhu}

<Route author="Max-Tortoise Rongronggg9" example="/douyin/user/MS4wLjABAAAARcAHmmF9mAG3JEixq_CdP72APhBlGlLVbN-1eBcPqao" path="/douyin/user/:uid/:routeParams?" paramsDesc={['uid，可在用户页面 URL 中找到', '额外参数，query string 格式，请参阅上面的表格']} anticrawler="1" radar="1" rssbud="1" puppeteer="1" />

### 标签 {#dou-yin-biao-qian}

<Route author="TonyRL" example="/douyin/hashtag/1592824105719812" path="/douyin/hashtag/:cid/:routeParams?" paramsDesc={['标签 ID，可在标签页面 URL 中找到', '额外参数，query string 格式，请参阅上面的表格']} anticrawler="1" radar="1" rssbud="1" puppeteer="1" />

### 直播 {#dou-yin-zhi-bo}

见 [#抖音直播](/routes/live#dou-yin-zhi-bo)

## 豆瓣 {#dou-ban}

### 正在上映的电影 {#dou-ban-zheng-zai-shang-ying-de-dian-ying}

<Route author="DIYgod" example="/douban/movie/playing" path="/douban/movie/playing"/>

### 正在上映的高分电影 {#dou-ban-zheng-zai-shang-ying-de-gao-fen-dian-ying}

<Route author="DIYgod" example="/douban/movie/playing/7.5" path="/douban/movie/playing/:score" paramsDesc={['返回大于等于这个分数的电影']}/>

### 即将上映的电影 {#dou-ban-ji-jiang-shang-ying-de-dian-ying}

<Route author="DIYgod" example="/douban/movie/later" path="/douban/movie/later"/>

### 北美票房榜 {#dou-ban-bei-mei-piao-fang-bang}

<Route author="DIYgod" example="/douban/movie/ustop" path="/douban/movie/ustop"/>

### 一周口碑榜 {#dou-ban-yi-zhou-kou-bei-bang}

<Route author="umm233 nczitzk" example="/douban/movie/weekly" path="/douban/movie/weekly/:type?" paramsDesc={['分类，可在榜单页 URL 中找到，默认为一周口碑电影榜']}>

| 一周口碑电影榜    | 华语口碑剧集榜         |
| ----------------- | ---------------------- |
| movie_weekly_best | tv_chinese_best_weekly |

</Route>

### 豆瓣电影分类 {#dou-ban-dou-ban-dian-ying-fen-lei}

<Route author="zzwab" example="/douban/movie/classification/R/7.5/Netflix,剧情,2020" path="/douban/movie/classification/:sort?/:score?/:tags?" paramsDesc={['排序方式，默认为U', '最低评分，默认不限制', '分类标签，多个标签之间用英文逗号分隔，常见的标签到豆瓣电影的分类页面查看，支持自定义标签']} />

排序方式可选值如下

| 近期热门 | 标记最多 | 评分最高 | 最近上映 |
| -------- | -------- | -------- | -------- |
| U        | T        | S        | R        |

### 豆瓣电影人 {#dou-ban-dou-ban-dian-ying-ren}

<Route author="minimalistrojan" example="/douban/celebrity/1274261" path="/douban/celebrity/:id/:sort?" paramsDesc={['电影人 id', '排序方式，缺省为 `time`（时间排序），可为 `vote` （评价排序）']}/>

### 豆瓣小组 {#dou-ban-dou-ban-xiao-zu}

<Route author="DIYgod" example="/douban/group/648102" path="/douban/group/:groupid/:type?" paramsDesc={['豆瓣小组的 id', '缺省 最新，essence 最热，elite 精华']} anticrawler="1"/>

### 浏览发现 {#dou-ban-liu-lan-fa-xian}

<Route author="clarkzsd Fatpandac" example="/douban/explore" path="/douban/explore"/>

### 浏览发现分栏目 {#dou-ban-liu-lan-fa-xian-fen-lan-mu}

<Route author="LogicJake" example="/douban/explore/column/2" path="/douban/explore_column/:id" paramsDesc={['分栏目id']}/>

### 新书速递 {#dou-ban-xin-shu-su-di}

<Route author="fengkx" example="/douban/book/latest" path="douban/book/latest"/>

### 最新增加的音乐 {#dou-ban-zui-xin-zeng-jia-de-yin-yue}

<Route author="fengkx xyqfer" example="/douban/music/latest/chinese" path="/douban/music/latest/:area?" paramsDesc={['区域类型，默认全部']}>

| 华语    | 欧美    | 日韩        |
| ------- | ------- | ----------- |
| chinese | western | japankorean |

</Route>

### 热门同城活动 {#dou-ban-re-men-tong-cheng-huo-dong}

<Route author="xyqfer" example="/douban/event/hot/118172" path="/douban/event/hot/:locationId" paramsDesc={['位置 id, [同城首页](https://www.douban.com/location)打开控制台执行 `window.__loc_id__` 获取']}/>

### 商务印书馆新书速递 {#dou-ban-shang-wu-yin-shu-guan-xin-shu-su-di}

<Route author="xyqfer" example="/douban/commercialpress/latest" path="/douban/commercialpress/latest"/>

### 豆瓣书店 {#dou-ban-dou-ban-shu-dian}

<Route author="xyqfer" example="/douban/bookstore" path="/douban/bookstore"/>

### 热门图书排行 {#dou-ban-re-men-tu-shu-pai-hang}

<Route author="xyqfer queensferryme" example="/douban/book/rank/fiction" path="/douban/book/rank/:type?" paramsDesc={['图书类型，默认合并列表']}>

| 全部 | 虚构    | 非虚构     |
| ---- | ------- | ---------- |
|      | fiction | nonfiction |

</Route>

### 豆列 {#dou-ban-dou-lie}

<Route author="LogicJake" example="/douban/doulist/37716774" path="douban/doulist/:id" paramsDesc={['豆列id']}/>

### 用户广播 {#dou-ban-yong-hu-guang-bo}

<Route author="alfredcai" example="/douban/people/62759792/status" path="douban/people/:userid/status/:routeParams" paramsDesc={['整数型用户 id', '额外参数；见下']} radar="1">

:::tip

-   **目前只支持整数型 id**
-   字母型的 id，可以通过头像图片链接来找到其整数型 id，图片命名规则`ul[userid]-*.jpg`或`u[userid]-*.jpg`，即取文件名中间的数字
-   例如：用户 id: `MovieL`他的头像图片链接：`https://img1.doubanio.com/icon/ul1128221-98.jpg`他的整数型 id: `1128221`

:::

对于豆瓣用户广播内容，在 `routeParams` 参数中以 query string 格式设置如下选项可以控制输出的样式

| 键                         | 含义                                                           | 接受的值       | 默认值 |
| -------------------------- | -------------------------------------------------------------- | -------------- | ------ |
| readable                   | 是否开启细节排版可读性优化                                     | 0/1/true/false | false  |
| authorNameBold             | 是否加粗作者名字                                               | 0/1/true/false | false  |
| showAuthorInTitle          | 是否在标题处显示作者                                           | 0/1/true/false | true   |
| showAuthorInDesc           | 是否在正文处显示作者                                           | 0/1/true/false | false  |
| showAuthorAvatarInDesc     | 是否在正文处显示作者头像（若阅读器会提取正文图片，不建议开启） | 0/1/true/false | false  |
| showEmojiForRetweet        | 显示 “🔁” 取代 “Fw”（转发）                                    | 0/1/true/false | false  |
| showRetweetTextInTitle     | 在标题出显示转发评论（置为 false 则在标题只显示被转发的广播）  | 0/1/true/false | false  |
| addLinkForPics             | 为图片添加可点击的链接                                         | 0/1/true/false | false  |
| showTimestampInDescription | 在正文处显示广播的时间戳                                       | 0/1/true/false | false  |
| showComments               | 在正文处显示评论                                               | 0/1/true/false | false  |
| widthOfPics                | 广播配图宽（生效取决于阅读器）                                 | 不指定 / 数字  | 不指定 |
| heightOfPics               | 广播配图高（生效取决于阅读器）                                 | 不指定 / 数字  | 不指定 |
| sizeOfAuthorAvatar         | 作者头像大小                                                   | 数字           | 48     |

指定更多与默认值不同的参数选项可以改善 RSS 的可读性，如

    https://rsshub.app/douban/people/113894409/status/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweet=1&showRetweetTextInTitle=1&addLinkForPics=1&showTimestampInDescription=1&showComments=1&widthOfPics=100

的效果为

<img src="/img/readable-douban.png" alt="豆瓣读书的可读豆瓣广播 RSS" />

</Route>

### 日记最新回应 {#dou-ban-ri-ji-zui-xin-hui-ying}

<Route author="nczitzk" example="/douban/replies/xiaoyaxiaoya" path="/douban/replies/:uid" paramsDesc={['用户id，可在用户日记页 URL 中找到']}/>

### 最新回应过的日记 {#dou-ban-zui-xin-hui-ying-guo-de-ri-ji}

<Route author="nczitzk" example="/douban/replied/xiaoyaxiaoya" path="/douban/replied/:uid" paramsDesc={['用户id，可在用户日记页 URL 中找到']}/>

### 话题 {#dou-ban-hua-ti}

<Route author="LogicJake" example="/douban/topic/48823" path="/douban/topic/:id/:sort?" paramsDesc={['话题id','排序方式，hot或new，默认为new']}/>

### 频道专题 {#dou-ban-pin-dao-zhuan-ti}

<Route author="umm233" example="/douban/channel/30168934/hot" path="/douban/channel/:id/:nav?" paramsDesc={['频道id','专题分类，可选，默认为 default']}>

| 默认    | 热门 | 最新 |
| ------- | ---- | ---- |
| default | hot  | new  |

</Route>

### 频道书影音 {#dou-ban-pin-dao-shu-ying-yin}

<Route author="umm233" example="/douban/channel/30168934/subject/0" path="/douban/channel/:id/subject/:nav" paramsDesc={['频道id','书影音分类']}>

| 电影 | 电视剧 | 图书 | 唱片 |
| ---- | ------ | ---- | ---- |
| 0    | 1      | 2    | 3    |

</Route>

### 用户想看 {#dou-ban-yong-hu-xiang-kan}

<Route author="exherb" example="/douban/people/exherb/wish" path="/douban/people/:userid/wish/:routeParams?" paramsDesc={['用户id','额外参数；见下']}>

对于豆瓣用户想看的内容，在 `routeParams` 参数中以 query string 格式设置如下选项可以控制输出的样式

| 键         | 含义       | 接受的值 | 默认值 |
| ---------- | ---------- | -------- | ------ |
| pagesCount | 查询页面数 |          | 1      |

</Route>

### 豆瓣招聘 {#dou-ban-dou-ban-zhao-pin}

<Route author="Fatpandac" example="/douban/jobs/campus" path="/douban/jobs/:type" paramsDesc={['招聘类型，见下表']}>

| 社会招聘 | 校园招聘 | 实习生招聘 |
| :------: | :------: | :--------: |
|  social  |  campus  |   intern   |

</Route>

### 榜单与集合 {#dou-ban-bang-dan-yu-ji-he}

<Route author="5upernova-heng" example="/douban/list/subject_real_time_hotest" path="/douban/list/:type?" paramsDesc={['榜单类型，见下表。默认为实时热门书影音']}>

| 榜单 / 集合        | 路由（type）               |
| ------------------ | -------------------------- |
| 实时热门书影音     | subject_real_time_hotest   |
| 影院热映           | movie_showing              |
| 实时热门电影       | movie_real_time_hotest     |
| 实时热门电视       | tv_real_time_hotest        |
| 一周口碑电影榜     | movie_weekly_best          |
| 华语口碑剧集榜     | tv_chinese_best_weekly     |
| 全球口碑剧集榜     | tv_global_best_weekly      |
| 国内口碑综艺榜     | show_chinese_best_weekly   |
| 国外口碑综艺榜     | show_global_best_weekly    |
| 热播新剧国产剧   | tv_domestic    |
| 热播新剧欧美剧   | tv_american    |
| 热播新剧日剧    | tv_japanese    |
| 热播新剧韩剧    | tv_korean    |
| 热播新剧动画    | tv_animation    |
| 虚构类小说热门榜   | book_fiction_hot_weekly    |
| 非虚构类小说热门榜 | book_nonfiction_hot_weekly |
| 热门单曲榜         | music_single               |
| 华语新碟榜         | music_chinese              |
| ...                | ...                        |

> 上面的榜单 / 集合并没有列举完整。
>
> 如何找到榜单对应的路由参数：
> 在豆瓣手机 APP 中，对应地榜单页面右上角，点击分享链接。链接路径 `subject_collection` 后的路径就是路由参数 `type`。
> 如：小说热门榜的分享链接为：`https://m.douban.com/subject_collection/ECDIHUN4A`，其对应本 RSS 路由的 `type` 为 `ECDIHUN4A`，对应的订阅链接路由：[`/douban/list/ECDIHUN4A`](https://rsshub.app/douban/list/ECDIHUN4A)

</Route>

## 饭否 {#fan-fou}

:::caution

部署时需要申请并配置饭否 Consumer Key、Consumer Secret、用户名和密码，具体见部署文档

:::

### 用户动态 {#fan-fou-yong-hu-dong-tai}

<Route author="junbaor" example="/fanfou/user_timeline/wangxing" path="/fanfou/user_timeline/:uid" paramsDesc={['用户的uid']} anticrawler="1"/>

### 当前登录用户的时间线 {#fan-fou-dang-qian-deng-lu-yong-hu-de-shi-jian-xian}

<Route author="junbaor" example="/fanfou/home_timeline" path="/fanfou/home_timeline" anticrawler="1"/>

### 用户收藏 {#fan-fou-yong-hu-shou-cang}

<Route author="junbaor" example="/fanfou/favorites/wangxing" path="/fanfou/favorites/:uid" paramsDesc={['用户的uid']} anticrawler="1"/>

### 热门话题 {#fan-fou-re-men-hua-ti}

<Route author="junbaor" example="/fanfou/trends" path="/fanfou/trends" anticrawler="1"/>

### 饭否搜索 {#fan-fou-fan-fou-sou-suo}

<Route author="junbaor" example="/fanfou/public_timeline/冬天" path="/fanfou/public_timeline/:keyword" paramsDesc={['关键字']} anticrawler="1"/>

## 方格子 {#fang-ge-zi}

### 出版專題 {#fang-ge-zi-chu-ban-zhuan-ti}

<Route author="Maecenas" example="/vocus/publication/bass" path="/vocus/publication/:id" paramsDesc={['出版專題 id，可在出版專題主页的 URL 找到']} radar="1"/>

### 用户个人文章 {#fang-ge-zi-yong-hu-ge-ren-wen-zhang}

<Route author="LogicJake" example="/vocus/user/tsetyan" path="/vocus/user/:id" paramsDesc={['用户 id，可在用户主页的 URL 找到']} radar="1"/>

## 即刻 {#ji-ke}

### 用户动态 {#ji-ke-yong-hu-dong-tai}

<Route author="DIYgod prnake" example="/jike/user/3EE02BC9-C5B3-4209-8750-4ED1EE0F67BB" path="/jike/user/:id" paramsDesc={['用户 id, 可在即刻分享出来的单条动态页点击用户头像进入个人主页，然后在个人主页的 URL 中找到，或者在单条动态页使用 RSSHub Radar 插件']} radar="1"/>

### 圈子 {#ji-ke-quan-zi}

<Route author="DIYgod prnake" example="/jike/topic/556688fae4b00c57d9dd46ee" path="/jike/topic/:id/:showUid?" paramsDesc={['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到', '是否在内容中显示用户信息，设置为 1 则开启']} radar="1" rssbud="1"/>

### 圈子 - 纯文字 {#ji-ke-quan-zi-chun-wen-zi}

<Route author="HenryQW" example="/jike/topic/text/553870e8e4b0cafb0a1bef68" path="/jike/topic/text/:id" paramsDesc={['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']} radar="1" rssbud="1"/>

## 简书 {#jian-shu}

### 首页 {#jian-shu-shou-ye}

<Route author="DIYgod HenryQW" example="/jianshu/home" path="/jianshu/home"/>

### 热门 {#jian-shu-re-men}

<Route author="DIYgod HenryQW" example="/jianshu/trending/weekly" path="/jianshu/trending/:timeframe" paramsDesc={['按周 `weekly` 或 按月 `monthly`']}/>

### 专题 {#jian-shu-zhuan-ti}

<Route author="DIYgod HenryQW" example="/jianshu/collection/xYuZYD" path="/jianshu/collection/:id" paramsDesc={['专题 id, 可在专题页 URL 中找到']}/>

### 作者 {#jian-shu-zuo-zhe}

<Route author="DIYgod HenryQW" example="/jianshu/user/yZq3ZV" path="/jianshu/user/:id" paramsDesc={['作者 id, 可在作者主页 URL 中找到']}/>

## 酷安 {#ku-an}

### 图文 {#ku-an-tu-wen}

<Route author="xizeyoupan" example="/coolapk/tuwen" path="/coolapk/tuwen/:type?" paramsDesc={['默认为hot']}>

| 参数名称 | 编辑精选 | 最新   |
| -------- | -------- | ------ |
| type     | hot      | latest |

</Route>

### 头条 {#ku-an-tou-tiao}

<Route author="xizeyoupan" example="/coolapk/toutiao" path="/coolapk/toutiao/:type?" paramsDesc={['默认为history']}>

| 参数名称 | 历史头条 | 最新   |
| -------- | -------- | ------ |
| type     | history  | latest |

</Route>

### 看看号 {#ku-an-kan-kan-hao}

<Route author="xizeyoupan" example="/coolapk/dyh/1524" path="/coolapk/dyh/:dyhId" paramsDesc={['看看号ID']}>

:::tip

仅限于采集**站内订阅**的看看号的内容。看看号 ID 可在看看号界面右上分享 - 复制链接得到。

:::

</Route>

### 话题 {#ku-an-hua-ti}

<Route author="xizeyoupan" example="/coolapk/huati/酷安夜话" path="/coolapk/huati/:tag" paramsDesc={['话题名称']}/>

### 用户 {#ku-an-yong-hu}

<Route author="xizeyoupan" example="/coolapk/user/3177668/dynamic" path="/coolapk/user/:uid/dynamic" paramsDesc={['在个人界面右上分享-复制链接获取']}/>

### 热榜 {#ku-an-re-bang}

<Route author="xizeyoupan" example="/coolapk/hot" path="/coolapk/hot/:type?/:period?" paramsDesc={['默认为`jrrm`','默认为`daily`']}>

| 参数名称 | 今日热门 | 点赞榜 | 评论榜 | 收藏榜 | 酷图榜 |
| -------- | -------- | ------ | ------ | ------ | ------ |
| type     | jrrm     | dzb    | plb    | scb    | ktb    |

| 参数名称 | 日榜  | 周榜   |
| -------- | ----- | ------ |
| period   | daily | weekly |

:::tip

今日热门没有周榜，酷图榜日榜的参数会变成周榜，周榜的参数会变成月榜。

:::

</Route>

## 美拍 {#mei-pai}

### 用户动态 {#mei-pai-yong-hu-dong-tai}

<Route author="ihewro" example="/meipai/user/56537299" path="/meipai/user/:id" paramsDesc={['用户 id, 可在 分享出去获得的用户主页 URL 中找到']}/>

## 全民 K 歌 {#quan-min-k-ge}

### 用户作品列表 {#quan-min-k-ge-yong-hu-zuo-pin-lie-biao}

<Route author="zhangxiang012" example="/qq/kg/639a9a86272c308e33" path="/qq/kg/:userId" paramsDesc={['用户 ID, 可在对应页面的 URL 中找到']} radar="1" rssaid="1" supportPodcast="1"/>

### 用户作品评论动态 {#quan-min-k-ge-yong-hu-zuo-pin-ping-lun-dong-tai}

<Route author="zhangxiang012" example="/qq/kg/reply/OhXHMdO1VxLWQOOm" path="/qq/kg/reply/:playId" paramsDesc={['音频页 ID, 可在对应页面的 URL 中找到']} radar="1" rssaid="1"/>

## 数字尾巴 {#shu-zi-wei-ba}

### 首页 {#shu-zi-wei-ba-shou-ye}

<Route author="Erriy" example="/dgtle" path="/dgtle" />

### 闲置（分类） {#shu-zi-wei-ba-xian-zhi-fen-lei}

<Route author="xyqfer hoilc" example="/dgtle/trade/111" path="/dgtle/trade/:typeId?" paramsDesc={['分类 id，默认为全部']}>

| 全部 | 电脑 | 手机 | 平板 | 相机 | 影音 | 外设 | 生活 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 111  | 109  | 110  | 113  | 114  | 115  | 112  | 116  |

</Route>

### 闲置（关键词） {#shu-zi-wei-ba-xian-zhi-guan-jian-ci}

<Route author="gaoliang hoilc" example="/dgtle/trade/search/ipad" path="/dgtle/trade/search/:keyword" paramsDesc={['搜索关键词']}/>

### 鲸图（分类） {#shu-zi-wei-ba-jing-tu-fen-lei}

<Route author="Erriy" example="/dgtle/whale/category/0" path="/dgtle/whale/category/:category" paramsDesc={['分类 id']}>

| 精选 | 人物 | 静物 | 二次元 | 黑白 | 自然 | 美食 | 电影与游戏 | 科技与艺术 | 城市与建筑 | 萌物 | 美女 |
| ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---------- | ---------- | ---------- | ---- | ---- |
| 0    | 1    | 2    | 3      | 4    | 5    | 6    | 7          | 8          | 9          | 10   | 11   |

</Route>

### 鲸图（排行榜） {#shu-zi-wei-ba-jing-tu-pai-hang-bang}

<Route author="Erriy" example="/dgtle/whale/rank/download/day" path="/dgtle/whale/rank/:type/:rule" paramsDesc={['排行榜类型', '排行榜周期']}>

type

| 下载排行榜 | 点赞排行榜 |
| ---------- | ---------- |
| download   | like       |

rule

| 日排行 | 周排行 | 月排行 | 总排行 |
| ------ | ------ | ------ | ------ |
| day    | week   | month  | amount |

</Route>

## 刷屏 {#shua-ping}

### 最新 {#shua-ping-zui-xin}

<Route author="xyqfer" example="/weseepro/newest" path="/weseepro/newest"/>

### 最新（无中间页） {#shua-ping-zui-xin-wu-zhong-jian-ye}

<Route author="xyqfer yefoenix" example="/weseepro/newest-direct" path="/weseepro/newest-direct"/>

### 朋友圈 {#shua-ping-peng-you-quan}

<Route author="xyqfer" example="/weseepro/circle" path="/weseepro/circle"/>

## 微博 {#wei-bo}

:::caution

微博会针对请求的来源地区返回不同的结果。\
一个已知的例子为：部分视频因未知原因仅限中国大陆境内访问 (CDN 域名为 `locallimit.us.sinaimg.cn` 而非 `f.video.weibocdn.com`)。若一条微博含有这种视频且 RSSHub 实例部署在境外，抓取到的微博可能不含视频。将 RSSHub 部署在境内有助于抓取这种视频，但阅读器也必须处于境内网络环境以加载视频。

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

    https://rsshub.app/weibo/user/1642909335/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweet=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showTimestampInDescription=1&heightOfPics=150

的效果为

<img src="/img/readable-weibo.png" alt="微博小秘书的可读微博 RSS" />

### 博主 {#wei-bo-bo-zhu}

<Route author="DIYgod iplusx Rongronggg9" example="/weibo/user/1195230310" path="/weibo/user/:uid/:routeParams?" paramsDesc={['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取', '额外参数；请参阅上面的说明和表格；特别地，当 `routeParams=1` 时开启微博视频显示']} anticrawler="1" radar="1" rssbud="1">

部分博主仅登录可见，不支持订阅，可以通过打开 `https://m.weibo.cn/u/:uid` 验证

</Route>

### 关键词 {#wei-bo-guan-jian-ci}

<Route author="DIYgod Rongronggg9" example="/weibo/keyword/DIYgod" path="/weibo/keyword/:keyword/:routeParams?" paramsDesc={['你想订阅的微博关键词', '额外参数；请参阅上面的说明和表格']} anticrawler="1" radar="1" rssbud="1"/>

### 热搜榜 {#wei-bo-re-sou-bang}

<Route author="xyqfer" example="/weibo/search/hot" path="/weibo/search/hot" anticrawler="1" radar="1" rssbud="1"/>

### 超话 {#wei-bo-chao-hua}

<Route author="zengxs Rongronggg9" example="/weibo/super_index/1008084989d223732bf6f02f75ea30efad58a9/sort_time" path="/weibo/super_index/:id/:type?/:routeParams?" paramsDesc={['超话ID', '类型：见下表', '额外参数；请参阅上面的说明和表格']} anticrawler="1" radar="1" rssbud="1"/>

| type      | 备注             |
| --------- | ---------------- |
| soul      | 精华             |
| video     | 视频（暂不支持） |
| album     | 相册（暂不支持） |
| hot_sort  | 热门             |
| sort_time | 最新帖子         |
| feed      | 最新评论         |

### 个人时间线 {#wei-bo-ge-ren-shi-jian-xian}

<Route author="zytomorrow DIYgod Rongronggg9" example="/weibo/timeline/3306934123" path="/weibo/timeline/:uid/:feature?/:routeParams?" paramsDesc={['用户的uid', '过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。', '额外参数；请参阅上面的说明和表格']} anticrawler="1" selfhost="1">

:::caution

需要对应用户打开页面进行授权生成 token 才能生成内容

自部署需要申请并配置微博 key，具体见部署文档

:::

</Route>

### 自定义分组 {#wei-bo-zi-ding-yi-fen-zu}

<Route author="monologconnor Rongronggg9" example="/weibo/group/4541216424989965/微博分组/:routeParams?" path="/weibo/group/:gid/:gname?/:routeParams?" paramsDesc={['分组id, 在网页版分组地址栏末尾`?gid=`处获取', '分组显示名称; 默认为: `微博分组`', '额外参数；请参阅上面的说明和表格']} anticrawler="1" selfhost="1">

:::caution

由于微博官方未提供自定义分组相关 api, 此方案必须使用用户`Cookie`进行抓取

因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

微博用户 Cookie 的配置可参照部署文档

:::

</Route>

## 微博绿洲 {#wei-bo-lv-zhou}

### 用户 {#wei-bo-lv-zhou-yong-hu}

<Route author="kt286" example="/weibo/oasis/user/1990895721" path="/weibo/oasis/user/:userid" paramsDesc={['用户 id, 可在用户主页 URL 中找到']} anticrawler="1"/>

## 悟空问答 {#wu-kong-wen-da}

### 用户动态 {#wu-kong-wen-da-yong-hu-dong-tai}

<Route author="nczitzk" example="/wukong/user/5826687196" path="/wukong/user/:id/:type?" paramsDesc={['用户ID，可在用户页 URL 中找到', '类型，可选 `dongtai` 即 动态，`answers` 即 回答，`questions` 即 提问，默认为 `dongtai`']}>

:::tip

用户的动态是一定时间范围内用户提出的问题和作出的回答，距离现在时间较久的问题和回答不会出现，此时选择 `dongtai` 用户动态是会缺失的。

同理选择 `answers` 和 `questions` 作为参数时，对于没有提出过问题和作出过回答的用户，其内容也会相应缺失。

:::

</Route>

## 小红书 {#xiao-hong-shu}

### 用户笔记 {#xiao-hong-shu-yong-hu-bi-ji}

<Route author="lotosbin" example="/xiaohongshu/user/593032945e87e77791e03696/notes" path="/xiaohongshu/user/:user_id/notes/:fulltext?" paramsDesc={['用户 ID', '若为`fulltext`将抓取笔记全文，若为空则只抓取笔记标题']} puppeteer="1" anticrawler="1" radar="1" rssbud="1"/>

:::tip

笔记全文不支持显示视频

:::

### 用户收藏 {#xiao-hong-shu-yong-hu-shou-cang}

<Route author="lotosbin" example="/xiaohongshu/user/593032945e87e77791e03696/collect" path="/xiaohongshu/user/:user_id/collect" paramsDesc={['用户 ID']} puppeteer="1" anticrawler="1" radar="1" rssbud="1"/>

### 专辑 {#xiao-hong-shu-zhuan-ji}

<Route author="lotosbin" example="/xiaohongshu/board/5db6f79200000000020032df" path="/xiaohongshu/board/:board_id" paramsDesc={['专辑 ID']} puppeteer="1" anticrawler="1" radar="1" rssbud="1"/>

## 新榜 {#xin-bang}

:::caution

部署时需要配置 NEWRANK_COOKIE，具体见部署文档
请勿过高频抓取，新榜疑似对每天调用 token 总次数进行了限制，超限会报错

:::

### 微信公众号 {#xin-bang-wei-xin-gong-zhong-hao}

<Route author="lessmoe" example="/newrank/wechat/chijiread" path="/newrank/wechat/:wxid" paramsDesc={['微信号，若微信号与新榜信息不一致，以新榜为准']} anticrawler="1" selfhost="1"/>

### 抖音短视频 {#xin-bang-dou-yin-duan-shi-pin}

<Route author="lessmoe" example="/newrank/douyin/110266463747" path="/newrank/douyin/:dyid" paramsDesc={['抖音ID，可在新榜账号详情 URL 中找到']} anticrawler="1" selfhost="1"/>

:::caution

免费版账户抖音每天查询次数 20 次，如需增加次数可购买新榜会员或等待未来多账户支持

:::

## 知乎 {#zhi-hu}

### 收藏夹 {#zhi-hu-shou-cang-jia}

<Route author="huruji Colin-XKL Fatpandac" example="/zhihu/collection/26444956" path="/zhihu/collection/:id/:getAll?" paramsDesc={['收藏夹 id, 可在收藏夹页面 URL 中找到', '获取全部收藏内容，任意值为打开']} anticrawler="1" radar="1" rssbud="1"/>

### 用户动态 {#zhi-hu-yong-hu-dong-tai}

<Route author="DIYgod" example="/zhihu/people/activities/diygod" path="/zhihu/people/activities/:id" paramsDesc={['作者 id, 可在用户主页 URL 中找到']} anticrawler="1" radar="1" rssbud="1"/>

### 用户回答 {#zhi-hu-yong-hu-hui-da}

<Route author="DIYgod prnake" example="/zhihu/people/answers/diygod" path="/zhihu/people/answers/:id" paramsDesc={['作者 id, 可在用户主页 URL 中找到']} anticrawler="1" radar="1" rssbud="1"/>

### 用户文章 {#zhi-hu-yong-hu-wen-zhang}

<Route author="whtsky Colin-XKL" example="/zhihu/posts/people/frederchen" path="/zhihu/posts/:usertype/:id" paramsDesc={['作者 id, 可在用户主页 URL 中找到', '用户类型usertype，参考用户主页的URL。目前有两种，见下表']} anticrawler="1" radar="1" rssbud="1"/>

| 普通用户 | 机构用户 |
| -------- | -------- |
| people   | org      |

### 专栏 {#zhi-hu-zhuan-lan}

<Route author="DIYgod" example="/zhihu/zhuanlan/googledevelopers" path="/zhihu/zhuanlan/:id" paramsDesc={['专栏 id, 可在专栏主页 URL 中找到']} anticrawler="1" radar="1" rssbud="1"/>

### 知乎日报 {#zhi-hu-zhi-hu-ri-bao}

<Route author="DHPO" example="/zhihu/daily" path="/zhihu/daily" anticrawler="1" radar="1" rssbud="1"/>

### 知乎日报 - 合集 {#zhi-hu-zhi-hu-ri-bao-he-ji}

<Route author="ccbikai" example="/zhihu/daily/section/2" path="/zhihu/daily/section/:sectionId" paramsDesc={['合集 id, 可在 https://news-at.zhihu.com/api/7/sections 找到']} anticrawler="1"/>

### 知乎热榜 {#zhi-hu-zhi-hu-re-bang}

<Route author="DIYgod" example="/zhihu/hotlist" path="/zhihu/hotlist" anticrawler="1" radar="1" rssbud="1"/>

### 知乎分类热榜 {#zhi-hu-zhi-hu-fen-lei-re-bang}

<Route author="nczitzk" example="/zhihu/hot" path="/zhihu/hot/:category?" paramsDesc={['分类，见下表，默认为全站']} anticrawler="1" radar="1" rssbud="1">

| 全站  | 国际  | 科学    | 汽车 | 视频   | 时尚    | 时事  | 数码    | 体育  | 校园   | 影视 |
| ----- | ----- | ------- | ---- | ------ | ------- | ----- | ------- | ----- | ------ | ---- |
| total | focus | science | car  | zvideo | fashion | depth | digital | sport | school | film |

</Route>

### 知乎想法热榜 {#zhi-hu-zhi-hu-xiang-fa-re-bang}

<Route author="xyqfer" example="/zhihu/pin/hotlist" path="/zhihu/pin/hotlist" anticrawler="1" radar="1" rssbud="1"/>

### 问题 {#zhi-hu-wen-ti}

<Route author="xyqfer hacklu" example="/zhihu/question/59895982" path="/zhihu/question/:questionId/:sortBy?" paramsDesc={['问题 id', '排序方式：`default`, `created`, `updated`。默认为 `default`']} anticrawler="1" radar="1" rssbud="1"/>

### 话题 {#zhi-hu-hua-ti}

<Route author="xyqfer" example="/zhihu/topic/19828946" path="/zhihu/topic/:topicId" paramsDesc={['话题 id']} anticrawler="1" radar="1" rssbud="1"/>

### 用户想法 {#zhi-hu-yong-hu-xiang-fa}

<Route author="xyqfer" example="/zhihu/people/pins/kan-dan-45" path="/zhihu/people/pins/:id" paramsDesc={['作者 id, 可在用户主页 URL 中找到']} anticrawler="1" radar="1" rssbud="1"/>

### 知乎书店 - 新书 {#zhi-hu-zhi-hu-shu-dian-xin-shu}

<Route author="xyqfer" example="/zhihu/bookstore/newest" path="/zhihu/bookstore/newest" anticrawler="1" radar="1" rssbud="1"/>

### 知乎想法 - 24 小时新闻汇总 {#zhi-hu-zhi-hu-xiang-fa-24-xiao-shi-xin-wen-hui-zong}

<Route author="xyqfer" example="/zhihu/pin/daily" path="/zhihu/pin/daily" anticrawler="1" radar="1" rssbud="1"/>

### 知乎书店 - 知乎周刊 {#zhi-hu-zhi-hu-shu-dian-zhi-hu-zhou-kan}

<Route author="LogicJake" example="/zhihu/weekly" path="/zhihu/weekly" anticrawler="1" radar="1" rssbud="1"/>

### 用户关注时间线 {#zhi-hu-yong-hu-guan-zhu-shi-jian-xian}

<Route author="SeanChao" example="/zhihu/timeline" path="/zhihu/timeline" anticrawler="1" selfhost="1">

:::caution

用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### [xhu](https://github.com/REToys/xhu) - 收藏夹 {#zhi-hu-xhu-https-github.com-retoys-xhu-shou-cang-jia}

<Route author="JimenezLi" example="/zhihu/xhu/collection/26444956" path="/zhihu/xhu/collection/:id" paramsDesc={['收藏夹 id, 可在收藏夹页面 URL 中找到']} anticrawler="1"/>

### [xhu](https://github.com/REToys/xhu) - 专栏 {#zhi-hu-xhu-https-github.com-retoys-xhu-zhuan-lan}

<Route author="JimenezLi" example="/zhihu/xhu/zhuanlan/githubdaily" path="/zhihu/xhu/zhuanlan/:id" paramsDesc={['专栏 id, 可在专栏主页 URL 中找到']} anticrawler="1"/>

### [xhu](https://github.com/REToys/xhu) - 问题 {#zhi-hu-xhu-https-github.com-retoys-xhu-wen-ti}

<Route author="JimenezLi" example="/zhihu/xhu/question/264051433" path="/zhihu/xhu/question/:questionId/:sortBy?" paramsDesc={['问题 id', '排序方式：`default`, `created`, `updated`。默认为 `default`']} anticrawler="1"/>

### [xhu](https://github.com/REToys/xhu) - 话题 {#zhi-hu-xhu-https-github.com-retoys-xhu-hua-ti}

<Route author="JimenezLi" example="/zhihu/xhu/topic/19566035" path="/zhihu/xhu/topic/:topicId" paramsDesc={['话题ID']} anticrawler="1"/>
