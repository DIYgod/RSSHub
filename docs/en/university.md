---
pageClass: routes
---

# University

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

<Route author="gammapi" example="/umass/amherst/ipostories" path="/umass/amherst/ipostories" radar="1" rssbud="1"/>

#### Featured Stories

<Route author="gammapi" example="/umass/amherst/ipoevents" path="/umass/amherst/ipoevents" radar="1" rssbud="1"/>
