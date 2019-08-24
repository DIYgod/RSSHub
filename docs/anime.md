---
pageClass: routes
---

# 二次元

## 005.tv

### 二次元资讯

<Route author="junfengP" example="/005tv/zx/latest" path="/005tv/zx/latest"/>
## Anime1

### 動畫

<Route author="maple3142" example="/anime1/anime/2018年秋季/哥布林殺手" path="/anime1/anime/:time/:name" :paramsDesc="['时间', '动画名称']" radar="1">

时间和动画名称请自己从网址取得: <https://anime1.me/category/2018年秋季/刀劍神域-alicization>

</Route>

### 搜尋

<Route author="maple3142" example="/anime1/search/兔女郎學姊" path="/anime1/search/:keyword" :paramsDesc="['关键字']" radar="1"/>

## Animen 动漫平台

### news

<Route author="LogicJake" example="/animen/news/zx" path="/animen/news/:type" :paramsDesc="['板块类型']">

| 最新 | 焦点 | 动画 | 漫画 | 游戏 | 小说 | 真人版 | 活动 | 音乐 | 访谈 | 其他 | 新闻稿 | 懒人包 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ------ | ------ | ---- |
| zx   | jd   | dh   | mh   | yx   | xs   | zrb    | hd   | yy   | ft   | qt   | xwg    | lrb    | gg   |

</Route>

## Anitama

### Anitama Channel

<Route author="ranpox" path="/anitama/:channel?" example="/anitama" :paramsDesc="['频道id，从频道的地址栏中查看']"/>

## Bangumi

### 放送列表

<Route author="magic-akari" example="/bangumi/calendar/today" path="/bangumi/calendar/today"/>

### 条目的章节

<Route author="SettingDust" example="/bangumi/subject/240038" path="/bangumi/subject/ep/:id" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

### 条目的吐槽箱

<Route author="ylc395" example="/bangumi/subject/214265/comments?minLength=100" path="/bangumi/subject/:id/comments" :paramsDesc="['条目 id, 在条目页面的地址栏查看. minLength: 以查询字符串（query string）的形式指定. 用于过滤掉内容长度小于指定值的吐槽']"/>

### 条目的评论

<Route author="ylc395" example="/bangumi/subject/214265/blogs" path="/bangumi/subject/:id/blogs" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

### 条目的讨论

<Route author="ylc395" example="/bangumi/subject/214265/topics" path="/bangumi/subject/:id/topics" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

### 现实人物的新作品

<Route author="ylc395" example="/bangumi/person/32943" path="/bangumi/person/:id" :paramsDesc="['人物 id, 在人物页面的地址栏查看']"/>

### 小组话题的新回复

<Route author="ylc395" example="/bangumi/topic/24657" path="/bangumi/topic/:id" :paramsDesc="['话题 id, 在话题页面地址栏查看']"/>

### 小组话题

<Route author="SettingDust" example="/bangumi/group/boring" path="/bangumi/group/:id" :paramsDesc="['小组 id, 在小组页面地址栏查看']"/>

## bilibili

见 [#bilibili](/social-media.html#bilibili)

## ebb.io

### ebb

<Route author="Tsuki" example="/ebb" path="/ebb"/>

## Hanime.tv

### 最近更新

<Route author="EsuRt" example="/hanime/video" path="/hanime/video"/>

## Hpoi 手办维基

### 情报

<Route author="sanmmm" path="/hpoi/info/:type?" example="/hpoi/info/all" :paramsDesc="['分类, 见下表, 默认为`all`']">

分类

| 全部 | 手办  | 模型  |
| ---- | ----- | ----- |
| all  | hobby | model |

</Route>

### 浏览周边

<Route author="howel52 DIYgod" path="/hpoi/:category/:words" example="/hpoi/charactar/1246512" :paramsDesc="['分类, 见下表', '角色/作品 ID']">

| 角色手办  | 作品手办 |
| --------- | -------- |
| charactar | works    |

</Route>

## say 花火

### 文章

<Route author="junfengP" example="/sayhuahuo" path="/sayhuahuo"/>

## Vol.moe

### vol

<Route author="CoderTonyChan" example="/vol/finsh" path="/vol/:mode?" :paramsDesc="['模式']">

| 连载   | 完结  |
| ------ | ----- |
| serial | finsh |

</Route>

## 嘀哩嘀哩 - dilidili

### 嘀哩嘀哩番剧更新

<Route author="SunShinenny" path="/dilidili/fanju/:id" example="/dilidili/fanju/onepunchman2" :paramsDesc="['番剧id']">

请打开对应番剧的纵览页(非具体某集),从 url 中最后一位查看番剧 id.(一般为英文)
除去'海贼'此类具有特殊页面的超长番剧,绝大多数页面都可以解析.
最适合用来追新番

</Route>

## 動畫瘋

### 最後更新

<Route author="maple3142" example="/anigamer/new_anime" path="/anigamer/new_anime"/>

### 動畫

<Route author="maple3142" example="/anigamer/anime/90003" path="/anigamer/anime/:sn" :paramsDesc="['動畫 sn']"/>

## 咚漫

### 漫画更新

<Route author="Machsix" path="/dongmanmanhua/comic/:category/:name/:id" example="/dongmanmanhua/comic/COMEDY/xin-xinlingdeshengyin/381" :paramsDesc="['类别','名称','ID']"/>

## 動漫狂

### 漫画更新

<Route author="KellyHwong" path="/cartoonmad/comic/:id" example="/cartoonmad/comic/5827" :paramsDesc="['漫画ID']"/>

## 看漫画

### 漫画更新

<Route author="MegrezZhu" path="/manhuagui/comic/:id" example="/manhuagui/comic/22942" :paramsDesc="['漫画ID']"/>

## 漫画 DB

### 漫画 DB

<Route author="junfengP" path="/manhuadb/:id" example="/manhuadb/comics/1711" :paramsDesc="['漫画ID']"/>

## 鼠绘漫画

### 鼠绘漫画

<Route author="zytomorrow" path="/shuhui/comics/:id" example="/shuhui/comics/1" :paramsDesc="['漫画id，漫画主页的地址栏中最后一位数字']"/>

## 忧郁的 loli

### 文章

<Route author="DIYgod" example="/mmgal" path="/mmgal"/>

## 终点分享

### 最新汉化

<Route author="junfengP" example="/zdfx" path="/zdfx"/>
