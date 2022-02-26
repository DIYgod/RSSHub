---
pageClass: routes
---

# 二次元

## 005.tv

### 二次元资讯

<Route author="junfengP" example="/005tv/zx/latest" path="/005tv/zx/latest"/>

## 18comic 禁漫天堂

### 成人 A 漫

<Route author="nczitzk" example="/18comic" path="/18comic/:category?/:time?/:order?/:keyword?" :paramsDesc="['分类，见下表，默认为 `all` 即全部', '时间范围，见下表，默认为 `a` 即全部', '排列顺序，见下表，默认为 `mr` 即最新', '关键字，见下表，默认为空']">

分类

| 全部  | 其他漫畫    | 同人     | 韓漫     | 美漫     | 短篇    | 單本     |
| --- | ------- | ------ | ------ | ------ | ----- | ------ |
| all | another | doujin | hanman | meiman | short | single |

时间范围

| 全部 | 今天 | 这周 | 本月 |
| -- | -- | -- | -- |
| a  | t  | w  | m  |

排列顺序

| 最新 | 最多点阅 | 最多图片 | 最爱 |
| -- | ---- | ---- | -- |
| mr | mv   | mp   | tf |

关键字（供参考）

| YAOI | 女性向 | NTR | 非 H | 3D | 獵奇 |
| ---- | --- | --- | --- | -- | -- |

</Route>

### 搜索

<Route author="nczitzk" example="/18comic/search/photos/all/NTR" path="/18comic/search/:option?/:category?:keyword?/:time?/:order?" :paramsDesc="['选项，可选 `video` 和 `photos`，默认为 `photos`', '分类，同上表，默认为 `all` 即全部', '关键字，同上表，默认为空', '时间范围，同上表，默认为 `a` 即全部', '排列顺序，同上表，默认为 `mr` 即最新']">

::: tip 提示

关键字必须超过两个字，这是来自网站的限制。

:::

</Route>

### 专辑

<Route author="nczitzk" example="/18comic/album/292282" path="/18comic/album/:id" :paramsDesc="['专辑 id，可在专辑页 URL 中找到']">

::: tip 提示

专辑 id 不包括 URL 中标题的部分。

:::

</Route>

### 文庫

<Route author="nczitzk" example="/18comic/blogs" path="/18comic/blogs/:category?" :paramsDesc="['分类，见下表，默认为空即全部']">

分类

| 全部 | 紳夜食堂   | 遊戲文庫    | JG GAMES | 模型山下   |
| -- | ------ | ------- | -------- | ------ |
|    | dinner | raiders | jg       | figure |

</Route>

## 1draw #深夜の真剣お絵描き 60 分一本勝負

### 投稿一览

<Route author="jackyu1996" path="/1draw/" example="/1draw/" />

## AcFun

### 番剧

<Route author="xyqfer" example="/acfun/bangumi/5022158" path="/acfun/bangumi/:id" :paramsDesc="['番剧 id']" radar="1" rssbud="1"/>

::: tip 提示

番剧 id 不包含开头的 aa。
例如：<http://www.acfun.cn/bangumi/aa5022158> 的番剧 id 是 5022158，不包括开头的 aa。

:::

### 用户投稿

<Route author="wdssmq" example="/acfun/user/video/14450522" path="/acfun/user/video/:id" :paramsDesc="['用户 UID']" radar="1" rssbud="1"/>

## AGE 动漫

### 最近更新

<Route author="nczitzk" example="/agefans/update" path="/agefans/update"/>

### 番剧详情

<Route author="s2marine" example="/agefans/detail/20200035" path="/agefans/detail/:id" :paramsDesc="['番剧 id，对应详情 URL 中找到']"/>

## Anime1

### 動畫

<Route author="maple3142" example="/anime1/anime/2018年秋季/哥布林殺手" path="/anime1/anime/:time/:name" :paramsDesc="['时间', '动画名称']" radar="1" rssbud="1">

