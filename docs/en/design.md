---
pageClass: routes
---

# Design

## Axis Studios

### Work type

<RouteEn author="MisteryMonster" example="/axis-studios/work/full-service-cg-production" path="/axis-studios/:type/:tag?" :paramsDesc="['`work`, `blog`', 'Work type URL: `compositing`, `full-service-cg-production`, `vfx-supervision`, `realtime`, `art-direction`, `animation`']">

Work type URL in articles. Such as： 'https://axisstudiosgroup.com/work/full-service-cg-production' the tag will be `full-service-cg-production`.

Some tags are rarely used： `Script`, `direction`, `production`, `design-concept` etc。

</RouteEn>

## Behance

### User Works

<RouteEn author="MisteryMonster" example="/behance/mishapetrick" path="/behance/:user/:type?" :paramsDesc="['username', 'type, `projects` or `appreciated`, `projects` by default']" radar="1">

Behance user's profile URL, like <https://www.behance.net/mishapetrick> the username will be `mishapetrick`。

</RouteEn>

## Blow Studio

### Home

<RouteEn author="MisteryMonster" example="/blow-studio" path="/blow-studio" />

## Blur Studio

### Works

<RouteEn author="MisteryMonster" example="/blur-studio" path="/blur-studio" />

## Digic Picture

### Works & News

<RouteEn author="MisteryMonster" example="/digic-pictures/works/real-time-engine" path="/digic-pictures/:menu/:tag?" :paramsDesc="['`news`, `works`', 'Under WORK types: `/game-cinematics`, `/feature`, `/making-of`, `/commercials-vfx`, `/real-time-engine`']" />

## Dribbble

### Popular

<RouteEn path="/dribbble/popular/:timeframe?" example="/dribbble/popular" :paramsDesc="['support the following values: week, month, year and ever']" />

### User (or team)

<RouteEn path="/dribbble/user/:name" example="/dribbble/user/google" :paramsDesc="['username, available in user\'s homepage URL']" />

### Keyword

<RouteEn path="/dribbble/keyword/:keyword" example="/dribbble/keyword/player" :paramsDesc="['desired keyword']" />

## Eagle

### Blog

<RouteEn author="Fatpandac" example="/eagle/blog/en" path="/eagle/blog/:cate?/:language?" :paramsDesc="['Category, get by URL, `all` by default', 'Language, `cn`, `tw`, `en`, `en` by default']" radar="1" rsshub="1"/>

## Google

### Google Fonts

<RouteEn author="Fatpandac" example="/google/fonts/date" path="/google/fonts/:sort?" :paramsDesc="['Sorting type, see below, default to `date`']" selfhost="1">

| Newest | Trending | Most popular | Name  | Number of styles |
| :----: | :------: | :----------: | :--:  | :--------------: |
| date   | trending | popularity   | alpha | style            |

::: warning

This route requires API key, therefore it's only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/en/install/#configuration-route-specific-configurations) for route-specific configurations.

:::

</RouteEn>

## Inside Design

### Recent Stories

<RouteEn author="miaoyafeng" example="/invisionapp/inside-design" path="/invisionapp/inside-design">
</RouteEn>

## Method Studios

### Menus

<RouteEn author="MisteryMonster" path="/method-studios/:menu?" example="/method-studios/games" :paramsDesc="['URL behind /en: `features`, `advertising`, `episodic`, `games`, `methodmade`']">

Not support `main`, `news`.

Default is under 'https://www.methodstudios.com/en/features'.

</RouteEn>

## Notefolio

### Works

<RouteEn author="nczitzk" example="/notefolio" path="/notefolio/:caty?/:order?/:time?/:query?" :paramsDesc="['Category, see below, `all` by default', 'Order, `pick` as Notefolio Pick, `newest` as Newest, `noted` as Noted, `pick` by default', 'Time, `all` as All the time, `day` as Latest 24 hours, `week` as Latest week, `month` as Latest month, `month3` as Latest 3 months, `all` by default', 'Keyword, empty by default']">

| Category | Name in Korean | Name in English |
| -------- | -------------- | --------------- |
| all | 전체 | All |
| A7 | 공예 | Crafts |
| J7 | 그래픽 디자인 | Graphic Design |
| B7 | 디지털 아트 | Digital Art |
| C7 | 영상/모션그래픽 | Video / Motion Graphics |
| D7 | 브랜딩/편집 | Branding / Editing |
| E7 | 산업 디자인 | Industrial Design |
| F7 | UI/UX | UI/UX |
| G7 | 일러스트레이션 | Illustration |
| K7 | 타이포그래피 | Typography |
| H7 | 파인아트 | Fine Art |
| I7 | 포토그래피 | Photography |

</RouteEn>

## Unit Image

### Films

<RouteEn author="MisteryMonster" example="/unit-image/films/vfx" path="/unit-image/films/:type?" :paramsDesc="['Films type，`vfx`, `game-trailer`, `animation`, `commercials`, `making-of`']"/>
