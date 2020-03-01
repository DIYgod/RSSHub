---
pageClass: routes
---

# Scientific Journal

## Cell Journal

<RouteEn author="yech1990" example="/cell/cell/current" path="/journal/cell/cell/:category" supportScihub="1" />

| `:category` |       Query Type        | Route                                    |
| :---------: | :---------------------: | ---------------------------------------- |
|   current   | Current Issue (default) | [/cell/cell/current](/cell/cell/current) |
|   inpress   |    Articles in press    | [/cell/cell/inpress](/cell/cell/inpress) |

</RouteEn>

## eLife

### Latest Research - Research by Subject

<RouteEn author="emdoe" example="/elife/cell-biology" path="/journal/elife/:subject" :paramsDesc="['topic name', 'obtain it from the homepage. `latest` will include all topics.']" supportScihub="1"/>

## Google Scholar

### Keywords Monitoring

<RouteEn author="HenryQW" path="/google/scholar/:query" example="/google/scholar/data+visualization" :paramsDesc="['query statement which supports「Basic」and「Advanced」modes']" anticrawler="1">

::: warning

Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.

:::

1. Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

2. Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

</RouteEn>

### Author Citations

<RouteEn author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

The parameter id in the route is the id in the URL of the user ’s Google Scholar reference page，for example `https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ` to `mlmE4JMAAAAJ`

</RouteEn>

## Nature Journal

### Latest Research

<RouteEn author="yech1990" example="/nature/research/ng" path="/journal/nature/research/:journal" :paramsDesc="['short name for a journal']" />

|  `:journal`   |  Full Name of the Journal   | Route                                                            |
| :-----------: | :-------------------------: | ---------------------------------------------------------------- |
|    nature     |           Nature            | [/nature/research/nature](/nature/research/nature)               |
|      nbt      |    Nature Biotechnology     | [/nature/research/nbt](/nature/research/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/research/neuro](/nature/research/neuro)                 |
|      ng       |       Nature Genetics       | [/nature/research/ng](/nature/research/ng)                       |
|      ni       |      Nature Immunology      | [/nature/research/ni](/nature/research/ni)                       |
|     nmeth     |        Nature Method        | [/nature/research/nmeth](/nature/research/nmeth)                 |
|     nchem     |      Nature Chemistry       | [/nature/research/nchem](/nature/research/nchem)                 |
|     nmat      |      Nature Materials       | [/nature/research/nmat](/nature/research/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/research/natmachintell](/nature/research/natmachintell) |

-   Using router (`/nature/research/` + “short name for a journal”) to query latest research paper for a certain journal of Nature Publishing Group.
    If the `:journal` parameter is blank, then latest research of Nature will return.
-   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals
-   Only the abstract section is rendered

</RouteEn>

### News & Comment

<RouteEn author="yech1990" example="/nature/news-and-comment/ng" path="/journal/nature/news-and-comment/:journal" :paramsDesc="['short name for a journal']" />

|  `:journal`   |  Full Name of the Journal   | Route                                                                            |
| :-----------: | :-------------------------: | -------------------------------------------------------------------------------- |
|      nbt      |    Nature Biotechnology     | [/nature/news-and-comment/nbt](/nature/news-and-comment/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/news-and-comment/neuro](/nature/news-and-comment/neuro)                 |
|      ng       |       Nature Genetics       | [/nature/news-and-comment/ng](/nature/news-and-comment/ng)                       |
|      ni       |      Nature Immunology      | [/nature/news-and-comment/ni](/nature/news-and-comment/ni)                       |
|     nmeth     |        Nature Method        | [/nature/news-and-comment/nmeth](/nature/news-and-comment/nmeth)                 |
|     nchem     |      Nature Chemistry       | [/nature/news-and-comment/nchem](/nature/news-and-comment/nchem)                 |
|     nmat      |      Nature Materials       | [/nature/news-and-comment/nmat](/nature/news-and-comment/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/news-and-comment/natmachintell](/nature/news-and-comment/natmachintell) |

-   Using router (`/nature/research/` + “short name for a journal”) to query latest research paper for a certain journal of Nature Publishing Group.
-   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals

</RouteEn>

### News

<RouteEn author="yech1990" example="/nature/news" path="/journal/nature/news" />

### Research Highlight

<RouteEn author="yech1990" example="/nature/highlight" path="/journal/nature/highlight" supportScihub="1"/>

## Proceedings of The National Academy of Sciences (PNAS)

### Latest Articles - Articles by Topic

<RouteEn author="emdoe HenryQW" example="/pnas/Applied Mathematics" path="/journal/pnas/:topic" :paramsDesc="['topic name', 'obtain it from pnas.org (new research in ...). `Latest` will include all.']" supportScihub="1"/>

## PubMed

### Trending

<RouteEn author="yech1990" example="/pubmed/trending" path="/journal/pubmed/trending" supportScihub="1"/>

## Science Journal

### Current Issue

<RouteEn author="yech1990" example="/sciencemag/current/science" path="/journal/sciencemag/research/:journal" :paramsDesc="['short name for a journal']" supportScihub="1"/>

| `:journal` |    Full Name of the Journal    | Route                                                            |
| :--------: | :----------------------------: | ---------------------------------------------------------------- |
|  science   |            Science             | [/sciencemag/current/science](/sciencemag/current/science)       |
|  advances  |        Science Advances        | [/sciencemag/current/advances](/sciencemag/current/advances)     |
| immunology |       Science Immunology       | [/sciencemag/current/immunology](/sciencemag/current/immunology) |
|  robotics  |        Science Robotics        | [/sciencemag/current/robotics](/sciencemag/current/robotics)     |
|    stke    |       Science Signaling        | [/sciencemag/current/stke](/sciencemag/current/stke)             |
|    stm     | Science Translational Medicine | [/sciencemag/current/stm](/sciencemag/current/stm)               |

-   Using router (`/sciencemag/current/` + “short name for a journal”) to query current issue of a journal form AAAS.
    leave the parameter blank（`/sciencemag/current`）to get update from Science.

</RouteEn>

### First Release

<RouteEn author="yech1990" example="/sciencemag/early/science" path="/journal/sciencemag/early/science" supportScihub="1"/>

_only support Science Journal_

</RouteEn>

## X-MOL Platform

### Journal

<RouteEn author="cssxsh" example="/x-mol/paper/0/9" path="/journal/x-mol/paper/:type/:magazine" :paramsDesc="['type','magazine']" />
