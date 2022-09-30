---
pageClass: routes
---

# Reading

## All Poetry

### Poems

<RouteEn author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['Ordering, `best` or `newest`, `best` by default']"/>

## hameln

### chapter

<RouteEn author="huangliangshusheng" example="/hameln/chapter/264928" path="/hameln/chapter/:id" :paramsDesc="['Novel id, can be found in URL']">

Eg:<https://syosetu.org/novel/264928/>

</RouteEn>

## kakuyomu

### episode

<RouteEn author="huangliangshusheng" example="/kakuyomu/episode/1177354054883783581" path="/kakuyomu/episode/:id" :paramsDesc="['Novel id, can be found in URL']">

Eg:<https://kakuyomu.jp/works/1177354054883783581>

</RouteEn>

## Literotica

### New Stories

<RouteEn author="nczitzk" example="/literotica/new" path="/literotica/new"/>

### Category

<RouteEn author="nczitzk" example="/literotica/category/anal-sex-stories" path="/literotica/category/:category?" :paramsDesc="['Category, can be found in URL']"/>

## Mobilism

### eBook Releases

<RouteEn author="nitezs" example="/mobilism/forums/books/romance" path="/mobilism/forums/books/:type/:fulltext?" :paramsDesc="['Category', 'Retrieve fulltext, specify `y` to enable']">

| Category                 | Parameter  |
| ------------------------ | ---------- |
| Romance                  | romance    |
| Sci-Fi/Fantasy/Horror    | scifi      |
| General Fiction/Classics | classics   |
| Magazines & Newspapers   | magazines  |
| Audiobooks               | audioBooks |
| Comics                   | comics     |

</RouteEn>

## Penguin Random House

### Book Lists

<RouteEn author="StevenRCE0" example="/penguin-random-house/the-read-down" path="/penguin-random-house/the-read-down" />

### Articles

<RouteEn author="StevenRCE0" example="/penguin-random-house/articles" path="/penguin-random-house/articles" />

## syosetu

### chapter

<RouteEn author="huangliangshusheng" example="/syosetu/chapter/n1976ey" path="/syosetu/chapter/:id" :paramsDesc="['Novel id, can be found in URL']">

Eg:<https://ncode.syosetu.com/n1976ey/>

</RouteEn>
