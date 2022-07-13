---
pageClass: routes
---

# Scientific Journal

## Academy of Management

### Journal

<RouteEn author="nczitzk" example="/aom/journal/amr" path="/aom/journal/:id" :paramsDesc="['journal id, see below']">

| Id        | Title                                     |
| --------- | ------------------------------------------ |
| annals    | Academy of Management Annals               |
| amd       | Academy of Management Discoveries          |
| amgblproc | Academy of Management Global Proceedings   |
| amj       | Academy of Management Journal              |
| amle      | Academy of Management Learning & Education |
| amp       | Academy of Management Perspectives         |
| amproc    | Academy of Management Proceedings          |
| amr       | Academy of Management Review               |

</RouteEn>

## arXiv

### Search Keyword

<RouteEn author="nczitzk" example="/arxiv/search_query=all:electron&start=0&max_results=10" path="/arxiv/:query" :paramsDesc="['query statement']" anticrawler="1">

See [arXiv API User Manual](https://arxiv.org/help/api/user-manual) to find out all query statements.

Fill in parameter `query` with content after `http://export.arxiv.org/api/query?`.

</RouteEn>

## BioOne

### Featured articles

<RouteEn author="nczitzk" example="/bioone/featured" path="/bioone/featured"/>

### Journals

<RouteEn author="nczitzk" example="/bioone/journals/acta-chiropterologica" path="/bioone/journals/:journal?" :paramsDesc="['Journals, can be found in URL']"/>

## caa.reviews

### Book Reviews

<RouteEn author="Fatpandac" example="/caareviews/book" path="/caareviews/book"/>

### Exhibition Reviews

<RouteEn author="Fatpandac" example="/caareviews/exhibition" path="/caareviews/exhibition"/>

### Essays

<RouteEn author="Fatpandac" example="/caareviews/essay" path="/caareviews/essay"/>

## Cell Journal

### Current Issue

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

## ELSEVIER

### Journal

<RouteEn author="Derekmini sunwolf-swb" example="/elsevier/signal-processing" path="/elsevier/:journal" :paramsDesc="['Journal Name, the part of the URL after `/journal/`']" radar="1" rssbud="1"/>

### Special Issue

<RouteEn author="Derekmini sunwolf-swb" example="/elsevier/signal-processing/192" path="/elsevier/:journal/:issue" :paramsDesc="['Journal Name, the part of the URL after `/journal/`','Release Number, the number in the URL after `/vol/` (If both Volume and Issue exist, must use the `Volume-Issue` form, e.g., `/elsevier/aace-clinical-case-reports/7-6`)']" radar="1" rssbud="1"/>

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

The parameter id in the route is the id in the URL of the user's Google Scholar reference page, for example `https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ` to `mlmE4JMAAAAJ`

</RouteEn>

## IEEE Xplore

### Journal

<RouteEn author="Derekmini auto-bot-ty" example="/ieee/journal/70" path="/ieee/journal/:journal/:sortType?" :paramsDesc="['Journal code, the number of the `punumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']" radar="1" rssbud="1"/>

### Journal (Papers within the recent 2 months)

<RouteEn author="Derekmini auto-bot-ty" example="/ieee/journal/78/recent" path="/ieee/journal/:journal/recent/:sortType?" :paramsDesc="['Journal code, the number of the `punumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']" radar="1" rssbud="1"/>

## INFORMS

### Category

<RouteEn author="Fatpandac" example="/informs/mnsc" path="/informs/:category?" :paramsDesc="['Category, can be found in the url of the page, `orsc` by default']"/>

## MDPI

### Journal

<RouteEn author="Derekmini" example="/mdpi/analytica" path="/mdpi/:journal" :paramsDesc="['Journal Name, get it from the journal homepage']" radar="1" rssbud="1"/>

## MIT Technology Review

<RouteEn author="zphw" example="/technologyreview" path="/technologyreview" />

### Topics

<RouteEn author="laampui" example="/technologyreview/humans-and-technology" path="/technologyreview/:category_name" :paramsDesc="['see below']" />

| `:category_name` | Route |
| -------- | ----- |
| humans-and-technology | /technologyreview/humans-and-technology |
| election-2020 | /technologyreview/election-2020 |
| artificial-intelligence | /technologyreview/artificial-intelligence |
| biotechnology | /technologyreview/biotechnology |
| blockchain | /technologyreview/blockchain |
| climate-change | /technologyreview/climate-change |
| computing |/technologyreview/computing  |
| tech-policy | /technologyreview/tech-policy |
| silicon-valley |  /technologyreview/silicon-valley|
| smart-cities | /technologyreview/smart-cities|
| space | /technologyreview/space |

## Nature Journal

::: tip Tips

You can get all short name of a journal from <https://www.nature.com/siteindex> or [Journal List](#nature-journal-journal-list).

:::

### Latest Research

<RouteEn author="yech1990 TonyRL" example="/nature/research/ng" path="/nature/research/:journal?" :paramsDesc="['short name for a journal, `nature` by default']" supportScihub="1" radar="1" rssbud="1"/>

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

-   Using router (`/nature/research/` + "short name for a journal") to query latest research paper for a certain journal of Nature Publishing Group.
    If the `:journal` parameter is blank, then latest research of Nature will return.
-   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals
-   Only abstract is rendered in some researches

</RouteEn>

### News & Comment

<RouteEn author="yech1990 TonyRL" example="/nature/news-and-comment/ng" path="/nature/news-and-comment/:journal" :paramsDesc="['short name for a journal']" supportScihub="1" radar="1" rssbud="1"/>

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

-   Using router (`/nature/research/` + "short name for a journal") to query latest research paper for a certain journal of Nature Publishing Group.
-   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals

</RouteEn>

### Cover Story

<RouteEn author="yech1990" example="/nature/cover" path="/nature/cover" />

Subscribe to the cover images of the Nature journals, and get the latest publication updates in time.

</RouteEn>

### Nature News

<RouteEn author="yech1990 TonyRL" example="/nature/news" path="/nature/news" supportScihub="1" radar="1" rssbud="1"/>

### Research Highlight

<RouteEn author="yech1990 TonyRL" example="/nature/highlight" path="/nature/highlight/:journal?" :paramsDesc="['short name for a journal, `nature` by default']" supportScihub="1" radar="1" rssbud="1">

::: warning Warning

Only some journals are supported.

:::

</RouteEn>

### Journal List

<RouteEn author="TonyRL" example="/nature/siteindex" path="/nature/siteindex"/>

## Oxford University Press

### Oxford Academic

#### Journal

<RouteEn author="Fatpandac" example="/oup/journals/adaptation" path="/oup/journals/:name" :paramsDesc="['short name for a journal, can be found in URL']" anticrawler="1"/>

## Proceedings of The National Academy of Sciences (PNAS)

### Latest Articles - Articles by Topic

### Proceedings of The National Academy of Sciences (PNAS) - Latest Articles

<RouteEn author="emdoe" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['topic name', 'obtain it from pnas.org (new research in ...)']" />

-   Using router (`/pnas/` + Topic of Interest) to query latest research paper for a certain topic from PNAS journal.
    If the `:topic` parameter is blank, or equal to 'latest', then all the latest papers will return.

</RouteEn>

<RouteEn author="emdoe HenryQW" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['topic name', 'obtain it from pnas.org (new research in ...). `Latest` will include all.']" supportScihub="1"/>

## PubMed

### Trending articles

<RouteEn author="yech1990 nczitzk" example="/pubmed/trending" path="/pubmed/trending/:filter?" :paramsDesc="['Filters, can be found in URL']" supportScihub="1">

::: tip Tip

For the parameter **filter**, the `filter` parameter in the URL should be split into a string by `,`, here is an example.

In <https://pubmed.ncbi.nlm.nih.gov/trending/?filter=simsearch1.fha&filter=pubt.clinicaltrial&filter=pubt.randomizedcontrolledtrial>, the filter parameters are `simsearch1.fha`, `pubt.clinicaltrial`, and `pubt.randomizedcontrolledtrial`. Therefore, the filter corresponding to the route should be filled with `simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial`, and the route is [`/pubmed/trending/simsearch1.fha,pubt .clinicaltrial,pubt.randomizedcontrolledtrial`](https://rsshub.app/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial)

:::

</RouteEn>

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

## ScienceDirect

### Journal

<RouteEn author="nczitzk" example="/sciencedirect/journal/research-policy" path="/sciencedirect/journal/:id" :paramsDesc="['Journal id, can be found in URL']"/>

## Scitation

### Journal

<RouteEn author="Derekmini auto-bot-ty" example="/scitation/aapt/ajp" path="/scitation/:pub/:jrn" :paramsDesc="['Publisher, the part of the URL before `scitation.org`','Journal, the part of the URL after `/toc/`']" radar="1" rssbud="1" puppeteer="1"/>

### Section

<RouteEn author="Derekmini auto-bot-ty" example="/scitation/aapt/ajp/COMPUTATIONAL+PHYSICS" path="/scitation/:pub/:jrn/:sec" :paramsDesc="['Publisher, the part of the URL before `scitation.org`','Journal, the part of the URL after `/toc/`','Section, the `tocSection` part of the URL']" radar="1" rssbud="1" puppeteer="1"/>

## Springer

### Journal

<RouteEn author="Derekmini TonyRL" example="/springer/journal/10450" path="/springer/journal/:journal" :paramsDesc="['Journal Code, the number in the URL from the journal homepage']" radar="1" rssbud="1"/>

## X-MOL Platform

### Journal

<RouteEn author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" :paramsDesc="['type','magazine']" />
