---
pageClass: routes
---

# 论坛

## A 岛匿名版

### 串

<Route author="zcx1218029121" example="/adnmb/20" path="/adnmb/:pid" :paramsDesc="['板块 id 或者板块名称，例如`/adnmb/20`等价于`/adnmb/欢乐恶搞`，现有板块请参考下表']" >

| 时间线 | 综合版 1 | 围炉 | 欢乐恶搞 | 速报 2 | 推理 | 跑团 | 技术宅 | 料理 | 猫版 | 音乐 | 考试 | 社畜 |
| ------ | -------- | ---- | -------- | ------ | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ---- |
| -1     | 4        | 120  | 20       | 121    | 11   | 111  | 30     | 32   | 40   | 35   | 56   | 110  |

| 科学 | 文学 | 创意 | 姐妹 1 | 数码 | 女装 | 日记 | 圈内 | 都市怪谈 | 买买买 | 动画 | 漫画 | 美漫 | 国漫 | 小说 |
| ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | -------- | ------ | ---- | ---- | ---- | ---- | ---- |
| 15   | 103  | 17   | 98     | 75   | 97   | 89   | 96   | 81       | 106    | 14   | 12   | 90   | 99   | 19   |

| 轻小说 | GALGAME | 东方 Project | 舰娘 | 虚拟偶像 | VOCALOID | 游戏 | DNF | SE  | 手游 |
| ------ | ------- | ------------ | ---- | -------- | -------- | ---- | --- | --- | ---- |
| 87     | 64      | 5            | 93   | 101      | 6        | 2    | 72  | 124 | 3    |

| Steam | 索尼 | LOL | DOTA | 口袋妖怪 | 战争雷霆 | WOT | Minecraft | 怪物猎人 | 3A 游戏 |
| ----- | ---- | --- | ---- | -------- | -------- | --- | --------- | -------- | ------- |
| 107   | 24   | 22  | 70   | 38       | 86       | 51  | 10        | 28       | 108     |

| 彩虹六号 | 暴雪游戏 | 卡牌桌游 | MUG | AC 大逃杀 | 任天堂 | AKB | SNH48 | COSPLAY | 声优 |
| -------- | -------- | -------- | --- | --------- | ------ | --- | ----- | ------- | ---- |
| 119      | 23       | 45       | 34  | 29        | 25     | 16  | 100   | 13      | 55   |

| 模型 | 影视 | 军武 | 体育 | 值班室 | 城墙 | 技术支持 | 询问 3 | 宠物 | 摄影 2 |
| ---- | ---- | ---- | ---- | ------ | ---- | -------- | ------ | ---- | ------ |
| 39   | 31   | 37   | 33   | 18     | 112  | 117      | 114    | 118  | 115    |

| 主播 | 育儿 | 围炉 | 旅行 | 特摄 |
| ---- | ---- | ---- | ---- | ---- |
| 116  | 113  | 120  | 125  | 9    |

</Route>

## Chiphell

### 子版块

<Route author="tylinux" example="/chiphell/forum/80" path="/chiphell/forum/:forumId" :paramsDesc="['子版块 id，可在子版块 URL 找到']"/>

## Dcard

### 首頁帖子

<Route author="DIYgod" example="/dcard/posts/popular" path="/dcard/posts/:type?" :paramsDesc="['排序，popular 熱門；latest 最新，默認為 latest']" radar="1" rssbud="1"/>

### 板塊帖子

<Route author="HenryQW" example="/dcard/funny/popular" path="/dcard/:section/:type?" :paramsDesc="['板塊名稱，URL 中獲得', '排序，popular 熱門；latest 最新，默認為 latest']" radar="1" rssbud="1"/>

## Discuz

### 通用子版块 - 自动检测

<Route author="junfengP" example="/discuz/http%3a%2f%2fwww.u-share.cn%2fforum.php%3fmod%3dforumdisplay%26fid%3d56" path="/discuz/:link" :paramsDesc="['子版块链接， 需要手动Url编码']"/>

### 通用子版块 - 指定版本

<Route author="junfengP" example="/discuz/x/https%3a%2f%2fwww.52pojie.cn%2fforum-16-1.html" path="/discuz/:ver/:link" :paramsDesc="['discuz版本类型，见下表','子版块链接， 需要手动Url编码']" >

| Discuz X 系列 | Discuz 7.x 系列 |
| ------------- | --------------- |
| x             | 7               |

