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

## Gwern Branwen

<Route author="cerebrater" example="/gwern/newest" path="/gwern/:category" :paramsDesc="['網誌主頁的分類訊息']"/>

## Hedwig.pub

<Route author="zwithz" example="/blogs/hedwig/zmd" path="/blogs/hedwig/:type" :paramsDesc="['分类, 见下表']"/>

| 呆唯的 Newsletter | 0neSe7en 的技术周刊 | 地心引力 | 宪学宪卖 | Comeet 每周精选 | 无鸡之谈 | 我有一片芝麻地 |
| ----------------- | ------------------- | -------- | -------- | --------------- | -------- | -------------- |
| hirasawayui       | se7en               | walnut   | themez   | comeet          | sunskyxh | zmd            |

> 原则上只要是 {type}.hedwig.pub 都可以匹配。

## Hexo

### Next 主题博客

<Route author="fengkx" example="/hexo/next/diygod.me" path="/hexo/next/:url" :paramsDesc="['博客 Url 不带协议头']"/>

### Yilia 主题博客

<Route author="aha2mao" example="/hexo/yilia/cloudstone.xin" path="/hexo/yilia/:url" :paramsDesc="['博客 Url 不带协议头']"/>

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

## Paul Graham 博客

通过提取文章全文，提供比官方源更佳的阅读体验。

### Essays

<Route author="Maecenas" example="/blogs/paulgraham" path="/blogs/paulgraham"/>

## Phrack Magazine

### 文章

<Route author="CitrusIce" example="/phrack" path="/phrack" />

## WordPress

<Route author="Lonor" example="/blogs/wordpress/lawrence.code.blog" path="/blogs/wordpress/:domain/:https?" :paramsDesc="['WordPress 博客域名', '默认 https 协议。填写 `http`或`https`']"/>

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

| 日劇新聞   | 日影新聞   | 日樂新聞   | 日藝新聞           |
| ---------- | ---------- | ---------- | ------------------ |
| news_drama | news_movie | news_music | news_entertainment |

| 動漫新聞 | 藝人美照     | 清涼寫真   | 日本廣告 | 其他日聞    |
| -------- | ------------ | ---------- | -------- | ----------- |
| news_acg | artist-photo | photoalbum | jpcm     | news_others |

旅遊情報 jpnews

| 日本美食情報 | 日本甜點情報  | 日本零食情報  | 日本飲品情報  | 日本景點情報       |
| ------------ | ------------- | ------------- | ------------- | ------------------ |
| jpnews-food  | jpnews-sweets | jpnews-okashi | jpnews-drinks | jpnews-attractions |

| 日本玩樂情報 | 日本住宿情報 | 日本活動情報  | 日本購物情報    | 日本社會情報   |
| ------------ | ------------ | ------------- | --------------- | -------------- |
| jpnews-play  | jpnews-hotel | jpnews-events | jpnews-shopping | jpnews-society |

| 日本交通情報   | 日本天氣情報   |
| -------------- | -------------- |
| jpnews-traffic | jpnews-weather |

日劇世界 jdrama

| 每周劇評            | 日劇總評           | 資料情報   |
| ------------------- | ------------------ | ---------- |
| drama_review_weekly | drama_review_final | drama_data |

| 深度日劇   | 收視報告     | 日劇專欄     | 劇迷互動          |
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

## 王五四文集

### 文章

<Route author="prnake" example="/blogs/wang54" path="/blogs/wang54/:id?" :paramsDesc="['RSS抓取地址：https://wangwusiwj.blogspot.com/:id?，默认为2020']"/>

## 王垠博客

### 文章

<Route author="junbaor SkiTiSu" example="/blogs/wangyin" path="/blogs/wangyin"/>
