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

## Inoreader

### HTML Clip

<RouteEn author="BeautyyuYanli" example="/inoreader/html_clip/1006346356/News?limit=3" path="/html_clip/:user/:tag" :paramsDesc="[
'user id, the interger after user/ in the example URL',
'tag, the string after tag/ in the example URL',
]">

Use query parameter `limit=n` to limit the number of articles, default to 20

Eg: <https://www.inoreader.com/stream/user/1006346356/tag/News/view/html?n=3>

</RouteEn>

### RSS

<RouteEn author="NavePnow" example="/inoreader/rss/1005137674/user-favorites" path="/inoreader/rss/:user/:tag" :paramsDesc="[
'user id, the interger after user/ in the example URL',
'tag, the string after tag/ in the example URL',
]">

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

## MagazineLib

### Latest Magazine

<RouteEn author="NavePnow" example="/magazinelib/latest-magazine/new+yorker" path="/magazinelib/latest-magazine/:query?" :paramsDesc="['query, search page querystring']"/>

For instance, when doing search at <https://magazinelib.com/> and you get url <https://magazinelib.com/?s=new+yorker>, the query is `new+yorker`

</RouteEn>

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