时间和动画名称请自己从网址取得: `https://anime1.me/category/2018年秋季/刀劍神域-alicization`

</Route>

### 搜尋

<Route author="maple3142" example="/anime1/search/兔女郎學姊" path="/anime1/search/:keyword" :paramsDesc="['关键字']" radar="1" rssbud="1"/>

## Animen 动漫平台

### news

<Route author="LogicJake" example="/animen/news/zx" path="/animen/news/:type" :paramsDesc="['板块类型']">

| 最新 | 焦点 | 动画 | 漫画 | 游戏 | 小说 | 真人版 | 活动 | 音乐 | 访谈 | 其他 | 新闻稿 | 懒人包 | 公告 |
| -- | -- | -- | -- | -- | -- | --- | -- | -- | -- | -- | --- | --- | -- |
| zx | jd | dh | mh | yx | xs | zrb | hd | yy | ft | qt | xwg | lrb | gg |

</Route>

## Anitama

### Anitama Channel

<Route author="ranpox" path="/anitama/:channel?" example="/anitama" :paramsDesc="['频道id，从频道的地址栏中查看']"/>

## Bangumi

### 放送列表

<Route author="magic-akari" example="/bangumi/calendar/today" path="/bangumi/calendar/today" radar="1"/>

### 条目的章节

<Route author="SettingDust" example="/bangumi/subject/240038" path="/bangumi/subject/:id" :paramsDesc="['条目 id, 在条目页面的地址栏查看']" radar="1"/>

### 条目的吐槽箱

<Route author="ylc395" example="/bangumi/subject/214265/comments?minLength=100" path="/bangumi/subject/:id/comments" :paramsDesc="['条目 id, 在条目页面的地址栏查看. minLength: 以查询字符串（query string）的形式指定. 用于过滤掉内容长度小于指定值的吐槽']" radar="1"/>

### 条目的评论

<Route author="ylc395" example="/bangumi/subject/214265/blogs" path="/bangumi/subject/:id/blogs" :paramsDesc="['条目 id, 在条目页面的地址栏查看']" radar="1"/>

### 条目的讨论

<Route author="ylc395" example="/bangumi/subject/214265/topics" path="/bangumi/subject/:id/topics" :paramsDesc="['条目 id, 在条目页面的地址栏查看']" radar="1"/>

### 现实人物的新作品

<Route author="ylc395" example="/bangumi/person/32943" path="/bangumi/person/:id" :paramsDesc="['人物 id, 在人物页面的地址栏查看']" radar="1"/>

### 小组话题的新回复

<Route author="ylc395" example="/bangumi/topic/24657" path="/bangumi/topic/:id" :paramsDesc="['话题 id, 在话题页面地址栏查看']" radar="1"/>

### 小组话题

<Route author="SettingDust" example="/bangumi/group/boring" path="/bangumi/group/:id" :paramsDesc="['小组 id, 在小组页面地址栏查看']" radar="1"/>

### 用户日志

<Route author="nczitzk" example="/bangumi/user/blog/sai" path="/bangumi/user/blog/:id" :paramsDesc="['用户 id, 在用户页面地址栏查看']" radar="1"/>

## bilibili