</Route>

### 通用子版块 - 支持 Cookie

<Route author="junfengP" example="/discuz/x/00/https%3a%2f%2fbbs.zdfx.net%2fforum-2-1.html" path="/discuz/:ver/:cid/:link" :paramsDesc="['discuz版本类型，见下表', 'Cookie id，需自建并配置环境变量，详情见部署页面的配置模块','子版块链接， 需要手动Url编码']" >

| Discuz X 系列 | Discuz 7.x 系列 |
| ------------- | --------------- |
| x             | 7               |

</Route>

## eTOLAND

### 主题贴

<Route author="mengx8" example="/etoland/star01" path="/etoland/:boardId" :paramsDesc="['板块 id，可在板块 URL 找到']" radar="1" rssbud="1"/>

## LearnKu

### 社区

<Route author="haokaiyang" example="/learnku/laravel/qa" path="/learnku/:community/:category?" :paramsDesc="['社区 标识，可在 <https://learnku.com/communities> 找到', '分类，如果不传 `category` 则获取全部分类']"/>

| 招聘 | 翻译         | 问答 | 链接  |
| ---- | ------------ | ---- | ----- |
| jobs | translations | qa   | links |

## MCBBS

### 版块

<Route author="cssxsh" example="/mcbbs/forum/news" path="/mcbbs/forum/:type" :paramsDesc="['版块名称或者版块号']"/>

### 帖子

<Route author="cssxsh" example="/mcbbs/post/915861/3038" path="/mcbbs/post/:tid/:authorid?" :paramsDesc="['贴子id，可在帖子 URL 找到', '用户id，此参数不为空时，只看此作者']"/>

## NGA

### 分区帖子

<Route author="xyqfer" example="/nga/forum/489" path="/nga/forum/:fid/:recommend?"  :paramsDesc="['分区 id, 可在分区主页 URL 找到, 没有 fid 时 stid 同样适用','是否只显示精华主题, 留空为否, 任意值为是']" radar="1" rssbud="1"/>

### 帖子

<Route author="xyqfer" example="/nga/post/18449558" path="/nga/post/:tid"  :paramsDesc="['帖子 id, 可在帖子 URL 找到']" radar="1" rssbud="1"/>

## Quicker

### 讨论区

<Route author="Cesaryuan" example="/quicker/qa" path="/quicker/qa"/>

### 用户动作更新

<Route author="Cesaryuan" example="/quicker/user/action/18359/Cesaryuan" path="/quicker/user/action/:uid/:person" :paramsDesc="['用户ID，可在用户主页链接里找到', '用户昵称，可在用户主页链接里找到']" />

## RF 技术社区

### 文章

<Route author="nczitzk" example="/rf/article" path="/rf/article"/>

## Ruby China

> 未登录状态下抓取页面非实时更新

### 主题

<Route author="ahonn" example="/ruby-china/topics" path="/ruby-china/topics/:type" :paramsDesc="['主题类型，在 URL 可以找到']"/>

| 主题类型 | type       |
| -------- | ---------- |
| 精华贴   | excellent  |
| 优质帖子 | popular    |
| 无人问津 | no_reply   |
| 最新回复 | last_reply |
| 最新发布 | last       |

### 招聘

<Route author="ahonn" example="/ruby-china/jobs" path="/ruby-china/jobs"/>

## Saraba1st

### 帖子

<Route author="zengxs" example="/saraba1st/thread/1789863" path="/saraba1st/thread/:tid" :paramsDesc="['帖子 id']">

帖子网址如果为 <https://bbs.saraba1st.com/2b/thread-1789863-1-1.html> 那么帖子 id 就是 `1789863`。

</Route>

## V2EX

### 最热 / 最新主题

<Route author="WhiteWorld" example="/v2ex/topics/latest" path="/v2ex/topics/:type" :paramsDesc="['hot 或 latest']"/>

### 帖子

<Route author="kt286" example="/v2ex/post/584403" path="/v2ex/post/:postid" :paramsDesc="['帖子ID，在 URL 可以找到']"/>

### 标签

<Route author="liyefox" example="/v2ex/tab/hot" path="/v2ex/tab/:tabid" :paramsDesc="['tab标签ID,在 URL 可以找到']"/>

## 巴哈姆特電玩資訊站

### 熱門推薦

