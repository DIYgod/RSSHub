---
pageClass: routes
---

# 博客

## archdaily

### 首页

<Route author="kt286" example="/archdaily" path="/archdaily"/>

## Benedict Evans

<Route author="emdoe" example="/benedictevans" path="/benedictevans"/>

## Google Sites

### 文章更新

<Route author="hoilc" example="/google/sites/outlierseconomics" path="/google/sites/:id" :paramsDesc="['Site ID, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 文章最近改动

<Route author="nczitzk" example="/google/sites/recentChanges/outlierseconomics" path="/google/sites/recentChanges/:id" :paramsDesc="['Site ID, 可在 URL 中找到']"/>

## Gwern Branwen

### 博客

<Route author="cerebrater" example="/gwern/newest" path="/gwern/:category" :paramsDesc="['網誌主頁的分類訊息']"/>

## Hedwig.pub

### 博客

<Route author="zwithz" example="/blogs/hedwig/zmd" path="/blogs/hedwig/:type" :paramsDesc="['分类, 见下表']"/>

| 呆唯的 Newsletter | 0neSe7en 的技术周刊 | 地心引力   | 宪学宪卖   | Comeet 每周精选 | 无鸡之谈     | 我有一片芝麻地 |
| -------------- | -------------- | ------ | ------ | ----------- | -------- | ------- |
| hirasawayui    | se7en          | walnut | themez | comeet      | sunskyxh | zmd     |

> 原则上只要是 {type}.hedwig.pub 都可以匹配。

## Hexo

### Next 主题博客

<Route author="fengkx" example="/hexo/next/diygod.me" path="/hexo/next/:url" :paramsDesc="['博客 Url 不带协议头']"/>

### Yilia 主题博客

<Route author="aha2mao" example="/hexo/yilia/cloudstone.xin" path="/hexo/yilia/:url" :paramsDesc="['博客 Url 不带协议头']"/>

### Fluid 主题博客

<Route author="gkkeys" example="/hexo/fluid/blog.tonyzhao.xyz" path="/hexo/fluid/:url" :paramsDesc="['博客 Url 不带协议头']"/>

## Hi, DIYgod

### DIYgod 的动森日记

<Route author="DIYgod" example="/blogs/diygod/animal-crossing" path="/blogs/diygod/animal-crossing"/>

### DIYgod 的可爱的手办们

<Route author="DIYgod" example="/blogs/diygod/gk" path="/blogs/diygod/gk"/>

## JustRun

### JustRun

<Route author="nczitzk" example="/justrun" path="/justrun"/>

## LaTeX 开源小屋

### 首页

<Route author="kt286 nczitzk" example="/latexstudio/home" path="/latexstudio/home"/>

## LeeMeng

### blog

<Route author="xyqfer" example="/leemeng" path="/leemeng"/>

## Miris Whispers

### 博客

<Route author="chazeon" example="/miris/blog" path="/miris/blog" />

## Paul Graham 博客

通过提取文章全文，提供比官方源更佳的阅读体验。

### Essays

<Route author="Maecenas" example="/blogs/paulgraham" path="/blogs/paulgraham"/>

## Phrack Magazine

### 文章

<Route author="CitrusIce" example="/phrack" path="/phrack" />

## PolkaWorld

### 最新资讯

<Route author="iceqing" example="/polkaworld/newest" path="/polkaworld/newest"/>

::: tip 提示

在路由末尾处加上 `?limit=限制获取数目` 来限制获取条目数量，默认值为`10`.

:::

## Stratechery by Ben Thompson

### 博客

<Route author="chazeon" example="/stratechery" path="/stratechery" />

## Whoscall

### 最新文章

<Route author="nczitzk" example="/whoscall" path="/whoscall"/>

### 分類

<Route author="nczitzk" example="/whoscall/categories/5-Whoscall 百科" path="/whoscall/categories/:category?" :paramsDesc="['分类，见下表，可在对应分類页 URL 中找到，默认为最新文章']">

| News   | Whoscall 百科   | 防詐小學堂     | Whoscall 日常   |
| ------ | ------------- | --------- | ------------- |
| 1-News | 5-Whoscall 百科 | 4 - 防詐小學堂 | 6-Whoscall 日常 |

</Route>

### 標籤

<Route author="nczitzk" example="/whoscall/tags/whoscall小百科" path="/whoscall/tags/:tag?" :paramsDesc="['標籤，见下表，可在对应標籤页 URL 中找到，默认为最新文章']">

| 防疫也防詐 | 防詐專家 | 來電辨識 | whoscall 日常 |
| ----- | ---- | ---- | ----------- |

</Route>

## WordPress

### 博客

<Route author="Lonor" example="/blogs/wordpress/lawrence.code.blog" path="/blogs/wordpress/:domain/:https?" :paramsDesc="['WordPress 博客域名', '默认 https 协议。填写 `http`或`https`']"/>

## yuzu emulator

