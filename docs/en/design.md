---
pageClass: routes
---

# Design

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

## Method Studios

<RouteEn author="MisteryMonster" path="/method-studios/:tag?" example="/method-studios/games" :paramsDesc="['URL behind /en']">

Default is under 'https://www.methodstudios.com/en/features'.

URL behind '/en' witch was the menu. Such as: 'https://www.methodstudios.com/en/games/' then fill '/method-studios/games'.

</RouteEn>
