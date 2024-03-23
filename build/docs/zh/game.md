# 🎮 游戏

## 3DMGame <Site url="3dmgame.com"/>

### 新闻中心 <Site url="3dmgame.com" size="sm" />

<Route namespace="3dmgame" :data='{"path":"/news/:category?","categories":["game"],"example":"/3dmgame/news","parameters":{"category":"分类名或 ID，见下表，默认为新闻推荐，ID 可从分类 URL 中找到，如 Steam 为 `22221`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["3dmgame.com/news/:category?","3dmgame.com/news"]}],"name":"新闻中心","maintainers":["zhboner","lyqluis"],"description":"| 新闻推荐 | 游戏新闻 | 动漫影视 | 智能数码 | 时事焦点    |\n  | -------- | -------- | -------- | -------- | ----------- |\n  |          | game     | acg      | next     | news_36_1 |","location":"news-center.ts"}' />

| 新闻推荐 | 游戏新闻 | 动漫影视 | 智能数码 | 时事焦点    |
  | -------- | -------- | -------- | -------- | ----------- |
  |          | game     | acg      | next     | news_36_1 |

### 游戏资讯 <Site url="3dmgame.com" size="sm" />

<Route namespace="3dmgame" :data='{"path":"/games/:name/:type?","radar":[{"source":["3dmgame.com/games/:name/:type"]}],"name":"游戏资讯","categories":["game"],"maintainers":["sinchang","jacky2001114","HenryQW","lyqluis"],"location":"game.ts"}' />

## 4Gamers <Site url="www.4gamers.com.tw"/>

### Unknown <Site url="www.4gamers.com.tw/news" size="sm" />

<Route namespace="4gamers" :data='{"path":["/","/category/:category"],"radar":[{"source":["www.4gamers.com.tw/news","www.4gamers.com.tw/"],"target":""}],"name":"Unknown","maintainers":["TonyRL"],"url":"www.4gamers.com.tw/news","location":"category.ts"}' />

### Unknown <Site url="www.4gamers.com.tw/news" size="sm" />

<Route namespace="4gamers" :data='{"path":["/","/category/:category"],"radar":[{"source":["www.4gamers.com.tw/news","www.4gamers.com.tw/"],"target":""}],"name":"Unknown","maintainers":["TonyRL"],"url":"www.4gamers.com.tw/news","location":"category.ts"}' />

### 标签 <Site url="www.4gamers.com.tw/news" size="sm" />

<Route namespace="4gamers" :data='{"path":"/tag/:tag","categories":["game"],"example":"/4gamers/tag/限時免費","parameters":{"tag":"标签名，可在标签 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.4gamers.com.tw/news/tag/:tag"]}],"name":"标签","maintainers":["hoilc"],"url":"www.4gamers.com.tw/news","location":"tag.ts"}' />

### 主題 <Site url="www.4gamers.com.tw/news" size="sm" />

<Route namespace="4gamers" :data='{"path":"/topic/:topic","categories":["game"],"example":"/4gamers/topic/gentlemen-topic","parameters":{"topic":"主题，可在首页上方页面内找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.4gamers.com.tw/news/option-cfg/:topic"]}],"name":"主題","maintainers":["bestpika"],"url":"www.4gamers.com.tw/news","location":"topic.ts"}' />

## 5EPLAY <Site url="csgo.5eplay.com"/>

### 新闻列表 <Site url="csgo.5eplay.com/" size="sm" />

<Route namespace="5eplay" :data='{"path":"/article","categories":["game"],"example":"/5eplay/article","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["csgo.5eplay.com/","csgo.5eplay.com/article"]}],"name":"新闻列表","maintainers":["Dlouxgit"],"url":"csgo.5eplay.com/","location":"index.ts"}' />

## Blizzard <Site url="news.blizzard.com"/>

### News <Site url="news.blizzard.com" size="sm" />

<Route namespace="blizzard" :data='{"path":"/news/:language?/:category?","categories":["game"],"example":"/blizzard/news","parameters":{"language":"Language code, see below, en-US by default","category":"Category, see below, All News by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["nczitzk"],"description":"Categories\n\n  | Category               | Slug                |\n  | ---------------------- | ------------------- |\n  | All News               |                     |\n  | Diablo II: Resurrected | diablo2             |\n  | Diablo III             | diablo3             |\n  | Diablo IV              | diablo4             |\n  | Diablo: Immortal       | diablo-immortal     |\n  | Hearthstone            | hearthstone         |\n  | Heroes of the Storm    | heroes-of-the-storm |\n  | Overwatch 2            | overwatch           |\n  | StarCraft: Remastered  | starcraft           |\n  | StarCraft II           | starcraft2          |\n  | World of Warcraft      | world-of-warcraft   |\n  | Warcraft III: Reforged | warcraft3           |\n  | Battle.net             | battlenet           |\n  | BlizzCon               | blizzcon            |\n  | Inside Blizzard        | blizzard            |\n\n  Language codes\n\n  | Language           | Code  |\n  | ------------------ | ----- |\n  | Deutsch            | de-de |\n  | English (US)       | en-us |\n  | English (EU)       | en-gb |\n  | Español (EU)       | es-es |\n  | Español (Latino)   | es-mx |\n  | Français           | fr-fr |\n  | Italiano           | it-it |\n  | Português (Brasil) | pt-br |\n  | Polski             | pl-pl |\n  | Русский            | ru-ru |\n  | 한국어             | ko-kr |\n  | ภาษาไทย            | th-th |\n  | 日本語             | ja-jp |\n  | 繁體中文           | zh-tw |","location":"news.ts"}' />

Categories

  | Category               | Slug                |
  | ---------------------- | ------------------- |
  | All News               |                     |
  | Diablo II: Resurrected | diablo2             |
  | Diablo III             | diablo3             |
  | Diablo IV              | diablo4             |
  | Diablo: Immortal       | diablo-immortal     |
  | Hearthstone            | hearthstone         |
  | Heroes of the Storm    | heroes-of-the-storm |
  | Overwatch 2            | overwatch           |
  | StarCraft: Remastered  | starcraft           |
  | StarCraft II           | starcraft2          |
  | World of Warcraft      | world-of-warcraft   |
  | Warcraft III: Reforged | warcraft3           |
  | Battle.net             | battlenet           |
  | BlizzCon               | blizzcon            |
  | Inside Blizzard        | blizzard            |

  Language codes

  | Language           | Code  |
  | ------------------ | ----- |
  | Deutsch            | de-de |
  | English (US)       | en-us |
  | English (EU)       | en-gb |
  | Español (EU)       | es-es |
  | Español (Latino)   | es-mx |
  | Français           | fr-fr |
  | Italiano           | it-it |
  | Português (Brasil) | pt-br |
  | Polski             | pl-pl |
  | Русский            | ru-ru |
  | 한국어             | ko-kr |
  | ภาษาไทย            | th-th |
  | 日本語             | ja-jp |
  | 繁體中文           | zh-tw |

## Dorohedoro <Site url="dorohedoro.net"/>

### News <Site url="dorohedoro.net/news" size="sm" />

<Route namespace="dorohedoro" :data='{"path":"/news","categories":["game"],"example":"/dorohedoro/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dorohedoro.net/news","dorohedoro.net/"]}],"name":"News","maintainers":["nczitzk"],"url":"dorohedoro.net/news","location":"news.ts"}' />

## Epic Games Store <Site url="store.epicgames.com"/>

### Free games <Site url="store.epicgames.com" size="sm" />

<Route namespace="epicgames" :data='{"path":"/freegames/:locale?/:country?","categories":["game"],"example":"/epicgames/freegames","parameters":{"locale":"Locale, en_US by default","country":"Country, US by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["store.epicgames.com/:locale/free-games"],"target":"/freegames/:locale"}],"name":"Free games","maintainers":["DIYgod","NeverBehave","Zyx-A","junfengP","nczitzk","KotaHv"],"location":"index.ts"}' />

## FINAL FANTASY XIV 最终幻想 14 <Site url="eu.finalfantasyxiv.com"/>

### FINAL FANTASY XIV (The Lodestone) <Site url="eu.finalfantasyxiv.com" size="sm" />

<Route namespace="ff14" :data='{"path":["/global/:lang/:type?","/ff14_global/:lang/:type?"],"categories":["game"],"example":"/ff14/global/na/all","parameters":{"lang":"Region","type":"Category, `all` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"FINAL FANTASY XIV (The Lodestone)","maintainers":["chengyuhui"],"description":"Region\n\n  | North Ameria | Europe | France | Germany | Japan |\n  | ------------ | ------ | ------ | ------- | ----- |\n  | na           | eu     | fr     | de      | jp    |\n\n  Category\n\n  | all | topics | notices | maintenance | updates | status | developers |\n  | --- | ------ | ------- | ----------- | ------- | ------ | ---------- |","location":"ff14-global.ts"}' />

