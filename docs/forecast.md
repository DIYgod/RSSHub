---
pageClass: routes
---

# 预报预警

## 停电通知

获取未来一天的停电通知

### 国家电网

<Route author="xyqfer moonbegonia" example="/tingdiantz/95598/36401/36101" path="/tingdiantz/95598/:orgNo/:provinceNo/:scope?" :paramsDesc="['所属省供电公司编码', '所属地市供电公司编码', '停电范围关键字']"/>

> 以上参数可从[查询页面](http://www.95598.cn/95598/outageNotice/initOutageNotice)打开控制台抓包获得

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

## 香港天文台

### Current Weather Report

<Route author="calpa" example="/hko/weather" path="/hko/weather"/>

## 中国地震局

### 地震速报

<Route author="LogicJake" example="/earthquake" path="/earthquake/:region?" :paramsDesc="['区域，0全部，1国内（默认），2国外']">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

## 中央气象台

### 全国气象预警

<Route author="ylc395" example="/weatheralarm" path="/weatheralarm">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>
