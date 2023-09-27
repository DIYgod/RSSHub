# 🔬 Scientific Journal

## Academy of Management {#academy-of-management}

### Journal {#academy-of-management-journal}

<Route author="nczitzk" example="/aom/journal/amr" path="/aom/journal/:id" paramsDesc={['journal id, see below']}>

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

</Route>

## ACM Special Interest Group on Security Audit and Control {#acm-special-interest-group-on-security-audit-and-control}

### The ACM Conference on Computer and Communications Security {#acm-special-interest-group-on-security-audit-and-control-the-acm-conference-on-computer-and-communications-security}

<Route author="ZeddYu" example="/sigsac/ccs" path="/sigsac/ccs">

Return results from 2020

</Route>

## American Chemistry Society {#american-chemistry-society}

### Journal {#american-chemistry-society-journal}

<Route author="nczitzk" example="/acs/journal/jacsat" path="/aom/journal/:id" paramsDesc={['Journal id, can be found in URL']} supportScihub="1">

:::tip

See [Browse Content](https://pubs.acs.org)

:::

</Route>

## American Economic Association {#american-economic-association}

### Journal {#american-economic-association-journal}

<Route author="nczitzk" example="/aeaweb/aer" path="/aeaweb/:id" paramsDesc={['Journal id, can be found in URL']} supportScihub="1">

The URL of the journal [American Economic Review](https://www.aeaweb.org/journals/aer) is `https://www.aeaweb.org/journals/aer`, where `aer` is the id of the journal, so the route for this journal is `/aeaweb/aer`.

:::tip

More jounals can be found in [AEA Journals](https://www.aeaweb.org/journals).

:::

</Route>

## American Institute of Physics {#american-institute-of-physics}

### Journal {#american-institute-of-physics-journal}

<Route author="Derekmini auto-bot-ty" example="/aip/aapt/ajp" path="/aip/:pub/:jrn" paramsDesc={['Publisher id','Journal id']} radar="1" rssbud="1" supportScihub="1">

Refer to the URL format `pubs.aip.org/:pub/:jrn`

:::tip

More jounals can be found in [AIP Publications](https://publishing.aip.org/publications/find-the-right-journal).

:::

</Route>

## Annual Reviews {#annual-reviews}

### Journal {#annual-reviews-journal}

<Route author="nczitzk" example="/annualreviews/anchem" path="/annualreviews/:id" paramsDesc={['Journal id, can be found in URL']} supportScihub="1">

The URL of the journal [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) is `https://www.annualreviews.org/journal/anchem`, where `anchem` is the id of the journal, so the route for this journal is `/annualreviews/anchem`.

:::tip

More jounals can be found in [Browse Journals](https://www.annualreviews.org/action/showPublications).

:::

</Route>

## arXiv {#arxiv}

### Search Keyword {#arxiv-search-keyword}

<Route author="nczitzk" example="/arxiv/search_query=all:electron&start=0&max_results=10" path="/arxiv/:query" paramsDesc={['query statement']} anticrawler="1">

See [arXiv API User Manual](https://arxiv.org/help/api/user-manual) to find out all query statements.

Fill in parameter `query` with content after `http://export.arxiv.org/api/query?`.

</Route>

## BioOne {#bioone}

### Featured articles {#bioone-featured-articles}

<Route author="nczitzk" example="/bioone/featured" path="/bioone/featured"/>

### Journals {#bioone-journals}

<Route author="nczitzk" example="/bioone/journals/acta-chiropterologica" path="/bioone/journals/:journal?" paramsDesc={['Journals, can be found in URL']}/>

## caa.reviews {#caa.reviews}

### Book Reviews {#caa.reviews-book-reviews}

<Route author="Fatpandac" example="/caareviews/book" path="/caareviews/book"/>

### Exhibition Reviews {#caa.reviews-exhibition-reviews}

<Route author="Fatpandac" example="/caareviews/exhibition" path="/caareviews/exhibition"/>

### Essays {#caa.reviews-essays}

<Route author="Fatpandac" example="/caareviews/essay" path="/caareviews/essay"/>

## Cell {#cell}

### Current Issue {#cell-current-issue}

<Route author="y9c" example="/cell/cell/current" path="/cell/cell/:category" supportScihub="1">

| `:category` |       Query Type        | Route                                                      |
| :---------: | :---------------------: | ---------------------------------------------------------- |
|   current   | Current Issue (default) | [/cell/cell/current](https://rsshub.app/cell/cell/current) |
|   inpress   |    Articles in press    | [/cell/cell/inpress](https://rsshub.app/cell/cell/inpress) |

</Route>

### Cover Story {#cell-cover-story}

<Route author="y9c" example="/cell/cover" path="/cell/cover">

Subscribe to the cover images of the Cell journals, and get the latest publication updates in time.

Including 'cell', 'cancer-cell', 'cell-chemical-biology', 'cell-host-microbe', 'cell-metabolism', 'cell-reports', 'cell-reports-physical-science', 'cell-stem-cell', 'cell-systems', 'chem', 'current-biology', 'developmental-cell', 'immunity', 'joule', 'matter', 'molecular-cell', 'neuron', 'one-earth' and 'structure'.

</Route>

## Deloitte {#deloitte}

<Route author="laampui" example="/deloitte/industries/consumer" path="/deloitte/industries/:category?" paramsDesc={['默认为 energy-resources-industrials']}>

| 消费行业 | 能源、资源及工业行业         | 金融服务行业       | 政府及公共服务             | 生命科学与医疗行业       | 科技、传媒及电信行业                |
| -------- | ---------------------------- | ------------------ | -------------------------- | ------------------------ | ----------------------------------- |
| consumer | energy-resources-industrials | financial-services | government-public-services | life-sciences-healthcare | technology-media-telecommunications |

</Route>

## elife {#elife}

### Latest Research - Research by Subject {#elife-latest-research-research-by-subject}

<Route author="emdoe" example="/elife/cell-biology" path="/elife/:subject" paramsDesc={['topic name', 'obtain it from the homepage. `latest` will include all topics.']} supportScihub="1"/>

## ELSEVIER {#elsevier}

### Journal {#elsevier-journal}

<Route author="Derekmini sunwolf-swb" example="/elsevier/signal-processing" path="/elsevier/:journal" paramsDesc={['Journal Name, the part of the URL after `/journal/`']} radar="1" rssbud="1"/>

### Special Issue {#elsevier-special-issue}

<Route author="Derekmini sunwolf-swb" example="/elsevier/signal-processing/192" path="/elsevier/:journal/:issue" paramsDesc={['Journal Name, the part of the URL after `/journal/`','Release Number, the number in the URL after `/vol/` (If both Volume and Issue exist, must use the `Volume-Issue` form, e.g., `/elsevier/aace-clinical-case-reports/7-6`)']} radar="1" rssbud="1"/>

## Google Scholar {#google-scholar}

### Keywords Monitoring {#google-scholar-keywords-monitoring}

<Route author="HenryQW" path="/google/scholar/:query" example="/google/scholar/data+visualization" paramsDesc={['query statement which supports「Basic」and「Advanced」modes']} anticrawler="1">

:::caution

Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.

:::

1.  Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

2.  Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

</Route>

### Author Citations {#google-scholar-author-citations}

<Route author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

The parameter id in the route is the id in the URL of the user's Google Scholar reference page, for example `https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ` to `mlmE4JMAAAAJ`

</Route>

## IEEE Computer Society {#ieee-computer-society}

### IEEE Symposium on Security and Privacy {#ieee-computer-society-ieee-symposium-on-security-and-privacy}

<Route author="ZeddYu" example="/ieee-security/security-privacy" path="/ieee-security/security-privacy">

Return results from 2020

</Route>

## IEEE Xplore {#ieee-xplore}

### Author {#ieee-xplore-author}

<Route author="queensferryme" example="/ieee/author/37283006000/newest/10" path="/ieee/author/:aid/:sortType/:count?" paramsDesc={['作者 ID，可以在 URL 中找到，例如 [https://ieeexplore.ieee.org/author/37283006000](https://ieeexplore.ieee.org/author/37283006000)', '排序方式，详细见下', '数量限制，默认为 10 篇']}>

| 排序方式    | 最新     | 最旧     | 最多论文引用      | 最多专利引用       | 最流行         | 标题升序        | 标题降序         |
| ----------- | -------- | -------- | ----------------- | ------------------ | -------------- | --------------- | ---------------- |
| `:sortType` | `newest` | `oldest` | `paper-citations` | `patent-citations` | `most-popular` | `pub-title-asc` | `pub-title-desc` |

</Route>

### Journal {#ieee-xplore-journal}

<Route author="Derekmini auto-bot-ty" example="/ieee/journal/70" path="/ieee/journal/:journal/:sortType?" paramsDesc={['Journal code, the number of the `punumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']} radar="1" rssbud="1"/>

### Journal (Papers within the recent 2 months) {#ieee-xplore-journal-papers-within-the-recent-2-months}

<Route author="Derekmini auto-bot-ty" example="/ieee/journal/78/recent" path="/ieee/journal/:journal/recent/:sortType?" paramsDesc={['Journal code, the number of the `punumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']} radar="1" rssbud="1"/>

### Early Access Journal {#ieee-xplore-early-access-journal}

<Route author="5upernova-heng" example="/ieee/journal/5306045/earlyaccess" path="/ieee/journal/:journal/earlyaccess/:sortType?" paramsDesc={['Issue code, the number of the `isnumber` in the URL','Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`']} radar="1" rssbud="1"/>

## INFORMS {#informs}

### Category {#informs-category}

<Route author="Fatpandac" example="/informs/mnsc" path="/informs/:category?" paramsDesc={['Category, can be found in the url of the page, `orsc` by default']}/>

## MDPI {#mdpi}

### Journal {#mdpi-journal}

<Route author="Derekmini" example="/mdpi/analytica" path="/mdpi/:journal" paramsDesc={['Journal Name, get it from the journal homepage']} radar="1" rssbud="1"/>

## MIT Technology Review {#mit-technology-review}

<Route author="zphw" example="/technologyreview" path="/technologyreview" />

### Topics {#mit-technology-review-topics}

<Route author="laampui" example="/technologyreview/humans-and-technology" path="/technologyreview/:category_name" paramsDesc={['see below']} />

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

## National Bureau of Economic Research {#national-bureau-of-economic-research}

### All Papers {#national-bureau-of-economic-research-all-papers}

<Route author="5upernova-heng" example="/nber/papers" path="/nber/papers" radar="1" supportScihub="1"/>

### New Papers {#national-bureau-of-economic-research-new-papers}

<Route author="5upernova-heng" example="/nber/news" path="/nber/news" radar="1" supportScihub="1">

Papers that are published in this week.

</Route>

## Nature Journal {#nature-journal}

:::tip

You can get all short name of a journal from <https://www.nature.com/siteindex> or [Journal List](#nature-journal-journal-list).

:::

### Latest Research {#nature-journal-latest-research}

<Route author="y9c TonyRL" example="/nature/research/ng" path="/nature/research/:journal?" paramsDesc={['short name for a journal, `nature` by default']} supportScihub="1" radar="1" rssbud="1">

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

</Route>

### News & Comment {#nature-journal-news-comment}

<Route author="y9c TonyRL" example="/nature/news-and-comment/ng" path="/nature/news-and-comment/:journal" paramsDesc={['short name for a journal']} supportScihub="1" radar="1" rssbud="1">

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

</Route>

### Cover Story {#nature-journal-cover-story}

<Route author="y9c" example="/nature/cover" path="/nature/cover">

Subscribe to the cover images of the Nature journals, and get the latest publication updates in time.

</Route>

### Nature News {#nature-journal-nature-news}

<Route author="y9c TonyRL" example="/nature/news" path="/nature/news" supportScihub="1" radar="1" rssbud="1"/>

### Research Highlight {#nature-journal-research-highlight}

<Route author="y9c TonyRL" example="/nature/highlight" path="/nature/highlight/:journal?" paramsDesc={['short name for a journal, `nature` by default']} supportScihub="1" radar="1" rssbud="1">

:::caution

Only some journals are supported.

:::

</Route>

### Journal List {#nature-journal-journal-list}

<Route author="TonyRL" example="/nature/siteindex" path="/nature/siteindex"/>

## Network and Distributed System Security (NDSS) Symposium {#network-and-distributed-system-security-ndss-symposium}

### Accepted papers {#network-and-distributed-system-security-ndss-symposium-accepted-papers}

<Route author="ZeddYu" example="/ndss-symposium/ndss" path="/ndss-symposium/ndss">

Return results from 2020

</Route>

## Oxford University Press {#oxford-university-press}

### Oxford Academic {#oxford-university-press-oxford-academic}

#### Journal {#oxford-university-press-oxford-academic-journal}

<Route author="Fatpandac" example="/oup/journals/adaptation" path="/oup/journals/:name" paramsDesc={['short name for a journal, can be found in URL']} anticrawler="1"/>

## Proceedings of The National Academy of Sciences {#proceedings-of-the-national-academy-of-sciences}

### Journal {#proceedings-of-the-national-academy-of-sciences-journal}

<Route author="emdoe HenryQW y9c" example="/pnas/latest" path="/pnas/:topicPath*" paramsDesc={['Topic path, support **Featured Topics**, **Articles By Topic** and [**Collected Papers**](https://www.pnas.org/about/collected-papers), `latest` by default']} radar="1" anticrawler="1" puppeteer="1" supportScihub="1">

:::tip

Some topics require adding `topic/` to `topicPath` like [`/pnas/topic/app-math`](https://rsshub.app/pnas/topic/app-math) and some don't like [`/pnas/biophysics-and-computational-biology`](https://rsshub.app/pnas/biophysics-and-computational-biology)

:::

</Route>

## PubMed {#pubmed}

### Trending articles {#pubmed-trending-articles}

<Route author="y9c nczitzk" example="/pubmed/trending" path="/pubmed/trending/:filter?" paramsDesc={['Filters, can be found in URL']} supportScihub="1">

:::tip

For the parameter **filter**, the `filter` parameter in the URL should be split into a string by `,`, here is an example.

In <https://pubmed.ncbi.nlm.nih.gov/trending/?filter=simsearch1.fha&filter=pubt.clinicaltrial&filter=pubt.randomizedcontrolledtrial>, the filter parameters are `simsearch1.fha`, `pubt.clinicaltrial`, and `pubt.randomizedcontrolledtrial`. Therefore, the filter corresponding to the route should be filled with `simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial`, and the route is [`/pubmed/trending/simsearch1.fha,pubt .clinicaltrial,pubt.randomizedcontrolledtrial`](https://rsshub.app/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial)

:::

</Route>

## Royal Society of Chemistry {#royal-society-of-chemistry}

### Journal {#royal-society-of-chemistry-journal}

<Route author="nczitzk" example="/rsc/journal/ta" path="/rsc/journal/:id/:category?" paramsDesc={['Journal id, can be found in URL', 'Category, see below, All Recent Articles by default']} radar="1" rssbud="1">

:::tip

All journals at [Current journals](https://pubs.rsc.org/en/journals)

:::

| All Recent Articles | Advance Articles |
| ------------------- | ---------------- |
| allrecentarticles   | advancearticles  |

</Route>

## Science Magazine {#science-magazine}

### Current Issue {#science-magazine-current-issue}

<Route author="y9c TonyRL" example="/science/current/science" path="/science/current/:journal?" paramsDesc={['Short name for a journal']} supportScihub="1" anticrawler="1" puppeteer="1" radar="1" rssbud="1">

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

</Route>

### Cover Story {#science-magazine-cover-story}

<Route author="y9c TonyRL" example="/science/cover" path="/science/cover" anticrawler="1" radar="1" rssbud="1">

Subscribe to the cover images of Science journals, and get the latest publication updates in time.

Including 'Science', 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' and 'Science Translational Medicine'.

</Route>

### First Release {#science-magazine-first-release}

<Route author="y9c TonyRL" example="/science/early" path="/science/early/:journal?" paramsDesc={['Short name for a journal']} supportScihub="1" anticrawler="1" puppeteer="1" radar="1" rssbud="1">

*only Science, Science Immunology and Science Translational Medicine have first release*

</Route>

### Blogs {#science-magazine-blogs}

<Route author="TomHodson" example="/science/blogs/pipeline" path="/science/blogs/:name?" paramsDesc={['Short name for the blog, get this from the url. Defaults to pipeline']} anticrawler="1" puppeteer="1" radar="1" rssbud="1">

To subscribe to [IN THE PIPELINE by Derek Lowe’s](https://science.org/blogs/pipeline) or the [science editor's blog](https://science.org/blogs/editors-blog), use the name parameter `pipeline` or `editors-blog`.

</Route>

## ScienceDirect {#sciencedirect}

### Journal {#sciencedirect-journal}

<Route author="nczitzk" example="/sciencedirect/journal/research-policy" path="/sciencedirect/journal/:id" paramsDesc={['Journal id, can be found in URL']}/>

## Springer {#springer}

### Journal {#springer-journal}

<Route author="Derekmini TonyRL" example="/springer/journal/10450" path="/springer/journal/:journal" paramsDesc={['Journal Code, the number in the URL from the journal homepage']} radar="1" rssbud="1"/>

## Stork 文献鸟订阅 {#stork-wen-xian-niao-ding-yue}

### 关键词 {#stork-wen-xian-niao-ding-yue-guan-jian-ci}

<Route author="xraywu" example="/stork/keyword/409159/R4j3Hbn5ia" path="/stork/keyword/:trackID/:displayKey" paramsDesc={['关键词订阅 URL 上的 trackID 参数','关键词订阅 URL 上的  displayKey 参数']}>

在 Stork 上注册并订阅关键词后，在 `我的` -> `关键词` 中可找到对应关键词的订阅 URL。URL 后的两个参数即为路由参数。

</Route>

## Telecompaper {#telecompaper}

### News {#telecompaper-news}

<Route author="nczitzk" example="/telecompaper/news/mobile/2020/China/News" path="/telecompaper/news/:caty/:year?/:country?/:type?" paramsDesc={['Category, see table below', 'Year. The year in respective category page filter, `all` for unlimited year, empty by default', 'Country or continent, `all` for unlimited country or continent, empty by default', 'Type, can be found in the `Types` filter, `all` for unlimited type, unlimited by default']}>

Category

| WIRELESS | BROADBAND | VIDEO     | GENERAL | IT | INDUSTRY RESOURCES |
| -------- | --------- | --------- | ------- | -- | ------------------ |
| mobile   | internet  | boardcast | general | it | industry-resources |

:::tip

If `country` or `type` includes empty space, use `-` instead. For example, `United States` needs to be replaced with `United-States`, `White paper` needs to be replaced with `White-paper`

Filters in [INDUSTRY RESOURCES](https://www.telecompaper.com/industry-resources) only provides `Content Type` which corresponds to `type`. `year` and `country` are not supported.

:::

</Route>

### Search {#telecompaper-search}

<Route author="nczitzk" example="/telecompaper/search/Nokia" path="/telecompaper/search/:keyword?/:company?/:sort?/:period?" paramsDesc={['Keyword', 'Company name, empty by default', 'Sorting, see table below, `Date Descending` by default', 'Date selection, Last 12 months by default']}>

Sorting

| Date Ascending | Date Descending |
| -------------- | --------------- |
| 1              | 2               |

Date selection

| 1 month | 3 months | 6 months | 12 months | 24 months |
| ------- | -------- | -------- | --------- | --------- |
| 1       | 3        | 6        | 12        | 24        |

</Route>

## The University of Chicago Press: Journals {#the-university-of-chicago-press-journals}

### Current Issue {#the-university-of-chicago-press-journals-current-issue}

<Route author="TonyRL" example="/uchicago/journals/current/jpe" path="/uchicago/journals/current/:journal" paramsDesc={['Journal id, can be found in URL. [Browse journals by title](https://www.journals.uchicago.edu/action/showPublications)']} radar="1"/>

## USENIX {#usenix}

### Security Symposia {#usenix-security-symposia}

<Route author="ZeddYu" example="/usenix/usenix-security-sympoium" path="/usenix/usenix-security-sympoium">

Return results from 2020

</Route>

## X-MOL {#x-mol}

### Journal {#x-mol-journal}

<Route author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" paramsDesc={['type','magazine']} anticrawler="1"/>

## 管理世界 {#guan-li-shi-jie}

### 分类 {#guan-li-shi-jie-fen-lei}

<Route author="nczitzk" example="/mvm" path="/mvm/:category?" paramsDesc={['分类，见下表，默认为本期要目']}>

| 本期要目 | 网络首发 | 学术活动 | 通知公告 |
| -------- | -------- | -------- | -------- |
| bqym     | wlsf     | xshd     | tzgg     |

</Route>

## 环球法律评论 {#huan-qiu-fa-lv-ping-lun}

### 期刊 {#huan-qiu-fa-lv-ping-lun-qi-kan}

<Route author="nczitzk" example="/globallawreview" path="/globallawreview"/>

## 中国知网 {#zhong-guo-zhi-wang}

### 期刊 {#zhong-guo-zhi-wang-qi-kan}

<Route author="Fatpandac Derekmini" example="/cnki/journals/LKGP" path="/cnki/journals/:name" paramsDesc={['期刊缩写，可以在网址中得到']}/>

### 网络首发 {#zhong-guo-zhi-wang-wang-luo-shou-fa}

<Route author="Fatpandac" example="/cnki/journals/debut/LKGP" path="/cnki/journals/debut/:name" paramsDesc={['期刊缩写，可以在网址中得到']}/>

### 作者期刊文献 {#zhong-guo-zhi-wang-zuo-zhe-qi-kan-wen-xian}

:::tip

可能仅限中国大陆服务器访问，以实际情况为准。

:::

<Route author="harveyqiu Derekmini" example="/cnki/author/000042423923" path="/cnki/author/:code" paramsDesc={['作者对应code，可以在网址中得到']}/>