见 [#bilibili](/social-media.html#bilibili)

## DLsite

### 当前日期发售的新产品

<Route author="cssxsh" example="/dlsite/new/home" path="/dlsite/new/:type" :paramsDesc="['类型，如下表']">

| 同人   | 漫画    | 软件   | 同人 (R18) | 漫画 (R18) | 美少女游戏 | 乙女    | BL |
| ---- | ----- | ---- | -------- | -------- | ----- | ----- | -- |
| home | comic | soft | maniax   | books    | pro   | girls | bl |

</Route>

### 产品打折信息

<Route author="cssxsh" example="/dlsite/campaign/home" path="/dlsite/campaign/:type/:free?" :paramsDesc="['类型，同上表', '只看免费，任意值开启，为空关闭']">
</Route>

## ebb.io

### ebb

<Route author="Tsuki" example="/ebb" path="/ebb"/>

## Eventernote

### 声优活动及演唱会

<Route author="KTachibanaM" path="/eventernote/actors/:name/:id" example="/eventernote/actors/三森すずこ/2634" :paramsDesc="['声优姓名', '声优 ID']" radar="1" rssbud="1"/>

## Hanime.tv

### 最近更新

<Route author="EsuRt" example="/hanime/video" path="/hanime/video"/>

## Hpoi 手办维基

### 情报

<Route author="sanmmm" path="/hpoi/info/:type?" example="/hpoi/info/all" :paramsDesc="['分类, 见下表, 默认为`all`']">

分类

| 全部  | 手办    | 模型    |
| --- | ----- | ----- |
| all | hobby | model |

</Route>

### 浏览周边

<Route author="howel52 DIYgod" path="/hpoi/:category/:words" example="/hpoi/charactar/1246512" :paramsDesc="['分类, 见下表', '角色/作品 ID']">

| 角色手办      | 作品手办  |
| --------- | ----- |
| charactar | works |

</Route>

### 用户动态

<Route author="luyuhuang DIYgod" path="/hpoi/user/:user_id/:caty" example="/hpoi/user/116297/buy" :paramsDesc="['用户ID', '类别, 见下表']">

| 想买   | 预定       | 已入  | 关注   | 有过     |
| ---- | -------- | --- | ---- | ------ |
| want | preorder | buy | care | resell |

</Route>

## iwara

### 用户

<Route author="Fatpandac" example="/iwara/users/kelpie/video" path="/iwara/users/:username/:type?" :paramsDesc="['用户昵称', 'type 默认为 video']" radar="1" rssbud="1">

| type |   视频  |   图片  |
| :--: | :---: | :---: |
|  参数  | video | image |

</Route>

## Kemono

### Posts

<Route author="nczitzk" example="/kemono" path="/kemono/:source?/:id?" :paramsDesc="['来源，见下表，默认为 Posts', '用户 Id，可在对应页 URL 中找到']">

Sources

| Posts | Patreon | Pixiv Fanbox | Gumroad | SubscribeStar | DLsite | Discord | Fantia |
| ----- | ------- | ------------ | ------- | ------------- | ------ | ------- | ------ |
| posts | patreon | fanbox       | gumroad | subscribestar | dlsite | discord | fantia |

::: tip 提示

当选择 `posts` 作为参数 **source** 的值时，参数 **id** 不生效。

:::

</Route>

## Mox.moe

### 首頁

<Route author="nczitzk" example="/mox" path="/mox/:category?" :paramsDesc="['分类，可在对应分类页 URL 中找到']">

::: tip 提示

在首页将分类参数选择确定后跳转到的分类页面 URL 中，`/l/` 后的字段即为分类参数。

如 [科幻 + 日語 + 日本 + 長篇 + 完結 + 最近更新](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL) 的 URL 为 [https://mox.moe/l/CAT%2A 科幻，日本，完結，lastupdate,jpn,l,BL](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)，此时 `/l/` 后的字段为 `CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`。最终获得路由为 [`/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`](https://rsshub.app/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)

:::

</Route>

## say 花火

### 文章

<Route author="junfengP" example="/sayhuahuo" path="/sayhuahuo"/>

## Vol.moe

### vol

<Route author="CoderTonyChan" example="/vol/finish" path="/vol/:mode?" :paramsDesc="['模式']">

| 连载     | 完结     |
| ------ | ------ |
| serial | finish |

</Route>

## Webtoons

### 漫画更新

<Route author="machsix" path="/webtoons/:lang/:category/:name/:id" example="/webtoons/zh-hant/drama/gongzhuweimian/894" :paramsDesc="['语言','类别','名称','ID']"/>

比如漫画公主彻夜未眠的网址为<https://www.webtoons.com/zh-hant/drama/gongzhuweimian/list?title_no=894>, 则`lang=zh-hant`,`category=drama`,`name=gongzhucheyeweimian`,`id=894`.

### [Naver](https://comic.naver.com)

<Route author="zfanta" example="/webtoons/naver/651673" path="/webtoons/naver/:titleId" :paramsDesc="['titleId']" />

## X 漫画

### 最新动态

<Route author="Ye11" example="/xmanhua" path="/xmanhua/:uid" :paramsDesc="['漫画 id,在浏览器中可见，例如鬼灭之刃对应的 id 为 `73xm`']"/>

## 包子漫画

#### 订阅漫画

<Route author="Fatpandac" example="/baozimh/comic/guowangpaiming-shiricaofu" path="/baozimh/comic/:name" :paramsDesc="['漫画名称，在漫画链接可以得到(`comic/` 后的那段)']"/>

## 嘀哩嘀哩 - dilidili

### 嘀哩嘀哩番剧更新

<Route author="SunShinenny" path="/dilidili/fanju/:id" example="/dilidili/fanju/onepunchman2" :paramsDesc="['番剧id']">

请打开对应番剧的纵览页 (非具体某集), 从 url 中最后一位查看番剧 id.(一般为英文)
除去 ' 海贼 ' 此类具有特殊页面的超长番剧，绝大多数页面都可以解析.
最适合用来追新番

</Route>

## 電撃オンライン

### 最新記事

<Route author="cssxsh" path="/dengekionline/:type?" example="/dengekionline/dps" :paramsDesc="['新闻类别，如下表']">

| All | PlayStation | Nintendo | Xbox      | PC  | Girl’sStyle | Arcade Web | App | Anime | Review | Rank |
| --- | ----------- | -------- | --------- | --- | ----------- | ---------- | --- | ----- | ------ | ---- |
|     | dps         | nintendo | microsoft | dpc | gstyle      | arcade     | app | anime | review | rank |

</Route>

## 东方我乐多丛志

### 文章

<Route author="ttyfly" path="/touhougarakuta/:language/:type" example="/touhougarakuta/cn/index" :paramsDesc="['语言', '类型']">

语言

| 中文 | 日文 | 韩文 |
| -- | -- | -- |
| cn | ja | ko |

类型

| 最新情报  | 连载     | 特辑         | 小说     | 漫画     | 新闻   |
| ----- | ------ | ---------- | ------ | ------ | ---- |
| index | series | interviews | novels | comics | news |

| 音乐点评         | 游戏测评        | 同人作品感想      | 关于本站          |
| ------------ | ----------- | ----------- | ------------- |
| music_review | game_review | book_review | where_are_you |

**注：** 最新情报包括后面所有类型的文章，内容较多，谨慎使用。

</Route>

## 咚漫

### 漫画更新

<Route author="machsix" path="/dongmanmanhua/:category/:name/:id" example="/dongmanmanhua/COMEDY/xin-xinlingdeshengyin/381" :paramsDesc="['类别','名称','ID']"/>

## 動畫瘋

### 最後更新

<Route author="maple3142" example="/anigamer/new_anime" path="/anigamer/new_anime"/>

### 動畫

<Route author="maple3142" example="/anigamer/anime/90003" path="/anigamer/anime/:sn" :paramsDesc="['動畫 sn']"/>

## 動漫狂

### 漫画更新

<Route author="KellyHwong" path="/cartoonmad/comic/:id" example="/cartoonmad/comic/5827" :paramsDesc="['漫画ID']"/>

## 风之动漫

### 风之动漫

<Route author="geeeeoff zytomorrow" path="/fzdm/manhua/:id" example="/fzdm/manhua/93" :paramsDesc="['漫画ID。默认获取全部，建议使用通用参数limit获取指定数量']" anticrawler="1"/>

## 海猫吧

### 漫画更新

<Route author="zytomorrow" path="/haimaoba/:id" example="/haimaoba/4026" :paramsDesc="['漫画id，漫画主页的地址栏中最后一位数字']" radar="1" rssbud="1"/>

## 看漫画

### 漫画更新

<Route author="MegrezZhu" path="/manhuagui/comic/:id/:chapterCnt?" example="/manhuagui/comic/22942/5" :paramsDesc="['漫画ID','返回章节的数量，默认为0，返回所有章节']" radar="1" rssbud="1"/>

## 看漫画镜像站

### 漫画更新

<Route author="btdwv" path="/mhgui/comic/:id/:chapterCnt?" example="/mhgui/comic/13317/5" :paramsDesc="['漫画ID','返回章节的数量，默认为0，返回所有章节']" radar="1" rssbud="1"/>

## 看漫画台湾

### 漫画更新

<Route author="btdwv" path="/twmanhuagui/comic/:id/:chapterCnt?" example="/twmanhuagui/comic/13317/5" :paramsDesc="['漫画ID','返回章节的数量，默认为0，返回所有章节']" radar="1" rssbud="1"/>

## 拷贝漫画

### 漫画更新

<Route author="btdwv marvolo666 yan12125" path="/copymanga/comic/:id/:chapterCnt?" example="/copymanga/comic/zaiyishijiemigongkaihougong/5" :paramsDesc="['漫画ID','返回章节的数量，默认为0，返回所有章节']" radar="1" rssbud="1"/>

## 漫画 DB

### 漫画 DB

<Route author="junfengP" path="/manhuadb/:id" example="/manhuadb/comics/1711" :paramsDesc="['漫画ID']"/>

## 漫画堆

### 漫画

<Route author="geeeeoff" path="/manhuadui/manhua/:name/:serial?" example="/manhuadui/manhua/yiquanchaoren/1" :paramsDesc="['漫画名称', '内容序号，部分漫画存在最新章节、原作、番外，根据页面顺序从1开始排序']"/>

## 漫小肆

### 漫画更新

<Route author="junfengP" path="/manxiaosi/book/:id" example="/manxiaosi/book/90" :paramsDesc="['漫画id，漫画主页的地址栏中']" radar="1" rssbud="1"/>

## 三界异次元

### 三界异次元

<Route author="luyuhuang" example="/3ycy/home" path="/3ycy/home" radar="1" rssbud="1"/>

## 紳士漫畫

### 最新

<Route author="KenMizz" example="/ssmh" path="/ssmh/" />

### 分类更新

<Route author="Gandum2077" example="/ssmh/category/6" path="/ssmh/category/:cid" :paramsDesc="['分类的id，即对应 URL 中的数字']" />

## 鼠绘漫画

### 鼠绘漫画

<Route author="zytomorrow" path="/shuhui/comics/:id" example="/shuhui/comics/1" :paramsDesc="['漫画id，漫画主页的地址栏中最后一位数字']" radar="1" rssbud="1"/>

## 腾讯动漫

### 排行榜

<Route author="nczitzk" example="/qq/ac/rank" path="/qq/ac/rank/:type?/:time?" :paramsDesc="['分类，见下表，默认为月票榜', '时间，`cur` 为当周、`prev` 为上周']" radar="1" rssbud="1">

| 月票榜 | 飙升榜  | 新作榜 | 畅销榜 | TOP100 | 男生榜  | 女生榜    |
| --- | ---- | --- | --- | ------ | ---- | ------ |
| mt  | rise | new | pay | top    | male | female |

::: tip 提示

`time` 参数仅在 `type` 参数选为 **月票榜** 的时候生效。

:::

</Route>

### 漫画

<Route author="nczitzk" example="/qq/ac/comic/531490" path="/qq/ac/comic/:id" :paramsDesc="['编号，可在对应页 URL 中找到']" radar="1" rssbud="1"/>

## 忧郁的 loli

### 文章

<Route author="DIYgod kotoyuuko" example="/hhgal" path="/hhgal"/>

## 终点分享

### 最新汉化

<Route author="junfengP" example="/zdfx" path="/zdfx"/>
