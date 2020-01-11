---
pageClass: routes
---

# University

## MIT

### MIT graduateadmissions's all blogs

<RouteEn author="LogicJake" example="/mit/graduateadmissions/index/all" path="/universities/mit/graduateadmissions/index/all"/>

### MIT graduateadmissions's blogs by department

<RouteEn author="LogicJake" example="/mit/graduateadmissions/department/eecs" path="/universities/mit/graduateadmissions/department/:name" :paramsDesc="['department name which can be found in url']"/>

### MIT graduateadmissions's blogs by category

<RouteEn author="LogicJake" example="/mit/graduateadmissions/category/beyond-the-lab" path="/universities/mit/graduateadmissions/category/:name" :paramsDesc="['category name which can be found in url']"/>

## Polimi

### News

<RouteEn author="exuanbo" example="/polimi/news" path="/polimi/news/:language?" :paramsDesc="['English language code en']" />
