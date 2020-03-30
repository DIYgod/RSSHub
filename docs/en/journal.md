---
pageClass: routes
---

# Scientific Journal

## Cell Journal

<RouteEn author="yech1990" example="/cell/cell/current" path="/cell/cell/:category" supportScihub="1" />

| `:category` |       Query Type        | Route                                                      |
| :---------: | :---------------------: | ---------------------------------------------------------- |
|   current   | Current Issue (default) | [/cell/cell/current](https://rsshub.app/cell/cell/current) |
|   inpress   |    Articles in press    | [/cell/cell/inpress](https://rsshub.app/cell/cell/inpress) |

</RouteEn>

### Cover Story

<RouteEn author="yech1990" example="/cell/cover" path="/cell/cover" />

Subscribe to the cover images of the Cell journals, and get the latest publication updates in time.

Including 'cell', 'cancer-cell', 'cell-chemical-biology', 'cell-host-microbe', 'cell-metabolism', 'cell-reports', 'cell-reports-physical-science', 'cell-stem-cell', 'cell-systems', 'chem', 'current-biology', 'developmental-cell', 'immunity', 'joule', 'matter', 'molecular-cell', 'neuron', 'one-earth' and 'structure'.

</RouteEn>

## eLife

### Latest Research - Research by Subject

<RouteEn author="emdoe" example="/elife/cell-biology" path="/elife/:subject" :paramsDesc="['topic name', 'obtain it from the homepage. `latest` will include all topics.']" supportScihub="1"/>

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

<RouteEn author="yech1990" example="/nature/research/ng" path="/nature/research/:journal" :paramsDesc="['short name for a journal']" />

|  `:journal`   |  Full Name of the Journal   | Route                                                                              |
| :-----------: | :-------------------------: | ---------------------------------------------------------------------------------- |
|    nature     |           Nature            | [/nature/research/nature](https://rsshub.app/nature/research/nature)               |
|      nbt      |    Nature Biotechnology     | [/nature/research/nbt](https://rsshub.app/nature/research/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/research/neuro](https://rsshub.app/nature/research/neuro)                 |
|      ng       |       Nature Genetics       | [/nature/research/ng](https://rsshub.app/nature/research/ng)                       |
|      ni       |      Nature Immunology      | [/nature/research/ni](https://rsshub.app/nature/research/ni)                       |
|     nmeth     |        Nature Method        | [/nature/research/nmeth](https://rsshub.app/nature/research/nmeth)                 |
|     nchem     |      Nature Chemistry       | [/nature/research/nchem](https://rsshub.app/nature/research/nchem)                 |
|     nmat      |      Nature Materials       | [/nature/research/nmat](https://rsshub.app/nature/research/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/research/natmachintell](https://rsshub.app/nature/research/natmachintell) |

-   Using router (`/nature/research/` + “short name for a journal”) to query latest research paper for a certain journal of Nature Publishing Group.
    If the `:journal` parameter is blank, then latest research of Nature will return.
-   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals
-   Only the abstract section is rendered

</RouteEn>

### News & Comment

<RouteEn author="yech1990" example="/nature/news-and-comment/ng" path="/nature/news-and-comment/:journal" :paramsDesc="['short name for a journal']" />

|  `:journal`   |  Full Name of the Journal   | Route                                                                                                                 |
| :-----------: | :-------------------------: | --------------------------------------------------------------------------------------------------------------------- |
|      nbt      |    Nature Biotechnology     | [/nature/news-and-comment/nbt](https://rsshub.app/nature/news-and-comment/nbt)                                        |
|     neuro     |     Nature Neuroscience     | [/nature/news-and-comment/neuro](https://rsshub.app/nature/news-and-comment/neuro)                                    |
|      ng       |       Nature Genetics       | [/nature/news-and-comment/ng](https://rsshub.app/nature/news-and-comment/ng)                                          |
|      ni       |      Nature Immunology      | [/nature/news-and-comment/ni](https://rsshub.app/nature/news-and-comment/ni)                                          |
|     nmeth     |        Nature Method        | [/nature/news-and-comment/nmeth](https://rsshub.app/nature/news-and-comment/nmeth)                                    |
|     nchem     |      Nature Chemistry       | [/nature/news-and-comment/nchem](https://rsshub.app/nature/news-and-comment/nchem)                                    |
|     nmat      |      Nature Materials       | [/nature/news-and-comment/nmat](https://rsshub.app/nature/news-and-comment/nmat)                                      |
| natmachintell | Nature Machine Intelligence | [/nature/news-and-https://rsshub.app/comment/natmachintell](https://rsshub.app/nature/news-and-comment/natmachintell) |

-   Using router (`/nature/research/` + “short name for a journal”) to query latest research paper for a certain journal of Nature Publishing Group.
-   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals

</RouteEn>

### Cover Story

<RouteEn author="yech1990" example="/nature/cover" path="/nature/cover" />

Subscribe to the cover images of the Nature journals, and get the latest publication updates in time.

</RouteEn>

### News

<RouteEn author="yech1990" example="/nature/news" path="/nature/news" />

### Research Highlight

<RouteEn author="yech1990" example="/nature/highlight" path="/nature/highlight" supportScihub="1"/>

## Proceedings of The National Academy of Sciences (PNAS)

### Latest Articles - Articles by Topic

### Proceedings of The National Academy of Sciences (PNAS) - Latest Articles

<RouteEn author="emdoe" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['topic name', 'obtain it from pnas.org (new research in ...)']" />

-   Using router (`/pnas/` + Topic of Interest) to query latest research paper for a certain topic from PNAS journal.
    If the `:topic` parameter is blank, or equal to 'latest', then all the latest papers will return.

</RouteEn>

<RouteEn author="emdoe HenryQW" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['topic name', 'obtain it from pnas.org (new research in ...). `Latest` will include all.']" supportScihub="1"/>

## PubMed

### Trending

<RouteEn author="yech1990" example="/pubmed/trending" path="/pubmed/trending" supportScihub="1"/>

## Science Journal

### Current Issue

<RouteEn author="yech1990" example="/sciencemag/current/science" path="/sciencemag/research/:journal" :paramsDesc="['short name for a journal']" supportScihub="1"/>

| `:journal` |    Full Name of the Journal    | Route                                                                              |
| :--------: | :----------------------------: | ---------------------------------------------------------------------------------- |
|  science   |            Science             | [/sciencemag/current/science](https://rsshub.app/sciencemag/current/science)       |
|  advances  |        Science Advances        | [/sciencemag/current/advances](https://rsshub.app/sciencemag/current/advances)     |
| immunology |       Science Immunology       | [/sciencemag/current/immunology](https://rsshub.app/sciencemag/current/immunology) |
|  robotics  |        Science Robotics        | [/sciencemag/current/robotics](https://rsshub.app/sciencemag/current/robotics)     |
|    stke    |       Science Signaling        | [/sciencemag/current/stke](https://rsshub.app/sciencemag/current/stke)             |
|    stm     | Science Translational Medicine | [/sciencemag/current/stm](https://rsshub.app/sciencemag/current/stm)               |

-   Using router (`/sciencemag/current/` + “short name for a journal”) to query current issue of a journal form AAAS.
    leave the parameter blank（`/sciencemag/current`）to get update from Science.

</RouteEn>

### Cover Story

<RouteEn author="yech1990" example="/sciencemag/cover" path="/sciencemag/cover" />

Subscribe to the cover images of the Science journals, and get the latest publication updates in time.

Including ‘Science’, 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' and 'Science Translational Medicine'.

</RouteEn>

### First Release

<RouteEn author="yech1990" example="/sciencemag/early/science" path="/sciencemag/early/science" supportScihub="1"/>

_only support Science Journal_

</RouteEn>

## X-MOL Platform

### Journal

<RouteEn author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" :paramsDesc="['type','magazine']" />
