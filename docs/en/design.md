---
pageClass: routes
---

# Design

## Blow Studio

### Home

<RouteEn author="MisteryMonster" example="/blow-studio" path="/blow-studio" />

## Axis Studios

### Work type

<RouteEn author="MisteryMonster" example="/axis-studios/work/full-service-cg-production" path="/axis-studios/:type/:tag?" :paramsDesc="['`work`, `blog`', 'Work type URL: `compositing`, `full-service-cg-production`, `vfx-supervision`, `realtime`, `art-direction`, `animation`']">

Work type URL in articles. Such as： 'https://axisstudiosgroup.com/work/full-service-cg-production' the tag will be `full-service-cg-production`.

Some tags are rarely used： `Script`, `direction`, `production`, `design-concept` etc。

</RouteEn>

## Dribbble

### Popular

<RouteEn path="/dribbble/popular/:timeframe?" example="/dribbble/popular" :paramsDesc="['support the following values: week, month, year and ever']" />

### User (or team)

<RouteEn path="/dribbble/user/:name" example="/dribbble/user/google" :paramsDesc="['username, available in user\'s homepage URL']" />

### Keyword

<RouteEn path="/dribbble/keyword/:keyword" example="/dribbble/keyword/player" :paramsDesc="['desired keyword']" />

## Inside Design

### Recent Stories

<RouteEn author="miaoyafeng" example="/invisionapp/inside-design" path="/invisionapp/inside-design">
</RouteEn>

## Unit Image

### Films

<RouteEn author="MisteryMonster" example="/unit-image/films/vfx" path="/unit-image/films/:type?" :paramsDesc="['Films type，`vfx`, `game-trailer`, `animation`, `commercials`, `making-of`']"/>