<Route author="nczitzk" example="/gamer/hot/47157" path="/gamer/hot/:bsn" :paramsDesc="['板块 id，在 URL 可以找到']"/>

## 才符

### 用户动态

<Route author="nczitzk" example="/91ddcc/user/2377095" path="/91ddcc/user/:user" :paramsDesc="['用户ID，在 URL 可以找到']"/>

### 驿站帖子

<Route author="nczitzk" example="/91ddcc/stage/206" path="/91ddcc/stage/:stage" :paramsDesc="['驿站ID，在 URL 可以找到']"/>

## 电鸭社区

### 工作机会

<Route author="sfyumi" example="/eleduck/jobs" path="/eleduck/jobs"/>

## 光谷社区

### 子论坛

<Route author="nczitzk" example="/guanggoo/index" path="/guanggoo/:caty" :paramsDesc="['子论坛']">

| 首页  | 你问我答 | 同城活动 | IT 技术 | 金融财经 | 创业创客 | 城市建设 |
| ----- | -------- | -------- | ------- | -------- | -------- | -------- |
| index | qna      | lowshine | it      | finance  | startup  | city     |

</Route>

## 虎扑

### 虎扑 BBS 论坛

<Route author="LogicJake" example="/hupu/bbs/bxj/2" path="/hupu/bbs/:id/:order?" :paramsDesc="['板块 id，可在板块 URL 找到', '排序方式，1最新回帖（默认），2最新发帖，3精华帖']"/>

### 分类

<Route author="nczitzk" example="/hupu/all/gambia" path="/hupu/all/:caty" :paramsDesc="['分类名，见下表']">

| 分类         | 名称     |
| ------------ | -------- |
| NBA 论坛     | nba      |
| CBA 论坛     | cba      |
| 运动和装备   | gear     |
| 国际足球论坛 | soccer   |
| 中国足球论坛 | csl      |
| 综合体育     | sports   |
| 步行街       | gambia   |
| 彩票中心     | lottery  |
| 自建版块     | boards   |
| 虎扑社团     | group    |
| 站务管理     | feedback |

