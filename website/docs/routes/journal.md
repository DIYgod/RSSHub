import Route from '@site/src/components/Route';

# 🔬 科学期刊

## Academy of Management {#academy-of-management}

### Journal {#academy-of-management-journal}

<Route author="nczitzk" example="/aom/journal/amr" path="/aom/journal/:id" paramsDesc={['期刊 id，见下表']} supportScihub="1">

| Id        | 名称                                       |
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

抓取的 Papers 从 2020 年开始

</Route>

## American Chemistry Society {#american-chemistry-society}

### Journal {#american-chemistry-society-journal}

<Route author="nczitzk" example="/acs/journal/jacsat" path="/aom/journal/:id" paramsDesc={['期刊 id，可在对应期刊页 URL 中找到']} supportScihub="1">

:::tip 提示

见 [Browse Content](https://pubs.acs.org)

:::

</Route>

## American Economic Association {#american-economic-association}

### Journal {#american-economic-association-journal}

<Route author="nczitzk" example="/aeaweb/aer" path="/aeaweb/:id" paramsDesc={['期刊 id，可在对应期刊页 URL 中找到']} supportScihub="1">

期刊 [American Economic Review](https://www.aeaweb.org/journals/aer) 的 URL 是 `https://www.aeaweb.org/journals/aer`，其中 `aer` 即为其期刊 id，故该期刊对应路由为 `/aeaweb/aer`。

:::tip 提示

更多期刊可在 [AEA Journals](https://www.aeaweb.org/journals) 中找到。

:::

</Route>

## Annual Reviews {#annual-reviews}

### Journal {#annual-reviews-journal}

<Route author="nczitzk" example="/annualreviews/anchem" path="/annualreviews/:id" paramsDesc={['期刊 id，可在对应期刊页 URL 中找到']} supportScihub="1">

期刊 [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) 的 URL 是 `https://www.annualreviews.org/journal/anchem`，其中 `anchem` 即为其期刊 id，故该期刊对应路由为 `/annualreviews/anchem`。

:::tip 提示

更多期刊可在 [Browse Journals](https://www.annualreviews.org/action/showPublications) 中找到。

:::

</Route>

## arXiv {#arxiv}

### 搜索关键字 {#arxiv-sou-suo-guan-jian-zi}

<Route author="nczitzk" example="/arxiv/search_query=all:electron&start=0&max_results=10" path="/arxiv/:query" paramsDesc={['查询语句']} anticrawler="1">

参见 [arXiv API 用户手册](https://arxiv.org/help/api/user-manual) 查看所有查询参数。

路由中的参数 query 处填写 `http://export.arxiv.org/api/query?` 后的内容。

</Route>

## BioOne {#bioone}

### Featured articles {#bioone-featured-articles}

<Route author="nczitzk" example="/bioone/featured" path="/bioone/featured"/>

### Journals {#bioone-journals}

<Route author="nczitzk" example="/bioone/journals/acta-chiropterologica" path="/bioone/journals/:journal?" paramsDesc={['期刊名，可在期刊页地址栏中找到']}/>

## caa.reviews {#caa.reviews}

### Book Reviews {#caa.reviews-book-reviews}

<Route author="Fatpandac" example="/caareviews/book" path="/caareviews/book"/>

### Exhibition Reviews {#caa.reviews-exhibition-reviews}

<Route author="Fatpandac" example="/caareviews/exhibition" path="/caareviews/exhibition"/>

### Essays {#caa.reviews-essays}

<Route author="Fatpandac" example="/caareviews/essay" path="/caareviews/essay"/>

## Cell {#cell}

### 主刊 {#cell-zhu-kan}

<Route author="y9c" example="/cell/cell/current" path="/journals/cell/cell/:category" supportScihub="1">

| `:category` |       类型说明      | 路由                                                       |
| :---------: | :-----------------: | ---------------------------------------------------------- |
|   current   | 本期刊物 (默认选项) | [/cell/cell/current](https://rsshub.app/cell/cell/current) |
|   inpress   |       在线发表      | [/cell/cell/inpress](https://rsshub.app/cell/cell/inpress) |

</Route>

### 封面故事 {#cell-feng-mian-gu-shi}

<Route author="y9c" example="/cell/cover" path="/cell/cover">

订阅 Cell 系列杂志的封面图片，并及时获取刊物更新状态。

包含了： 'cell'、 'cancer-cell'、 'cell-chemical-biology'、 'cell-host-microbe'、 'cell-metabolism'、 'cell-reports'、 'cell-reports-physical-science'、 'cell-stem-cell'、 'cell-systems'、 'chem'、 'current-biology'、 'developmental-cell'、 'immunity'、 'joule'、 'matter'、 'molecular-cell'、 'neuron'、 'one-earth' 和'structure'。

</Route>

## Deloitte {#deloitte}

<Route author="laampui" example="/deloitte/industries/consumer" path="/deloitte/industries/:category?" paramsDesc={['默认为 energy-resources-industrials']}>

| 消费行业 | 能源、资源及工业行业         | 金融服务行业       | 政府及公共服务             | 生命科学与医疗行业       | 科技、传媒及电信行业                |
| -------- | ---------------------------- | ------------------ | -------------------------- | ------------------------ | ----------------------------------- |
| consumer | energy-resources-industrials | financial-services | government-public-services | life-sciences-healthcare | technology-media-telecommunications |

</Route>

## elife {#elife}

### 最新成果 {#elife-zui-xin-cheng-guo}

<Route author="emdoe HenryQW" example="/elife/cell-biology" path="/elife/:subject" paramsDesc={['方向名称', '请在主页获取。`latest` 则为全部。']} supportScihub="1"/>

## ELSEVIER {#elsevier}

### 期刊 {#elsevier-qi-kan}

<Route author="Derekmini sunwolf-swb" example="/elsevier/signal-processing" path="/elsevier/:journal" paramsDesc={['期刊名称，URL 中 `/journal/` 后部分']} radar="1" rssbud="1"/>

### 期刊指定卷 {#elsevier-qi-kan-zhi-ding-juan}

<Route author="Derekmini sunwolf-swb" example="/elsevier/signal-processing/192" path="/elsevier/:journal/:issue" paramsDesc={['期刊名称，URL 中 `/journal/` 后部分','发行号 (如果 Volume 与 Issue 同时存在，采用 `Volume-Issue` 形式, e.g., `/elsevier/aace-clinical-case-reports/7-6`)']} radar="1" rssbud="1"/>

## IEEE Computer Society {#ieee-computer-society}

### IEEE Symposium on Security and Privacy {#ieee-computer-society-ieee-symposium-on-security-and-privacy}

<Route author="ZeddYu" example="/ieee-security/security-privacy" path="/ieee-security/security-privacy">

抓取的 Papers 从 2020 年开始

</Route>

## IEEE Xplore {#ieee-xplore}

### 作者 {#ieee-xplore-zuo-zhe}

<Route author="queensferryme" example="/ieee/author/37283006000/newest/10" path="/ieee/author/:aid/:sortType/:count?" paramsDesc={['作者 ID，可以在 URL 中找到，例如 [https://ieeexplore.ieee.org/author/37283006000](https://ieeexplore.ieee.org/author/37283006000)', '排序方式，详细见下', '数量限制，默认为 10 篇']}>

| 排序方式    | 最新     | 最旧     | 最多论文引用      | 最多专利引用       | 最流行         | 标题升序        | 标题降序         |
| ----------- | -------- | -------- | ----------------- | ------------------ | -------------- | --------------- | ---------------- |
| `:sortType` | `newest` | `oldest` | `paper-citations` | `patent-citations` | `most-popular` | `pub-title-asc` | `pub-title-desc` |

</Route>

### 期刊 {#ieee-xplore-qi-kan}

<Route author="Derekmini auto-bot-ty" example="/ieee/journal/70" path="/ieee/journal/:journal/:sortType?" paramsDesc={['期刊代码，URL 中 `punumber` 部分','排序方式，默认`vol-only-seq`，URL 中 `sortType` 部分']} radar="1" rssbud="1"/>

### 期刊（近两个月内文章） {#ieee-xplore-qi-kan-%EF%BC%88-jin-liang-ge-yue-nei-wen-zhang-%EF%BC%89}

<Route author="Derekmini auto-bot-ty" example="/ieee/journal/78/recent" path="/ieee/journal/:journal/recent/:sortType?" paramsDesc={['期刊代码，URL 中 `punumber` 部分','排序方式，默认`vol-only-seq`，URL 中 `sortType` 部分']} radar="1" rssbud="1"/>

### 预印版 {#ieee-xplore-yu-yin-ban}

<Route author="5upernova-heng" example="/ieee/journal/5306045/earlyaccess" path="/ieee/journal/:journal/earlyaccess/:sortType?" paramsDesc={['发布代码，URL 中 `isnumber` 部分','排序方式，默认`vol-only-seq`，URL 中 `sortType` 部分']} radar="1" rssbud="1"/>

## INFORMS {#informs}

### 类型 {#informs-lei-xing}

<Route author="Fatpandac" example="/informs/mnsc" path="/informs/:category?" paramsDesc={['类型, 可以在 url 中得到，默认为 `orsc`']}/>

## MDPI {#mdpi}

### 期刊 {#mdpi-qi-kan}

<Route author="Derekmini" example="/mdpi/analytica" path="/mdpi/:journal" paramsDesc={['期刊名称，从期刊主页 URL 中获得']} radar="1" rssbud="1"/>

## National Bureau of Economic Research {#national-bureau-of-economic-research}

### 全部论文 {#national-bureau-of-economic-research-quan-bu-lun-wen}

<Route author="5upernova-heng" example="/nber/papers" path="/nber/papers" radar="1" supportScihub="1"/>

### 新论文 {#national-bureau-of-economic-research-xin-lun-wen}

<Route author="5upernova-heng" example="/nber/news" path="/nber/news" radar="1" supportScihub="1">

在网站上被标记为 "new" 的论文

</Route>

## Nature 系列 {#nature-xi-lie}

:::tip Tips

You can get all short name of a journal from <https://www.nature.com/siteindex> or [期刊列表](#nature-xi-lie-qi-kan-lie-biao).

:::

### 最新成果 {#nature-xi-lie-zui-xin-cheng-guo}

<Route author="y9c TonyRL" example="/nature/research/ng" path="/nature/research/:journal?" paramsDesc={['期刊名简写，默认为 `nature`']} supportScihub="1" radar="1" rssbud="1">

|   `:journal`  |            期刊名           | 路由                                                                               |
| :-----------: | :-------------------------: | ---------------------------------------------------------------------------------- |
|     nature    |            Nature           | [/nature/research/nature](https://rsshub.app/nature/research/nature)               |
|      nbt      |     Nature Biotechnology    | [/nature/research/nbt](https://rsshub.app/nature/research/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/research/neuro](https://rsshub.app/nature/research/neuro)                 |
|       ng      |       Nature Genetics       | [/nature/research/ng](https://rsshub.app/nature/research/ng)                       |
|       ni      |      Nature Immunology      | [/nature/research/ni](https://rsshub.app/nature/research/ni)                       |
|     nmeth     |        Nature Method        | [/nature/research/nmeth](https://rsshub.app/nature/research/nmeth)                 |
|     nchem     |       Nature Chemistry      | [/nature/research/nchem](https://rsshub.app/nature/research/nchem)                 |
|      nmat     |       Nature Materials      | [/nature/research/nmat](https://rsshub.app/nature/research/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/research/natmachintell](https://rsshub.app/nature/research/natmachintell) |

-   通过 `/nature/research/` + “杂志简写” 来获取对应杂志的最新文章 (Latest Research)。
    若参数置空 (`/nature/research`)，则默认获取主刊 (Nature) 的最新文章。
-   由于 Nature 系列的刊物是分别由不同的编辑来独立运营，所以页面格式上有些差异。目前**仅**对以上杂志进行了测试。
-   由于权限的限制，目前部分论文仅获取摘要进行展示。

</Route>

### 新闻及评论 {#nature-xi-lie-xin-wen-ji-ping-lun}

<Route author="y9c TonyRL" example="/nature/news-and-comment/ng" path="/nature/news-and-comment/:journal" paramsDesc={['期刊名简写']} supportScihub="1" radar="1" rssbud="1">

|   `:journal`  |            期刊名           | 路由                                                                                               |
| :-----------: | :-------------------------: | -------------------------------------------------------------------------------------------------- |
|      nbt      |     Nature Biotechnology    | [/nature/news-and-comment/nbt](https://rsshub.app/nature/news-and-comment/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/news-and-comment/neuro](https://rsshub.app/nature/news-and-comment/neuro)                 |
|       ng      |       Nature Genetics       | [/nature/news-and-comment/ng](https://rsshub.app/nature/news-and-comment/ng)                       |
|       ni      |      Nature Immunology      | [/nature/news-and-comment/ni](https://rsshub.app/nature/news-and-comment/ni)                       |
|     nmeth     |        Nature Method        | [/nature/news-and-comment/nmeth](https://rsshub.app/nature/news-and-comment/nmeth)                 |
|     nchem     |       Nature Chemistry      | [/nature/news-and-comment/nchem](https://rsshub.app/nature/news-and-comment/nchem)                 |
|      nmat     |       Nature Materials      | [/nature/news-and-comment/nmat](https://rsshub.app/nature/news-and-comment/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/news-and-comment/natmachintell](https://rsshub.app/nature/news-and-comment/natmachintell) |

-   通过 `/nature/research/` + “杂志简写” 来获取对应杂志的最新文章 (Latest Research)。
    主刊由于格式不同，该 router 并未支持，采用 `/nature/news` 来获取新闻。
-   由于 Nature 系列的刊物是分别由不同的编辑来独立运营，所以页面格式上有些差异。目前**仅**对以上杂志进行了测试。

</Route>

### 封面故事 {#nature-xi-lie-feng-mian-gu-shi}

<Route author="y9c" example="/nature/cover" path="/nature/cover">

订阅 Nature 系列杂志的封面图片，并及时获取刊物更新状态。

</Route>

### 主刊 - 新闻动态 {#nature-xi-lie-zhu-kan---xin-wen-dong-tai}

<Route author="y9c TonyRL" example="/nature/news" path="/nature/news" supportScihub="1" radar="1" rssbud="1"/>

### 精彩研究 {#nature-xi-lie-jing-cai-yan-jiu}

<Route author="y9c TonyRL" example="/nature/highlight" path="/nature/highlight/:journal?" paramsDesc={['期刊名简写，默认为 `nature`']} supportScihub="1" radar="1" rssbud="1"/>

:::caution 警告

仅支持部分期刊。

:::

### 期刊列表 {#nature-xi-lie-qi-kan-lie-biao}

<Route author="TonyRL" example="/nature/siteindex" path="/nature/siteindex"/>

## Network and Distributed System Security (NDSS) Symposium {#network-and-distributed-system-security-(ndss)-symposium}

### Accepted papers {#network-and-distributed-system-security-(ndss)-symposium-accepted-papers}

<Route author="ZeddYu" example="/ndss-symposium/ndss" path="/ndss-symposium/ndss">

抓取的 Papers 从 2020 年开始

</Route>

## Oxford University Press {#oxford-university-press}

### Oxford Academic {#oxford-university-press-oxford-academic}

#### 期刊

<Route author="Fatpandac" example="/oup/journals/adaptation" path="/oup/journals/:name" paramsDesc={['期刊名称缩写，可以在网址中得到']} anticrawler="1"/>

## Proceedings of The National Academy of Sciences {#proceedings-of-the-national-academy-of-sciences}

### 期刊 {#proceedings-of-the-national-academy-of-sciences-qi-kan}

<Route author="emdoe HenryQW y9c" example="/pnas/latest" path="/pnas/:topicPath*" paramsDesc={['领域路径，支持 **Featured Topics**、**Articles By Topic** 及 [**Collected Papers**](https://www.pnas.org/about/collected-papers), 预设为 `latest`']} radar="1" anticrawler="1" puppeteer="1" supportScihub="1">

:::tip Tips
有些领域需要在 `topicPath` 中添加 `topic/`，如 [`/pnas/topic/app-math`](https://rsshub.app/pnas/topic/app-math)，有些则不需要，如 [`/pnas/biophysics-and-computational-biology`](https://rsshub.app/pnas/biophysics-and-computational-biology)
:::

</Route>

## PubMed {#pubmed}

### Trending articles {#pubmed-trending-articles}

<Route author="y9c nczitzk" example="/pubmed/trending" path="/pubmed/trending/:filter?" paramsDesc={['过滤条件，可在 URL 中找到']} supportScihub="1">

:::tip 提示

对于参数 **过滤条件**，应将 URL 中的 filter 参数用 `,` 分割成一个字段填入，下面是一个例子。

<https://pubmed.ncbi.nlm.nih.gov/trending/?filter=simsearch1.fha&filter=pubt.clinicaltrial&filter=pubt.randomizedcontrolledtrial> 中 filter 参数有 `simsearch1.fha` `pubt.clinicaltrial` `pubt.randomizedcontrolledtrial` 三者。所以，对应到路由的 filter 应填入 `simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial`，于是可获得路由 [`/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial`](https://rsshub.app/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial)

:::

</Route>

## Science 系列 {#science-xi-lie}

### 本期刊物 {#science-xi-lie-ben-qi-kan-wu}

<Route author="y9c TonyRL" example="/science/current/science" path="/science/current/:journal" paramsDesc={['期刊名简写']} supportScihub="1" anticrawler="1" puppeteer="1" radar="1" rssbud="1">

|     简写    |             期刊名             | 路由                                                                           |
| :---------: | :----------------------------: | ------------------------------------------------------------------------------ |
|   science   |             Science            | [/science/current/science](https://rsshub.app/science/current/science)         |
|    sciadv   |        Science Advances        | [/science/current/sciadv](https://rsshub.app/science/current/sciadv)           |
|  sciimmunol |       Science Immunology       | [/science/current/sciimmunol](https://rsshub.app/science/current/sciimmunol)   |
| scirobotics |        Science Robotics        | [/science/current/scirobotics](https://rsshub.app/science/current/scirobotics) |
|  signaling  |        Science Signaling       | [/science/current/signaling](https://rsshub.app/science/current/signaling)     |
|     stm     | Science Translational Medicine | [/science/current/stm](https://rsshub.app/science/current/stm)                 |

-   通过 `/science/current/` + "期刊名简写" 来获取对应杂志最新一期的文章（Current Issue）。
    若参数置空（`/science/current`），则默认获取主刊（Science）的最新文章。

</Route>

### 封面故事 {#science-xi-lie-feng-mian-gu-shi}

<Route author="y9c TonyRL" example="/science/cover" path="/science/cover" anticrawler="1" radar="1" rssbud="1">

订阅 Science 系列杂志的封面图片，并及时获取刊物更新状态。

包含了： 'Science', 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' 和 'Science Translational Medicine'。

</Route>

### 在线发表 {#science-xi-lie-zai-xian-fa-biao}

<Route author="y9c TonyRL" example="/science/early" path="/science/early/:journal?" paramsDesc={['期刊名简写']} supportScihub="1" anticrawler="1" puppeteer="1" radar="1" rssbud="1">

*仅 Science, Science Immunology 和 Science Translational Medicine 提供在线发表*

</Route>

### 博客 {#science-xi-lie-bo-ke}

<Route author="TomHodson" example="/science/blogs/pipeline" path="/science/blogs/:name?" paramsDesc={['博客简称，可在 URL 找到。默认为 `pipeline`']} anticrawler="1" puppeteer="1" radar="1" rssbud="1">

要订阅 [Derek Lowe 的 IN THE PIPELINE](https://science.org/blogs/pipeline) 或 [科学编辑的博客](https://science.org/blogs/editors-blog)，请使用名称参数 `pipeline` 或 `editors-blog`。

</Route>

## ScienceDirect {#sciencedirect}

### Journal {#sciencedirect-journal}

<Route author="nczitzk" example="/sciencedirect/journal/research-policy" path="/sciencedirect/journal/:id" paramsDesc={['期刊 id，可在对应期刊页 URL 中找到']}/>

## Scitation {#scitation}

### 期刊 {#scitation-qi-kan}

<Route author="Derekmini auto-bot-ty" example="/scitation/aapt/ajp" path="/scitation/:pub/:jrn" paramsDesc={['出版社，URL 中 `scitation.org` 前部分','期刊，URL 中 `/toc/` 后部分']} radar="1" rssbud="1" puppeteer="1"/>

### 专栏 {#scitation-zhuan-lan}

<Route author="Derekmini auto-bot-ty" example="/scitation/aapt/ajp/COMPUTATIONAL+PHYSICS" path="/scitation/:pub/:jrn/:sec" paramsDesc={['出版社，URL 中 `scitation.org` 前部分','期刊，URL 中 `/toc/` 后部分','专栏，URL 中 `tocSection` 部分']} radar="1" rssbud="1" puppeteer="1"/>

## Springer {#springer}

### 期刊 {#springer-qi-kan}

<Route author="Derekmini TonyRL" example="/springer/journal/10450" path="/springer/journal/:journal" paramsDesc={['期刊代码，期刊主页 URL 中的数字']} radar="1" rssbud="1"/>

## Stork 文献鸟订阅 {#stork-wen-xian-niao-ding-yue}

### 关键词 {#stork-wen-xian-niao-ding-yue-guan-jian-ci}

<Route author="xraywu" example="/stork/keyword/409159/R4j3Hbn5ia" path="/stork/keyword/:trackID/:displayKey" paramsDesc={['关键词订阅 URL 上的 trackID 参数','关键词订阅 URL 上的  displayKey 参数']}>

在 Stork 上注册并订阅关键词后，在 `我的` -> `关键词` 中可找到对应关键词的订阅 URL。URL 后的两个参数即为路由参数。

</Route>

## Telecompaper {#telecompaper}

### News {#telecompaper-news}

<Route author="nczitzk" example="/telecompaper/news/mobile/2020/China/News" path="/telecompaper/news/:caty/:year?/:country?/:type?" paramsDesc={['分类，见下表', '年份，可在所选分类页中 Filter 的 `Years` 选择器中选择相应年份，不限年份则填入 `all`，默认为不限', '国家或大洲，可在所选分类页中 Filter 的 `Countries` 选择器中选择相应国家或大洲，不限国家或大洲则填入 `all`，默认为不限', '类型，可在所选分类页中 Filter 的 `Types` 选择器中选择相应类型，不限类型则填入 `all`，默认为不限']}>

可选分类如下

| WIRELESS | BROADBAND | VIDEO     | GENERAL | IT | INDUSTRY RESOURCES |
| -------- | --------- | --------- | ------- | -- | ------------------ |
| mobile   | internet  | boardcast | general | it | industry-resources |

:::tip 提示

若 `country` 或 `type` 参数包含空格，则用 `-` 替代。如 `United States` 更换为 `United-States`，`White paper` 更换为 `White-paper`

[INDUSTRY RESOURCES](https://www.telecompaper.com/industry-resources) 分类页的 Filter 仅提供了 `Content Type` 选择器，对应路由中 `type` 参数。`year` 和 `country` 参数则对该分类无效。

:::

</Route>

### Search {#telecompaper-search}

<Route author="nczitzk" example="/telecompaper/search/Nokia" path="/telecompaper/search/:keyword?/:company?/:sort?/:period?" paramsDesc={['关键词', '公司名，默认为不限', '排序，见下表，默认为 Date Descending', '发表在时间段内，默认为 12 months']}>

排序

| Date Ascending | Date Descending |
| -------------- | --------------- |
| 1              | 2               |

发表在时间段内

| 1 month | 3 months | 6 months | 12 months | 24 months |
| ------- | -------- | -------- | --------- | --------- |
| 1       | 3        | 6        | 12        | 24        |

</Route>

## USENIX {#usenix}

### Security Symposia {#usenix-security-symposia}

<Route author="ZeddYu" example="/usenix/usenix-security-sympoium" path="/usenix/usenix-security-sympoium">

抓取的 Papers 从 2020 年开始

</Route>

## X-MOL 平台 {#x-mol-ping-tai}

### 期刊 {#x-mol-ping-tai-qi-kan}

<Route author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" paramsDesc={['类别','机构，两个参数都可从期刊URL获取。']} />

## 谷歌学术 {#gu-ge-xue-shu}

### 关键词更新 {#gu-ge-xue-shu-guan-jian-ci-geng-xin}

<Route author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" paramsDesc={['查询语句, 支持「简单」和「高级」两种模式:']} anticrawler="1">

1.  简单模式，例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2.  高级模式，前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn&as_sdt=0,5), 点击左上角，选择高级搜索并提交查询。此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数。例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

</Route>

### 作者引用更新 {#gu-ge-xue-shu-zuo-zhe-yin-yong-geng-xin}

<Route author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

路由中的参数 id，即用户谷歌学术引用页面 url 中的 id，如 <https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ> 中 user= 后的 mlmE4JMAAAAJ。

</Route>

## 管理世界 {#guan-li-shi-jie}

### 分类 {#guan-li-shi-jie-fen-lei}

<Route author="nczitzk" example="/mvm" path="/mvm/:category?" paramsDesc={['分类，见下表，默认为本期要目']}>

| 本期要目 | 网络首发 | 学术活动 | 通知公告 |
| -------- | -------- | -------- | -------- |
| bqym     | wlsf     | xshd     | tzgg     |

</Route>

## 环球法律评论 {#huan-qiu-fa-l%C3%BC-ping-lun}

### 期刊 {#huan-qiu-fa-l%C3%BC-ping-lun-qi-kan}

<Route author="nczitzk" example="/globallawreview" path="/globallawreview"/>

## 中国知网 {#zhong-guo-zhi-wang}

### 期刊 {#zhong-guo-zhi-wang-qi-kan}

<Route author="Fatpandac Derekmini" example="/cnki/journals/LKGP" path="/cnki/journals/:name" paramsDesc={['期刊缩写，可以在网址中得到']}/>

### 网络首发 {#zhong-guo-zhi-wang-wang-luo-shou-fa}

<Route author="Fatpandac" example="/cnki/journals/debut/LKGP" path="/cnki/journals/debut/:name" paramsDesc={['期刊缩写，可以在网址中得到']}/>

### 作者期刊文献 {#zhong-guo-zhi-wang-zuo-zhe-qi-kan-wen-xian}

:::tip 注意
可能仅限中国大陆服务器访问，以实际情况为准。
:::

<Route author="harveyqiu Derekmini" example="/cnki/author/000042423923" path="/cnki/author/:code" paramsDesc={['作者对应code，可以在网址中得到']}/>
