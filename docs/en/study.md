---
pageClass: routes
---

# Study

## eLife

### Latest Research

#### ALL

<RouteEn author="emdoe" example="/elife/latest" path="/elife/latest" />

#### Research by Subject

<RouteEn author="emdoe" example="/elife/cell-biology" path="/elife/:subject" :paramsDesc="['topic name', 'obtain it from the homepage']" />

## Google Scholar

### Keywords Monitoring

<RouteEn author="HenryQW" path="/google/scholar/:query" example="/google/scholar/data+visualization" :paramsDesc="['query statement which supports「Basic」and「Advanced」modes']" anticrawler="1">

::: warning

Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.

:::

1. Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

2. Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

</RouteEn>

## Nature

### Latest Research

#### Nature

<RouteEn author="emdoe" example="/nature/research" path="/nature/research" />

#### Nature Machine Intelligence

<RouteEn author="LogicJake" example="/nature/natmachintell/research" path="/nature/natmachintell/research" />

#### Nature Neuroscience

<RouteEn author="emdoe" example="/nature/neuroscience/research" path="/nature/neuroscience/research" />

## Proceedings of The National Academy of Sciences

### Latest Articles

#### ALL

<RouteEn author="emdoe" example="/pnas/latest" path="/pnas/latest" />

#### Articles by Topic

<RouteEn author="emdoe" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['topic name', 'obtain it from pnas.org (new research in ...)']" />
