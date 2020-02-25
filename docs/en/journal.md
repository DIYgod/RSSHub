---
pageClass: routes
---

# Sciences Journal

## Online papers

### Cell Journal

<Route author="yech1990" example="/cell/cell/current" path="/cell/cell/:category" />

> Current Issue (default)

`/cell/cell/current`

> Articles in press

`/cell/cell/inpress`

### eLife - Latest Research-ALL

<RouteEn author="emdoe" example="/elife/latest" path="/elife/latest" />

### eLife - Latest Research-Research by Subject

<RouteEn author="emdoe" example="/elife/cell-biology" path="/elife/:subject" :paramsDesc="['topic name', 'obtain it from the homepage']" />

### Nature Journal - Latest Research

<RouteEn author="yech1990" example="/nature/nature/research" path="/nature/nature/research" />

### Nature Journal - News

<RouteEn author="yech1990" example="/nature/nature/news" path="/nature/nature/news" />

### Nature Journal - Research Highlight

<RouteEn author="yech1990" example="/nature/nature/highlight" path="/nature/nature/highlight" />

### Nature Genetics (ng) - Latest Research

<RouteEn author="yech1990" example="/nature/ng/research" path="/nature/ng/research" />

### Nature Methods (nmeth) - Latest Research

<RouteEn author="yech1990" example="/nature/nmeth/research" path="/nature/nmeth/research" />

### Nature Biotechnology (nbt) - Latest Research

<RouteEn author="yech1990" example="/nature/nbt/research" path="/nature/nbt/research" />

### Nature Neuroscience (neuro) - Latest Research

<RouteEn author="yech1990" example="/nature/neuro/research" path="/nature/neuro/research" />

### Nature Machine Intelligence (natmachintell) - Latest Research

<RouteEn author="LogicJake" example="/nature/natmachintell/research" path="/nature/natmachintell/research" />

### Proceedings of The National Academy of Sciences (PNAS) - Latest Articles - ALL

<RouteEn author="emdoe" example="/pnas/latest" path="/pnas/latest" />

### Proceedings of The National Academy of Sciences (PNAS) - Latest Articles-Articles by Topic

<RouteEn author="emdoe" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['topic name', 'obtain it from pnas.org (new research in ...)']" />

### Science Journal - Current Issue

<RouteEn author="yech1990" example="/sciencemag/science/current" path="/sciencemag/science/current" />

### Science Journal - First Release

<RouteEn author="yech1990" example="/sciencemag/science/early" path="/sciencemag/science/early" />

### Science Advances - Current Issue

<RouteEn author="yech1990" example="/sciencemag/advances/current" path="/sciencemag/advances/current" />

## Search Engine

### PubMed Trending

<RouteEn author="yech1990" example="/pubmed/trending" path="/pubmed/trending" />

### X-MOL Platform - News

<RouteEn author="cssxsh" example="/x-mol/news/3" path="/x-mol/news/:tag?" :paramsDesc="['数字编号，可从新闻列表URL得到。为空时从新闻主页获取新闻。']" />

### X-MOL Platform - Journal

<RouteEn author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" :paramsDesc="['类别','机构，两个参数都可从期刊URL获取。']" />

### Google Scholar - Keywords Monitoring

<RouteEn author="HenryQW" path="/google/scholar/:query" example="/google/scholar/data+visualization" :paramsDesc="['query statement which supports「Basic」and「Advanced」modes']" anticrawler="1">

::: warning

Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.

:::

1. Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

2. Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

</RouteEn>

### Google Scholar - Author Citations

<RouteEn author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

The parameter id in the route is the id in the URL of the user ’s Google Scholar reference page，for example `https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ` to `mlmE4JMAAAAJ`

</RouteEn>
