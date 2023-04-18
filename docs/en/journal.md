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

## ACM Special Interest Group on Security Audit and Control

### The ACM Conference on Computer and Communications Security

<RouteEn author="ZeddYu" example="/sigsac/ccs" path="/sigsac/ccs">

Return results from 2020

</RouteEn>

## American Chemistry Society

### Journal

<RouteEn author="nczitzk" example="/acs/journal/jacsat" path="/aom/journal/:id" :paramsDesc="['Journal id, can be found in URL']" supportScihub="1">

::: tip Tip

See [Browse Content](https://pubs.acs.org)

:::

</RouteEn>

## American Economic Association

### Journal

<RouteEn author="nczitzk" example="/aeaweb/aer" path="/aeaweb/:id" :paramsDesc="['Journal id, can be found in URL']" supportScihub="1">

The URL of the journal [American Economic Review](https://www.aeaweb.org/journals/aer) is `https://www.aeaweb.org/journals/aer`, where `aer` is the id of the journal, so the route for this journal is `/aeaweb/aer`.

::: tip Tip

More jounals can be found in [AEA Journals](https://www.aeaweb.org/journals).

:::

</RouteEn>

## Annual Reviews

### Journal

<RouteEn author="nczitzk" example="/annualreviews/anchem" path="/annualreviews/:id" :paramsDesc="['Journal id, can be found in URL']" supportScihub="1">

The URL of the journal [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) is `https://www.annualreviews.org/journal/anchem`, where `anchem` is the id of the journal, so the route for this journal is `/annualreviews/anchem`.

::: tip Tip

More jounals can be found in [Browse Journals](https://www.annualreviews.org/action/showPublications).

:::

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

<RouteEn author="y9c" example="/cell/cell/current" path="/cell/cell/:category" supportScihub="1" />

| `:category` |       Query Type        | Route                                                      |
| :---------: | :---------------------: | ---------------------------------------------------------- |
|   current   | Current Issue (default) | [/cell/cell/current](https://rsshub.app/cell/cell/current) |
|   inpress   |    Articles in press    | [/cell/cell/inpress](https://rsshub.app/cell/cell/inpress) |

</RouteEn>

### Cover Story

<RouteEn author="y9c" example="/cell/cover" path="/cell/cover" />

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

1.  Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

2.  Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

</RouteEn>

### Author Citations

<RouteEn author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

The parameter id in the route is the id in the URL of the user's Google Scholar reference page, for example `https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ` to `mlmE4JMAAAAJ`

</RouteEn>

## IEEE Computer Society

### IEEE Symposium on Security and Privacy

<RouteEn author="ZeddYu" example="/ieee-security/security-privacy" path="/ieee-security/security-privacy">

Return results from 2020

</RouteEn>

## IEEE Xplore

### Journal

<RouteEn author="Derekmini auto-bot-ty" example="/ieee/journal/70" path="/ieee/journal/:journal/:sortType?" :paramsDesc="['Journal code, the number of the `punumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']" radar="1" rssbud="1"/>

### Journal (Papers within the recent 2 months)

<RouteEn author="Derekmini auto-bot-ty" example="/ieee/journal/78/recent" path="/ieee/journal/:journal/recent/:sortType?" :paramsDesc="['Journal code, the number of the `punumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']" radar="1" rssbud="1"/>

### Early Access Journal

<RouteEn author="5upernova-heng" example="/ieee/journal/5306045/earlyaccess" path="/ieee/journal/:journal/earlyaccess/:sortType?" :paramsDesc="['Issue code, the number of the `isnumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']" radar="1" rssbud="1"/>

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

## National Bureau of Economic Research

### All Papers

<RouteEn author="5upernova-heng" example="/nber/papers" path="/nber/papers" radar="1" supportScihub="1"/>

### New Papers

<RouteEn author="5upernova-heng" example="/nber/news" path="/nber/news" radar="1" supportScihub="1">

Papers that are published in this week.

</RouteEn>

## Nature Journal

::: tip Tips

You can get all short name of a journal from <https://www.nature.com/siteindex> or [Journal List](#nature-journal-journal-list).

:::

### Latest Research

<RouteEn author="y9c TonyRL" example="/nature/research/ng" path="/nature/research/:journal?" :paramsDesc="['short name for a journal, `nature` by default']" supportScihub="1" radar="1" rssbud="1"/>

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

<RouteEn author="y9c TonyRL" example="/nature/news-and-comment/ng" path="/nature/news-and-comment/:journal" :paramsDesc="['short name for a journal']" supportScihub="1" radar="1" rssbud="1"/>

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

<RouteEn author="y9c" example="/nature/cover" path="/nature/cover" />

Subscribe to the cover images of the Nature journals, and get the latest publication updates in time.

</RouteEn>

### Nature News

<RouteEn author="y9c TonyRL" example="/nature/news" path="/nature/news" supportScihub="1" radar="1" rssbud="1"/>

### Research Highlight

<RouteEn author="y9c TonyRL" example="/nature/highlight" path="/nature/highlight/:journal?" :paramsDesc="['short name for a journal, `nature` by default']" supportScihub="1" radar="1" rssbud="1">

::: warning Warning

Only some journals are supported.

:::

</RouteEn>

### Journal List

<RouteEn author="TonyRL" example="/nature/siteindex" path="/nature/siteindex"/>

## Network and Distributed System Security (NDSS) Symposium

### Accepted papers

<RouteEn author="ZeddYu" example="/ndss-symposium/ndss" path="/ndss-symposium/ndss">

Return results from 2020

</RouteEn>

## Oxford University Press

### Oxford Academic

#### Journal

<RouteEn author="Fatpandac" example="/oup/journals/adaptation" path="/oup/journals/:name" :paramsDesc="['short name for a journal, can be found in URL']" anticrawler="1"/>

## Proceedings of The National Academy of Sciences

### Journal

<RouteEn author="emdoe HenryQW y9c" example="/pnas/latest" path="/pnas/:topicPath*" :paramsDesc="['Topic path, support **Featured Topics**, **Articles By Topic** and [**Collected Papers**](https://www.pnas.org/about/collected-papers), `latest` by default']" radar="1" anticrawler="1" puppeteer="1" supportScihub="1">

::: tip Tips
Some topics require adding `topic/` to `topicPath` like [`/pnas/topic/app-math`](https://rsshub.app/pnas/topic/app-math) and some don't like [`/pnas/biophysics-and-computational-biology`](https://rsshub.app/pnas/biophysics-and-computational-biology)
:::

</RouteEn>

## PubMed

### Trending articles

<RouteEn author="y9c nczitzk" example="/pubmed/trending" path="/pubmed/trending/:filter?" :paramsDesc="['Filters, can be found in URL']" supportScihub="1">

::: tip Tip

For the parameter **filter**, the `filter` parameter in the URL should be split into a string by `,`, here is an example.

In <https://pubmed.ncbi.nlm.nih.gov/trending/?filter=simsearch1.fha&filter=pubt.clinicaltrial&filter=pubt.randomizedcontrolledtrial>, the filter parameters are `simsearch1.fha`, `pubt.clinicaltrial`, and `pubt.randomizedcontrolledtrial`. Therefore, the filter corresponding to the route should be filled with `simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial`, and the route is [`/pubmed/trending/simsearch1.fha,pubt .clinicaltrial,pubt.randomizedcontrolledtrial`](https://rsshub.app/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial)

:::

</RouteEn>

## Science Magazine

### Current Issue

<RouteEn author="y9c TonyRL" example="/science/current/science" path="/science/current/:journal?" :paramsDesc="['Short name for a journal']" supportScihub="1" anticrawler="1" puppeteer="1" radar="1" rssbud="1"/>

| Short name |    Full name of the journal    | Route                                                                              |
| :--------: | :----------------------------: | ---------------------------------------------------------------------------------- |
|   science   |             Science            | [/science/current/science](https://rsshub.app/science/current/science)         |
|    sciadv   |        Science Advances        | [/science/current/sciadv](https://rsshub.app/science/current/sciadv)           |
|  sciimmunol |       Science Immunology       | [/science/current/sciimmunol](https://rsshub.app/science/current/sciimmunol)   |
| scirobotics |        Science Robotics        | [/science/current/scirobotics](https://rsshub.app/science/current/scirobotics) |
|  signaling  |        Science Signaling       | [/science/current/signaling](https://rsshub.app/science/current/signaling)     |
|     stm     | Science Translational Medicine | [/science/current/stm](https://rsshub.app/science/current/stm)                 |

-   Using route (`/science/current/` + "short name for a journal") to get current issue of a journal from AAAS.
-   Leaving it empty (`/science/current`) to get update from Science.

</RouteEn>

### Cover Story

<RouteEn author="y9c TonyRL" example="/science/cover" path="/science/cover" anticrawler="1" radar="1" rssbud="1"/>

Subscribe to the cover images of Science journals, and get the latest publication updates in time.

Including 'Science', 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' and 'Science Translational Medicine'.

</RouteEn>

### First Release

<RouteEn author="y9c TonyRL" example="/science/early" path="/science/early/:journal?" :paramsDesc="['Short name for a journal']" supportScihub="1" anticrawler="1" puppeteer="1" radar="1" rssbud="1"/>

*only Science, Science Immunology and Science Translational Medicine have first release*

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

## The University of Chicago Press: Journals

### Current Issue

<RouteEn author="TonyRL" example="/uchicago/journals/current/jpe" path="/uchicago/journals/current/:journal" :paramsDesc="['Journal id, can be found in URL. [Browse journals by title](https://www.journals.uchicago.edu/action/showPublications)']" radar="1"/>

## USENIX

### Security Symposia

<RouteEn author="ZeddYu" example="/usenix/usenix-security-sympoium" path="/usenix/usenix-security-sympoium">

Return results from 2020

</RouteEn>

## X-MOL Platform

### Journal

<RouteEn author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" :paramsDesc="['type','magazine']" />
