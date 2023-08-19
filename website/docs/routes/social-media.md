import Route from '@site/src/components/Route';

# 💬 社交媒体

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

<Route author="DIYgod zytomorrow" example="/bilibili/user/dynamic/2267573" path="/bilibili/user/dynamic/:uid/:showEmoji?/:disableEmbed?" paramsDesc={['用户 id, 可在 UP 主主页中找到', '显示或隐藏表情图片，默认值为 0 隐藏，其他值为显示', '默认为开启内嵌视频, 任意值为关闭']} radar="1" rssbud="1"/>

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

:::caution 注意

UP 主粉丝现在需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### UP 主关注用户 {#bilibili-up-zhu-guan-zhu-yong-hu}

<Route author="Qixingchen" example="/bilibili/user/followings/2267573/3" path="/bilibili/user/followings/:uid/:loginUid" paramsDesc={['用户 id, 可在 UP 主主页中找到','用于登入的用户id,需要配置对应的 Cookie 值']} radar="1" rssbud="1" selfhost="1">

:::caution 注意

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

<Route author="TigerCubDen" example="/bilibili/followings/dynamic/109937383" path="/bilibili/followings/dynamic/:uid/:showEmoji?/:disableEmbed?" paramsDesc={['用户 id', '显示或隐藏表情图片，默认值为 0 隐藏，其他值为显示', '默认为开启内嵌视频, 任意值为关闭']} selfhost="1">

