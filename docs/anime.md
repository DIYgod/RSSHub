# 二次元

## bilibili

见 [#bilibili](/social-media.html#bilibili)

## Bangumi

<Route name="放送列表" author="magic-akari" example="/bangumi/calendar/today" path="/bangumi/calendar/today"/>

<Route name="条目的章节" author="SettingDust" example="/bangumi/subject/240038" path="/bangumi/subject/ep/:id" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

<Route name="条目的吐槽箱" author="ylc395" example="/bangumi/subject/214265/comments?minLength=100" path="/bangumi/subject/:id/comments" :paramsDesc="['条目 id, 在条目页面的地址栏查看. minLength: 以查询字符串（query string）的形式指定. 用于过滤掉内容长度小于指定值的吐槽']"/>

<Route name="条目的评论" author="ylc395" example="/bangumi/subject/214265/blogs" path="/bangumi/subject/:id/blogs" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

<Route name="条目的讨论" author="ylc395" example="/bangumi/subject/214265/topics" path="/bangumi/subject/:id/topics" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

<Route name="现实人物的新作品" author="ylc395" example="/bangumi/person/32943" path="/bangumi/person/:id" :paramsDesc="['人物 id, 在人物页面的地址栏查看']"/>

<Route name="小组话题的新回复" author="ylc395" example="/bangumi/topic/24657" path="/bangumi/topic/:id" :paramsDesc="['话题 id, 在话题页面地址栏查看']"/>

<Route name="小组话题" author="SettingDust" example="/bangumi/group/boring" path="/bangumi/group/:id" :paramsDesc="['小组 id, 在小组页面地址栏查看']"/>

## 忧郁的 loli

<Route name="文章" author="DIYgod" example="/mmgal" path="/mmgal"/>

## 终点分享

<Route name="最新汉化" author="junfengP" example="/zdfx" path="/zdfx"/>

## 看漫画

<Route name="漫画更新" author="MegrezZhu" path="/manhuagui/comic/:id" example="/manhuagui/comic/22942" :paramsDesc="['漫画ID']"/>

## 動畫狂

<Route name="漫画更新" author="KellyHwong" path="/cartoonmad/comic/:id" example="/cartoonmad/comic/5827" :paramsDesc="['漫画ID']"/>

## Anime1

<Route name="動畫" author="maple3142" example="/anime1/anime/2018年秋季/哥布林殺手" path="/anime1/anime/:time/:name" :paramsDesc="['时间', '动画名称']">

时间和动画名称请自己从网址取得: <https://anime1.me/category/2018年秋季/刀劍神域-alicization>

</Route>

<Route name="搜尋" author="maple3142" example="/anime1/search/兔女郎學姊" path="/anime1/search/:keyword" :paramsDesc="['关键字']"/>

## 動畫瘋

<Route name="最後更新" author="maple3142" example="/anigamer/new_anime" path="/anigamer/new_anime"/>

<Route name="動畫" author="maple3142" example="/anigamer/anime/90003" path="/anigamer/anime/:sn" :paramsDesc="['動畫 sn']"/>

## Animen 动漫平台

<Route name="news" author="LogicJake" example="/animen/news/zx" path="/animen/news/:type" :paramsDesc="['板块类型']">

| 最新 | 焦点 | 动画 | 漫画 | 游戏 | 小说 | 真人版 | 活动 | 音乐 | 访谈 | 其他 | 新闻稿 | 懒人包 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ------ | ------ | ---- |
| zx   | jd   | dh   | mh   | yx   | xs   | zrb    | hd   | yy   | ft   | qt   | xwg    | lrb    | gg   |

</Route>

## Vol.moe

<Route name="vol" author="CoderTonyChan" example="/vol/finsh" path="/vol/:mode?" :paramsDesc="['模式']">

| 连载   | 完结  |
| ------ | ----- |
| serial | finsh |

</Route>

## ebb.io

<Route name="ebb" author="Tsuki" example="/ebb" path="/ebb"/>

## Anitama

<Route name="Anitama Channel" author="ranpox" path="/anitama/:channel?" example="/anitama" :paramsDesc="['频道id，从频道的地址栏中查看']"/>
