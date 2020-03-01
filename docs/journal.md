---
pageClass: routes
---

# 科学期刊

## Cell

### 主刊

<Route author="yech1990" example="/cell/cell/current" path="/journals/cell/cell/:category" supportScihub="1"/>

| `:category` |      类型说明       | 路由                                     |
| :---------: | :-----------------: | ---------------------------------------- |
|   current   | 本期刊物 (默认选项) | [/cell/cell/current](/cell/cell/current) |
|   inpress   |      在线发表       | [/cell/cell/inpress](/cell/cell/inpress) |

</Route>

## elife

### 最新成果

<Route author="emdoe HenryQW" example="/elife/cell-biology" path="/journals/elife/:subject" :paramsDesc="['方向名称', '请在主页获取。`latest` 则为全部。']" supportScihub="1"/>

## Nature 系列

### 最新成果

<Route author="yech1990" example="/nature/research/ng" path="/journals/nature/research/:journal" :paramsDesc="['期刊名简写']" />

|  `:journal`   |           期刊名            | 路由                                                             |
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

-   通过 `/nature/research/` + “杂志简写”来获取对应杂志的最新文章（Latest Research）。
    若参数置空（`/nature/research`），则默认获取主刊（Nature）的最新文章。
-   由于 Nature 系列的刊物是分别由不同的编辑来独立运营，所以页面格式上有些差异。目前**仅**对以下杂志进行了测试。
-   由于权限的限制，目前仅获取论文的摘要进行展示。

</Route>

### 新闻及评论

<Route author="yech1990" example="/nature/news-and-comment/ng" path="/journals/nature/news-and-comment/:journal" :paramsDesc="['期刊名简写']" supportScihub="1"/>

|  `:journal`   |           期刊名            | 路由                                                                             |
| :-----------: | :-------------------------: | -------------------------------------------------------------------------------- |
|      nbt      |    Nature Biotechnology     | [/nature/news-and-comment/nbt](/nature/news-and-comment/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/news-and-comment/neuro](/nature/news-and-comment/neuro)                 |
|      ng       |       Nature Genetics       | [/nature/news-and-comment/ng](/nature/news-and-comment/ng)                       |
|      ni       |      Nature Immunology      | [/nature/news-and-comment/ni](/nature/news-and-comment/ni)                       |
|     nmeth     |        Nature Method        | [/nature/news-and-comment/nmeth](/nature/news-and-comment/nmeth)                 |
|     nchem     |      Nature Chemistry       | [/nature/news-and-comment/nchem](/nature/news-and-comment/nchem)                 |
|     nmat      |      Nature Materials       | [/nature/news-and-comment/nmat](/nature/news-and-comment/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/news-and-comment/natmachintell](/nature/news-and-comment/natmachintell) |

-   通过 `/nature/research/` + “杂志简写”来获取对应杂志的最新文章（Latest Research）。
    主刊由于格式不同，该 router 并未支持，采用 `/nature/news` 来获取新闻。
-   由于 Nature 系列的刊物是分别由不同的编辑来独立运营，所以页面格式上有些差异。目前**仅**对以下杂志进行了测试。

</Route>

### 主刊 - 新闻动态

<Route author="yech1990" example="/nature/news" path="/journals/nature/news" />

### 主刊 - 精彩研究

<Route author="yech1990" example="/nature/highlight" path="/journals/nature/highlight" supportScihub="1"/>

## PNAS

### 最新文章(根据领域分类)

<Route author="emdoe HenryQW" example="/pnas/Applied Mathematics" path="/journals/pnas/:topic" :paramsDesc="['领域名称, 可从 pnas.org 获得。`latest` 则为全部。']" supportScihub="1" />

## PubMed

### 热门文章

<Route author="yech1990" example="/pubmed/trending" path="/journals/pubmed/trending" supportScihub="1"/>

## Science 系列

### 本期刊物

<Route author="yech1990" example="/sciencemag/current/science" path="/journals/sciencemag/current/:journal" :paramsDesc="['期刊名简写']" supportScihub="1"/>

| `:journal` |             期刊名             | 路由                                                             |
| :--------: | :----------------------------: | ---------------------------------------------------------------- |
|  science   |            Science             | [/sciencemag/current/science](/sciencemag/current/science)       |
|  advances  |        Science Advances        | [/sciencemag/current/advances](/sciencemag/current/advances)     |
| immunology |       Science Immunology       | [/sciencemag/current/immunology](/sciencemag/current/immunology) |
|  robotics  |        Science Robotics        | [/sciencemag/current/robotics](/sciencemag/current/robotics)     |
|    stke    |       Science Signaling        | [/sciencemag/current/stke](/sciencemag/current/stke)             |
|    stm     | Science Translational Medicine | [/sciencemag/current/stm](/sciencemag/current/stm)               |

-   通过 `/sciencemag/current/` + “杂志简写”来获取对应杂志最新一期的文章（Current Issue）。
    若参数置空（`/sciencemag/current`），则默认获取主刊（Science）的最新文章。

</Route>

### 主刊-在线发表

<Route author="yech1990" example="/sciencemag/early/science" path="/journals/sciencemag/early/science" supportScihub="1"/>

_仅支持 Science 主刊_

</Route>

## X-MOL

### 平台-期刊

<Route author="cssxsh" example="/journals/x-mol/paper/0/9" path="/journals/x-mol/paper/:type/:magazine" :paramsDesc="['类别','机构，两个参数都可从期刊URL获取。']" />

## 谷歌学术

### 关键词更新

<Route author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" :paramsDesc="['查询语句, 支持「简单」和「高级」两种模式:']" anticrawler="1">

1. 简单模式, 例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2. 高级模式, 前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn&as_sdt=0,5), 点击左上角, 选择高级搜索并提交查询. 此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数. 例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

</Route>

### 作者引用更新

<Route author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

路由中的参数 id，即用户谷歌学术引用页面 url 中的 id，如 https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ 中 user= 后的 mlmE4JMAAAAJ。

</Route>
