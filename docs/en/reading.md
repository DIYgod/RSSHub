---
pageClass: routes
---

# Reading

## All Poetry

### Poems

<RouteEn author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['排序方式, `best` 或 `newest`, 缺省 `best`']"/>

## Literotica

### New Stories

<RouteEn author="nczitzk" example="/literotica/new" path="/literotica/new"/>

### Category

<RouteEn author="nczitzk" example="/literotica/category/anal-sex-stories" path="/literotica/category/:category?" :paramsDesc="['Categor, can be found in URL']"/>

## Mobilism

### eBook Releases

<Route author="nitezs" example="/mobilism/forums/books/romance" path="/mobilism/forums/books/:type" :paramsDesc="['type']">

| type       |
| ---------- |
| romance    |
| scifi      |
| classics   |
| magazines  |
| audioBooks |
| comics     |

</Route>
