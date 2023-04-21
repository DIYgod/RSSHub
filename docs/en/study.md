---
pageClass: routes
---

# Study

## Asian Innovation and Entrepreneurship Association

### Seminar Series

<RouteEn author="zxx-457" example="/aiea/seminars/upcoming" path="/aiea/seminars/:period" :paramsDesc="['Time frame']">

| Time frame |
| ----- |
| upcoming |
| past |
| both|

</RouteEn>

## Chinese Social Science Net

### Institute of Law

<RouteEn author="HankChow" example="/cssn/iolaw/zxzp" path="/cssn/iolaw/:section?" :paramsDesc="['Section ID, can be found in the URL. For example, the Section ID of URL `http://iolaw.cssn.cn/zxzp/` is `zxzp`. The default value is `zxzp`']"/>

## gradCafe

### gradCafe result

<RouteEn author="liecn" example="/gradcafe/result" path="/gradcafe/result" />

### gradCafe result by key words

<RouteEn author="liecn" example="/gradcafe/result/computer" path="/gradcafe/result/:type" :paramsDesc="['Keyword']"/>

## Great Britain China Centre

### Educational Trust

<RouteEn author="HenryQW" example="/gbcc/trust" path="/gbcc/trust" />

## iciba

### Daily English Sentence

<RouteEn author="mashirozx" example="/iciba/7/poster" path="/iciba/:days?/:img_type?" :paramsDesc="['number of items to show (min = 1, max = 7, default = 1)', 'image style']">

| `:img_type` | image style    |
| ----------- | -------------- |
| original    | Original size  |
| medium      | Medium size    |
| thumbnail   | Thumbnail size |
| poster      | Art poster     |

</RouteEn>

## Link Research

### Theses

<RouteEn author="y9c" example="/linkresearcher/category=theses&subject=生物" path="/linkresearcher/theses/:param" supportScihub="1" :paramsDesc="['key=value，eg. subject=生物']" radar="1" rssbud="1">

| `:param` | example         | definition                             |
| -------- | --------------- | -------------------------------------- |
| category | category=thesis | **one of** theses/information/careers |
| subject  | subject=生物    | string / undefined                     |
| columns  | columns=健康    | string / undefined                     |
| columns  | columns=virus   | string / undefined                     |

</RouteEn>

## MindMeister

### Public Maps

<RouteEn author="TonyRL" example="/mindmeister/mind-map-examples" path="/mindmeister/:category?/:language?" :paramsDesc="['Categories, see the table below, `mind-map-examples` by default', 'Languages, see the table below, `en` by default']" radar="1" rssbud="1">

| Categories | parameter |
| -------- | --------------- |
| Featured Map | mind-map-examples |
| Business | business |
| Design | design |
| Education | education |
| Entertainment | entertainment |
| Life | life |
| Marketing | marketing |
| Productivity | productivity |
| Summaries | summaries |
| Technology | technology |
| Other | other |

| Languages | parameter |
| -------- | --------------- |
| English | en |
| Deutsch | de |
| Français | fr |
| Español | es |
| Português | pt |
| Nederlands | nl |
| Dansk | da |
| Русский | ru |
| 日本語 | ja |
| Italiano | it |
| 简体中文 | zh |
| 한국어 | ko |
| Other | other |

</RouteEn>

## ORCID

### Works List

<RouteEn author="OrangeEd1t" example="/orcid/0000-0002-4731-9700" path="/orcid/:id" :paramsDesc="['Open Researcher and Contributor ID']"/>

## ResearchGate

### Publications

<RouteEn author="nczitzk" example="/researchgate/publications/Somsak-Panha" path="/researchgate/publications/:username" :paramsDesc="['Username, can be found in URL']" puppeteer="1" anticrawler="1"/>

## The Korea Institute of Marine Law

### Thesis

<RouteEn author="TonyRL" example="/kimlaw/thesis" path="/kimlaw/thesis" radar="1"/>

## X-MOL

### News

<RouteEn author="cssxsh" example="/x-mol/news/3" path="/x-mol/news/:tag?" :paramsDesc="['Tag number, can be obtained from news list URL. Empty value means news index.']" />

## XMind

### Mindmap Gallery

<RouteEn author="nczitzk" example="/xmind/mindmap" path="/xmind/mindmap/:lang?" :paramsDesc="['language code, all languages by default']">

| English | Español | Deutsch | Français | 中文 | 日本語 |
| ------- | ------- | ------- | -------- | ---- | ------ |
| en      | es      | de      | fr       | zh   | jp     |

</RouteEn>

## ZhiShiFenZi

### News

<RouteEn author="y9c" example="/zhishifenzi/news/ai" path="/zhishifenzi/news/:type" :paramsDesc="['type，eg. ai']">

| `:type`   | type name |
| --------- | --------- |
| biology   | Biology   |
| medicine  | Medicine  |
| ai        | AI        |
| physics   | physics   |
| chymistry | Chymistry |
| astronomy | Astronomy |
| others    | Others    |

> leave it blank（`/zhishifenzi/news`）to get all

</RouteEn>

### depth

<RouteEn author="y9c" example="/zhishifenzi/depth" path="/zhishifenzi/depth" />

### innovation

<RouteEn author="y9c" example="/zhishifenzi/innovation/company" path="/zhishifenzi/innovation/:type" :paramsDesc="['type，eg. company']">

| `:type`       | type name     |
| ------------- | ------------- |
| ~~multiple~~  | ~~Multiple~~  |
| company       | Company       |
| product       | Product       |
| technology    | Technology    |
| ~~character~~ | ~~Character~~ |
| policy        | Policy        |

> leave it blank（`/zhishifenzi/innovation`）to get all

</RouteEn>