:::caution 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 用户关注视频动态 {#bilibili-yong-hu-guan-zhu-shi-pin-dong-tai}

<Route author="LogicJake" example="/bilibili/followings/video/2267573" path="/bilibili/followings/video/:uid/:disableEmbed?" paramsDesc={['用户 id', '默认为开启内嵌视频, 任意值为关闭']} selfhost="1">

:::caution 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 用户关注专栏 {#bilibili-yong-hu-guan-zhu-zhuan-lan}

<Route author="woshiluo" example="/bilibili/followings/article/99800931" path="/bilibili/followings/article/:uid" paramsDesc={['用户 id']} selfhost="1">

:::caution 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

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

### 话题 (频道 / 标签) {#bilibili-hua-ti-(-pin-dao-%2F-biao-qian-)}

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

:::caution 注意

用户追漫需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 频道排行榜 {#bilibili-pin-dao-pai-hang-bang}

<Route author="3401797899" example="/bilibili/channel/5417/hot" path="/bilibili/channel/:channelid/hot/:disableEmbed?" paramsDesc={['频道id，可在频道链接中找到', '默认为开启内嵌视频, 任意值为关闭']}/>

## Bluesky (bsky) {#bluesky-(bsky)}

### 关键词 {#bluesky-(bsky)-guan-jian-ci}

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

## Curius {#curius}

### 用户 {#curius-yong-hu}

<Route author="Ovler-Young" example="/curius/links/yuu-yuu" path="/curius/links/:name" paramsDesc={['用户名称，可在url中找到']}/>

## Dev.to {#dev.to}

### 最高职位 {#dev.to-zui-gao-zhi-wei}

<Route author="dwemerx" example="/dev.to/top/month" path="/dev.to/top/:period" paramsDesc={['period']}>

| 开发到每周最高 | 开发至每月最高 | 开发年度最高 | 开发到有史以来最高职位 |
| -------------- | -------------- | ------------ | ---------------------- |
| week           | month          | year         | infinity               |

</Route>

## Disqus {#disqus}

### 评论 {#disqus-ping-lun}

<Route author="DIYgod" example="/disqus/posts/diygod-me" path="/disqus/posts/:forum" paramsDesc={['网站的 disqus name']}/>

## Facebook {#facebook}

### 粉絲專頁 {#facebook-fen-si-zhuan-ye}

<Route author="maple3142" example="/facebook/page/SonetPCR" path="/facebook/page/:id" paramsDesc={['專頁 id']} anticrawler="1"/>

## Fur Affinity {#fur-affinity}

### 主页 {#fur-affinity-zhu-ye}

<Route author="TigerCubDen" example="/furaffinity/home" path="/furaffinity/home/:type?/:nsfw?" paramsDesc={['类型，默认为 `artwork`', 'NSFW开关, 当值为 `1` 时不过滤NSFW内容']} radar="1">

类型 type

| 艺术品  | 手工   | 音乐  | 写作    |
| ------- | ------ | ----- | ------- |
| artwork | crafts | music | writing |

</Route>

### 浏览 {#fur-affinity-liu-lan}

<Route author="TigerCubDen" example="/furaffinity/browse" path="/furaffinity/browse/:nsfw?" paramsDesc={['NSFW开关, 当值为 `1` 时不过滤NSFW内容']} radar="1"/>

### 站点状态 {#fur-affinity-zhan-dian-zhuang-tai}

<Route author="TigerCubDen" example="/furaffinity/status" path="/furaffinity/status" radar="1"/>

### 搜索 {#fur-affinity-sou-suo}

<Route author="TigerCubDen" example="/furaffinity/search/tiger" path="/furaffinity/search/:keyword/:nsfw?" paramsDesc={['搜索关键词，仅限英文搜索', 'NSFW开关, 当值为 `1` 时不过滤NSFW内容']} radar="1"/>

### 用户主页简介 {#fur-affinity-yong-hu-zhu-ye-jian-jie}

<Route author="TigerCubDen" example="/furaffinity/user/tiger-jungle" path="/furaffinity/user/:username" paramsDesc={['用户名, 可在用户主页的链接处找到']} radar="1"/>

### 用户关注列表 {#fur-affinity-yong-hu-guan-zhu-lie-biao}

<Route author="TigerCubDen" example="/furaffinity/watching/okami9312" path="/furaffinity/watching/:username" paramsDesc={['用户名, 可在用户主页的链接处找到']} radar="1"/>

### 用户被关注列表 {#fur-affinity-yong-hu-bei-guan-zhu-lie-biao}

<Route author="TigerCubDen" example="/furaffinity/watchers/malikshadowclaw" path="/furaffinity/watchers/:username" paramsDesc={['用户名, 可在用户主页的链接处找到']} radar="1"/>

### 用户接受委托信息 {#fur-affinity-yong-hu-jie-shou-wei-tuo-xin-xi}

<Route author="TigerCubDen" example="/furaffinity/commissions/flashlioness" path="/furaffinity/commissions/:username" paramsDesc={['用户名, 可在用户主页的链接处找到']} radar="1"/>

### 用户的 Shouts 留言 {#fur-affinity-yong-hu-de-shouts-liu-yan}

<Route author="TigerCubDen" example="/furaffinity/shouts/redodgft" path="/furaffinity/shouts/:username" paramsDesc={['用户名, 可在用户主页的链接处找到']} radar="1"/>

### 用户的日记 {#fur-affinity-yong-hu-de-ri-ji}

<Route author="TigerCubDen" example="/furaffinity/journals/rukis" path="/furaffinity/journals/:username" paramsDesc={['用户名, 可在用户主页的链接处找到']} radar="1"/>

### 用户的创作画廊 {#fur-affinity-yong-hu-de-chuang-zuo-hua-lang}

<Route author="TigerCubDen" example="/furaffinity/gallery/flashlioness" path="/furaffinity/gallery/:username/:nsfw?" paramsDesc={['用户名, 可在用户主页的链接处找到', 'NSFW开关，当值为 `1` 时不过滤NSFW内容']} radar="1"/>

### 用户的零碎 (非正式) 作品 {#fur-affinity-yong-hu-de-ling-sui-(-fei-zheng-shi-)-zuo-pin}

<Route author="TigerCubDen" example="/furaffinity/scraps/flashlioness" path="/furaffinity/scraps/:username/:nsfw?" paramsDesc={['用户名, 可在用户主页的链接处找到', 'NSFW开关，当值为 `1` 时不过滤NSFW内容']} radar="1"/>

### 用户的喜爱列表 {#fur-affinity-yong-hu-de-xi-ai-lie-biao}

<Route author="TigerCubDen" example="/furaffinity/favorites/tiger-jungle" path="/furaffinity/favorites/:username/:nsfw?" paramsDesc={['用户名, 可在用户主页的链接处找到', 'NSFW开关，当值为 `1` 时不过滤NSFW内容']} radar="1"/>

### 作品评论区 {#fur-affinity-zuo-pin-ping-lun-qu}

<Route author="TigerCubDen" example="/furaffinity/submission_comments/34909983" path="/furaffinity/submission_comments/:id" paramsDesc={['作品id, 可在作品所在页面对应的链接处找到']} radar="1"/>

### 日记评论区 {#fur-affinity-ri-ji-ping-lun-qu}

<Route author="TigerCubDen" example="/furaffinity/journal_comments/9750669" path="/furaffinity/journal_comments/:id" paramsDesc={['日记id, 可在日记所在页面对应的链接处找到']} radar="1"/>

## Gab {#gab}

### 用戶時間線 {#gab-yong-hu-shi-jian-xian}

<Route author="zphw" example="/gab/user/realdonaldtrump" path="/gab/user/:username" paramsDesc={['用戶名']} />

### 熱門 {#gab-re-men}

<Route author="zphw" example="/gab/popular/hot" path="/gab/popular/:sort?" paramsDesc={['排序方式, `hot` 為 Hot Posts, `top` 為 Top Posts。默認為 hot']} />

## GETTR {#gettr}

### 个人时间线 {#gettr-ge-ren-shi-jian-xian}

<Route author="TonyRL" example="/gettr/user/jasonmillerindc" path="/gettr/user/:id" paramsDesc={['用户 id']} radar="1" rssbud="1"/>

## iCity {#icity}

### 用户动态 {#icity-yong-hu-dong-tai}

<Route author="nczitzk" example="/icity/sai" path="/icity/:id" paramsDesc={['用户 id']}/>

## Instagram {#instagram}

:::caution 注意

由于 Instagram Private API 限制，必须在服务器上设置你的用户名和密码。暂不支持两步验证。步骤见[部署指南](https://docs.rsshub.app/install/)。

如需无登录的 feed，请用 [Picuki](#picuki)。

:::

### 用户 / 标签 - Private API {#instagram-yong-hu-%2F-biao-qian---private-api}

<Route author="oppilate DIYgod" example="/instagram/user/stefaniejoosten" path="/instagram/:category/:key" paramsDesc={['类别，见下表', '用户名／标签名']} radar="1" anticrawler="1" selfhost="1">

| 用户时间线 | 标签 |
| ---------- | ---- |
| user       | tags |

:::tip Tips
建议在部署时使用 Redis 缓存。
:::

</Route>

### 用户 / 标签 - Cookie {#instagram-yong-hu-%2F-biao-qian---cookie}

<Route author="TonyRL" example="/instagram/2/user/stefaniejoosten" path="/instagram/2/:category/:key" paramsDesc={['类别，见上表', '用户名／标签名']} radar="1" anticrawler="1" selfhost="1" />

## Keep {#keep}

### 运动日记 {#keep-yun-dong-ri-ji}

<Route author="Dectinc DIYgod" example="/keep/user/556b02c1ab59390afea671ea" path="/keep/user/:id" paramsDesc={['Keep 用户 id']}/>

## Lofter {#lofter}

### 用户 {#lofter-yong-hu}

<Route author="hondajojo nczitzk" example="/lofter/user/i" path="/lofter/user/:name?" paramsDesc={['Lofter 用户名, 可以在用户页 URL 中找到']}/>

### 话题 (标签) {#lofter-hua-ti-(-biao-qian-)}

<Route author="hoilc nczitzk" example="/lofter/tag/摄影/date" path="/lofter/tag/:name?/:type?" paramsDesc={['话题(标签)名 例如 `名侦探柯南`，默认为 `摄影`', '排行类型, 见下表，默认显示最新']}>

| new  | date | week | month | total |
| ---- | ---- | ---- | ----- | ----- |
| 最新 | 日榜 | 周榜 | 月榜  | 总榜  |

</Route>

## Mastodon {#mastodon}

:::tip 提示

通常来说，各实例提供用户时间线的订阅源，如下：

-   RSS: `https://**:instance**/users/**:username**.rss`
-   Atom: ~~`https://**:instance**/users/**:username**.atom`~~ (仅 pawoo.net)

例如：<https://pawoo.net/users/pawoo_support.rss> 或 <https://pawoo.net/users/pawoo_support.atom>

上述订阅源的内容不包括用户的转嘟。RSSHub 提供基于 Mastodon API 的订阅源，但可能需要您在某个 Mastodon 实例申请 API，并对 RSSHub 实例进行配置。详情见部署页面的[配置模块](/install#部分-rss-模块配置)。

:::

### 用户公共时间线 {#mastodon-yong-hu-gong-gong-shi-jian-xian}

<Route author="notofoe" example="/mastodon/acct/CatWhitney@mastodon.social/statuses" path="/mastodon/acct/:acct/statuses/:only_media?" paramsDesc={['Webfinger account URI, 形如 `user@host`', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']}/>

自 Mastodon v4.0.0 起，本路由中对于 `search` API 的使用不再需要访问令牌。
如果你的 Webfinger account URI 域和实例的 API 服务器域名是一样的（即没有一些其他协议称呼的 deletation），那么此路由不需要额外配置且开箱即用。
不过，你依然可以提供这些路由特定的配置来覆盖它们。

### 实例公共时间线（本站） {#mastodon-shi-li-gong-gong-shi-jian-xian-%EF%BC%88-ben-zhan-%EF%BC%89}

<Route author="hoilc" example="/mastodon/timeline/pawoo.net/true" path="/mastodon/timeline/:site/:only_media?" paramsDesc={['实例地址, 仅域名, 不包括`http://`或`https://`协议头', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']}/>

实例地址不为 `mastodon.social` 或 `pawoo.net` 的情况下均需要 `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` 为 `true`。

### 实例公共时间线（跨站） {#mastodon-shi-li-gong-gong-shi-jian-xian-%EF%BC%88-kua-zhan-%EF%BC%89}

<Route author="hoilc" example="/mastodon/remote/pawoo.net/true" path="/mastodon/remote/:site/:only_media?" paramsDesc={['实例地址, 仅域名, 不包括`http://`或`https://`协议头', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']}/>

实例地址不为 `mastodon.social` 或 `pawoo.net` 的情况下均需要 `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` 为 `true`。

### 用户公共时间线（备用） {#mastodon-yong-hu-gong-gong-shi-jian-xian-%EF%BC%88-bei-yong-%EF%BC%89}

<Route author="notofoe" example="/mastodon/account_id/mastodon.social/23634/statuses/only_media" path="/mastodon/account/:site/:account_id/statuses/:only_media?" paramsDesc={['实例地址, 仅域名, 不包括`http://`或`https://`协议头', '用户 ID. 登录实例后, 搜索用户并进入用户页, 在地址中可以找到这串数字', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']}/>

实例地址不为 `mastodon.social` 或 `pawoo.net` 的情况下均需要 `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` 为 `true`。

## Misskey {#misskey}

### 精选笔记 {#misskey-jing-xuan-bi-ji}

<Route author="Misaka13514" example="/misskey/notes/featured/misskey.io" path="/misskey/notes/featured/:site" paramsDesc={['实例地址, 仅域名, 不包括`http://`或`https://`协议头']} radar="1" rssbud="1"/>

## piapro {#piapro}

### 用户最新作品 {#piapro-yong-hu-zui-xin-zuo-pin}

<Route author="hoilc" example="/piapro/user/shine_longer" path="/piapro/user/:pid" paramsDesc={['用户 ID, 可在 URL 中找到']}/>

### 全站最新作品 {#piapro-quan-zhan-zui-xin-zuo-pin}

<Route author="hoilc" example="/piapro/public/music/miku/2" path="/piapro/public/:type/:tag?/:category?" paramsDesc={['作品类别, 可选`music`,`illust`,`text`','标签, 即 URL 中`tag`参数','分类 ID, 即 URL 中 `categoryId` 参数']}/>

## Picuki {#picuki}

### 用户 {#picuki-yong-hu}

<Route author="hoilc Rongronggg9" example="/picuki/profile/stefaniejoosten" path="/picuki/profile/:id/:functionalFlag?" paramsDesc={['Instagram 用户 id','功能标记，见下表']} radar="1" rssbud="1">

| functionalFlag | 嵌入视频                 | 获取 Instagram Stories |
| -------------- | ------------------------ | ---------------------- |
| 0              | 关，只用图片显示视频封面 | 关                     |
| 1 (默认)       | 开                       | 关                     |
| 10             | 开                       | 开                     |

:::caution 注意

Instagram Stories 没有可靠的 guid，你的 RSS 阅读器可能将同一条 Story 显示多于一次。
尽管如此，每个 Story 都会在 24 小时后过期，所以问题也许没那么严重。

:::

</Route>

## pixiv {#pixiv}

### 用户收藏 {#pixiv-yong-hu-shou-cang}

<Route author="EYHN" example="/pixiv/user/bookmarks/15288095" path="/pixiv/user/bookmarks/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']} radar="1" rssbud="1"/>

### 用户动态 {#pixiv-yong-hu-dong-tai}

<Route author="DIYgod" example="/pixiv/user/11" path="/pixiv/user/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']} radar="1" rssbud="1"/>

### 用户小说 {#pixiv-yong-hu-xiao-shuo}

<Route author="TonyRL" example="/pixiv/user/novels/27104704" path="/pixiv/user/novels/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']} radar="1" rssbud="1"/>

### 排行榜 {#pixiv-pai-hang-bang}

<Route author="EYHN" example="/pixiv/ranking/week" path="/pixiv/ranking/:mode/:date?" paramsDesc={['排行榜类型' ,'日期, 取值形如 `2018-4-25`']} radar="1" rssbud="1">

| 日排行 | 周排行 | 月排行 | 受男性欢迎排行 | 受女性欢迎排行 | AI 生成作品排行榜 | 原创作品排行  | 新人排行    |
| ------ | ------ | ------ | -------------- | -------------- | ----------------- | ------------- | ----------- |
| day    | week   | month  | day_male       | day_female     | day_ai            | week_original | week_rookie |

| pixiv R-18 日排行 | R-18 AI 生成作品排行 | R-18 受男性欢迎排行 | R-18 受女性欢迎排行 | R-18 周排行 | R-18G 排行 |
| ----------------- | -------------------- | ------------------- | ------------------- | ----------- | ---------- |
| day_r18           | day_r18_ai           | day_male_r18        | day_female_r18      | week_r18    | week_r18g  |

</Route>

### 关键词 {#pixiv-guan-jian-ci}

<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" paramsDesc={['关键词', '排序方式，popular 按热门度排序，空或其他任意值按时间排序', '过滤方式']} radar="1" rssbud="1">

| 只看非 R18 内容 | 只看 R18 内容 | 不过滤         |
| --------------- | ------------- | -------------- |
| safe            | r18           | 空或其他任意值 |

</Route>

### 关注的新作品 {#pixiv-guan-zhu-de-xin-zuo-pin}

<Route author="ClarkeCheng" example="/pixiv/user/illustfollows" path="/pixiv/user/illustfollows" radar="1" rssbud="1" selfhost="1">

:::caution 注意

因为每个人关注的画师不同，所以只能自建。请不要将画师设为 “悄悄关注”，这样子画师的作品就不会出现在订阅里了。

:::

</Route>

## pixivFANBOX {#pixivfanbox}

### User {#pixivfanbox-user}

<Route author="sgqy" example="/fanbox/otomeoto" path="/fanbox/:user?" paramsDesc={['用户名，可在用户主页 URL 中找到，默认为官方资讯']}/>

## Plurk {#plurk}

### 話題 {#plurk-hua-ti}

<Route author="TonyRL" path="/plurk/topic/:topic" example="/plurk/topic/standwithukraine" paramsDesc={['話題 ID，可在 URL 找到']} radar="1" rssbud="1"/>

### 話題排行榜 {#plurk-hua-ti-pai-hang-bang}

<Route author="TonyRL" path="/plurk/top/:category?/:lang?" example="/plurk/top/topReplurks" paramsDesc={['排行榜分類，見下表，默認為 `topReplurks`', '語言，見下表，默認為 `en`']} radar="1" rssbud="1">

| 最多人轉噗  | 最多人喜歡   | 最多人回應   |
| ----------- | ------------ | ------------ |
| topReplurks | topFavorites | topResponded |

| English | 中文（繁體） |
| ------- | ------------ |
| en      | zh           |

</Route>

### 偷偷說 {#plurk-tou-tou-shuo}

<Route author="TonyRL" path="/plurk/anonymous" example="/plurk/anonymous" radar="1" rssbud="1"/>

### 搜尋 {#plurk-sou-xun}

<Route author="TonyRL" path="/plurk/search/:keyword" example="/plurk/search/FGO" paramsDesc={['關鍵詞']} radar="1" rssbud="1"/>

### 最近分享 {#plurk-zui-jin-fen-xiang}

<Route author="TonyRL" path="/plurk/hotlinks" example="/plurk/hotlinks" radar="1" rssbud="1"/>

### 噗浪消息 {#plurk-pu-lang-xiao-xi}

<Route author="TonyRL" path="/plurk/news/:lang?" example="/plurk/news/zh" paramsDesc={['語言，見上表，默認為 `en`']} radar="1" rssbud="1"/>

### 用戶 {#plurk-yong-hu}

<Route author="TonyRL" path="/plurk/user/:user" example="/plurk/user/plurkoffice" paramsDesc={['用戶 ID，可在 URL 找到']} radar="1" rssbud="1"/>

## Popi 提问箱 {#popi-ti-wen-xiang}

### 提问箱新回答 {#popi-ti-wen-xiang-ti-wen-xiang-xin-hui-da}

<Route author="AgFlore" example="/popiask/popi6666" path="/popiask/:sharecode/:pagesize?" paramsDesc={['提问箱 ID', '查看条数（默认为 20）']} radar="1" rssbud="1"/>

## Soul {#soul}

### 瞬间更新 {#soul-shun-jian-geng-xin}

<Route author="ImSingee" example="/soul/Y2w2aTNWQVBLOU09" path="/soul/:id" paramsDesc={['用户 id, 分享用户主页时的 URL 的 userIdEcpt 参数']} radar="1" rssbud="1"></Route>

### 热门瞬间 {#soul-re-men-shun-jian}

<Route author="BugWriter2" example="/soul/posts/hot/NXJiSlM5V21kamJWVlgvZUh1NEExdz09" path="/soul/posts/hot/:pid*" paramsDesc={['瞬间 id, 分享用户瞬间时的 URL 的 postIdEcpt 参数']}/>

:::tip 提示

提供不同内容的 `pid`, 可以得到不同的热门瞬间推荐，如果想看多个种类的热门可以用 `/` 把不同的 `pid` 连起来，例如: `NXJiSlM5V21kamJWVlgvZUh1NEExdz09/MkM0amxSTUNiTEpLcHhzSlRzTEI1dz09`

:::

## Tape 小纸条 {#tape-xiao-zhi-tiao}

### 提问箱新回答 {#tape-xiao-zhi-tiao-ti-wen-xiang-xin-hui-da}

<Route author="AgFlore" example="/tapechat/questionbox/TOAH7BBH" path="/tapechat/questionbox/:sharecode/:pagesize?" paramsDesc={['提问箱 ID', '查看条数（默认为 20）']} />

## Telegram {#telegram}

### 频道 {#telegram-pin-dao}

<Route author="DIYgod Rongronggg9" example="/telegram/channel/awesomeDIYgod/searchQuery=%23DIYgod的豆瓣动态" path="/telegram/channel/:username/:routeParams?" paramsDesc={['频道 username', '额外参数，请参阅下面的表格']} radar="1" rssbud="1">

| 键                    | 含义                                           | 接受的值                                     | 默认值     |
| --------------------- | ---------------------------------------------- | -------------------------------------------- | ---------- |
| showLinkPreview       | 是否显示 Telegram 的链接预览                   | 0/1/true/false                               | true       |
| showViaBot            | 对于经 bot 发出的消息，是否显示该 bot          | 0/1/true/false                               | true       |
| showReplyTo           | 对于回复消息，是否显示回复的目标               | 0/1/true/false                               | true       |
| showFwdFrom           | 对于转发消息，是否显示消息的转发来源           | 0/1/true/false                               | true       |
| showFwdFromAuthor     | 对于转发消息，是否显示消息的转发来源的原始作者 | 0/1/true/false                               | true       |
| showInlineButtons     | 是否显示消息的按钮                             | 0/1/true/false                               | false      |
| showMediaTagInTitle   | 是否在标题中显示媒体标签                       | 0/1/true/false                               | true       |
| showMediaTagAsEmoji   | 将媒体标签显示为 emoji                         | 0/1/true/false                               | true       |
| includeFwd            | 包含转发消息                                   | 0/1/true/false                               | true       |
| includeReply          | 包含回复消息                                   | 0/1/true/false                               | true       |
| includeServiceMsg     | 包含服务消息 (如：置顶了消息，更换了头像)      | 0/1/true/false                               | true       |
| includeUnsupportedMsg | 包含 t.me 不支持的消息                         | 0/1/true/false                               | false      |
| searchQuery           | 搜索关键词                                     | 关键词；如需搜索 hashtag 请用 `%23` 替代 `#` | (禁用搜索) |

指定更多与默认值不同的参数选项可以满足不同的需求，如

    https://rsshub.app/telegram/channel/NewlearnerChannel/showLinkPreview=0&showViaBot=0&showReplyTo=0&showFwdFrom=0&showFwdFromAuthor=0&showInlineButtons=0&showMediaTagInTitle=1&showMediaTagAsEmoji=1&includeFwd=0&includeReply=1&includeServiceMsg=0&includeUnsupportedMsg=0

会生成一个没有任何链接预览和烦人的元数据，在标题中显示 emoji 媒体标签，不含转发消息（但含有回复消息），也不含你不关心的消息（服务消息和不支持的消息）的 RSS，适合喜欢纯净订阅的人。

:::tip 提示

为向后兼容，不合法的 `routeParams` 会被视作 `searchQuery` 。

由于 Telegram 限制，部分涉及色情、版权、政治的频道无法订阅，可通过访问 <https://t.me/s/:username> 确认。

:::

</Route>

### 贴纸包 {#telegram-tie-zhi-bao}

<Route author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" paramsDesc={['贴纸包 id, 可在分享贴纸获得的 URL 中找到']}/>

### Telegram Blog {#telegram-telegram-blog}

<Route author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## Twitter {#twitter}

:::caution 注意

由于 Twitter 的限制，部分路由目前仅支持 7 天内推文检索。

部分路由的实现依赖 Twitter Developer API，需要特别配置以启用。\
`/twitter/user` 及 `/twitter/keyword` 两个路由除 Developer API 外，尚有不需特别配置以启用的 Web API 实现。默认情况下，Developer API 优先级更高，只有当其未配置或出错时才会使用 Web API。然而，两个 API 在某些方面存在不同特性，如，`excludeReplies` 在 Developer API 中会将推文串（[Thread](https://blog.twitter.com/official/en_us/topics/product/2017/nicethreads.html)，回复自己推文的推文）视作回复一并排除，而在 Web API 中则不会。如有需要在 `/twitter/user` 中排除回复但包含推文串，请启用 `forceWebApi`。

:::

对于推文内容，在 `routeParams` 参数中以 query string 格式指定选项，可以控制额外的功能

| 键                             | 含义                                                                                           | 接受的值               | 默认值                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------- |
| `readable`                     | 是否开启细节排版可读性优化                                                                     | `0`/`1`/`true`/`false` | `false`                                     |
| `authorNameBold`               | 是否加粗作者名字                                                                               | `0`/`1`/`true`/`false` | `false`                                     |
| `showAuthorInTitle`            | 是否在标题处显示作者                                                                           | `0`/`1`/`true`/`false` | `false` (`/twitter/followings` 中为 `true`) |
| `showAuthorInDesc`             | 是否在正文处显示作者                                                                           | `0`/`1`/`true`/`false` | `false` (`/twitter/followings` 中为 `true`) |
| `showQuotedAuthorAvatarInDesc` | 是否在正文处显示被转推的推文的作者头像（若阅读器会提取正文图片，不建议开启）                   | `0`/`1`/`true`/`false` | `false`                                     |
| `showAuthorAvatarInDesc`       | 是否在正文处显示作者头像（若阅读器会提取正文图片，不建议开启）                                 | `0`/`1`/`true`/`false` | `false`                                     |
| `showEmojiForRetweetAndReply`  | 显示 “🔁” 取代 “Rt”、“↩️” 取代 “Re”                                                            | `0`/`1`/`true`/`false` | `false`                                     |
| `showSymbolForRetweetAndReply` | 显示 “RT” 取代 “”、“ Re ” 取代 “”                                                              | `0`/`1`/`true`/`false` | `true`                                      |
| `showRetweetTextInTitle`       | 在标题处显示转推评论（置为 `false` 则在标题只显示被转推推文）                                  | `0`/`1`/`true`/`false` | `true`                                      |
| `addLinkForPics`               | 为图片添加可点击的链接                                                                         | `0`/`1`/`true`/`false` | `false`                                     |
| `showTimestampInDescription`   | 在正文处显示推特的时间戳                                                                       | `0`/`1`/`true`/`false` | `false`                                     |
| `showQuotedInTitle`            | 在标题处显示被引用的推文                                                                       | `0`/`1`/`true`/`false` | `false`                                     |
| `widthOfPics`                  | 推文配图宽（生效取决于阅读器）                                                                 | 不指定 / 数字          | 不指定                                      |
| `heightOfPics`                 | 推文配图高（生效取决于阅读器）                                                                 | 不指定 / 数字          | 不指定                                      |
| `sizeOfAuthorAvatar`           | 作者头像大小                                                                                   | 数字                   | `48`                                        |
| `sizeOfQuotedAuthorAvatar`     | 被转推推文作者头像大小                                                                         | 数字                   | `24`                                        |
| `excludeReplies`               | 排除回复，只在 `/twitter/user` 中有效                                                          | `0`/`1`/`true`/`false` | `false`                                     |
| `includeRts`                   | 包括转推，只在 `/twitter/user` 中有效                                                          | `0`/`1`/`true`/`false` | `true`                                      |
| `forceWebApi`                  | 强制使用 Web API，即使 Developer API 已配置，只在 `/twitter/user` 和 `/twitter/keyword` 中有效 | `0`/`1`/`true`/`false` | `false`                                     |
| `count`                        | 传递给 Twitter API 的 `count` 参数，只在 `/twitter/user` 中有效                                | 不指定 / 数字          | 不指定                                      |

指定更多与默认值不同的参数选项可以改善 RSS 的可读性，如

    https://rsshub.app/twitter/user/durov/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweetAndReply=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showQuotedInTitle=1&heightOfPics=150

的效果为

<img src="/img/readable-twitter.png" alt="Durov 的可读推特 RSS" />

### 用户时间线 {#twitter-yong-hu-shi-jian-xian}

<Route author="DIYgod yindaheng98 Rongronggg9" example="/twitter/user/DIYgod" path="/twitter/user/:id/:routeParams?" paramsDesc={['用户名；特别地，以 `+` 开头则代表[唯一 ID](https://github.com/DIYgod/RSSHub/issues/12221)，如 `+44196397`', '额外参数；请参阅上面的说明和表格；特别地，当 `routeParams=exclude_replies`时去除回复，`routeParams=exclude_rts`去除转推，`routeParams=exclude_rts_replies`去除回复和转推，默认包含全部回复和转推。']} radar="1" rssbud="1"/>

### 用户媒体时间线 {#twitter-yong-hu-mei-ti-shi-jian-xian}

<Route author="yindaheng98 Rongronggg9" example="/twitter/media/DIYgod" path="/twitter/media/:id/:routeParams?" paramsDesc={['用户名；特别地，以 `+` 开头则代表[唯一 ID](https://github.com/DIYgod/RSSHub/issues/12221)，如 `+44196397`', '额外参数；请参阅上面的说明和表格。']} radar="1" rssbud="1"/>

### 用户关注时间线 {#twitter-yong-hu-guan-zhu-shi-jian-xian}

<Route author="DIYgod" example="/twitter/followings/DIYgod" path="/twitter/followings/:id/:routeParams?" paramsDesc={['用户名', '额外参数；请参阅上面的说明和表格']} radar="1" rssbud="1" selfhost="1">

:::caution 注意

用户关注时间线需要对应用户的 Twitter token， 所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 列表时间线 {#twitter-lie-biao-shi-jian-xian}

<Route author="xyqfer" example="/twitter/list/ladyleet/Javascript" path="/twitter/list/:id/:name/:routeParams?" paramsDesc={['用户名', 'list 名称', '额外参数；请参阅上面的说明和表格']} radar="1" rssbud="1"/>

### 用户喜欢列表 {#twitter-yong-hu-xi-huan-lie-biao}

<Route author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id/:routeParams?" paramsDesc={['用户名', '额外参数；请参阅上面的说明和表格']} radar="1" rssbud="1"/>

### 关键词 {#twitter-guan-jian-ci}

<Route author="DIYgod yindaheng98 Rongronggg9" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword/:routeParams?" paramsDesc={['关键词', '额外参数；请参阅上面的说明和表格']} radar="1" rssbud="1"/>

### Trends {#twitter-trends}

<Route author="sakamossan" example="/twitter/trends/23424856" path="/twitter/trends/:woeid?" paramsDesc={['Where On Earth ID. 默认 `1` (World Wide)']} radar="1" rssbud="1"/>

### 推文收集 {#twitter-tui-wen-shou-ji}

<Route author="TonyRL" example="/twitter/collection/DIYgod/1527857429467172864" path="/twitter/collection/:uid/:collectionId/:routeParams?" paramsDesc={['用户名，需与生成的 Twitter token 对应', '推文收集 ID，可从 URL 获得', '额外参数；请参阅上面的说明和表格']} radar="1" rssbud="1" selfhost="1">

:::caution 注意

推文收集需要用户的 Twitter token，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 推文详情 {#twitter-tui-wen-xiang-qing}

<Route author="LarchLiu Rongronggg9" example="/twitter/tweet/DIYgod/status/1650844643997646852" path="/twitter/tweet/:id/status/:status/:original?" paramsDesc={['用户名；特别地，以 `+` 开头则代表[唯一 ID](https://github.com/DIYgod/RSSHub/issues/12221)，如 `+44196397`', '推文 ID', '额外参数；返回数据类型，当非 `0`/`false` 且 `config.isPackage` 为 `true`时，返回 twitter 原始数据']} radar="1" rssbud="1"/>

## Vimeo {#vimeo}

### 用户页面 {#vimeo-yong-hu-ye-mian}

<Route author="MisteryMonster" example="/vimeo/user/filmsupply/picks" path="/vimeo/user/:username/:cat" paramsDesc={['用户名或者 uid，用户名可从地址栏获得，如 [https://vimeo.com/filmsupply](https://vimeo.com/filmsupply) 中为 `filmsupply`', '分类根据不同的用户页面获得，例子中有`Docmentary`，`Narrative`，`Drama`等。填入 `picks` 为和首页一样的推荐排序，推荐排序下没有发布时间信息']} radar="1">

:::tip 请注意带有斜杠的的标签名

如果分类名带有斜杠符号的如 `3D/CG` 时，必须把斜杠`/`转成 `|`

:::

</Route>

### 频道页面 {#vimeo-pin-dao-ye-mian}

<Route author="MisteryMonster" example="/vimeo/channel/bestoftheyear" path="/vimeo/channel/:channel" paramsDesc={['channel 名可从 url 获得,如 [https://vimeo.com/channels/bestoftheyear/videos](https://vimeo.com/channels/bestoftheyear/videos) 中的 `bestoftheyear`']} radar="1">

</Route>

### 分类页面 {#vimeo-fen-lei-ye-mian}

<Route author="MisteryMonster" example="/vimeo/category/documentary/staffpicks" path="/vimeo/category/:category/:staffpicks?" paramsDesc={['主分类名可从 url 获得，如 [https://vimeo.com/categories/documentary/videos](https://vimeo.com/categories/documentary/videos) 中的 `documentary`', '填入 `staffpicks` 则按 staffpicks 排序']} radar="1">

</Route>

## VueVlog {#vuevlog}

### 用户 {#vuevlog-yong-hu}

<Route author="kt286" example="/vuevideo/971924215514" path="/vuevideo/:userid" paramsDesc={['用户ID, 可在对应页面的 URL 中找到']}/>

## YouTube {#youtube}

:::tip Tiny Tiny RSS 用户请注意

Tiny Tiny RSS 会给所有 iframe 元素添加 `sandbox="allow-scripts"` 属性，导致无法加载 YouTube 内嵌视频，如果需要使用内嵌视频请为 Tiny Tiny RSS 安装 [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) 插件

:::

### 用户 {#youtube-yong-hu}

<Route author="DIYgod" example="/youtube/user/JFlaMusic/" path="/youtube/user/:username/:disableEmbed?" paramsDesc={['用户名', '默认为开启内嵌视频, 任意值为关闭']} radar="1" rssbud="1"/>

### 频道 {#youtube-pin-dao}

:::tip 提示

YouTube 官方亦有提供频道 RSS，形如 <https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ>。

:::

<Route author="DIYgod" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" path="/youtube/channel/:id/:disableEmbed?" paramsDesc={['频道 id', '默认为开启内嵌视频，任意值为关闭']} radar="1" rssbud="1"/>

### 自定义网址 {#youtube-zi-ding-yi-wang-zhi}

<Route author="TonyRL" path="/youtube/c/:id/:embed?" example="/youtube/c/YouTubeCreators" paramsDesc={['YouTube 自定义网址', '默认为开启内嵌视频，任意值为关闭']} radar="1" rssbud="1"/>

### 播放列表 {#youtube-bo-fang-lie-biao}

<Route author="HenryQW" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" path="/youtube/playlist/:id/:disableEmbed?" paramsDesc={['播放列表 id', '默认为开启内嵌视频，任意值为关闭']} radar="1" rssbud="1"/>

### 社群 {#youtube-she-qun}

<Route author="TonyRL" path="/youtube/community/:handle" example="/youtube/community/@JFlaMusic" paramsDesc={['YouTube 帐号代码或频道 id']} radar="1" rssbud="1"/>

### 订阅列表 {#youtube-ding-yue-lie-biao}

<Route author="TonyRL" path="/youtube/subscriptions/:embed?" example="/youtube/subscriptions" paramsDesc={['默认为开启内嵌视频，任意值为关闭']} selfhost="1" radar="1" rssbud="1"/>

### 音乐排行榜 {#youtube-yin-yue-pai-hang-bang}

<Route author="TonyRL" path="/youtube/charts/:category?/:country?/:embed?" example="/youtube/charts" paramsDesc={['排行榜，见下表，默认为 `TopVideos`', '国家代码，见下表，默认为全球', '默认为开启内嵌视频，任意值为关闭']} radar="1" rssbud="1">

:::note 排行榜

| 热门音乐人 | 热门歌曲 | 热门音乐视频 | 时下流行       |
| ---------- | -------- | ------------ | -------------- |
| TopArtists | TopSongs | TopVideos    | TrendingVideos |

:::

:::note 国家代码

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

:::

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

:::caution 注意

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

:::tip 提示

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

:::caution 注意
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

### 圈子 - 纯文字 {#ji-ke-quan-zi---chun-wen-zi}

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

### 闲置（分类） {#shu-zi-wei-ba-xian-zhi-%EF%BC%88-fen-lei-%EF%BC%89}

<Route author="xyqfer hoilc" example="/dgtle/trade/111" path="/dgtle/trade/:typeId?" paramsDesc={['分类 id，默认为全部']}>

| 全部 | 电脑 | 手机 | 平板 | 相机 | 影音 | 外设 | 生活 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 111  | 109  | 110  | 113  | 114  | 115  | 112  | 116  |

</Route>

### 闲置（关键词） {#shu-zi-wei-ba-xian-zhi-%EF%BC%88-guan-jian-ci-%EF%BC%89}

<Route author="gaoliang hoilc" example="/dgtle/trade/search/ipad" path="/dgtle/trade/search/:keyword" paramsDesc={['搜索关键词']}/>

### 鲸图（分类） {#shu-zi-wei-ba-jing-tu-%EF%BC%88-fen-lei-%EF%BC%89}

<Route author="Erriy" example="/dgtle/whale/category/0" path="/dgtle/whale/category/:category" paramsDesc={['分类 id']}>

| 精选 | 人物 | 静物 | 二次元 | 黑白 | 自然 | 美食 | 电影与游戏 | 科技与艺术 | 城市与建筑 | 萌物 | 美女 |
| ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---------- | ---------- | ---------- | ---- | ---- |
| 0    | 1    | 2    | 3      | 4    | 5    | 6    | 7          | 8          | 9          | 10   | 11   |

</Route>

### 鲸图（排行榜） {#shu-zi-wei-ba-jing-tu-%EF%BC%88-pai-hang-bang-%EF%BC%89}

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

### 最新（无中间页） {#shua-ping-zui-xin-%EF%BC%88-wu-zhong-jian-ye-%EF%BC%89}

<Route author="xyqfer yefoenix" example="/weseepro/newest-direct" path="/weseepro/newest-direct"/>

### 朋友圈 {#shua-ping-peng-you-quan}

<Route author="xyqfer" example="/weseepro/circle" path="/weseepro/circle"/>

## 微博 {#wei-bo}

:::caution 注意

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

:::caution 注意

需要对应用户打开页面进行授权生成 token 才能生成内容

自部署需要申请并配置微博 key，具体见部署文档

:::

</Route>

### 自定义分组 {#wei-bo-zi-ding-yi-fen-zu}

<Route author="monologconnor Rongronggg9" example="/weibo/group/4541216424989965/微博分组/:routeParams?" path="/weibo/group/:gid/:gname?/:routeParams?" paramsDesc={['分组id, 在网页版分组地址栏末尾`?gid=`处获取', '分组显示名称; 默认为: `微博分组`', '额外参数；请参阅上面的说明和表格']} anticrawler="1" selfhost="1">

:::caution 注意

由于微博官方未提供自定义分组相关 api, 此方案必须使用用户`Cookie`进行抓取

因微博 cookies 的过期与更新方案未经验证，部署一次 Cookie 的有效时长未知

微博用户 Cookie 的配置可参照部署文档

:::

</Route>

## 微博绿洲 {#wei-bo-l%C3%BC-zhou}

### 用户 {#wei-bo-l%C3%BC-zhou-yong-hu}

<Route author="kt286" example="/weibo/oasis/user/1990895721" path="/weibo/oasis/user/:userid" paramsDesc={['用户 id, 可在用户主页 URL 中找到']} anticrawler="1"/>

## 悟空问答 {#wu-kong-wen-da}

### 用户动态 {#wu-kong-wen-da-yong-hu-dong-tai}

<Route author="nczitzk" example="/wukong/user/5826687196" path="/wukong/user/:id/:type?" paramsDesc={['用户ID，可在用户页 URL 中找到', '类型，可选 `dongtai` 即 动态，`answers` 即 回答，`questions` 即 提问，默认为 `dongtai`']}>

:::tip 注意

用户的动态是一定时间范围内用户提出的问题和作出的回答，距离现在时间较久的问题和回答不会出现，此时选择 `dongtai` 用户动态是会缺失的。

同理选择 `answers` 和 `questions` 作为参数时，对于没有提出过问题和作出过回答的用户，其内容也会相应缺失。

:::

</Route>

## 小红书 {#xiao-hong-shu}

### 用户笔记 {#xiao-hong-shu-yong-hu-bi-ji}

<Route author="lotosbin" example="/xiaohongshu/user/593032945e87e77791e03696/notes" path="/xiaohongshu/user/:user_id/notes/:fulltext?" paramsDesc={['用户 ID', '若为`fulltext`将抓取笔记全文，若为空则只抓取笔记标题']} puppeteer="1" anticrawler="1" radar="1" rssbud="1"/>

:::tip 提示
笔记全文不支持显示视频
:::

### 用户收藏 {#xiao-hong-shu-yong-hu-shou-cang}

<Route author="lotosbin" example="/xiaohongshu/user/593032945e87e77791e03696/collect" path="/xiaohongshu/user/:user_id/collect" paramsDesc={['用户 ID']} puppeteer="1" anticrawler="1" radar="1" rssbud="1"/>

### 专辑 {#xiao-hong-shu-zhuan-ji}

<Route author="lotosbin" example="/xiaohongshu/board/5db6f79200000000020032df" path="/xiaohongshu/board/:board_id" paramsDesc={['专辑 ID']} puppeteer="1" anticrawler="1" radar="1" rssbud="1"/>

## 新榜 {#xin-bang}

:::caution 注意
部署时需要配置 NEWRANK_COOKIE，具体见部署文档
请勿过高频抓取，新榜疑似对每天调用 token 总次数进行了限制，超限会报错
:::

### 微信公众号 {#xin-bang-wei-xin-gong-zhong-hao}

<Route author="lessmoe" example="/newrank/wechat/chijiread" path="/newrank/wechat/:wxid" paramsDesc={['微信号，若微信号与新榜信息不一致，以新榜为准']} anticrawler="1" selfhost="1"/>

### 抖音短视频 {#xin-bang-dou-yin-duan-shi-pin}

<Route author="lessmoe" example="/newrank/douyin/110266463747" path="/newrank/douyin/:dyid" paramsDesc={['抖音ID，可在新榜账号详情 URL 中找到']} anticrawler="1" selfhost="1"/>

:::caution 注意
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

### 知乎日报 - 合集 {#zhi-hu-zhi-hu-ri-bao---he-ji}

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

### 知乎书店 - 新书 {#zhi-hu-zhi-hu-shu-dian---xin-shu}

<Route author="xyqfer" example="/zhihu/bookstore/newest" path="/zhihu/bookstore/newest" anticrawler="1" radar="1" rssbud="1"/>

### 知乎想法 - 24 小时新闻汇总 {#zhi-hu-zhi-hu-xiang-fa---24-xiao-shi-xin-wen-hui-zong}

<Route author="xyqfer" example="/zhihu/pin/daily" path="/zhihu/pin/daily" anticrawler="1" radar="1" rssbud="1"/>

### 知乎书店 - 知乎周刊 {#zhi-hu-zhi-hu-shu-dian---zhi-hu-zhou-kan}

<Route author="LogicJake" example="/zhihu/weekly" path="/zhihu/weekly" anticrawler="1" radar="1" rssbud="1"/>

### 用户关注时间线 {#zhi-hu-yong-hu-guan-zhu-shi-jian-xian}

<Route author="SeanChao" example="/zhihu/timeline" path="/zhihu/timeline" anticrawler="1" selfhost="1">

:::caution 注意

用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### [xhu](https://github.com/REToys/xhu) - 话题 {#zhi-hu-%5Bxhu%5D(https%3A%2F%2Fgithub.com%2Fretoys%2Fxhu)---hua-ti}

<Route author="JimenezLi" example="/zhihu/xhu/topic/19566035" path="/zhihu/xhu/topic/:topicId" paramsDesc={['话题ID']} anticrawler="1"/>