### Entry

<Route author="nczitzk" example="/yuzu-emu/entry" path="/yuzu-emu/entry" />

## 阿里云系统组技术博客

### 首页

<Route author="attenuation" example="/aliyun-kernel/index" path="/aliyun-kernel/index"/>

## 财新博客

### 用户博客

<Route author="Maecenas" example="/caixin/blog/zhangwuchang" path="/caixin/blog/:column" :paramsDesc="['博客名称，可在博客主页的 URL 找到']">

通过提取文章全文，以提供比官方源更佳的阅读体验.

</Route>

## 大侠阿木

### 首页

<Route author="kt286" example="/daxiaamu/home" path="/daxiaamu/home"/>

## 大眼仔旭

### 分类

<Route author="nitezs" example="/dayanzai/windows" path="/dayanzai/:category/:fulltext?" :paramsDesc="['分类','是否获取全文，需要获取则传入参数`y`']" radar="1"> 

| 微软应用    | 安卓应用    | 教程资源     | 其他资源  |
| ------- | ------- | -------- | ----- |
| windows | android | tutorial | other |

</Route>

## 華康字型故事

### 博客

<Route author="tpnonthealps" example="/fontstory" path="/fontstory" />

## 建宁闲谈

### 文章

<Route author="changlan" example="/blogs/jianning" path="/blogs/jianning" radar="1" rssbud="1"/>

## 劍心．回憶

### 分类

<Route author="nczitzk" example="/kenshin" path="/kenshin/:category?/:type?" :paramsDesc="['分类，见下表，默认为首页', '子分类，见下表，默认为首页']">

::: tip 提示

如 `藝能新聞` 的 `日劇新聞` 分类，路由为 `/jnews/news_drama`

:::

藝能新聞 jnews

| 日劇新聞       | 日影新聞       | 日樂新聞       | 日藝新聞               |
| ---------- | ---------- | ---------- | ------------------ |
| news_drama | news_movie | news_music | news_entertainment |

| 動漫新聞     | 藝人美照         | 清涼寫真       | 日本廣告 | 其他日聞        |
| -------- | ------------ | ---------- | ---- | ----------- |
| news_acg | artist-photo | photoalbum | jpcm | news_others |

旅遊情報 jpnews

| 日本美食情報      | 日本甜點情報        | 日本零食情報        | 日本飲品情報        | 日本景點情報             |
| ----------- | ------------- | ------------- | ------------- | ------------------ |
| jpnews-food | jpnews-sweets | jpnews-okashi | jpnews-drinks | jpnews-attractions |

| 日本玩樂情報      | 日本住宿情報       | 日本活動情報        | 日本購物情報          | 日本社會情報         |
| ----------- | ------------ | ------------- | --------------- | -------------- |
| jpnews-play | jpnews-hotel | jpnews-events | jpnews-shopping | jpnews-society |

| 日本交通情報         | 日本天氣情報         |
| -------------- | -------------- |
| jpnews-traffic | jpnews-weather |

日劇世界 jdrama

| 每周劇評                | 日劇總評               | 資料情報       |
| ------------------- | ------------------ | ---------- |
| drama_review_weekly | drama_review_final | drama_data |

| 深度日劇       | 收視報告         | 日劇專欄         | 劇迷互動              |
| ---------- | ------------ | ------------ | ----------------- |
| drama_deep | drama_rating | drama_column | drama_interactive |

</Route>

## 敬维博客

### 文章

<Route author="a180285" example="/blogs/jingwei.link" path="/blogs/jingwei.link"/>

## 每日安全

### 推送

<Route author="LogicJake" example="/security/pulses" path="/security/pulses"/>

## 美团技术团队

### 最近更新

<Route author="kt286" example="/meituan/tech/home" path="/meituan/tech/home"/>

## 十年之约

### 文章

<Route author="7Wate" example="/blogs/foreverblog" path="/blogs/foreverblog" />

## 王五四文集

### 文章

<Route author="prnake" example="/blogs/wang54" path="/blogs/wang54/:id?" :paramsDesc="['RSS抓取地址：https://wangwusiwj.blogspot.com/:id?，默认为2020']"/>

## 王垠博客

### 文章

<Route author="junbaor SkiTiSu" example="/blogs/wangyin" path="/blogs/wangyin"/>

## 雨苁博客

### 首页

<Route author="XinRoom" example="/ddosi" path="/ddosi"/>

### 分类

<Route author="XinRoom" example="/ddosi/category/黑客工具" path="/ddosi/category/:category?"/>

## 竹白

### 文章

<Route author="naixy28" example="/zhubai/via" path="/zhubai/:id"  :paramsDesc="['`id` 为竹白主页 url 中的三级域名，如 via.zhubai.love 的 `id` 为 `via`']">

::: tip 提示

在路由末尾处加上 `?limit=限制获取数目` 来限制获取条目数量，默认值为`20`

:::

</Route>
