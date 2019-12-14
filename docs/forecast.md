---
pageClass: routes
---

# 预报预警

## 地震速报

### 中国地震局

<Route author="LogicJake" example="/earthquake" path="/earthquake/:region?" :paramsDesc="['区域，0全部，1国内（默认），2国外']" anticrawler="1">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

### 中国地震台

<Route author="SettingDust" example="/earthquake/ceic/1" path="/earthquake/ceic/:type" :paramsDesc="['类型，1 最近24小时地震信息, 2: 最近48小时地震信息, 5: 最近一年3.0级以上地震信息, 7: 最近一年3.0级以下地震, 8: 最近一年4.0级以上地震信息, 9: 最近一年5.0级以上地震信息, 0: 最近一年6.0级以上地震信息']">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

## 国家应急广播网

### 预警信息

<Route author="muzea" example="/cneb/yjxx" path="/cneb/yjxx"/>

### 国内新闻

<Route author="muzea" example="/cneb/guoneinews" path="/cneb/guoneinews"/>

## 停电通知

### 南京市

<Route author="ocleo1" example="/tingdiantz/nanjing" path="/tingdiantz/nanjing"/>

## 停水通知

配合 [IFTTT](https://ifttt.com/) Applets [邮件通知](https://ifttt.com/applets/SEvmDVKY-) 使用实现自动通知效果.

### 杭州市

<Route author="znhocn" example="/tingshuitz/hangzhou" path="/tingshuitz/hangzhou"/>

### 萧山区

<Route author="znhocn" example="/tingshuitz/xiaoshan" path="/tingshuitz/xiaoshan"/>

### 大连市

<Route author="DIYgod" example="/tingshuitz/dalian" path="/tingshuitz/dalian"/>

### 广州市

<Route author="xyqfer" example="/tingshuitz/guangzhou" path="/tingshuitz/guangzhou"/>

### 东莞市

<Route author="victoriqueko" example="/tingshuitz/dongguan" path="/tingshuitz/dongguan"/>

### 西安市

<Route author="ciaranchen" example="/tingshuitz/xian" path="/tingshuitz/xian"/>

### 阳江市

<Route author="ciaranchen" example="/tingshuitz/yangjiang" path="/tingshuitz/yangjiang"/>

### 南京市

<Route author="ocleo1" example="/tingshuitz/nanjing" path="/tingshuitz/nanjing"/>

### 武汉市

<Route author="MoonBegonia" example="/tingshuitz/wuhan" path="/tingshuitz/wuhan"/>

## 香港天文台

### Current Weather Report

<Route author="calpa" example="/hko/weather" path="/hko/weather"/>

## 在线服务/本地设施 停服通知

### Outage.Report

<Route author="cxumol" example="/outagereport/ubisoft/5" path="/outagereport/:name/:count?" :paramsDesc="['服务名称｡ 拼写格式须与 URL 保持一致', '计数门槛｡ 仅当报告停服的人不低于此数量时, 才会写进 RSS']">
 
其中 name 参数, 请略过本地服务的区域码, 例如 `https://outage.report/us/verizon-wireless` 填入 `verizon-wireless` 即可｡

</Route>

## 中央气象台

### 全国气象预警

<Route author="ylc395" example="/weatheralarm" path="/weatheralarm">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>
