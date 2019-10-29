---
pageClass: routes
---

# 论坛

## Dcard

### 首頁帖子

<Route author="DIYgod" example="/dcard/posts/popular" path="/dcard/posts/:type?" :paramsDesc="['排序，popular 熱門；latest 最新，默認為 latest']" radar="1"/>

### 板塊帖子

<Route author="HenryQW" example="/dcard/funny/popular" path="/dcard/:section/:type?" :paramsDesc="['板塊名稱，URL 中獲得', '排序，popular 熱門；latest 最新，默認為 latest']" radar="1"/>

## MCBBS

### 版块

<Route author="cssxsh" example="/mcbbs/forum/news" path="/mcbbs/forum/:type" :paramsDesc="['版块名称或者版块号']"/>

### 帖子

<Route author="cssxsh" example="/mcbbs/post/915861/3038" path="/mcbbs/post/:tid/:authorid?" :paramsDesc="['贴子id，可在帖子 URL 找到', '用户id，此参数不为空时，只看此作者']"/>

## NGA

### 分区帖子

<Route author="xyqfer" example="/nga/forum/489" path="/nga/forum/:fid"  :paramsDesc="['分区 id, 可在分区主页 URL 找到']" radar="1"/>

### 帖子

<Route author="xyqfer" example="/nga/post/18449558" path="/nga/post/:tid"  :paramsDesc="['帖子 id, 可在帖子 URL 找到']" radar="1"/>

## Saraba1st

### 帖子

<Route author="zengxs" example="/saraba1st/thread/1789863" path="/saraba1st/thread/:tid" :paramsDesc="['帖子 id']">

帖子网址如果为 <https://bbs.saraba1st.com/2b/thread-1789863-1-1.html> 那么帖子 id 就是 `1789863`。

</Route>

## V2EX

### 最热/最新主题

<Route author="WhiteWorld" example="/v2ex/topics/latest" path="/v2ex/topics/:type" :paramsDesc="['hot 或 latest']"/>

### 帖子

<Route author="kt286" example="/v2ex/post/584403" path="/v2ex/post/:postid" :paramsDesc="['帖子ID，在 URL 可以找到']"/>

## 虎扑

### 虎扑 BBS 论坛

<Route author="LogicJake" example="/hupu/bbs/bxj/2" path="/hupu/bbs/:id/:order?" :paramsDesc="['板块 id，可在板块 URL 找到', '排序方式，1最新回帖（默认），2最新发帖，3精华帖']"/>

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

## 书友社区

### 导读

<Route author="AngUOI" example="/andyt/newthread" path="/andyt/:view?" :paramsDesc="['子版块 view, 为空默认最新发表']">

| 最新发表  | 最新热门 | 最新精华 | 最新回复 |
| --------- | -------- | -------- | -------- |
| newthread | hot      | digest   | new      |

</Route>

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

## 一亩三分地

### 主题帖

<Route author="Maecenas" example="/1point3acres/user/1/threads" path="/1point3acres/user/:id/threads" :paramsDesc="['用户 id，可在 Instant 版网站的个人主页 URL 找到']"/>

### 回帖

<Route author="Maecenas" example="/1point3acres/user/1/posts" path="/1point3acres/user/:id/posts" :paramsDesc="['用户 id，可在 Instant 版网站的个人主页 URL 找到']"/>

## 直播吧

### 子论坛

<Route author="LogicJake" example="/zhibo8/forum/8" path="/zhibo8/forum/:id" :paramsDesc="['子论坛 id，可在子论坛 URL 找到']"/>

### 回帖

<Route author="LogicJake" example="/zhibo8/post/2601615" path="/zhibo8/post/:id" :paramsDesc="['帖子 id，可在帖子 URL 找到']"/>
