---
pageClass: routes
---

# 科学期刊

## 聚合平台

### PubMed-热门文章

<Route author="yech1990" example="/pubmed/trending" path="/pubmed/trending" />

### X-MOL 平台-新闻

<Route author="cssxsh" example="/x-mol/news/3" path="/x-mol/news/:tag?" :paramsDesc="['数字编号，可从新闻列表URL得到。为空时从新闻主页获取新闻。']" />

### X-MOL 平台-期刊

<Route author="cssxsh" example="/x-mol/paper/0/9" path="/x-mol/paper/:type/:magazine" :paramsDesc="['类别','机构，两个参数都可从期刊URL获取。']" />

### 谷歌学术-关键词更新

<Route author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" :paramsDesc="['查询语句, 支持「简单」和「高级」两种模式:']" anticrawler="1">

1. 简单模式, 例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2. 高级模式, 前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn&as_sdt=0,5), 点击左上角, 选择高级搜索并提交查询. 此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数. 例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

</Route>

### 谷歌学术-作者引用更新

<Route author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

路由中的参数 id，即用户谷歌学术引用页面 url 中的 id，如 https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ 中 user= 后的 mlmE4JMAAAAJ。

</Route>

## 期刊网站

### eLife-最新成果-综合

<Route author="emdoe" example="/elife/latest" path="/elife/latest" />

### elife-最新成果-细分领域

<Route author="emdoe" example="/elife/cell-biology" path="/elife/:subject" :paramsDesc="['方向名称', '请在主页获取']" />

### Nature 主刊-最新成果

<Route author="yech1990" example="/nature/nature/research" path="/nature/nature/research" />

### Nature 主刊-新闻动态

<Route author="yech1990" example="/nature/nature/news" path="/nature/nature/news" />

### Nature 主刊-精彩研究

<Route author="yech1990" example="/nature/nature/highlight" path="/nature/nature/highlight" />

### Nature Genetics (ng)-最新成果

<Route author="yech1990" example="/nature/ng/research" path="/nature/ng/research" />

### Nature Methods (nmeth)-最新成果

<Route author="yech1990" example="/nature/nmeth/research" path="/nature/nmeth/research" />

### Nature Biotechnology (nbt)-最新成果

<Route author="yech1990" example="/nature/nbt/research" path="/nature/nbt/research" />

### Nature Neuroscience (neuro)-最新成果

<Route author="yech1990" example="/nature/neuro/research" path="/nature/neuro/research" />

### Nature Machine Intelligence (natmachintell)-最新成果

<Route author="LogicJake" example="/nature/natmachintell/research" path="/nature/natmachintell/research" />

### PNAS-最新文章(全部)

<Route author="emdoe" example="/pnas/latest" path="/pnas/latest" />

### PNAS-最新文章(根据领域分类)

<Route author="emdoe" example="/pnas/Applied Mathematics" path="/pnas/:topic" :paramsDesc="['领域名称','可从 pnas.org 获得']" />

### Science 主刊-本期刊物

<Route author="yech1990" example="/sciencemag/science/current" path="/sciencemag/science/current" />

### Science 主刊-在线发表

<Route author="yech1990" example="/sciencemag/science/early" path="/sciencemag/science/early" />

### Science Advances-本期刊物

<Route author="yech1990" example="/sciencemag/advances/current" path="/sciencemag/advances/current" />