Region

  | North Ameria | Europe | France | Germany | Japan |
  | ------------ | ------ | ------ | ------- | ----- |
  | na           | eu     | fr     | de      | jp    |

  Category

  | all | topics | notices | maintenance | updates | status | developers |
  | --- | ------ | ------- | ----------- | ------- | ------ | ---------- |

### FINAL FANTASY XIV (The Lodestone) <Site url="eu.finalfantasyxiv.com" size="sm" />

<Route namespace="ff14" :data='{"path":["/global/:lang/:type?","/ff14_global/:lang/:type?"],"categories":["game"],"example":"/ff14/global/na/all","parameters":{"lang":"Region","type":"Category, `all` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"FINAL FANTASY XIV (The Lodestone)","maintainers":["chengyuhui"],"description":"Region\n\n  | North Ameria | Europe | France | Germany | Japan |\n  | ------------ | ------ | ------ | ------- | ----- |\n  | na           | eu     | fr     | de      | jp    |\n\n  Category\n\n  | all | topics | notices | maintenance | updates | status | developers |\n  | --- | ------ | ------- | ----------- | ------- | ------ | ---------- |","location":"ff14-global.ts"}' />

Region

  | North Ameria | Europe | France | Germany | Japan |
  | ------------ | ------ | ------ | ------- | ----- |
  | na           | eu     | fr     | de      | jp    |

  Category

  | all | topics | notices | maintenance | updates | status | developers |
  | --- | ------ | ------- | ----------- | ------- | ------ | ---------- |

### 最终幻想 14 国服 <Site url="ff.web.sdo.com/web8/index.html" size="sm" />

<Route namespace="ff14" :data='{"path":["/zh/:type?","/ff14_zh/:type?"],"categories":["game"],"example":"/ff14/zh/news","parameters":{"type":"分类名，预设为 `all`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ff.web.sdo.com/web8/index.html"],"target":"/zh"}],"name":"最终幻想 14 国服","maintainers":["Kiotlin","ZeroClad","15x15G"],"url":"ff.web.sdo.com/web8/index.html","description":"| 新闻 | 公告     | 活动   | 广告      | 所有 |\n  | ---- | -------- | ------ | --------- | ---- |\n  | news | announce | events | advertise | all  |","location":"ff14-zh.ts"}' />

| 新闻 | 公告     | 活动   | 广告      | 所有 |
  | ---- | -------- | ------ | --------- | ---- |
  | news | announce | events | advertise | all  |

### 最终幻想 14 国服 <Site url="ff.web.sdo.com/web8/index.html" size="sm" />

<Route namespace="ff14" :data='{"path":["/zh/:type?","/ff14_zh/:type?"],"categories":["game"],"example":"/ff14/zh/news","parameters":{"type":"分类名，预设为 `all`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ff.web.sdo.com/web8/index.html"],"target":"/zh"}],"name":"最终幻想 14 国服","maintainers":["Kiotlin","ZeroClad","15x15G"],"url":"ff.web.sdo.com/web8/index.html","description":"| 新闻 | 公告     | 活动   | 广告      | 所有 |\n  | ---- | -------- | ------ | --------- | ---- |\n  | news | announce | events | advertise | all  |","location":"ff14-zh.ts"}' />

| 新闻 | 公告     | 活动   | 广告      | 所有 |
  | ---- | -------- | ------ | --------- | ---- |
  | news | announce | events | advertise | all  |

## Fortnite <Site url="fortnite.com"/>

### News <Site url="fortnite.com" size="sm" />

<Route namespace="fortnite" :data='{"path":"/news/:options?","categories":["game"],"example":"/fortnite/news","parameters":{"options":"Params"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["lyqluis"],"description":"-   `options.lang`, optional, language, eg. `/fortnite/news/lang=en-US`, common languages are listed below, more languages are available one the [official website](https://www.fortnite.com/news)\n\n  | English (default) | Spanish | Japanese | French | Korean | Polish |\n  | ----------------- | ------- | -------- | ------ | ------ | ------ |\n  | en-US             | es-ES   | ja       | fr     | ko     | pl     |","location":"news.ts"}' />

