# 🔬 科学期刊

## American Economic Association <Site url="aeaweb.org"/>

### Journal <Site url="aeaweb.org" size="sm" />

<Route namespace="aeaweb" :data='{"path":"/:id","categories":["journal"],"example":"/aeaweb/aer","parameters":{"id":"Journal id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["aeaweb.org/journals/:id","aeaweb.org/"]}],"name":"Journal","maintainers":["nczitzk"],"description":"The URL of the journal [American Economic Review](https://www.aeaweb.org/journals/aer) is `https://www.aeaweb.org/journals/aer`, where `aer` is the id of the journal, so the route for this journal is `/aeaweb/aer`.\n\n  :::tip\n  More jounals can be found in [AEA Journals](https://www.aeaweb.org/journals).\n  :::","location":"index.ts"}' :test='{"code":0}' />

The URL of the journal [American Economic Review](https://www.aeaweb.org/journals/aer) is `https://www.aeaweb.org/journals/aer`, where `aer` is the id of the journal, so the route for this journal is `/aeaweb/aer`.

  :::tip
  More jounals can be found in [AEA Journals](https://www.aeaweb.org/journals).
  :::

## American Institute of Physics <Site url="pubs.aip.org"/>

### Journal <Site url="pubs.aip.org" size="sm" />

<Route namespace="aip" :data='{"path":"/:pub/:jrn","categories":["journal"],"example":"/aip/aapt/ajp","parameters":{"pub":"Publisher id","jrn":"Journal id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["pubs.aip.org/:pub/:jrn"]}],"name":"Journal","maintainers":["Derekmini","auto-bot-ty"],"description":"Refer to the URL format `pubs.aip.org/:pub/:jrn`\n\n  :::tip\n  More jounals can be found in [AIP Publications](https://publishing.aip.org/publications/find-the-right-journal).\n  :::","location":"journal.ts"}' :test='{"code":0}' />

Refer to the URL format `pubs.aip.org/:pub/:jrn`

  :::tip
  More jounals can be found in [AIP Publications](https://publishing.aip.org/publications/find-the-right-journal).
  :::

## Annual Reviews <Site url="annualreviews.org"/>

### Journal <Site url="annualreviews.org" size="sm" />

<Route namespace="annualreviews" :data='{"path":"/:id","categories":["journal"],"example":"/annualreviews/anchem","parameters":{"id":"Journal id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["annualreviews.org/journal/:id","annualreviews.org/"]}],"name":"Journal","maintainers":["nczitzk"],"description":"The URL of the journal [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) is `https://www.annualreviews.org/journal/anchem`, where `anchem` is the id of the journal, so the route for this journal is `/annualreviews/anchem`.\n\n  :::tip\n  More jounals can be found in [Browse Journals](https://www.annualreviews.org/action/showPublications).\n  :::","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

The URL of the journal [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) is `https://www.annualreviews.org/journal/anchem`, where `anchem` is the id of the journal, so the route for this journal is `/annualreviews/anchem`.

  :::tip
  More jounals can be found in [Browse Journals](https://www.annualreviews.org/action/showPublications).
  :::

## ACM Special Interest Group on Security Audit and Control <Site url="sigsac.org"/>

### The ACM Conference on Computer and Communications Security <Site url="sigsac.org/ccs.html" size="sm" />

<Route namespace="sigsac" :data='{"path":"/ccs","categories":["journal"],"example":"/sigsac/ccs","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sigsac.org/ccs.html","sigsac.org/"]}],"name":"The ACM Conference on Computer and Communications Security","maintainers":[],"url":"sigsac.org/ccs.html","description":"Return results from 2020","location":"ccs.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Return results from 2020

## BioOne <Site url="bioone.org"/>

### Featured articles <Site url="bioone.org/" size="sm" />

<Route namespace="bioone" :data='{"path":"/featured","categories":["journal"],"example":"/bioone/featured","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bioone.org/"]}],"name":"Featured articles","maintainers":["nczitzk"],"url":"bioone.org/","location":"featured.ts"}' :test='{"code":0}' />

### Journals <Site url="bioone.org" size="sm" />

<Route namespace="bioone" :data='{"path":"/journals/:journal?","categories":["journal"],"example":"/bioone/journals/acta-chiropterologica","parameters":{"journal":"Journals, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bioone.org/journals/:journal","bioone.org/"],"target":"/journals/:journal"}],"name":"Journals","maintainers":["nczitzk"],"location":"journal.ts"}' :test='{"code":0}' />

## caa.reviews <Site url="caareviews.org"/>

### Book Reviews <Site url="caareviews.org/reviews/book" size="sm" />

<Route namespace="caareviews" :data='{"path":"/book","categories":["journal"],"example":"/caareviews/book","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["caareviews.org/reviews/book"]}],"name":"Book Reviews","maintainers":["Fatpandac"],"url":"caareviews.org/reviews/book","location":"book.ts"}' :test='{"code":0}' />

### Essays <Site url="caareviews.org/reviews/essay" size="sm" />

<Route namespace="caareviews" :data='{"path":"/essay","categories":["journal"],"example":"/caareviews/essay","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["caareviews.org/reviews/essay"]}],"name":"Essays","maintainers":["Fatpandac"],"url":"caareviews.org/reviews/essay","location":"essay.ts"}' :test='{"code":0}' />

### Exhibition Reviews <Site url="caareviews.org/reviews/exhibition" size="sm" />

<Route namespace="caareviews" :data='{"path":"/exhibition","categories":["journal"],"example":"/caareviews/exhibition","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["caareviews.org/reviews/exhibition"]}],"name":"Exhibition Reviews","maintainers":["Fatpandac"],"url":"caareviews.org/reviews/exhibition","location":"exhibition.ts"}' :test='{"code":0}' />

## Google <Site url="www.google.com"/>

### Author Citations <Site url="www.google.com" size="sm" />

<Route namespace="google" :data='{"path":"/citations/:id","categories":["journal"],"example":"/google/citations/mlmE4JMAAAAJ","parameters":{"id":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Author Citations","maintainers":["KellyHwong","const7"],"description":"The parameter id in the route is the id in the URL of the user&#39;s Google Scholar reference page, for example `https://scholar.google.com/citations?user=mlmE4JMAAAAJ` to `mlmE4JMAAAAJ`.\n\n  Query parameters are also supported here, for example `https://scholar.google.com/citations?user=mlmE4JMAAAAJ&sortby=pubdate` to `mlmE4JMAAAAJ&sortby=pubdate`. Please make sure that the user id (`mlmE4JMAAAAJ` in this case) should be the first parameter in the query string.","location":"citations.ts"}' :test='{"code":0}' />

The parameter id in the route is the id in the URL of the user's Google Scholar reference page, for example `https://scholar.google.com/citations?user=mlmE4JMAAAAJ` to `mlmE4JMAAAAJ`.

  Query parameters are also supported here, for example `https://scholar.google.com/citations?user=mlmE4JMAAAAJ&sortby=pubdate` to `mlmE4JMAAAAJ&sortby=pubdate`. Please make sure that the user id (`mlmE4JMAAAAJ` in this case) should be the first parameter in the query string.

### Keywords Monitoring <Site url="www.google.com" size="sm" />

<Route namespace="google" :data='{"path":"/scholar/:query","categories":["journal"],"example":"/google/scholar/data+visualization","parameters":{"query":"query statement which supports「Basic」and「Advanced」modes"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Keywords Monitoring","maintainers":["HenryQW"],"description":":::warning\n  Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn&#39;t guarantee availability. Please deploy your own instance as it might increase the stability.\n  :::\n\n  1.  Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).\n\n  2.  Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).","location":"scholar.ts"}' :test='{"code":0}' />

:::warning
  Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.
  :::

  1.  Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

  2.  Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

## IEEE Xplore <Site url="www.ieee.org"/>

### Early Access Journal <Site url="www.ieee.org" size="sm" />

<Route namespace="ieee" :data='{"path":"/journal/:journal/earlyaccess/:sortType?","categories":["journal"],"example":"/ieee/journal/5306045/earlyaccess","parameters":{"journal":"Issue code, the number of the `isnumber` in the URL","sortType":"Sort Type, default: `vol-only-seq`, the part of the URL after `sortType`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Early Access Journal","maintainers":["5upernova-heng"],"location":"earlyaccess.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Unknown <Site url="www.ieee.org" size="sm" />

<Route namespace="ieee" :data='{"path":["/:journal/latest/vol/:sortType?","/journal/:journal/:sortType?"],"name":"Unknown","maintainers":[],"location":"journal.ts"}' :test='undefined' />

### Unknown <Site url="www.ieee.org" size="sm" />

<Route namespace="ieee" :data='{"path":["/:journal/latest/vol/:sortType?","/journal/:journal/:sortType?"],"name":"Unknown","maintainers":[],"location":"journal.ts"}' :test='undefined' />

### Unknown <Site url="www.ieee.org" size="sm" />

<Route namespace="ieee" :data='{"path":["/:journal/latest/date/:sortType?","/journal/:journal/recent/:sortType?"],"name":"Unknown","maintainers":[],"location":"recent.ts"}' :test='undefined' />

### Unknown <Site url="www.ieee.org" size="sm" />

<Route namespace="ieee" :data='{"path":["/:journal/latest/date/:sortType?","/journal/:journal/recent/:sortType?"],"name":"Unknown","maintainers":[],"location":"recent.ts"}' :test='undefined' />

## IEEE Computer Society <Site url="ieee-security.org"/>

### IEEE Symposium on Security and Privacy <Site url="ieee-security.org/TC/SP-Index.html" size="sm" />

<Route namespace="ieee-security" :data='{"path":"/security-privacy","categories":["journal"],"example":"/ieee-security/security-privacy","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ieee-security.org/TC/SP-Index.html","ieee-security.org/"]}],"name":"IEEE Symposium on Security and Privacy","maintainers":["ZeddYu"],"url":"ieee-security.org/TC/SP-Index.html","description":"Return results from 2020","location":"sp.ts"}' :test='undefined' />

Return results from 2020

## INFORMS <Site url="pubsonline.informs.org"/>

### Category <Site url="pubsonline.informs.org" size="sm" />

<Route namespace="informs" :data='{"path":"/:category?","categories":["journal"],"example":"/informs/mnsc","parameters":{"category":"Category, can be found in the url of the page, `orsc` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Category","maintainers":["Fatpandac"],"location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## MDPI <Site url="www.mdpi.com"/>

### Journal <Site url="www.mdpi.com" size="sm" />

<Route namespace="mdpi" :data='{"path":"/:journal","categories":["journal"],"example":"/mdpi/analytica","parameters":{"journal":"Journal Name, get it from the journal homepage"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.mdpi.com/journal/:journal"]}],"name":"Journal","maintainers":["Derekmini"],"location":"journal.ts"}' :test='{"code":0}' />

## Nature Journal <Site url="nature.com"/>

:::tip
You can get all short name of a journal from [https://www.nature.com/siteindex](https://www.nature.com/siteindex) or [Journal List](#nature-journal-journal-list).
:::

### Cover Story <Site url="nature.com/" size="sm" />

<Route namespace="nature" :data='{"path":"/cover","categories":["journal"],"example":"/nature/cover","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nature.com/"]}],"name":"Cover Story","maintainers":["y9c"],"url":"nature.com/","description":"Subscribe to the cover images of the Nature journals, and get the latest publication updates in time.","location":"cover.ts"}' :test='{"code":1,"message":"expected NaN to be greater than -432000000"}' />

Subscribe to the cover images of the Nature journals, and get the latest publication updates in time.

### Journal List <Site url="nature.com" size="sm" />

<Route namespace="nature" :data='{"path":"/siteindex","categories":["journal"],"example":"/nature/siteindex","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Journal List","maintainers":["TonyRL"],"location":"siteindex.ts"}' :test='{"code":0}' />

### Latest Research <Site url="nature.com" size="sm" />

<Route namespace="nature" :data='{"path":"/research/:journal?","categories":["journal"],"example":"/nature/research/ng","parameters":{"journal":"short name for a journal, `nature` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["nature.com/:journal/research-articles","nature.com/:journal","nature.com/"],"target":"/research/:journal"}],"name":"Latest Research","maintainers":["y9c","TonyRL"],"description":"|   `:journal`  |   Full Name of the Journal  | Route                                                                              |\n  | :-----------: | :-------------------------: | ---------------------------------------------------------------------------------- |\n  |     nature    |            Nature           | [/nature/research/nature](https://rsshub.app/nature/research/nature)               |\n  |      nbt      |     Nature Biotechnology    | [/nature/research/nbt](https://rsshub.app/nature/research/nbt)                     |\n  |     neuro     |     Nature Neuroscience     | [/nature/research/neuro](https://rsshub.app/nature/research/neuro)                 |\n  |       ng      |       Nature Genetics       | [/nature/research/ng](https://rsshub.app/nature/research/ng)                       |\n  |       ni      |      Nature Immunology      | [/nature/research/ni](https://rsshub.app/nature/research/ni)                       |\n  |     nmeth     |        Nature Method        | [/nature/research/nmeth](https://rsshub.app/nature/research/nmeth)                 |\n  |     nchem     |       Nature Chemistry      | [/nature/research/nchem](https://rsshub.app/nature/research/nchem)                 |\n  |      nmat     |       Nature Materials      | [/nature/research/nmat](https://rsshub.app/nature/research/nmat)                   |\n  | natmachintell | Nature Machine Intelligence | [/nature/research/natmachintell](https://rsshub.app/nature/research/natmachintell) |\n\n  -   Using router (`/nature/research/` + \"short name for a journal\") to query latest research paper for a certain journal of Nature Publishing Group.\n      If the `:journal` parameter is blank, then latest research of Nature will return.\n  -   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals\n  -   Only abstract is rendered in some researches","location":"research.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

|   `:journal`  |   Full Name of the Journal  | Route                                                                              |
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

  -   Using router (`/nature/research/` + "short name for a journal") to query latest research paper for a certain journal of Nature Publishing Group.
      If the `:journal` parameter is blank, then latest research of Nature will return.
  -   The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals
  -   Only abstract is rendered in some researches

### Nature News <Site url="nature.com/latest-news" size="sm" />

<Route namespace="nature" :data='{"path":"/news","categories":["journal"],"example":"/nature/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["nature.com/latest-news","nature.com/news","nature.com/"]}],"name":"Nature News","maintainers":["y9c","TonyRL"],"url":"nature.com/latest-news","location":"news.ts"}' :test='{"code":0}' />

### Research Highlight <Site url="nature.com" size="sm" />

<Route namespace="nature" :data='{"path":"/highlight/:journal?","categories":["journal"],"example":"/nature/highlight","parameters":{"journal":"short name for a journal, `nature` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["nature.com/:journal/articles","nature.com/:journal","nature.com/"],"target":"/highlight/:journal"}],"name":"Research Highlight","maintainers":[],"description":":::warning\n  Only some journals are supported.\n  :::","location":"highlight.ts"}' :test='{"code":0}' />

:::warning
  Only some journals are supported.
  :::

### Unknown <Site url="nature.com/latest-news" size="sm" />

<Route namespace="nature" :data='{"path":"/news-and-comment/:journal?","radar":[{"source":["nature.com/latest-news","nature.com/news","nature.com/"],"target":"/news"}],"name":"Unknown","maintainers":["y9c","TonyRL"],"url":"nature.com/latest-news","location":"news-and-comment.ts"}' :test='undefined' />

## National Bureau of Economic Research <Site url="nber.org"/>

### All Papers <Site url="nber.org/papers" size="sm" />

<Route namespace="nber" :data='{"path":["/papers","/news"],"categories":["journal"],"example":"/nber/papers","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["nber.org/papers"]}],"name":"All Papers","maintainers":[],"url":"nber.org/papers","description":"Papers that are published in this week.","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Papers that are published in this week.

### All Papers <Site url="nber.org/papers" size="sm" />

<Route namespace="nber" :data='{"path":["/papers","/news"],"categories":["journal"],"example":"/nber/papers","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["nber.org/papers"]}],"name":"All Papers","maintainers":[],"url":"nber.org/papers","description":"Papers that are published in this week.","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Papers that are published in this week.

## Network and Distributed System Security (NDSS) Symposium <Site url="ndss-symposium.org"/>

### Accepted papers <Site url="ndss-symposium.org/" size="sm" />

<Route namespace="ndss-symposium" :data='{"path":"/ndss","categories":["journal"],"example":"/ndss-symposium/ndss","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ndss-symposium.org/"]}],"name":"Accepted papers","maintainers":["ZeddYu"],"url":"ndss-symposium.org/","description":"Return results from 2020","location":"ndss.ts"}' :test='undefined' />

Return results from 2020

## Oxford University Press <Site url="academic.oup.com"/>

### Oxford Academic <Site url="academic.oup.com/" size="sm" />

<Route namespace="oup" :data='{"path":"/journals/:name","categories":["journal"],"example":"/oup/journals/adaptation","parameters":{"name":"short name for a journal, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["academic.oup.com/","academic.oup.com/:name/issue"]}],"name":"Oxford Academic","maintainers":[],"url":"academic.oup.com/","description":"#### Journal {#oxford-university-press-oxford-academic-journal}","location":"index.ts"}' :test='{"code":0}' />

#### Journal {#oxford-university-press-oxford-academic-journal}

## Royal Society of Chemistry <Site url="pubs.rsc.org"/>

### Journal <Site url="pubs.rsc.org" size="sm" />

<Route namespace="rsc" :data='{"path":"/journal/:id/:category?","categories":["journal"],"example":"/rsc/journal/ta","parameters":{"id":"Journal id, can be found in URL","category":"Category, see below, All Recent Articles by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Journal","maintainers":["nczitzk"],"description":":::tip\n  All journals at [Current journals](https://pubs.rsc.org/en/journals)\n  :::\n\n  | All Recent Articles | Advance Articles |\n  | ------------------- | ---------------- |\n  | allrecentarticles   | advancearticles  |","location":"journal.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

:::tip
  All journals at [Current journals](https://pubs.rsc.org/en/journals)
  :::

  | All Recent Articles | Advance Articles |
  | ------------------- | ---------------- |
  | allrecentarticles   | advancearticles  |

## Science Magazine <Site url="science.org"/>

### Blogs <Site url="science.org" size="sm" />

<Route namespace="science" :data='{"path":"/blogs/:name?","categories":["journal"],"example":"/science/blogs/pipeline","parameters":{"name":"Short name for the blog, get this from the url. Defaults to pipeline"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["science.org/blogs/:name"],"target":"/blogs/:name"}],"name":"Blogs","maintainers":["TomHodson"],"description":"To subscribe to [IN THE PIPELINE by Derek Lowe’s](https://science.org/blogs/pipeline) or the [science editor&#39;s blog](https://science.org/blogs/editors-blog), use the name parameter `pipeline` or `editors-blog`.","location":"blogs.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

To subscribe to [IN THE PIPELINE by Derek Lowe’s](https://science.org/blogs/pipeline) or the [science editor's blog](https://science.org/blogs/editors-blog), use the name parameter `pipeline` or `editors-blog`.

### Cover Story <Site url="science.org/" size="sm" />

<Route namespace="science" :data='{"path":"/cover","categories":["journal"],"example":"/science/cover","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["science.org/"]}],"name":"Cover Story","maintainers":["y9c","TonyRL"],"url":"science.org/","description":"Subscribe to the cover images of Science journals, and get the latest publication updates in time.\n\n  Including &#39;Science&#39;, &#39;Science Advances&#39;, &#39;Science Immunology&#39;, &#39;Science Robotics&#39;, &#39;Science Signaling&#39; and &#39;Science Translational Medicine&#39;.","location":"cover.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Subscribe to the cover images of Science journals, and get the latest publication updates in time.

  Including 'Science', 'Science Advances', 'Science Immunology', 'Science Robotics', 'Science Signaling' and 'Science Translational Medicine'.

### Current Issue <Site url="science.org" size="sm" />

<Route namespace="science" :data='{"path":"/current/:journal?","categories":["journal"],"example":"/science/current/science","parameters":{"journal":"Short name for a journal"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["science.org/journal/:journal","science.org/toc/:journal/current"],"target":"/current/:journal"}],"name":"Current Issue","maintainers":["y9c","TonyRL"],"description":"|  Short name |    Full name of the journal    | Route                                                                          |\n  | :---------: | :----------------------------: | ------------------------------------------------------------------------------ |\n  |   science   |             Science            | [/science/current/science](https://rsshub.app/science/current/science)         |\n  |    sciadv   |        Science Advances        | [/science/current/sciadv](https://rsshub.app/science/current/sciadv)           |\n  |  sciimmunol |       Science Immunology       | [/science/current/sciimmunol](https://rsshub.app/science/current/sciimmunol)   |\n  | scirobotics |        Science Robotics        | [/science/current/scirobotics](https://rsshub.app/science/current/scirobotics) |\n  |  signaling  |        Science Signaling       | [/science/current/signaling](https://rsshub.app/science/current/signaling)     |\n  |     stm     | Science Translational Medicine | [/science/current/stm](https://rsshub.app/science/current/stm)                 |\n\n  -   Using route (`/science/current/` + \"short name for a journal\") to get current issue of a journal from AAAS.\n  -   Leaving it empty (`/science/current`) to get update from Science.","location":"current.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

|  Short name |    Full name of the journal    | Route                                                                          |
  | :---------: | :----------------------------: | ------------------------------------------------------------------------------ |
  |   science   |             Science            | [/science/current/science](https://rsshub.app/science/current/science)         |
  |    sciadv   |        Science Advances        | [/science/current/sciadv](https://rsshub.app/science/current/sciadv)           |
  |  sciimmunol |       Science Immunology       | [/science/current/sciimmunol](https://rsshub.app/science/current/sciimmunol)   |
  | scirobotics |        Science Robotics        | [/science/current/scirobotics](https://rsshub.app/science/current/scirobotics) |
  |  signaling  |        Science Signaling       | [/science/current/signaling](https://rsshub.app/science/current/signaling)     |
  |     stm     | Science Translational Medicine | [/science/current/stm](https://rsshub.app/science/current/stm)                 |

  -   Using route (`/science/current/` + "short name for a journal") to get current issue of a journal from AAAS.
  -   Leaving it empty (`/science/current`) to get update from Science.

### First Release <Site url="science.org" size="sm" />

<Route namespace="science" :data='{"path":"/early/:journal?","categories":["journal"],"example":"/science/early","parameters":{"journal":"Short name for a journal"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":true},"radar":[{"source":["science.org/journal/:journal","science.org/toc/:journal/0/0"],"target":"/early/:journal"}],"name":"First Release","maintainers":["y9c","TonyRL"],"description":"*only Science, Science Immunology and Science Translational Medicine have first release*","location":"early.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

*only Science, Science Immunology and Science Translational Medicine have first release*

## ScienceDirect <Site url="sciencedirect.com"/>

### Journal <Site url="sciencedirect.com" size="sm" />

<Route namespace="sciencedirect" :data='{"path":"/journal/:id","categories":["journal"],"example":"/sciencedirect/journal/research-policy","parameters":{"id":"Journal id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sciencedirect.com/journal/:id","sciencedirect.com/"]}],"name":"Journal","maintainers":["nczitzk"],"location":"journal.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## Springer <Site url="www.springer.com"/>

### Journal <Site url="www.springer.com" size="sm" />

<Route namespace="springer" :data='{"path":"/journal/:journal","categories":["journal"],"example":"/springer/journal/10450","parameters":{"journal":"Journal Code, the number in the URL from the journal homepage"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.springer.com/journal/:journal/*"]}],"name":"Journal","maintainers":["Derekmini","TonyRL"],"location":"journal.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## Telecompaper <Site url="telecompaper.com"/>

### News <Site url="telecompaper.com" size="sm" />

<Route namespace="telecompaper" :data='{"path":"/news/:caty/:year?/:country?/:type?","categories":["journal"],"example":"/telecompaper/news/mobile/2020/China/News","parameters":{"caty":"Category, see table below","year":"Year. The year in respective category page filter, `all` for unlimited year, empty by default","country":"Country or continent, `all` for unlimited country or continent, empty by default","type":"Type, can be found in the `Types` filter, `all` for unlimited type, unlimited by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["nczitzk"],"description":"Category\n\n  | WIRELESS | BROADBAND | VIDEO     | GENERAL | IT | INDUSTRY RESOURCES |\n  | -------- | --------- | --------- | ------- | -- | ------------------ |\n  | mobile   | internet  | boardcast | general | it | industry-resources |\n\n  :::tip\n  If `country` or `type` includes empty space, use `-` instead. For example, `United States` needs to be replaced with `United-States`, `White paper` needs to be replaced with `White-paper`\n\n  Filters in [INDUSTRY RESOURCES](https://www.telecompaper.com/industry-resources) only provides `Content Type` which corresponds to `type`. `year` and `country` are not supported.\n  :::","location":"news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Category

  | WIRELESS | BROADBAND | VIDEO     | GENERAL | IT | INDUSTRY RESOURCES |
  | -------- | --------- | --------- | ------- | -- | ------------------ |
  | mobile   | internet  | boardcast | general | it | industry-resources |

  :::tip
  If `country` or `type` includes empty space, use `-` instead. For example, `United States` needs to be replaced with `United-States`, `White paper` needs to be replaced with `White-paper`

  Filters in [INDUSTRY RESOURCES](https://www.telecompaper.com/industry-resources) only provides `Content Type` which corresponds to `type`. `year` and `country` are not supported.
  :::

### Search <Site url="telecompaper.com" size="sm" />

<Route namespace="telecompaper" :data='{"path":"/search/:keyword?/:company?/:sort?/:period?","categories":["journal"],"example":"/telecompaper/search/Nokia","parameters":{"keyword":"Keyword","company":"Company name, empty by default","sort":"Sorting, see table below, `Date Descending` by default","period":"Date selection, Last 12 months by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Search","maintainers":["nczitzk"],"description":"Sorting\n\n  | Date Ascending | Date Descending |\n  | -------------- | --------------- |\n  | 1              | 2               |\n\n  Date selection\n\n  | 1 month | 3 months | 6 months | 12 months | 24 months |\n  | ------- | -------- | -------- | --------- | --------- |\n  | 1       | 3        | 6        | 12        | 24        |","location":"search.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Sorting

  | Date Ascending | Date Descending |
  | -------------- | --------------- |
  | 1              | 2               |

  Date selection

  | 1 month | 3 months | 6 months | 12 months | 24 months |
  | ------- | -------- | -------- | --------- | --------- |
  | 1       | 3        | 6        | 12        | 24        |

## Trending Papers <Site url="trendingpapers.com"/>

### Trending Papers on arXiv <Site url="trendingpapers.com" size="sm" />

<Route namespace="trendingpapers" :data='{"path":"/papers/:category?/:time?/:cited?","categories":["journal"],"example":"/trendingpapers/papers","parameters":{"category":"Category of papers, can be found in URL. `All categories` by default.","time":"Time like `24 hours` to specify the duration of ranking, can be found in URL. `Since beginning` by default.","cited":"Cited or uncited papers, can be found in URL. `Cited and uncited papers` by default."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Trending Papers on arXiv","maintainers":["CookiePieWw"],"location":"papers.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## The University of Chicago Press: Journals <Site url="journals.uchicago.edu"/>

### Current Issue <Site url="journals.uchicago.edu" size="sm" />

<Route namespace="uchicago" :data='{"path":"/journals/current/:journal","categories":["journal"],"example":"/uchicago/journals/current/jpe","parameters":{"journal":"Journal id, can be found in URL. [Browse journals by title](https://www.journals.uchicago.edu/action/showPublications)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["journals.uchicago.edu/toc/:journal/current","journals.uchicago.edu/journal/:journal"]}],"name":"Current Issue","maintainers":["TonyRL"],"location":"current.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## USENIX <Site url="usenix.org"/>

### ;login: <Site url="usenix.org" size="sm" />

<Route namespace="usenix" :data='{"path":"/loginonline","categories":["journal"],"example":"/usenix/loginonline","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["usenix.org/publications/loginonline","usenix.org/publications","usenix.org/"]}],"name":";login:","maintainers":["wu-yufei"],"location":"loginonline.ts"}' :test='{"code":0}' />

### Security Symposia <Site url="usenix.org/conferences/all" size="sm" />

<Route namespace="usenix" :data='{"path":"/usenix-security-sympoium","categories":["journal"],"example":"/usenix/usenix-security-sympoium","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["usenix.org/conferences/all","usenix.org/conferences","usenix.org/"]}],"name":"Security Symposia","maintainers":["ZeddYu"],"url":"usenix.org/conferences/all","description":"Return results from 2020","location":"usenix.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

Return results from 2020

## X-MOL <Site url="x-mol.com"/>

### Journal <Site url="x-mol.com" size="sm" />

<Route namespace="x-mol" :data='{"path":"/paper/:type/:magazine","categories":["journal"],"example":"/x-mol/paper/0/9","parameters":{"type":"type","magazine":"magazine"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Journal","maintainers":["cssxsh"],"location":"paper.ts"}' :test='undefined' />

## 管理世界 <Site url="mwm.net.cn"/>

### 分类 <Site url="mwm.net.cn" size="sm" />

<Route namespace="mvm" :data='{"path":"/:category?","categories":["journal"],"example":"/mvm","parameters":{"category":"分类，见下表，默认为本期要目"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mwm.net.cn/web/:category","mwm.net.cn/"]}],"name":"分类","maintainers":["nczitzk"],"description":"| 本期要目 | 网络首发 | 学术活动 | 通知公告 |\n  | -------- | -------- | -------- | -------- |\n  | bqym     | wlsf     | xshd     | tzgg     |","location":"index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 本期要目 | 网络首发 | 学术活动 | 通知公告 |
  | -------- | -------- | -------- | -------- |
  | bqym     | wlsf     | xshd     | tzgg     |

## 中国知网 <Site url="navi.cnki.net"/>

### 期刊 <Site url="navi.cnki.net" size="sm" />

<Route namespace="cnki" :data='{"path":"/journals/:name","categories":["journal"],"example":"/cnki/journals/LKGP","parameters":{"name":"期刊缩写，可以在网址中得到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["navi.cnki.net/knavi/journals/:name/detail"]}],"name":"期刊","maintainers":["Fatpandac","Derekmini"],"location":"journals.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 网络首发 <Site url="navi.cnki.net" size="sm" />

<Route namespace="cnki" :data='{"path":"/journals/debut/:name","categories":["journal"],"example":"/cnki/journals/debut/LKGP","parameters":{"name":"期刊缩写，可以在网址中得到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["navi.cnki.net/knavi/journals/:name/detail"]}],"name":"网络首发","maintainers":["Fatpandac"],"location":"debut.ts"}' :test='{"code":0}' />

### 作者期刊文献 <Site url="navi.cnki.net" size="sm" />

<Route namespace="cnki" :data='{"path":"/author/:code","categories":["journal"],"example":"/cnki/author/000042423923","parameters":{"code":"作者对应code，可以在网址中得到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"作者期刊文献","description":":::tip\n    可能仅限中国大陆服务器访问，以实际情况为准。\n    :::","maintainers":["harveyqiu","Derekmini"],"location":"author.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

:::tip
    可能仅限中国大陆服务器访问，以实际情况为准。
    :::

