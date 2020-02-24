---
pageClass: routes
---

# Study

## gradCafe

### gradCafe result

<RouteEn author="liecn" example="/gradcafe/result" path="/gradcafe/result" />

### gradCafe result by key words

<RouteEn author="liecn" example="/gradcafe/result/computer" path="/gradcafe/result/:type" :paramsDesc="['Keyword']"/>

## Great Britain China Centre

### Educational Trust

<RouteEn author="HenryQW" example="/gbcc/trust" path="/gbcc/trust" />

## ZhiShiFenZi

### News

<RouteEn author="yech1990" example="/zhishifenzi/news/ai" path="/zhishifenzi/news/:type" :paramsDesc="['type，eg. ai']"/>

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

### depth

<RouteEn author="yech1990" example="/zhishifenzi/depth" path="/zhishifenzi/depth" />

### 创新

<Route author="yech1990" example="/zhishifenzi/innovation/company" path="/zhishifenzi/innovation/:type" :paramsDesc="['类别，如 company']"/>

| `:type`       | type name     |
| ------------- | ------------- |
| ~~multiple~~  | ~~Multiple~~  |
| company       | Company       |
| product       | Product       |
| technology    | Technology    |
| ~~character~~ | ~~Character~~ |
| policy        | Policy        |

> leave it blank（`/zhishifenzi/innovation`）to get all
