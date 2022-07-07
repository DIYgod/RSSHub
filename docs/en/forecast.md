---
pageClass: routes
---

# Forecast

## Outage.Report

### Report

<RouteEn author="cxumol nczitzk" example="/outagereport/ubisoft/5" path="/outagereport/:name/:count?" :paramsDesc="['Service name, spelling format must be consistent with URL', 'Counting threshold, will only be written in RSS if the number of people who report to stop serving is not less than this number']">

Please skip the local service area code for `name`, for example `https://outage.report/us/verizon-wireless` to `verizon-wireless`.

</RouteEn>