-   `options.lang`, optional, language, eg. `/fortnite/news/lang=en-US`, common languages are listed below, more languages are available one the [official website](https://www.fortnite.com/news)

  | English (default) | Spanish | Japanese | French | Korean | Polish |
  | ----------------- | ------- | -------- | ------ | ------ | ------ |
  | en-US             | es-ES   | ja       | fr     | ko     | pl     |

## Gamer Secret <Site url="gamersecret.com"/>

### Category <Site url="gamersecret.com" size="sm" />

<Route namespace="gamersecret" :data='{"path":"/:type?/:category?","categories":["game"],"example":"/gamersecret","parameters":{"type":"Type, see below, Latest News by default","category":"Category, see below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gamersecret.com/:type","gamersecret.com/:type/:category","gamersecret.com/"]}],"name":"Category","maintainers":["nczitzk"],"description":"| Latest News | PC | Playstation | Nintendo | Xbox | Moblie |\n  | ----------- | -- | ----------- | -------- | ---- | ------ |\n  | latest-news | pc | playstation | nintendo | xbox | moblie |\n\n  Or\n\n  | GENERAL          | GENERAL EN         | MOBILE          | MOBILE EN         |\n  | ---------------- | ------------------ | --------------- | ----------------- |\n  | category/general | category/generalen | category/mobile | category/mobileen |\n\n  | NINTENDO          | NINTENDO EN         | PC          | PC EN         |\n  | ----------------- | ------------------- | ----------- | ------------- |\n  | category/nintendo | category/nintendoen | category/pc | category/pcen |\n\n  | PLAYSTATION          | PLAYSTATION EN         | REVIEWS          |\n  | -------------------- | ---------------------- | ---------------- |\n  | category/playstation | category/playstationen | category/reviews |\n\n  | XBOX          | XBOX EN         |\n  | ------------- | --------------- |\n  | category/xbox | category/xboxen |","location":"index.ts"}' />

| Latest News | PC | Playstation | Nintendo | Xbox | Moblie |
  | ----------- | -- | ----------- | -------- | ---- | ------ |
  | latest-news | pc | playstation | nintendo | xbox | moblie |

  Or

  | GENERAL          | GENERAL EN         | MOBILE          | MOBILE EN         |
  | ---------------- | ------------------ | --------------- | ----------------- |
  | category/general | category/generalen | category/mobile | category/mobileen |

  | NINTENDO          | NINTENDO EN         | PC          | PC EN         |
  | ----------------- | ------------------- | ----------- | ------------- |
  | category/nintendo | category/nintendoen | category/pc | category/pcen |

  | PLAYSTATION          | PLAYSTATION EN         | REVIEWS          |
  | -------------------- | ---------------------- | ---------------- |
  | category/playstation | category/playstationen | category/reviews |

  | XBOX          | XBOX EN         |
  | ------------- | --------------- |
  | category/xbox | category/xboxen |

## HoYoLAB <Site url="hoyolab.com"/>

### Official Announcement <Site url="hoyolab.com" size="sm" />

<Route namespace="hoyolab" :data='{"path":"/news/:language/:gids/:type","categories":["game"],"example":"/hoyolab/news/zh-cn/2/2","parameters":{"language":"Language","gids":"Game ID","type":"Announcement type"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Official Announcement","maintainers":["ZenoTian"],"description":"| Language         | Code  |\n  | ---------------- | ----- |\n  | 简体中文         | zh-cn |\n  | 繁體中文         | zh-tw |\n  | 日本語           | ja-jp |\n  | 한국어           | ko-kr |\n  | English (US)     | en-us |\n  | Español (EU)     | es-es |\n  | Français         | fr-fr |\n  | Deutsch          | de-de |\n  | Русский          | ru-ru |\n  | Português        | pt-pt |\n  | Español (Latino) | es-mx |\n  | Indonesia        | id-id |\n  | Tiếng Việt       | vi-vn |\n  | ภาษาไทย          | th-th |\n\n  | Honkai Impact 3rd | Genshin Impact | Tears of Themis | HoYoLAB | Honkai: Star Rail | Zenless Zone Zero |\n  | ----------------- | -------------- | --------------- | ------- | ----------------- | ----------------- |\n  | 1                 | 2              | 4               | 5       | 6                 | 8                 |\n\n  | Notices | Events | Info |\n  | ------- | ------ | ---- |\n  | 1       | 2      | 3    |","location":"news.ts"}' />

| Language         | Code  |
  | ---------------- | ----- |
  | 简体中文         | zh-cn |
  | 繁體中文         | zh-tw |
  | 日本語           | ja-jp |
  | 한국어           | ko-kr |
  | English (US)     | en-us |
  | Español (EU)     | es-es |
  | Français         | fr-fr |
  | Deutsch          | de-de |
  | Русский          | ru-ru |
  | Português        | pt-pt |
  | Español (Latino) | es-mx |
  | Indonesia        | id-id |
  | Tiếng Việt       | vi-vn |
  | ภาษาไทย          | th-th |

  | Honkai Impact 3rd | Genshin Impact | Tears of Themis | HoYoLAB | Honkai: Star Rail | Zenless Zone Zero |
  | ----------------- | -------------- | --------------- | ------- | ----------------- | ----------------- |
  | 1                 | 2              | 4               | 5       | 6                 | 8                 |

  | Notices | Events | Info |
  | ------- | ------ | ---- |
  | 1       | 2      | 3    |

## indienova 独立游戏 <Site url="indienova.com"/>

### Unknown <Site url="indienova.com" size="sm" />

<Route namespace="indienova" :data='{"path":"/gamedb/recent","name":"Unknown","maintainers":["TonyRL"],"location":"gamedb.ts"}' />

### 会员开发游戏库 <Site url="indienova.com/usergames" size="sm" />

<Route namespace="indienova" :data='{"path":"/usergames","categories":["game"],"example":"/indienova/usergames","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["indienova.com/usergames","indienova.com/"]}],"name":"会员开发游戏库","maintainers":["TonyRL"],"url":"indienova.com/usergames","location":"usergames.ts"}' />

### 文章 <Site url="indienova.com" size="sm" />

<Route namespace="indienova" :data='{"path":"/:type","categories":["game"],"example":"/indienova/article","parameters":{"type":"类型: `article` 文章，`development` 开发"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文章","maintainers":["GensouSakuya","kt286"],"location":"article.ts"}' />

### 专题 <Site url="indienova.com" size="sm" />

<Route namespace="indienova" :data='{"path":"/column/:columnId","categories":["game"],"example":"/indienova/column/52","parameters":{"columnId":"专题 ID，可在 URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["indienova.com/column/:columnId"]}],"name":"专题","maintainers":["TonyRL"],"description":"<details>\n    <summary>专题 ID</summary>\n\n    游戏推荐\n\n    | itch 一周游戏汇 | 一周值得关注的发售作品 | 诺娃速递 | 周末游戏视频集锦 | 每月媒体评分 | 年度最佳游戏 | Indie Focus 近期新游 | indienova Picks 精选 |\n    | --------------- | ---------------------- | -------- | ---------------- | ------------ | ------------ | -------------------- | -------------------- |\n    | 52              | 29                     | 41       | 43               | 45           | 39           | 1                    | 8                    |\n\n    游戏评论\n\n    | 游必有方 Podcast | 独立游戏潮（RED） |\n    | ---------------- | ----------------- |\n    | 6                | 3                 |\n\n    游戏开发\n\n    | 游戏设计模式 | Roguelike 开发 | GMS 中文教程 |\n    | ------------ | -------------- | ------------ |\n    | 15           | 14             | 7            |\n\n    游戏设计\n\n    | 游戏与所有 | 让人眼前一亮的游戏设计 | 游戏音乐分析 | 游戏情感设计 | 游戏相关书籍 | 游戏设计课程笔记 | 游戏设计工具 | 游戏设计灵感 | 设计师谈设计 | 游戏研究方法 | 功能游戏 | 游戏设计专业院校 | 像素课堂 |\n    | ---------- | ---------------------- | ------------ | ------------ | ------------ | ---------------- | ------------ | ------------ | ------------ | ------------ | -------- | ---------------- | -------- |\n    | 10         | 33                     | 17           | 4            | 22           | 11               | 24           | 26           | 27           | 28           | 38       | 9                | 19       |\n\n    游戏文化\n\n    | NOVA 海外独立游戏见闻 | 工作室访谈 | indie Figure 游戏人 | 游戏艺术家 | 独立游戏音乐欣赏 | 游戏瑰宝 | 电脑 RPG 游戏史 | ALT. CTRL. GAMING |\n    | --------------------- | ---------- | ------------------- | ---------- | ---------------- | -------- | --------------- | ----------------- |\n    | 53                    | 23         | 5                   | 44         | 18               | 21       | 16              | 2                 |\n\n    Game Jam\n\n    | Ludum Dare | Global Game Jam |\n    | ---------- | --------------- |\n    | 31         | 13              |\n  </details>","location":"column.ts"}' />

<details>
    <summary>专题 ID</summary>

    游戏推荐

    | itch 一周游戏汇 | 一周值得关注的发售作品 | 诺娃速递 | 周末游戏视频集锦 | 每月媒体评分 | 年度最佳游戏 | Indie Focus 近期新游 | indienova Picks 精选 |
    | --------------- | ---------------------- | -------- | ---------------- | ------------ | ------------ | -------------------- | -------------------- |
    | 52              | 29                     | 41       | 43               | 45           | 39           | 1                    | 8                    |

    游戏评论

    | 游必有方 Podcast | 独立游戏潮（RED） |
    | ---------------- | ----------------- |
    | 6                | 3                 |

    游戏开发

    | 游戏设计模式 | Roguelike 开发 | GMS 中文教程 |
    | ------------ | -------------- | ------------ |
    | 15           | 14             | 7            |

    游戏设计

    | 游戏与所有 | 让人眼前一亮的游戏设计 | 游戏音乐分析 | 游戏情感设计 | 游戏相关书籍 | 游戏设计课程笔记 | 游戏设计工具 | 游戏设计灵感 | 设计师谈设计 | 游戏研究方法 | 功能游戏 | 游戏设计专业院校 | 像素课堂 |
    | ---------- | ---------------------- | ------------ | ------------ | ------------ | ---------------- | ------------ | ------------ | ------------ | ------------ | -------- | ---------------- | -------- |
    | 10         | 33                     | 17           | 4            | 22           | 11               | 24           | 26           | 27           | 28           | 38       | 9                | 19       |

    游戏文化

    | NOVA 海外独立游戏见闻 | 工作室访谈 | indie Figure 游戏人 | 游戏艺术家 | 独立游戏音乐欣赏 | 游戏瑰宝 | 电脑 RPG 游戏史 | ALT. CTRL. GAMING |
    | --------------------- | ---------- | ------------------- | ---------- | ---------------- | -------- | --------------- | ----------------- |
    | 53                    | 23         | 5                   | 44         | 18               | 21       | 16              | 2                 |

    Game Jam

    | Ludum Dare | Global Game Jam |
    | ---------- | --------------- |
    | 31         | 13              |
  </details>

## itch.io <Site url="itch.io"/>

### Developer Logs <Site url="itch.io" size="sm" />

<Route namespace="itch" :data='{"path":"/devlog/:user/:id","categories":["game"],"example":"/itch/devlog/teamterrible/the-baby-in-yellow","parameters":{"user":"User id, can be found in URL","id":"Item id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Developer Logs","maintainers":["nczitzk"],"description":"`User id` is the field before `.itch.io` in the URL of the corresponding page, e.g. the URL of [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is `https://teamterrible.itch.io/the-baby-in-yellow/devlog`, where the field before `.itch.io` is `teamterrible`.\n\n  `Item id` is the field between `itch.io` and `/devlog` in the URL of the corresponding page, e.g. the URL for [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is `https://teamterrible.itch.io/the-baby-in-yellow/devlog`, where the field between `itch.io` and `/devlog` is `the-baby-in-yellow`.\n\n  So the route is [`/itch/devlogs/teamterrible/the-baby-in-yellow`](https://rsshub.app/itch/devlogs/teamterrible/the-baby-in-yellow).","location":"devlog.ts"}' />

`User id` is the field before `.itch.io` in the URL of the corresponding page, e.g. the URL of [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is `https://teamterrible.itch.io/the-baby-in-yellow/devlog`, where the field before `.itch.io` is `teamterrible`.

  `Item id` is the field between `itch.io` and `/devlog` in the URL of the corresponding page, e.g. the URL for [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is `https://teamterrible.itch.io/the-baby-in-yellow/devlog`, where the field between `itch.io` and `/devlog` is `the-baby-in-yellow`.

  So the route is [`/itch/devlogs/teamterrible/the-baby-in-yellow`](https://rsshub.app/itch/devlogs/teamterrible/the-baby-in-yellow).

### Posts <Site url="itch.io" size="sm" />

<Route namespace="itch" :data='{"path":"/posts/:topic/:id","categories":["game"],"example":"/itch/posts/9539/introduce-yourself","parameters":{"topic":"Topic id, can be found in URL","id":"Topic name, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["itch.io/t/:topic/:id"]}],"name":"Posts","maintainers":["nczitzk"],"location":"posts.ts"}' />

### Unknown <Site url="itch.io" size="sm" />

<Route namespace="itch" :data='{"path":"*","name":"Unknown","maintainers":[],"location":"index.ts"}' />

## JUMP <Site url="switch.jumpvg.com"/>

### 游戏折扣 <Site url="switch.jumpvg.com" size="sm" />

<Route namespace="jump" :data='{"path":"/discount/:platform/:filter?/:countries?","categories":["game"],"example":"/jump/discount/ps5/all","parameters":{"platform":"平台:switch,ps4,ps5,xbox,steam,epic","filter":"过滤参数,all-全部，jx-精选，sd-史低，dl-独立，vip-会员","countries":"地区，具体支持较多，可自信查看地区简写"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"游戏折扣","maintainers":["zytomorrow"],"description":"| switch | ps4  | ps5  | xbox   | steam | epic   |\n  | ------ | ---- | ---- | ------ | ----- | ------ |\n  | 可用   | 可用 | 可用 | 不可用 | 可用  | 不可用 |\n\n  | filter | switch | ps4 | ps5 | steam |\n  | ------ | ------ | --- | --- | ----- |\n  | all    | ✔     | ✔  | ✔  | ✔    |\n  | jx     | ✔     | ✔  | ❌  | ✔    |\n  | sd     | ✔     | ✔  | ✔  | ✔    |\n  | dl     | ❌     | ✔  | ❌  | ✔    |\n  | vip    | ❌     | ❌  | ✔  | ❌    |\n\n  | 北美 | 欧洲（英语） | 法国 | 德国 | 日本 |\n  | ---- | ------------ | ---- | ---- | ---- |\n  | na   | eu           | fr   | de   | jp   |","location":"discount.ts"}' />

| switch | ps4  | ps5  | xbox   | steam | epic   |
  | ------ | ---- | ---- | ------ | ----- | ------ |
  | 可用   | 可用 | 可用 | 不可用 | 可用  | 不可用 |

  | filter | switch | ps4 | ps5 | steam |
  | ------ | ------ | --- | --- | ----- |
  | all    | ✔     | ✔  | ✔  | ✔    |
  | jx     | ✔     | ✔  | ❌  | ✔    |
  | sd     | ✔     | ✔  | ✔  | ✔    |
  | dl     | ❌     | ✔  | ❌  | ✔    |
  | vip    | ❌     | ❌  | ✔  | ❌    |

  | 北美 | 欧洲（英语） | 法国 | 德国 | 日本 |
  | ---- | ------------ | ---- | ---- | ---- |
  | na   | eu           | fr   | de   | jp   |

## Liquipedia <Site url="liquipedia.net"/>

### Dota2 战队最近比赛结果 <Site url="liquipedia.net" size="sm" />

<Route namespace="liquipedia" :data='{"path":"/dota2/matches/:id","categories":["game"],"example":"/liquipedia/dota2/matches/Team_Aster","parameters":{"id":"战队名称，可在url中找到。例如:https://liquipedia.net/dota2/Team_Aster"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["liquipedia.net/dota2/:id"]}],"name":"Dota2 战队最近比赛结果","maintainers":["wzekin"],"location":"dota2-matches.ts"}' />

### Unknown <Site url="liquipedia.net" size="sm" />

<Route namespace="liquipedia" :data='{"path":"/counterstrike/matches/:team","radar":[{"source":["liquipedia.net/counterstrike/:id/Matches","liquipedia.net/dota2/:id"],"target":"/counterstrike/matches/:id"}],"name":"Unknown","maintainers":["CookiePieWw"],"location":"cs-matches.ts"}' />

## Minecraft <Site url="minecraft.net"/>

### Java Game Update <Site url="minecraft.net/" size="sm" />

<Route namespace="minecraft" :data='{"path":"/version","categories":["game"],"example":"/minecraft/version","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["minecraft.net/"]}],"name":"Java Game Update","maintainers":["TheresaQWQ"],"url":"minecraft.net/","location":"version.ts"}' />

## Modrinth <Site url="modrinth.com"/>

### Project versions <Site url="modrinth.com" size="sm" />

<Route namespace="modrinth" :data='{"path":"/project/:id/versions/:routeParams?","categories":["game"],"example":"/modrinth/project/sodium/versions","parameters":{"id":"Id or slug of the Modrinth project","routeParams":"Extra route params. See the table below for options"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["modrinth.com/mod/:id/*","modrinth.com/plugin/:id/*","modrinth.com/datapack/:id/*","modrinth.com/shader/:id/*","modrinth.com/resourcepack/:id/*","modrinth.com/modpack/:id/*","modrinth.com/mod/:id","modrinth.com/plugin/:id","modrinth.com/datapack/:id","modrinth.com/shader/:id","modrinth.com/resourcepack/:id","modrinth.com/modpack/:id"],"target":"/project/:id/versions"}],"name":"Project versions","maintainers":["SettingDust"],"description":"| Name           | Example                                      |\n| -------------- | -------------------------------------------- |\n| loaders        | loaders=fabric&loaders=quilt&loaders=forge |\n| game_versions | game_versions=1.20.1&game_versions=1.20.2 |\n| featured       | featured=true                                |","location":"versions.ts"}' />

| Name           | Example                                      |
| -------------- | -------------------------------------------- |
| loaders        | loaders=fabric&loaders=quilt&loaders=forge |
| game_versions | game_versions=1.20.1&game_versions=1.20.2 |
| featured       | featured=true                                |

## Nintendo <Site url="nintendo.com"/>

### Nintendo Direct <Site url="nintendo.com/nintendo-direct/archive" size="sm" />

<Route namespace="nintendo" :data='{"path":"/direct","categories":["game"],"example":"/nintendo/direct","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nintendo.com/nintendo-direct/archive","nintendo.com/"]}],"name":"Nintendo Direct","maintainers":["HFO4"],"url":"nintendo.com/nintendo-direct/archive","location":"direct.ts"}' />

### News（Hong Kong only） <Site url="nintendo.com.hk/topics" size="sm" />

<Route namespace="nintendo" :data='{"path":"/news","categories":["game"],"example":"/nintendo/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nintendo.com.hk/topics","nintendo.com.hk/"]}],"name":"News（Hong Kong only）","maintainers":["HFO4"],"url":"nintendo.com.hk/topics","location":"news.ts"}' />

### Switch System Update（Japan） <Site url="nintendo.co.jp/support/switch/system_update/index.html" size="sm" />

<Route namespace="nintendo" :data='{"path":"/system-update","categories":["game"],"example":"/nintendo/system-update","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nintendo.co.jp/support/switch/system_update/index.html","nintendo.co.jp/"]}],"name":"Switch System Update（Japan）","maintainers":["hoilc"],"url":"nintendo.co.jp/support/switch/system_update/index.html","location":"system-update.ts"}' />

### Unknown <Site url="nintendoswitch.com.cn/software" size="sm" />

<Route namespace="nintendo" :data='{"path":"/eshop/cn","radar":[{"source":["nintendoswitch.com.cn/software","nintendoswitch.com.cn/"]}],"name":"Unknown","maintainers":[],"url":"nintendoswitch.com.cn/software","location":"eshop-cn.ts"}' />

### Unknown <Site url="nintendo.com.hk/software/switch" size="sm" />

<Route namespace="nintendo" :data='{"path":"/eshop/hk","radar":[{"source":["nintendo.com.hk/software/switch","nintendo.com.hk/"]}],"name":"Unknown","maintainers":[],"url":"nintendo.com.hk/software/switch","location":"eshop-hk.ts"}' />

### Unknown <Site url="nintendo.co.jp/software/switch/index.html" size="sm" />

<Route namespace="nintendo" :data='{"path":"/eshop/jp","radar":[{"source":["nintendo.co.jp/software/switch/index.html","nintendo.co.jp/"]}],"name":"Unknown","maintainers":[],"url":"nintendo.co.jp/software/switch/index.html","location":"eshop-jp.ts"}' />

### Unknown <Site url="nintendo.com/store/games" size="sm" />

<Route namespace="nintendo" :data='{"path":"/eshop/us","radar":[{"source":["nintendo.com/store/games","nintendo.com/"]}],"name":"Unknown","maintainers":[],"url":"nintendo.com/store/games","location":"eshop-us.ts"}' />

### 首页资讯（中国） <Site url="nintendoswitch.com.cn/" size="sm" />

<Route namespace="nintendo" :data='{"path":"/news/china","categories":["game"],"example":"/nintendo/news/china","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nintendoswitch.com.cn/"]}],"name":"首页资讯（中国）","maintainers":["NeverBehave"],"url":"nintendoswitch.com.cn/","location":"news-china.ts"}' />

## osu! <Site url="osu.ppy.sh"/>

### Beatmap Packs <Site url="osu.ppy.sh" size="sm" />

<Route namespace="osu" :data='{"path":"/packs/:type?","categories":["game"],"example":"/osu/packs","parameters":{"type":"pack type, default to `standard`, can choose from `featured`, `tournament`, `loved`, `chart`, `theme` and `artist`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Beatmap Packs","maintainers":["JimenezLi"],"location":"beatmaps/packs.ts"}' />

## PRINCESS CONNECT! Re Dive プリンセスコネクト！Re Dive <Site url="priconne-redive.jp"/>

### 最新公告 <Site url="priconne-redive.jp/news" size="sm" />

<Route namespace="priconne-redive" :data='{"path":"/news/:server?","categories":["game"],"example":"/priconne-redive/news","parameters":{"server":"服务器，默认日服"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["priconne-redive.jp/news"],"target":"/news/jp"},{"source":["princessconnect.so-net.tw/news"],"target":"/news/zh-tw"},{"source":["game.bilibili.com/pcr/news.html"],"target":"/news/zh-cn"}],"name":"最新公告","maintainers":["SayaSS","frankcwl"],"url":"priconne-redive.jp/news","description":"服务器\n\n  | 国服  | 台服  | 日服  |\n  | ----- | ----- | ---- |\n  | zh-cn | zh-tw | jp   |","location":"news.ts"}' />

服务器

  | 国服  | 台服  | 日服  |
  | ----- | ----- | ---- |
  | zh-cn | zh-tw | jp   |

## PlayStation Store <Site url="www.playstation.com"/>

### PlayStation Monthly Games <Site url="www.playstation.com/en-sg/ps-plus/whats-new" size="sm" />

<Route namespace="ps" :data='{"path":"/monthly-games","categories":["game"],"example":"/ps/monthly-games","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.playstation.com/en-sg/ps-plus/whats-new"]}],"name":"PlayStation Monthly Games","maintainers":["justjustCC"],"url":"www.playstation.com/en-sg/ps-plus/whats-new","location":"monthly-games.ts"}' />

### PlayStation Network user trophy <Site url="www.playstation.com" size="sm" />

<Route namespace="ps" :data='{"path":"/trophy/:id","categories":["game"],"example":"/ps/trophy/DIYgod_","parameters":{"id":"User ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"PlayStation Network user trophy","maintainers":["DIYgod"],"location":"trophy.ts"}' />

## SEGA <Site url="pjsekai.sega.jp"/>

### maimai DX Japanese Ver. News <Site url="info-maimai.sega.jp/" size="sm" />

<Route namespace="sega" :data='{"path":"/maimaidx/news","categories":["game"],"example":"/sega/maimaidx/news","radar":[{"source":["info-maimai.sega.jp/"]}],"name":"maimai DX Japanese Ver. News","maintainers":["randompasser"],"url":"info-maimai.sega.jp/","location":"maimaidx.ts"}' />

### 世界计划 多彩舞台 ｜ ProjectSekai ｜ プロセカ <Site url="pjsekai.sega.jp/news/index.html" size="sm" />

<Route namespace="sega" :data='{"path":"/pjsekai/news","categories":["game"],"example":"/sega/pjsekai/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["pjsekai.sega.jp/news/index.html"]}],"name":"世界计划 多彩舞台 ｜ ProjectSekai ｜ プロセカ","maintainers":["15x15G"],"url":"pjsekai.sega.jp/news/index.html","location":"pjsekai.ts"}' />

## Steam <Site url="store.steampowered.com"/>

### Store Search <Site url="store.steampowered.com" size="sm" />

<Route namespace="steam" :data='{"path":"/search/:params","categories":["game"],"example":"/steam/search/sort_by=Released_DESC&tags=492&category1=10&os=linux","parameters":{"params":"Query parameters for a Steam Store search."},"radar":[{"source":["store.steampowered.com","store.steampowered.com/search/:params"]}],"name":"Store Search","maintainers":["moppman"],"location":"search.ts"}' />

## TapTap 中国 <Site url="taptap.com"/>

:::warning
由于区域限制，需要在有国内 IP 的机器上自建才能正常获取 RSS。而对于《TapTap 国际版》则需要部署在具有海外出口的 IP 上才可正常获取 RSS。
:::

### 游戏更新 <Site url="taptap.com" size="sm" />

<Route namespace="taptap" :data='{"path":["/changelog/:id/:lang?","/intl/changelog/:id/:lang?"],"categories":["game"],"example":"/taptap/changelog/60809/en_US","parameters":{"id":"游戏 ID，游戏主页 URL 中获取","lang":"语言，默认使用 `zh_CN`，亦可使用 `en_US`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taptap.com/app/:id"],"target":"/changelog/:id"}],"name":"游戏更新","maintainers":["hoilc","ETiV"],"description":"#### 语言代码\n\n  | English (US) | 繁體中文 | 한국어 | 日本語 |\n  | ------------ | -------- | ------ | ------ |\n  | en_US       | zh_TW   | ko_KR | ja_JP |","location":"changelog.ts"}' />

#### 语言代码

  | English (US) | 繁體中文 | 한국어 | 日本語 |
  | ------------ | -------- | ------ | ------ |
  | en_US       | zh_TW   | ko_KR | ja_JP |

### 游戏更新 <Site url="taptap.com" size="sm" />

<Route namespace="taptap" :data='{"path":["/changelog/:id/:lang?","/intl/changelog/:id/:lang?"],"categories":["game"],"example":"/taptap/changelog/60809/en_US","parameters":{"id":"游戏 ID，游戏主页 URL 中获取","lang":"语言，默认使用 `zh_CN`，亦可使用 `en_US`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taptap.com/app/:id"],"target":"/changelog/:id"}],"name":"游戏更新","maintainers":["hoilc","ETiV"],"description":"#### 语言代码\n\n  | English (US) | 繁體中文 | 한국어 | 日本語 |\n  | ------------ | -------- | ------ | ------ |\n  | en_US       | zh_TW   | ko_KR | ja_JP |","location":"changelog.ts"}' />

#### 语言代码

  | English (US) | 繁體中文 | 한국어 | 日本語 |
  | ------------ | -------- | ------ | ------ |
  | en_US       | zh_TW   | ko_KR | ja_JP |

### 游戏评价 <Site url="taptap.com" size="sm" />

<Route namespace="taptap" :data='{"path":["/review/:id/:order?/:lang?","/intl/review/:id/:order?/:lang?"],"categories":["game"],"example":"/taptap/review/142793/hot","parameters":{"id":"游戏 ID，游戏主页 URL 中获取","order":"排序方式，空为默认排序，可选如下","lang":"语言，`zh-CN`或`zh-TW`，默认为`zh-CN`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taptap.com/app/:id/review","taptap.com/app/:id"],"target":"/review/:id"}],"name":"游戏评价","maintainers":["hoilc","TonyRL"],"description":"| 最新   | 最热 | 游戏时长 | 默认排序 |\n  | ------ | ---- | -------- | -------- |\n  | update | hot  | spent    | default  |","location":"review.ts"}' />

| 最新   | 最热 | 游戏时长 | 默认排序 |
  | ------ | ---- | -------- | -------- |
  | update | hot  | spent    | default  |

### 游戏评价 <Site url="taptap.com" size="sm" />

<Route namespace="taptap" :data='{"path":["/review/:id/:order?/:lang?","/intl/review/:id/:order?/:lang?"],"categories":["game"],"example":"/taptap/review/142793/hot","parameters":{"id":"游戏 ID，游戏主页 URL 中获取","order":"排序方式，空为默认排序，可选如下","lang":"语言，`zh-CN`或`zh-TW`，默认为`zh-CN`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taptap.com/app/:id/review","taptap.com/app/:id"],"target":"/review/:id"}],"name":"游戏评价","maintainers":["hoilc","TonyRL"],"description":"| 最新   | 最热 | 游戏时长 | 默认排序 |\n  | ------ | ---- | -------- | -------- |\n  | update | hot  | spent    | default  |","location":"review.ts"}' />

| 最新   | 最热 | 游戏时长 | 默认排序 |
  | ------ | ---- | -------- | -------- |
  | update | hot  | spent    | default  |

### 游戏论坛 <Site url="taptap.com" size="sm" />

<Route namespace="taptap" :data='{"path":"/topic/:id/:type?/:sort?/:lang?","categories":["game"],"example":"/taptap/topic/142793/official","parameters":{"id":"游戏 ID，游戏主页 URL 中获取","type":"论坛版块，默认显示所有帖子，论坛版块 URL 中 `type` 参数，见下表，默认为 `feed`","sort":"排序，见下表，默认为 `created`","lang":"语言，`zh-CN`或`zh-TW`，默认为`zh-CN`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taptap.com/app/:id/topic","taptap.com/app/:id"],"target":"/topic/:id"}],"name":"游戏论坛","maintainers":["hoilc","TonyRL"],"description":"| 全部 | 精华  | 官方     | 影片  |\n  | ---- | ----- | -------- | ----- |\n  | feed | elite | official | video |\n\n  | 发布时间 | 回复时间  |\n  | -------- | --------- |\n  | created  | commented |","location":"topic.ts"}' />

| 全部 | 精华  | 官方     | 影片  |
  | ---- | ----- | -------- | ----- |
  | feed | elite | official | video |

  | 发布时间 | 回复时间  |
  | -------- | --------- |
  | created  | commented |

## War Thunder <Site url="warthunder.com"/>

### News <Site url="warthunder.com/en/news" size="sm" />

<Route namespace="warthunder" :data='{"path":"/news","categories":["game"],"example":"/warthunder/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["warthunder.com/en/news","warthunder.com/"]}],"name":"News","maintainers":["axojhf"],"url":"warthunder.com/en/news","description":"News data from [https://warthunder.com/en/news/](https://warthunder.com/en/news/)\n  The year, month and day provided under UTC time zone are the same as the official website, so please ignore the specific time!!!","location":"news.ts"}' />

News data from [https://warthunder.com/en/news/](https://warthunder.com/en/news/)
  The year, month and day provided under UTC time zone are the same as the official website, so please ignore the specific time!!!

## 电玩巴士 TGBUS <Site url="tgbus.com"/>

### 文章列表 <Site url="tgbus.com" size="sm" />

<Route namespace="tgbus" :data='{"path":"/list/:category","parameters":{"category":"列表分类，见下表"},"categories":["game"],"example":"/tgbus/list/news","radar":[{"source":["www.tgbus.com/list/:category/"],"target":"/list/:category"}],"name":"文章列表","maintainers":["Xzonn"],"description":"| 最新资讯 | 游戏评测 | 游戏视频 | 巴士首页特稿 | 硬件资讯 |\n    | -------- | -------- | -------- | ------------ | -------- |\n    | news     | review   | video    | special      | hardware |","location":"list.ts"}' />

| 最新资讯 | 游戏评测 | 游戏视频 | 巴士首页特稿 | 硬件资讯 |
    | -------- | -------- | -------- | ------------ | -------- |
    | news     | review   | video    | special      | hardware |

## 二柄 APP <Site url="diershoubing.com"/>

### 新闻 <Site url="diershoubing.com/" size="sm" />

<Route namespace="diershoubing" :data='{"path":"/news","categories":["game"],"example":"/diershoubing/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["diershoubing.com/"]}],"name":"新闻","maintainers":["wushijishan"],"url":"diershoubing.com/","location":"news.ts"}' />

## 盒心光环 <Site url="xboxfan.com"/>

### 资讯 <Site url="xboxfan.com/" size="sm" />

<Route namespace="xboxfan" :data='{"path":"/news","categories":["game"],"example":"/xboxfan/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xboxfan.com/"]}],"name":"资讯","maintainers":["XXY233"],"url":"xboxfan.com/","location":"news.ts"}' />

## 旅法师营地 <Site url="www.iyingdi.com"/>

### Unknown <Site url="www.iyingdi.com" size="sm" />

<Route namespace="lfsyd" :data='{"path":"/tag/:tagId?","radar":[{"source":["mob.iyingdi.com/fine/:tagId"],"target":"/tag/:tagId"}],"name":"Unknown","maintainers":["auto-bot-ty"],"location":"tag.ts"}' />

### Unknown <Site url="www.iyingdi.com" size="sm" />

<Route namespace="lfsyd" :data='{"path":"/user/:id?","radar":[{"source":["www.iyingdi.com/tz/people/:id","www.iyingdi.com/tz/people/:id/*"],"target":"/user/:id"}],"name":"Unknown","maintainers":["auto-bot-ty"],"location":"user.ts"}' />

### 首页 <Site url="www.iyingdi.com/" size="sm" />

<Route namespace="lfsyd" :data='{"path":"/home","categories":["game"],"example":"/lfsyd/home","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.iyingdi.com/"]}],"name":"首页","maintainers":["auto-bot-ty"],"url":"www.iyingdi.com/","location":"home.ts"}' />

### 首页（旧版） <Site url="www.iyingdi.com/" size="sm" />

<Route namespace="lfsyd" :data='{"path":"/old_home","categories":["game"],"example":"/lfsyd/old_home","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.iyingdi.com/"]}],"name":"首页（旧版）","maintainers":["auto-bot-ty"],"url":"www.iyingdi.com/","location":"old-home.ts"}' />

## 米哈游 <Site url="genshin.hoyoverse.com"/>

### 崩坏：星穹铁道 <Site url="sr.mihoyo.com/news" size="sm" />

<Route namespace="mihoyo" :data='{"path":"/sr/:location?/:category?","categories":["game"],"example":"/mihoyo/sr","parameters":{"location":"区域，可选 `zh-cn`（国服，简中）或 `zh-tw`（国际服，繁中）","category":"分类，见下表，默认为最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sr.mihoyo.com/news"],"target":"/sr"}],"name":"崩坏：星穹铁道","maintainers":["shinanory"],"url":"sr.mihoyo.com/news","description":"#### 新闻 {#mi-ha-you-beng-huai-xing-qiong-tie-dao-xin-wen}\n\n  | 最新     | 新闻 | 公告   | 活动     |\n  | -------- | ---- | ------ | -------- |\n  | news-all | news | notice | activity |","location":"sr/news.ts"}' />

#### 新闻 {#mi-ha-you-beng-huai-xing-qiong-tie-dao-xin-wen}

  | 最新     | 新闻 | 公告   | 活动     |
  | -------- | ---- | ------ | -------- |
  | news-all | news | notice | activity |

### 米游社 - 用户关注 <Site url="genshin.hoyoverse.com" size="sm" />

<Route namespace="mihoyo" :data='{"path":"/bbs/follow-list/:uid","categories":["game"],"example":"/mihoyo/bbs/follow-list/77005350","parameters":{"uid":"用户uid"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"米游社 - 用户关注","maintainers":["CaoMeiYouRen"],"location":"bbs/follow-list.ts"}' />

### 米游社 - 同人榜 <Site url="genshin.hoyoverse.com" size="sm" />

<Route namespace="mihoyo" :data='{"path":"/bbs/img-ranking/:game/:routeParams?","categories":["game"],"example":"/mihoyo/bbs/img-ranking/ys/forumType=tongren&cateType=illustration&rankingType=daily","parameters":{"game":"游戏缩写","routeParams":"额外参数；请参阅以下说明和表格"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["miyoushe.com/:game/imgRanking/:forum_id/:ranking_id/:cate_id"],"target":"/bbs/img-ranking/:game"}],"name":"米游社 - 同人榜","maintainers":["CaoMeiYouRen"],"description":"| 键          | 含义                                  | 接受的值                                                             | 默认值       |\n  | ----------- | ------------------------------------- | -------------------------------------------------------------------- | ------------ |\n  | forumType   | 主榜类型（仅原神、大别野有 cos 主榜） | tongren/cos                                                          | tongren      |\n  | cateType    | 子榜类型（仅崩坏三、原神有子榜）      | 崩坏三：illustration/comic/cos；原神：illustration/comic/qute/manual | illustration |\n  | rankingType | 排行榜类型（崩坏二没有日榜）          | daily/weekly/monthly                                                 | daily        |\n  | lastId      | 当前页 id（用于分页）                 | 数字                                                                 | 1            |\n\n  游戏缩写（目前绝区零还没有同人榜\n\n  | 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 大别野 |\n  | ------ | ---- | ------ | ---------- | -------- | ------ |\n  | bh3    | ys   | bh2    | wd         | sr       | dby    |\n\n  主榜类型\n\n  | 同人榜  | COS 榜 |\n  | ------- | ------ |\n  | tongren | cos    |\n\n  子榜类型\n\n  崩坏三 子榜\n\n  | 插画         | 漫画  | COS |\n  | ------------ | ----- | --- |\n  | illustration | comic | cos |\n\n  原神 子榜\n\n  | 插画         | 漫画  | Q 版 | 手工   |\n  | ------------ | ----- | ---- | ------ |\n  | illustration | comic | qute | manual |\n\n  排行榜类型\n\n  | 日榜  | 周榜   | 月榜    |\n  | ----- | ------ | ------- |\n  | daily | weekly | monthly |","location":"bbs/img-ranking.ts"}' />

| 键          | 含义                                  | 接受的值                                                             | 默认值       |
  | ----------- | ------------------------------------- | -------------------------------------------------------------------- | ------------ |
  | forumType   | 主榜类型（仅原神、大别野有 cos 主榜） | tongren/cos                                                          | tongren      |
  | cateType    | 子榜类型（仅崩坏三、原神有子榜）      | 崩坏三：illustration/comic/cos；原神：illustration/comic/qute/manual | illustration |
  | rankingType | 排行榜类型（崩坏二没有日榜）          | daily/weekly/monthly                                                 | daily        |
  | lastId      | 当前页 id（用于分页）                 | 数字                                                                 | 1            |

  游戏缩写（目前绝区零还没有同人榜

  | 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 大别野 |
  | ------ | ---- | ------ | ---------- | -------- | ------ |
  | bh3    | ys   | bh2    | wd         | sr       | dby    |

  主榜类型

  | 同人榜  | COS 榜 |
  | ------- | ------ |
  | tongren | cos    |

  子榜类型

  崩坏三 子榜

  | 插画         | 漫画  | COS |
  | ------------ | ----- | --- |
  | illustration | comic | cos |

  原神 子榜

  | 插画         | 漫画  | Q 版 | 手工   |
  | ------------ | ----- | ---- | ------ |
  | illustration | comic | qute | manual |

  排行榜类型

  | 日榜  | 周榜   | 月榜    |
  | ----- | ------ | ------- |
  | daily | weekly | monthly |

### 米游社 - 官方公告 <Site url="genshin.hoyoverse.com" size="sm" />

<Route namespace="mihoyo" :data='{"path":"/bbs/official/:gids/:type?/:page_size?/:last_id?","categories":["game"],"example":"/mihoyo/bbs/official/2/3/20/","parameters":{"gids":"游戏id","type":"公告类型，默认为 2(即 活动)","page_size":"分页大小，默认为 20 ","last_id":"跳过的公告数，例如指定为 40 就是从第 40 条公告开始，可用于分页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"米游社 - 官方公告","maintainers":["CaoMeiYouRen"],"description":"游戏 id\n\n  | 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 绝区零 |\n  | ------ | ---- | ------ | ---------- | -------- | ------ |\n  | 1      | 2    | 3      | 4          | 6        | 8      |\n\n  公告类型\n\n  | 公告 | 活动 | 资讯 |\n  | ---- | ---- | ---- |\n  | 1    | 2    | 3    |","location":"bbs/official.ts"}' />

游戏 id

  | 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 绝区零 |
  | ------ | ---- | ------ | ---------- | -------- | ------ |
  | 1      | 2    | 3      | 4          | 6        | 8      |

  公告类型

  | 公告 | 活动 | 资讯 |
  | ---- | ---- | ---- |
  | 1    | 2    | 3    |

### 米游社 - 用户关注动态 <Site url="genshin.hoyoverse.com" size="sm" />

<Route namespace="mihoyo" :data='{"path":"/bbs/timeline","categories":["game"],"example":"/mihoyo/bbs/timeline","parameters":{},"features":{"requireConfig":[{"name":"MIHOYO_COOKIE","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["miyoushe.com/:game/timeline"]}],"name":"米游社 - 用户关注动态","maintainers":["CaoMeiYouRen"],"description":":::warning\n  用户关注动态需要米游社登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。\n  :::","location":"bbs/timeline.ts"}' />

:::warning
  用户关注动态需要米游社登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
  :::

### 米游社 - 用户帖子 <Site url="genshin.hoyoverse.com" size="sm" />

<Route namespace="mihoyo" :data='{"path":"/bbs/user-post/:uid","categories":["game"],"example":"/mihoyo/bbs/user-post/77005350","parameters":{"uid":"用户uid"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"米游社 - 用户帖子","maintainers":["CaoMeiYouRen"],"location":"bbs/user-post.ts"}' />

### 原神 <Site url="genshin.hoyoverse.com" size="sm" />

<Route namespace="mihoyo" :data='{"path":"/ys/:location?/:category?","categories":["game"],"example":"/mihoyo/ys","parameters":{"location":"区域，可选 `main`（简中）或 `zh-tw`（繁中）","category":"分类，见下表，默认为最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["genshin.hoyoverse.com/:location/news"],"target":"/ys/:location"}],"name":"原神","maintainers":["nczitzk"],"description":"#### 新闻 {#mi-ha-you-yuan-shen-xin-wen}\n\n  | 最新   | 新闻 | 公告   | 活动     |\n  | ------ | ---- | ------ | -------- |\n  | latest | news | notice | activity |","location":"ys/news.ts"}' />

#### 新闻 {#mi-ha-you-yuan-shen-xin-wen}

  | 最新   | 新闻 | 公告   | 活动     |
  | ------ | ---- | ------ | -------- |
  | latest | news | notice | activity |

## 明日方舟 <Site url="ak.arknights.jp"/>

### 游戏内公告 <Site url="ak.arknights.jp" size="sm" />

<Route namespace="arknights" :data='{"path":"/announce/:platform?/:group?","categories":["game"],"example":"/arknights/announce","parameters":{"platform":"平台，默认为 Android","group":"分组，默认为 ALL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"游戏内公告","maintainers":["swwind"],"description":"平台\n\n  |  安卓服 | iOS 服 |   B 服   |\n  | :-----: | :----: | :------: |\n  | Android |   IOS  | Bilibili |\n\n  分组\n\n  | 全部 | 系统公告 | 活动公告 |\n  | :--: | :------: | :------: |\n  |  ALL |  SYSTEM  | ACTIVITY |","location":"announce.ts"}' />

平台

  |  安卓服 | iOS 服 |   B 服   |
  | :-----: | :----: | :------: |
  | Android |   IOS  | Bilibili |

  分组

  | 全部 | 系统公告 | 活动公告 |
  | :--: | :------: | :------: |
  |  ALL |  SYSTEM  | ACTIVITY |

### 游戏公告与新闻 <Site url="ak-conf.hypergryph.com/*" size="sm" />

<Route namespace="arknights" :data='{"path":"/news","categories":["game"],"example":"/arknights/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ak-conf.hypergryph.com/*"]}],"name":"游戏公告与新闻","maintainers":["Astrian"],"url":"ak-conf.hypergryph.com/*","location":"news.ts"}' />

### アークナイツ (日服新闻) <Site url="ak.arknights.jp/news" size="sm" />

<Route namespace="arknights" :data='{"path":"/japan","categories":["game"],"example":"/arknights/japan","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ak.arknights.jp/news","ak.arknights.jp/"]}],"name":"アークナイツ (日服新闻)","maintainers":["ofyark"],"url":"ak.arknights.jp/news","location":"japan.ts"}' />

## 少女前线 <Site url="sunborngame.com"/>

### 情报局 <Site url="sunborngame.com" size="sm" />

<Route namespace="gf-cn" :data='{"path":"/news/:category?","categories":["game"],"example":"/gf-cn/news","parameters":{"category":"分类，见下表，默认为新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sunborngame.com/:category","sunborngame.com/"]}],"name":"情报局","maintainers":["nczitzk"],"description":"| 新闻 | 公告 |\n  | ---- | ---- |\n  | 1    | 3    |","location":"news.ts"}' />

| 新闻 | 公告 |
  | ---- | ---- |
  | 1    | 3    |

## 完美世界电竞 <Site url="wmpvp.com"/>

### 资讯列表 <Site url="wmpvp.com" size="sm" />

<Route namespace="wmpvp" :data='{"path":"/news/:type","categories":["game"],"example":"/wmpvp/news/1","parameters":{"type":"资讯分类，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"资讯列表","maintainers":["tssujt"],"description":"| DOTA2 | CS2 |\n  | ----- | --- |\n  | 1     | 2   |","location":"index.ts"}' />

| DOTA2 | CS2 |
  | ----- | --- |
  | 1     | 2   |

## 王者荣耀 <Site url="mp.weixin.qq.com"/>

### 新闻中心 <Site url="mp.weixin.qq.com" size="sm" />

<Route namespace="tencent" :data='{"path":"/pvp/newsindex/:type","categories":["game"],"example":"/tencent/pvp/newsindex/all","parameters":{"type":"栏目分类，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻中心","maintainers":["Jeason0228","HenryQW"],"description":"| 全部 | 热门 | 新闻 | 公告 | 活动 | 赛事 | 优化 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- |\n  | all  | rm   | xw   | gg   | hd   | ss   | yh   |","location":"pvp/newsindex.ts"}' />

| 全部 | 热门 | 新闻 | 公告 | 活动 | 赛事 | 优化 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | all  | rm   | xw   | gg   | hd   | ss   | yh   |

## 网易公开课 <Site url="163.com"/>

:::tip
部分歌单及听歌排行信息为登陆后可见，自建时将环境变量`NCM_COOKIES`设为登陆后的 Cookie 值，即可正常获取。
:::

### 用户发帖 <Site url="163.com" size="sm" />

<Route namespace="163" :data='{"path":"/ds/:id","categories":["game"],"example":"/163/ds/63dfbaf4117741daaf73404601165843","parameters":{"id":"用户ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ds.163.com/user/:id"]}],"name":"用户发帖","maintainers":["luyuhuang"],"location":"ds.ts"}' />

## 小黑盒 <Site url="xiaoheihe.cn"/>

### 用户动态 <Site url="xiaoheihe.cn" size="sm" />

<Route namespace="xiaoheihe" :data='{"path":"/user/:id","categories":["game"],"example":"/xiaoheihe/user/30664023","parameters":{"id":"用户 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户动态","maintainers":["tssujt"],"location":"user.ts"}' />

### 游戏折扣 <Site url="xiaoheihe.cn" size="sm" />

<Route namespace="xiaoheihe" :data='{"path":"/discount/:platform","categories":["game"],"example":"/xiaoheihe/discount/pc","parameters":{"platform":"平台分类，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"游戏折扣","maintainers":["tssujt"],"description":"| PC  | Switch  | PSN   | Xbox |\n  | ----- | ------ | ----- | ----- |\n  | pc    | switch | psn   | xbox  |","location":"discount.ts"}' />

| PC  | Switch  | PSN   | Xbox |
  | ----- | ------ | ----- | ----- |
  | pc    | switch | psn   | xbox  |

### 游戏新闻 <Site url="xiaoheihe.cn" size="sm" />

<Route namespace="xiaoheihe" :data='{"path":"/news","categories":["game"],"example":"/xiaoheihe/news","features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"游戏新闻","maintainers":["tssujt"],"location":"news.ts"}' />

## 英雄联盟 <Site url="lol.garena.tw"/>

### 台服新闻 <Site url="lol.garena.tw" size="sm" />

<Route namespace="loltw" :data='{"path":"/news/:category?","categories":["game"],"example":"/loltw/news","parameters":{"category":"新闻分类，置空为全部新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"台服新闻","maintainers":["hoilc"],"description":"| 活动  | 资讯 | 系统   | 电竞   | 版本资讯 | 战棋资讯 |\n  | ----- | ---- | ------ | ------ | -------- | -------- |\n  | event | info | system | esport | patch    | TFTpatch |","location":"news.ts"}' />

| 活动  | 资讯 | 系统   | 电竞   | 版本资讯 | 战棋资讯 |
  | ----- | ---- | ------ | ------ | -------- | -------- |
  | event | info | system | esport | patch    | TFTpatch |

## 游戏星辰 <Site url="www.2023game.com"/>

### 游戏星辰 <Site url="www.2023game.com/" size="sm" />

<Route namespace="2023game" :data='{"path":"/:category?/:tab?","categories":["game"],"example":"/2023game/sgame/topicList","parameters":{"category":"分类，见下表","tab":"标签, 所有:all;最新:topicList;热门:jhcpb"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"游戏星辰","maintainers":["xzzpig"],"url":"www.2023game.com/","description":"分类\n\n  | PS4游戏 | switch游戏 | 3DS游戏 | PSV游戏 | Xbox360 | PS3游戏 | 世嘉MD/SS | PSP游戏 | PC周边 | 怀旧掌机 | 怀旧主机 | PS4教程 | PS4金手指 | switch金手指 | switch教程 | switch补丁 | switch主题 | switch存档 |\n  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |\n  | ps4 | sgame | 3ds | psv | jiaocheng | ps3yx | zhuji.md | zhangji.psp | pcgame | zhangji | zhuji | ps4.psjc | ps41.ps4pkg | nsaita.cundang | nsaita.pojie | nsaita.buding | nsaita.zhutie | nsaita.zhuti |","location":"index.ts"}' />

分类

  | PS4游戏 | switch游戏 | 3DS游戏 | PSV游戏 | Xbox360 | PS3游戏 | 世嘉MD/SS | PSP游戏 | PC周边 | 怀旧掌机 | 怀旧主机 | PS4教程 | PS4金手指 | switch金手指 | switch教程 | switch补丁 | switch主题 | switch存档 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | ps4 | sgame | 3ds | psv | jiaocheng | ps3yx | zhuji.md | zhangji.psp | pcgame | zhangji | zhuji | ps4.psjc | ps41.ps4pkg | nsaita.cundang | nsaita.pojie | nsaita.buding | nsaita.zhutie | nsaita.zhuti |

## 游戏基因 <Site url="news.gamegene.cn"/>

### 资讯 <Site url="news.gamegene.cn/news" size="sm" />

<Route namespace="gamegene" :data='{"path":"/news","categories":["game"],"example":"/gamegene/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.gamegene.cn/news"]}],"name":"资讯","maintainers":["lone1y-51"],"url":"news.gamegene.cn/news","location":"news.ts"}' />

## 游讯网 <Site url="yxdown.com"/>

### 精彩推荐 <Site url="yxdown.com/" size="sm" />

<Route namespace="yxdown" :data='{"path":"/recommend","categories":["game"],"example":"/yxdown/recommend","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yxdown.com/"]}],"name":"精彩推荐","maintainers":["nczitzk"],"url":"yxdown.com/","location":"recommend.ts"}' />

### 资讯 <Site url="yxdown.com" size="sm" />

<Route namespace="yxdown" :data='{"path":"/news/:category?","categories":["game"],"example":"/yxdown/news","parameters":{"category":"分类，见下表，默认为资讯首页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"资讯","maintainers":["nczitzk"],"description":"| 资讯首页 | 业界动态 | 视频预告 | 新作发布 | 游戏资讯 | 游戏评测 | 网络游戏 | 手机游戏 |\n  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |\n  |          | dongtai  | yugao    | xinzuo   | zixun    | pingce   | wangluo  | shouyou  |","location":"news.ts"}' />

| 资讯首页 | 业界动态 | 视频预告 | 新作发布 | 游戏资讯 | 游戏评测 | 网络游戏 | 手机游戏 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  |          | dongtai  | yugao    | xinzuo   | zixun    | pingce   | wangluo  | shouyou  |

## 游戏打折情报 <Site url="yxdzqb.com"/>

### 游戏折扣 <Site url="yxdzqb.com/" size="sm" />

<Route namespace="yxdzqb" :data='{"path":"/:type","categories":["game"],"example":"/yxdzqb/popular_cn","parameters":{"type":"折扣类型"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yxdzqb.com/"]}],"name":"游戏折扣","maintainers":["LogicJake","nczitzk"],"url":"yxdzqb.com/","description":"| Steam 最新折扣 | Steam 热门游戏折扣 | Steam 热门中文游戏折扣 | Steam 历史低价 | Steam 中文游戏历史低价 |\n  | -------------- | ------------------ | ---------------------- | -------------- | ---------------------- |\n  | discount       | popular            | popular_cn            | low            | low_cn                |","location":"index.ts"}' />

| Steam 最新折扣 | Steam 热门游戏折扣 | Steam 热门中文游戏折扣 | Steam 历史低价 | Steam 中文游戏历史低价 |
  | -------------- | ------------------ | ---------------------- | -------------- | ---------------------- |
  | discount       | popular            | popular_cn            | low            | low_cn                |

## 游戏日报 <Site url="news.yxrb.net"/>

### 分类 <Site url="news.yxrb.net" size="sm" />

<Route namespace="yxrb" :data='{"path":"/:category?","categories":["game"],"example":"/yxrb/info","parameters":{"category":"分类，见下表，预设为 `info`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.yxrb.net/:category","news.yxrb.net/"],"target":"/:category"}],"name":"分类","maintainers":["TonyRL"],"description":"| 资讯 | 访谈    | 服务    | 游理游据 |\n  | ---- | ------- | ------- | -------- |\n  | info | talking | service | comments |","location":"home.ts"}' />

| 资讯 | 访谈    | 服务    | 游理游据 |
  | ---- | ------- | ------- | -------- |
  | info | talking | service | comments |

## 游研社 <Site url="yystv.cn"/>

### 游研社 - 分类文章 <Site url="yystv.cn" size="sm" />

<Route namespace="yystv" :data='{"path":"/category/:category","categories":["game"],"example":"/yystv/category/recommend","parameters":{"category":"专栏类型"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"游研社 - 分类文章","maintainers":["LightStrawberry"],"description":"| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 |\n  | --------- | ------- | ------ | ------- | ---- | -------- |\n  | recommend | history | big    | culture | news | retro    |","location":"category.ts"}' />

| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 |
  | --------- | ------- | ------ | ------- | ---- | -------- |
  | recommend | history | big    | culture | news | retro    |

### 游研社 - 全部文章 <Site url="yystv.cn/docs" size="sm" />

<Route namespace="yystv" :data='{"path":"/docs","categories":["game"],"example":"/yystv/docs","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yystv.cn/docs"]}],"name":"游研社 - 全部文章","maintainers":["HaitianLiu"],"url":"yystv.cn/docs","location":"docs.ts"}' />

## 遊戲基地 Gamebase <Site url="news.gamebase.com.tw"/>

### 新聞 <Site url="news.gamebase.com.tw" size="sm" />

<Route namespace="gamebase" :data='{"path":"/news/:type?/:category?","categories":["game"],"example":"/gamebase/news","parameters":{"type":"类型，见下表，默认为 newslist","category":"分类，可在对应分类页 URL 中找到，默认为 `all` 即全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新聞","maintainers":["nczitzk"],"description":"类型\n\n  | newslist | r18list |\n  | -------- | ------- |","location":"news.ts"}' />

类型

  | newslist | r18list |
  | -------- | ------- |

## ファミ通 <Site url="famitsu.com"/>

### Category <Site url="famitsu.com" size="sm" />

<Route namespace="famitsu" :data='{"path":"/category/:category?","categories":["game"],"example":"/famitsu/category/new-article","parameters":{"category":"Category, see table below, `new-article` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Category","maintainers":["TonyRL"],"description":"| 新着        | PS5 | Switch | PS4 | ニュース | ゲームニュース | PR TIMES | 動画   | 特集・企画記事  | インタビュー | 取材・リポート | レビュー | インディーゲーム |\n  | ----------- | --- | ------ | --- | -------- | -------------- | -------- | ------ | --------------- | ------------ | -------------- | -------- | ---------------- |\n  | new-article | ps5 | switch | ps4 | news     | news-game      | prtimes  | videos | special-article | interview    | event-report   | review   | indie-game       |","location":"category.ts"}' />

| 新着        | PS5 | Switch | PS4 | ニュース | ゲームニュース | PR TIMES | 動画   | 特集・企画記事  | インタビュー | 取材・リポート | レビュー | インディーゲーム |
  | ----------- | --- | ------ | --- | -------- | -------------- | -------- | ------ | --------------- | ------------ | -------------- | -------- | ---------------- |
  | new-article | ps5 | switch | ps4 | news     | news-game      | prtimes  | videos | special-article | interview    | event-report   | review   | indie-game       |

