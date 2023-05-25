---
pageClass: routes
---

# Forecast and alerts

## BADAN METEOROLOGI, KLIMATOLOGI, DAN GEOFISIKA(Indonesian)

### Recent Earthquakes

<RouteEn author="Shinanory" example="/bmkg/earthquake" path="/bmkg/earthquake" />

### News

<RouteEn author="Shinanory" example="/bmkg/news" path="/bmkg/news" />

## Outage.Report

### Report

<RouteEn author="cxumol nczitzk" example="/outagereport/ubisoft/5" path="/outagereport/:name/:count?" :paramsDesc="['Service name, spelling format must be consistent with URL', 'Counting threshold, will only be written in RSS if the number of people who report to stop serving is not less than this number']">

Please skip the local service area code for `name`, for example `https://outage.report/us/verizon-wireless` to `verizon-wireless`.

</RouteEn>

## Uptime Robot

### RSS

<RouteEn author="Rongronggg9" example="/uptimerobot/rss/u358785-e4323652448755805d668f1a66506f2f" path="/uptimerobot/rss/:id/:routeParams?" :paramsDesc="['the last part of your RSS URL (e.g. `u358785-e4323652448755805d668f1a66506f2f` for `https://rss.uptimerobot.com/u358785-e4323652448755805d668f1a66506f2f`)', 'extra parameters, see the table below']">
<!-- example stolen from https://atlas.eff.org//domains/uptimerobot.com.html -->

| Key    | Description                                                              | Accepts        | Defaults to |
|--------|--------------------------------------------------------------------------|----------------|-------------|
| showID | Show monitor ID (disabling it will also disable link for each RSS entry) | 0/1/true/false | true        |

</RouteEn>
