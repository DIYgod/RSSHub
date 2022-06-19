---
pageClass: routes
---

# 科学期刊

## Academy of Management

### Journal

<Route author="nczitzk" example="/aom/journal/amr" path="/aom/journal/:id" :paramsDesc="['期刊 id，见下表']" supportScihub="1">

| Id        | 名称                                         |
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

## arXiv

### 搜索关键字

<Route author="nczitzk" example="/arxiv/search_query=all:electron&start=0&max_results=10" path="/arxiv/:query" :paramsDesc="['查询语句']" anticrawler="1">

参见 [arXiv API 用户手册](https://arxiv.org/help/api/user-manual) 查看所有查询参数。

路由中的参数 query 处填写 `http://export.arxiv.org/api/query?` 后的内容。

</Route>

## BioOne

### Featured articles

<Route author="nczitzk" example="/bioone/featured" path="/bioone/featured"/>

### Journals

<Route author="nczitzk" example="/bioone/journals/acta-chiropterologica" path="/bioone/journals/:journal?" :paramsDesc="['期刊名，可在期刊页地址栏中找到']"/>

## caa.reviews

### Book Reviews

<Route author="Fatpandac" example="/caareviews/book" path="/caareviews/book"/>

### Exhibition Reviews

<Route author="Fatpandac" example="/caareviews/exhibition" path="/caareviews/exhibition"/>

### Essays

<Route author="Fatpandac" example="/caareviews/essay" path="/caareviews/essay"/>

## Cell

### 主刊

<Route author="yech1990" example="/cell/cell/current" path="/journals/cell/cell/:category" supportScihub="1"/>

| `:category` |     类型说明    | 路由                                                         |
| :---------: | :---------: | ---------------------------------------------------------- |
|   current   | 本期刊物 (默认选项) | [/cell/cell/current](https://rsshub.app/cell/cell/current) |
|   inpress   |     在线发表    | [/cell/cell/inpress](https://rsshub.app/cell/cell/inpress) |

</Route>

### 封面故事

<Route author="yech1990" example="/cell/cover" path="/cell/cover" />

订阅 Cell 系列杂志的封面图片，并及时获取刊物更新状态。

包含了： 'cell'、 'cancer-cell'、 'cell-chemical-biology'、 'cell-host-microbe'、 'cell-metabolism'、 'cell-reports'、 'cell-reports-physical-science'、 'cell-stem-cell'、 'cell-systems'、 'chem'、 'current-biology'、 'developmental-cell'、 'immunity'、 'joule'、 'matter'、 'molecular-cell'、 'neuron'、 'one-earth' 和'structure'。

</Route>

## Deloitte

<Route author="laampui" example="/deloitte/industries/consumer" path="/deloitte/industries/:category?" :paramsDesc="['默认为 energy-resources-industrials']">

| 消费行业     | 能源、资源及工业行业                   | 金融服务行业             | 政府及公共服务                    | 生命科学与医疗行业                | 科技、传媒及电信行业                          |
| -------- | ---------------------------- | ------------------ | -------------------------- | ------------------------ | ----------------------------------- |
| consumer | energy-resources-industrials | financial-services | government-public-services | life-sciences-healthcare | technology-media-telecommunications |

</Route>

## elife

### 最新成果

<Route author="emdoe HenryQW" example="/elife/cell-biology" path="/elife/:subject" :paramsDesc="['方向名称', '请在主页获取。`latest` 则为全部。']" supportScihub="1"/>

## ELSEVIER

### 期刊

<Route author="Derekmini sunwolf-swb" example="/elsevier/signal-processing" path="/elsevier/:journal" :paramsDesc="['期刊名称，URL 中 `/journal/` 后部分']" radar="1" rssbud="1"/>

### 期刊指定卷

<Route author="Derekmini sunwolf-swb" example="/elsevier/signal-processing/192" path="/elsevier/:journal/:issue" :paramsDesc="['期刊名称，URL 中 `/journal/` 后部分','发行号 (如果 Volume 与 Issue 同时存在，采用 `Volume-Issue` 形式, e.g., `/elsevier/aace-clinical-case-reports/7-6`)']" radar="1" rssbud="1"/>

## IEEE Xplore

### 作者

<Route author="queensferryme" example="/ieee/author/37283006000/newest/10" path="/ieee/author/:aid/:sortType/:count?" :paramsDesc="['作者 ID，可以在 URL 中找到，例如 [https://ieeexplore.ieee.org/author/37283006000](https://ieeexplore.ieee.org/author/37283006000)', '排序方式，详细见下', '数量限制，默认为 10 篇']">

| 排序方式        | 最新       | 最旧       | 最多论文引用            | 最多专利引用             | 最流行            | 标题升序            | 标题降序             |
| ----------- | -------- | -------- | ----------------- | ------------------ | -------------- | --------------- | ---------------- |
| `:sortType` | `newest` | `oldest` | `paper-citations` | `patent-citations` | `most-popular` | `pub-title-asc` | `pub-title-desc` |

</Route>

### 期刊

<Route author="Derekmini auto-bot-ty" example="/ieee/journal/70" path="/ieee/journal/:journal/:sortType?" :paramsDesc="['期刊代码，URL 中 `punumber` 部分','排序方式，默认`vol-only-seq`，URL 中 `sortType` 部分']" radar="1" rssbud="1"/>

### 期刊（近两个月内文章）

<Route author="Derekmini auto-bot-ty" example="/ieee/journal/78/recent" path="/ieee/journal/:journal/recent/:sortType?" :paramsDesc="['期刊代码，URL 中 `punumber` 部分','排序方式，默认`vol-only-seq`，URL 中 `sortType` 部分']" radar="1" rssbud="1"/>

## INFORMS

### 类型

<Route author="Fatpandac" example="/informs/mnsc" path="/informs/:category?" :paramsDesc="['类型, 可以在 url 中得到，默认为 `orsc`']"/>

## Nature 系列

::: tip Tips

You can get all short name of a journal from <https://www.nature.com/siteindex> or [期刊列表](#nature-xi-lie-qi-kan-lie-biao).

:::

### 最新成果

<Route author="yech1990 TonyRL" example="/nature/research/ng" path="/nature/research/:journal?" :paramsDesc="['期刊名简写，默认为 `nature`']" supportScihub="1" radar="1" rssbud="1"/>

|   `:journal`  |             期刊名             | 路由                                                                                 |
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

### 新闻及评论

<Route author="yech1990 TonyRL" example="/nature/news-and-comment/ng" path="/nature/news-and-comment/:journal" :paramsDesc="['期刊名简写']" supportScihub="1" radar="1" rssbud="1"/>

|   `:journal`  |             期刊名             | 路由                                                                                                 |
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

### 封面故事

<Route author="yech1990" example="/nature/cover" path="/nature/cover" />

订阅 Nature 系列杂志的封面图片，并及时获取刊物更新状态。

</Route>

### 主刊 - 新闻动态

<Route author="yech1990 TonyRL" example="/nature/news" path="/nature/news" supportScihub="1" radar="1" rssbud="1"/>

### 精彩研究

<Route author="yech1990 TonyRL" example="/nature/highlight" path="/nature/highlight/:journal?" :paramsDesc="['期刊名简写，默认为 `nature`']" supportScihub="1" radar="1" rssbud="1"/>

::: warning 警告

仅支持部分期刊。

:::

### 期刊列表

<Route author="TonyRL" example="/nature/siteindex" path="/nature/siteindex"/>

## Oxford University Press

### Oxford Academic

#### 期刊

<Route author="Fatpandac" example="/oup/journals/adaptation" path="/oup/journals/:name" :paramsDesc="['期刊名称缩写，可以在网址中得到']" anticrawler="1"/>

## PNAS

### 最新文章（可筛选领域）

<Route author="emdoe yech1990" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['领域名称','可从 pnas.org 获得']" supportScihub="1"/>

-   通过 `/pnas/` + “领域名称” 来获取对应 “领域” 的最新文章（Latest Research）。
    若参数置空（`/pnas`）或为 latest（`/pnas/latest`），则默认获取全部文章。

</Route>

## PubMed

### Trending articles

<Route author="yech1990 nczitzk" example="/pubmed/trending" path="/pubmed/trending/:filter?" :paramsDesc="['过滤条件，可在 URL 中找到']" supportScihub="1">

::: tip 提示

对于参数 **过滤条件**，应将 URL 中的 filter 参数用 `,` 分割成一个字段填入，下面是一个例子。

<https://pubmed.ncbi.nlm.nih.gov/trending/?filter=simsearch1.fha&filter=pubt.clinicaltrial&filter=pubt.randomizedcontrolledtrial> 中 filter 参数有 `simsearch1.fha` `pubt.clinicaltrial` `pubt.randomizedcontrolledtrial` 三者。所以，对应到路由的 filter 应填入 `simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial`，于是可获得路由 [`/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial`](https://rsshub.app/pubmed/trending/simsearch1.fha,pubt.clinicaltrial,pubt.randomizedcontrolledtrial)

:::

</Route>

## Science 系列

### 本期刊物

<Route author="yech1990" example="/sciencemag/current/science" path="/sciencemag/current/:journal" :paramsDesc="['期刊名简写']" supportScihub="1"/>

| `:journal` |               期刊名              | 路由                                                                                 |
| :--------: | :----------------------------: | ---------------------------------------------------------------------------------- |
|   science  |             Science            | [/sciencemag/current/science](https://rsshub.app/sciencemag/current/science)       |
|  advances  |        Science Advances        | [/sciencemag/current/advances](https://rsshub.app/sciencemag/current/advances)     |
| immunology |       Science Immunology       | [/sciencemag/current/immunology](https://rsshub.app/sciencemag/current/immunology) |
|  robotics  |        Science Robotics        | [/sciencemag/current/robotics](https://rsshub.app/sciencemag/current/robotics)     |
|    stke    |        Science Signaling       | [/sciencemag/current/stke](https://rsshub.app/sciencemag/current/stke)             |
|     stm    | Science Translational Medicine | [/sciencemag/current/stm](https://rsshub.app/sciencemag/current/stm)               |

-   通过 `/sciencemag/current/` + “杂志简写” 来获取对应杂志最新一期的文章（Current Issue）。
    若参数置空（`/sciencemag/current`），则默认获取主刊（Science）的最新文章。

</Route>

### 封面故事

<Route author="yech1990" example="/sciencemag/cover" path="/sciencemag/cover" />

订阅 Science 系列杂志的封面图片，并及时获取刊物更新状态。

包含了： ‘Science’, 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' 和 'Science Translational Medicine'。

</Route>

### 主刊 - 在线发表

<Route author="yech1990" example="/sciencemag/early/science" path="/sciencemag/early/science" supportScihub="1"/>

*仅支持 Science 主刊*

</Route>

## ScienceDirect

### Journal

<Route author="nczitzk" example="/sciencedirect/journal/research-policy" path="/sciencedirect/journal/:id" :paramsDesc="['期刊 id，可在对应期刊页 URL 中找到']"/>

## Scitation

### 期刊

<Route author="Derekmini auto-bot-ty" example="/scitation/aapt/ajp" path="/scitation/:pub/:jrn" :paramsDesc="['出版社，URL 中 `scitation.org` 前部分','期刊，URL 中 `/toc/` 后部分']" radar="1" rssbud="1"/>

### 专栏

<Route author="Derekmini auto-bot-ty" example="/scitation/aapt/ajp/COMPUTATIONAL+PHYSICS" path="/scitation/:pub/:jrn/:sec" :paramsDesc="['出版社，URL 中 `scitation.org` 前部分','期刊，URL 中 `/toc/` 后部分','专栏，URL 中 `tocSection` 部分']" radar="1" rssbud="1"/>

## Springer

### 期刊

<Route author="Derekmini TonyRL" example="/springer/journal/10450" path="/springer/journal/:journal" :paramsDesc="['期刊代码，期刊主页 URL 中的数字']" radar="1" rssbud="1"/>

## Stork 文献鸟订阅

### 关键词

<Route author="xraywu" example="/stork/keyword/409159/R4j3Hbn5ia" path="/stork/keyword/:trackID/:displayKey" :paramsDesc="['关键词订阅 URL 上的 trackID 参数','关键词订阅 URL 上的  displayKey 参数']">

在 Stork 上注册并订阅关键词后，在 `我的` -> `关键词` 中可找到对应关键词的订阅 URL。URL 后的两个参数即为路由参数。

</Route>

## X-MOL 平台

### 期刊

<Route author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" :paramsDesc="['类别','机构，两个参数都可从期刊URL获取。']" />

## 谷歌学术

### 关键词更新

<Route author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" :paramsDesc="['查询语句, 支持「简单」和「高级」两种模式:']" anticrawler="1">

1.  简单模式，例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2.  高级模式，前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn\&as_sdt=0,5), 点击左上角，选择高级搜索并提交查询。此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数。例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

</Route>

### 作者引用更新

<Route author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

路由中的参数 id，即用户谷歌学术引用页面 url 中的 id，如 <https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ> 中 user= 后的 mlmE4JMAAAAJ。

</Route>

## 管理世界

### 分类

<Route author="nczitzk" example="/mvm" path="/mvm/:category?" :paramsDesc="['分类，见下表，默认为本期要目']">

| 本期要目 | 网络首发 | 学术活动 | 通知公告 |
| ---- | ---- | ---- | ---- |
| bqym | wlsf | xshd | tzgg |

</Route>

## 中国知网

### 期刊

<Route author="Fatpandac" example="/cnki/journals/LKGP" path="/cnki/journals/:name" :paramsDesc="['期刊缩写，可以在网址中得到']"/>

### 网络首发

<Route author="Fatpandac" example="/cnki/journals/debut/LKGP" path="/cnki/journals/debut/:name" :paramsDesc="['期刊缩写，可以在网址中得到']"/>
