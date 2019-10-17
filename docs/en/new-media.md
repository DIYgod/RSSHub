---
pageClass: routes
---

# New media

## 9To5

### 9To5 Sub-site

<RouteEn author="HenryQW" example="/9to5/mac" path="/9to5/:type" :paramsDesc="['The sub-site name']">

Supported sub-sites：
| Mac | Google | Toys |
| --- | ------ | ---- |
| Mac | Google | Toys |

</RouteEn>

## AEON

<Route author="emdoe" example="/aeon/ideas" path="/aeon/:category" :paramsDesc="['Category']"></Route>

Subscribe it by channel：
| Ideas | Essays | Videos |
| ----- | ------ | ------ |
| ideas | essays | videos |

Subscribe it by subject or topic ：
| Culture | Philosophy | Psychology | Society | Science |
| ------- | ---------- | ---------- | ------- | ------- |
| culture | philosophy | psychology | society | science |

Compared to the official one, the RSS feed generates by RSSHub not only has more fine-grained options, but eliminates pull quotes which can't be easily distinguished from other paragraphs by any RSS reader but purely disrupts the reading flow. Besides that, this feed also provides users a bio of the author in the end of the article.

## iDownloadBlog

### iDownloadBlog

<RouteEn author="HenryQW" example="/iDownloadBlog" path="/iDownloadBlog/index">

Provides a better reading experience (full text articles) over the official one.

</RouteEn>

## Nautilus

### Topics

<Route author="emdoe" example="/nautilus/topic/Art" path="/nautilus/topic/:tid" :paramsDesc="['topic']"/>

This route provides a flexible plan with full text content to subscribe specific topic(s) on the Nautilus. Please visit [nautil.us](http://nautil.us) and click `Topics` to acquire whole topic list.

## The Verge

<RouteEn author="HenryQW" example="/verge" path="/verge">

Provides a better reading experience (full text articles) over the official one.

</RouteEn>