更多参见 [虎扑社区版块目录](https://bbs.hupu.com/boards.php) 左侧导航栏各板块分类页

</Route>

### 子站

<Route author="nczitzk" example="/hupu/dept/nba" path="/hupu/dept/:dept" :paramsDesc="['名称，见下表']">

| 子站     | 名称         |
| -------- | ------------ |
| NBA      | nba          |
| 国际足球 | soccer       |
| 中国足球 | soccer-china |
| CBA      | cba          |
| 电竞     | gg           |

</Route>

## 华为心声社区

### 华为家事

<Route author="nczitzk" example="/huawei/xinsheng" path="/huawei/xinsheng/:caty?/:order?/:keyword?" :paramsDesc="['分区 ID, 见下表，默认为全部帖子', '排序方式, 见下表，默认为最新回复', '关键词，默认为空']">

分区 ID

| 全部帖子 | 公司文件 | 管理思考 | 产品改进 | 版务公告 |
| -------- | -------- | -------- | -------- | -------- |
|          | 155      | 415      | 427      | 419      |

排序方式

| 最新发帖 | 最新回复 | 最多回复   | 最多点击  |
| -------- | -------- | ---------- | --------- |
| cTime    | rTime    | replycount | viewcount |

</Route>

## 看雪

### 论坛

<Route author="renzhexigua" example="/pediy/topic/android/digest" path="/pediy/topic/:category?/:type?" :paramsDesc="['版块, 缺省为`all`', '类型, 缺省为`latest`']"/>

| 版块         | category   |
| ------------ | ---------- |
| 智能设备     | iot        |
| 区块链安全   | blockchain |
| Android 安全 | android    |
| iOS 安全     | ios        |
| 软件逆向     | re         |
| 编程技术     | coding     |
| 加壳脱壳     | unpack     |
| 密码算法     | crypto     |
| 二进制漏洞   | vuln       |
| CrackMe      | crackme    |
| Pwn          | pwn        |
| WEB 安全     | web        |
| 全站         | all        |

| 类型     | type   |
| -------- | ------ |
| 最新主题 | latest |
| 精华主题 | digest |

## 龙空

### 分区

<Route author="ma6254" example="/lkong/forum/60" path="/lkong/forum/:id/:digest?" :paramsDesc="['分区 id, 可在分区的URL里找到','默认获取全部主题，任意值则只获取精华主题']"/>

### 帖子

<Route author="ma6254" example="/lkong/thread/2356933" path="/lkong/thread/:id?" :paramsDesc="['帖子 id, 可在帖子的URL里找到']"/>

## 龙腾网

### 转译网贴

<Route author="sgqy" example="/ltaaa" path="/ltaaa/:type?" :paramsDesc="['热门类型.']">

| 最新 | 每周 | 每月  | 全年 |
| ---- | ---- | ----- | ---- |
| (空) | week | month | year |

</Route>

## 牛客网

### 讨论区

<Route author="LogicJake" example="/nowcoder/discuss/2/4" path="/nowcoder/discuss/:type/:order" :paramsDesc="['讨论区分区id 在 URL 中可以找到', '排序方式']">

| 最新回复 | 最新发表 | 最新 | 精华 |
| -------- | -------- | ---- | ---- |
| 0        | 3        | 1    | 4    |

</Route>

### 校招日程

<Route author="junfengP" example="/nowcoder/schedule" path="nowcoder/schedule/:propertyId?/:typeId?" :paramsDesc="['行业, 在控制台中抓取接口，可获得行业id，默认0', '类别，同上']" />

### 求职推荐

<Route author="junfengP" example="/nowcoder/recommend" path="nowcoder/recommend"/>

### 实习广场 & 社招广场

<Route author="nczitzk" example="/nowcoder/jobcenter/1/北京/1/1/true" path="/nowcoder/jobcenter/:recruitType?/:city?/:type?/:order?/:latest?" :paramsDesc="['招聘分类，`1` 指 实习广场，`2` 指 社招广场，默认为 `1`', '所在城市，可选城市见下表，若空则为 `全国`', '职位类型，可选职位代码见下表，若空则为 `全部`', '排序参数，可选排序参数代码见下表，若空则为 `默认`', '是否仅查看最近一周，可选 `true` 和 `false`，默认为 `false`']">

可选城市有：北京、上海、广州、深圳、杭州、南京、成都、厦门、武汉、西安、长沙、哈尔滨、合肥、其他

职位类型代码见下表：

| 研发 | 测试 | 数据 | 算法 | 前端 | 产品 | 运营 | 其他 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 5    | 6    | 7    | 0    |

排序参数见下表：

| 最新发布 | 最快处理 | 处理率最高 |
| -------- | -------- | ---------- |
| 1        | 2        | 3          |

</Route>

## 三星盖乐世社区

### 最新帖子

<Route author="nczitzk" example="/samsungmembers/latest" path="/samsungmembers/latest"/>

## 书友社区

### 导读

<Route author="AngUOI" example="/andyt/newthread" path="/andyt/:view?" :paramsDesc="['子版块 view, 为空默认最新发表']">

| 最新发表  | 最新热门 | 最新精华 | 最新回复 |
| --------- | -------- | -------- | -------- |
| newthread | hot      | digest   | new      |

</Route>

## 水木社区

### 分区文章

<Route author="nczitzk" example="/newsmth/section/university" path="/newsmth/section/:section" :paramsDesc="['分区名，见下表']">

| 社区管理  | 国内院校   | 休闲娱乐      | 五湖四海 | 游戏运动 | 社会信息 | 知性感性 | 文化人文 | 学术科学 | 电脑技术   |
| --------- | ---------- | ------------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- |
| community | university | entertainment | location | game     | society  | romance  | culture  | science  | technology |

</Route>

### 用户文章

<Route author="nczitzk" example="/newsmth/account/fef705ec94819a5a87941759e33c0982" path="/newsmth/account/:id" :paramsDesc="['用户 id，可在用户页的 URL 中找到']"/>

## 天涯论坛

### 子版块

<Route author="a14907" example="/tianya/index/lookout" path="/tianya/index/:type" :paramsDesc="['板块类型 type，可在 URL 找到 例如，天涯杂谈板块的地址是http://bbs.tianya.cn/list-free-1.shtml， 这个板块的type就是free; 同理，我的大学板块地址为http://bbs.tianya.cn/list-university-1.shtml，类型是university']"/>

### 用户帖子

<Route author="a14907" example="/tianya/user/11488997" path="/tianya/user/:userid" :paramsDesc="['用户id userid，可在 URL 找到 例如，用户苕木匠的地址是http://www.tianya.cn/11488997/bbs， 苕木匠的userid就是11488997']"/>

### 用户的回帖

<Route author="a14907" example="/tianya/comments/11488997" path="/tianya/comments/:userid" :paramsDesc="['用户id userid，可在 URL 找到 例如，用户苕木匠的地址是http://www.tianya.cn/11488997/bbs， 苕木匠的userid就是11488997']"/>

## 贴吧

### 帖子列表

<Route author="u3u" example="/tieba/forum/女图" path="/tieba/forum/:kw" :paramsDesc="['吧名']"/>

### 精品帖子

<Route author="u3u" example="/tieba/forum/good/女图" path="/tieba/forum/good/:kw/:cid?" :paramsDesc="['吧名', '精品分类, 如果不传 `cid` 则获取全部分类']"/>

### 帖子动态

<Route author="u3u" example="/tieba/post/5853240586" path="/tieba/post/:id" :paramsDesc="['帖子 ID']"/>

### 楼主动态

<Route author="u3u" example="/tieba/post/lz/5853240586" path="/tieba/post/lz/:id" :paramsDesc="['帖子 ID']"/>

## 万维读者

### 焦点新闻

<Route author="nczitzk" example="/creaders/headline" path="/creaders/headline"/>

## 文学城

### 博客

<Route author="changlan" example="/wenxuecity/blog/43626" path="/wenxuecity/blog/:id" :paramsDesc="['博客 ID, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 最热主题

<Route author="changlan" example="/wenxuecity/hot/9" path="/wenxuecity/hot/:cid" :paramsDesc="['版面 ID, 可在 URL 中找到']" radar="1"/>

### 最新主题

<Route author="changlan" example="/wenxuecity/bbs/tzlc" path="/wenxuecity/bbs/:cat/:elite?" :paramsDesc="['版面名, 可在 URL 中找到', '是否精华区, 1 为精华区']" radar="1" rssbud="1"/>

### 焦点新闻

<Route author="nczitzk" example="/wenxuecity/news" path="/wenxuecity/news" />

## 小米社区

### 圈子

<Route author="DIYgod" example="/mi/bbs/board/18066617" path="/mi/bbs/board/:boardId" :paramsDesc="['圈子 id，可在圈子 URL 找到']" radar="1" rssbud="1"/>

## 一亩三分地

### 主题帖

<Route author="Maecenas" example="/1point3acres/user/1/threads" path="/1point3acres/user/:id/threads" :paramsDesc="['用户 id，可在 Instant 版网站的个人主页 URL 找到']"/>

### 回帖

<Route author="Maecenas" example="/1point3acres/user/1/posts" path="/1point3acres/user/:id/posts" :paramsDesc="['用户 id，可在 Instant 版网站的个人主页 URL 找到']"/>

### 帖子 (手机端的最热与最新 Tab)

<Route author="NavePnow" example="/1point3acres/post/hot" path="/1point3acres/post/:category" :paramsDesc="['分类 category, 见下表']"/>

| 最热帖子 | 最新帖子 |
| -------- | -------- |
| hot      | new      |

### 录取结果

<Route author="NavePnow" example="/1point3acres/offer/12/null/CMU" path="/1point3acres/offer/:year?/:major?/:school?" :paramsDesc="['录取年份  id，空为null', '录取专业 id，空为null', '录取学校 id，空为null']">
::: warning 三个 id 获取方式

1.  打开 <https://offer.1point3acres.com>
2.  打开控制台
3.  切换到 Network 面板
4.  点击 搜索 按钮
5.  点击 results?ps=15&pg=1 POST 请求
6.  找到 Request Payload 请求参数，例如 filters: {planyr: "13", planmajor: "1", outname_w: "ACADIAU"} ，则三个 id 分别为: 13,1,ACADIAU

:::
</Route>

## 直播吧

### 子论坛

<Route author="LogicJake" example="/zhibo8/forum/8" path="/zhibo8/forum/:id" :paramsDesc="['子论坛 id，可在子论坛 URL 找到']"/>

### 回帖

<Route author="LogicJake" example="/zhibo8/post/2601615" path="/zhibo8/post/:id" :paramsDesc="['帖子 id，可在帖子 URL 找到']"/>

### 滚动新闻

<Route author="nczitzk" example="/zhibo8/more/nba" path="/zhibo8/more/:caty" :paramsDesc="['分类，可选 `nba` 指 NBA，或 `zuqiu` 指 足球']"/>
