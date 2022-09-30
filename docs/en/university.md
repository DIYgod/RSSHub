---
pageClass: routes
---

# University

## Beijing Jiaotong University

### BJTU Graduate School

<RouteEn author="E1nzbern" example="/bjtu/gs/all" path="/bjtu/gs/:type" :paramsDesc="['Type of articles']">

| All articles | Notification | News | Admissions Promotion | Training | Degrees | Admissions | Master Admissions | PhD Admissions | Admissions Brochure | Admissions Policies and Regulations | Notice from Graduate Student Work Department | News from Graduate Student Work Department |
| ---- | -------- | -------- | ------------ | ------------ | -------- | -------- | ------ | ---------- | ------ | ------ | ------ | ------ |
| all  | noti     | news    | zsxc       | py       | xw      | zs     | sszs    | bszs      | zsjz    | zcfg    | ygbtzgg    | ygbnews    |

</RouteEn>

Note: [Source website](https://gs.bjtu.edu.cn/) only provides articles in Chinese.

## MIT

### MIT OCW Most popular courses of the month

<RouteEn author="dwemerx" example="/mit/ocw-top" path="/mit/ocw-top"/>

### MIT graduateadmissions's all blogs

<RouteEn author="LogicJake" example="/mit/graduateadmissions/index/all" path="/mit/graduateadmissions/index/all"/>

### MIT graduateadmissions's blogs by department

<RouteEn author="LogicJake" example="/mit/graduateadmissions/department/eecs" path="/mit/graduateadmissions/department/:name" :paramsDesc="['department name which can be found in url']"/>

### MIT graduateadmissions's blogs by category

<RouteEn author="LogicJake" example="/mit/graduateadmissions/category/beyond-the-lab" path="/mit/graduateadmissions/category/:name" :paramsDesc="['category name which can be found in url']"/>

### MIT CSAIL

<RouteEn author="nczitzk" example="/mit/csail/news" path="/mit/csail/news"/>

## Polimi

### News

<RouteEn author="exuanbo" example="/polimi/news" path="/polimi/news/:language?" :paramsDesc="['English language code en']" />

## Tianjin University

### Admission Office of Graduate

<RouteEn author="SuperPung" example="/tju/yzb/notice" path="/tju/yzb/:type?" :paramsDesc="['default `notice`']">

| School-level Notice | Master | Doctor | On-the-job Degree |
| :-----------------: | :----: | :----: |:-----------------:|
|       notice        | master | doctor |        job        |

</RouteEn>

### College of Intelligence and Computing

<RouteEn author="SuperPung" example="/tju/cic/news" path="/tju/cic/:type?" :paramsDesc="['default `news`']">

| College News | Notification | TJU Forum for CIC |
| :----------: | :----------: | :---------------: |
|     news     | notification |       forum       |

</RouteEn>

### News

<RouteEn author="SuperPung" example="/tju/news/focus" path="/tju/news/:type?" :paramsDesc="['default `focus`']">

| Focus on TJU | General News | Internal News | Media Report | Pictures of TJU |
| :----------: | :----------: | :-----------: | :----------: | :-------------: |
|    focus     |   general    |    internal   |    media     |     picture     |

</RouteEn>

### The Office of Academic Affairs

<RouteEn author="AmosChenYQ SuperPung" example="/tju/oaa/news" path="/tju/oaa/:type?" :paramsDesc="['default `news`']">

| News | Notification |
| :--: | :----------: |
| news | notification |

</RouteEn>

## UMASS Amherst

### College of Electrical and Computer Engineering

#### News

<RouteEn author="gammapi" example="/umass/amherst/ecenews" path="/umass/amherst/ecenews" radar="1" rssbud="1"/>

#### Seminar

<RouteEn author="gammapi" example="/umass/amherst/eceseminar" path="/umass/amherst/eceseminar" radar="1" rssbud="1"/>

Note：[Source website](https://ece.umass.edu/seminar) may be empty when there's no upcoming seminars. This is normal and will cause rsshub fail to fetch this feed.

### College of Information & Computer Sciences News

<RouteEn author="gammapi" example="/umass/amherst/csnews" path="/umass/amherst/csnews" radar="1" rssbud="1"/>

### International Programs Office

#### Events

<RouteEn author="gammapi" example="/umass/amherst/ipostories" path="/umass/amherst/ipostories" radar="1" rssbud="1"/>

#### Featured Stories

<RouteEn author="gammapi" example="/umass/amherst/ipoevents" path="/umass/amherst/ipoevents" radar="1" rssbud="1"/>
