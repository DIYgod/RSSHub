---
pageClass: routes
---

# 预报预警

## Outage.Report

### Report

<Route author="cxumol nczitzk" example="/outagereport/ubisoft/5" path="/outagereport/:name/:count?" :paramsDesc="['服务名称｡ 拼写格式须与 URL 保持一致', '计数门槛｡ 仅当报告停服的人不低于此数量时, 才会写进 RSS']">

其中 name 参数，请略过本地服务的区域码，例如 `https://outage.report/us/verizon-wireless` 填入 `verizon-wireless` 即可｡

</Route>

## Uptime Robot

### RSS

<Route author="Rongronggg9" example="/uptimerobot/rss/u358785-e4323652448755805d668f1a66506f2f" path="/uptimerobot/rss/:id/:routeParams?" :paramsDesc="['RSS URL 的最后一部分 (e.g. 对于 `https://rss.uptimerobot.com/u358785-e4323652448755805d668f1a66506f2f`，为 `u358785-e4323652448755805d668f1a66506f2f`)', '额外参数，请参阅下面的表格']">
<!-- example stolen from https://atlas.eff.org//domains/uptimerobot.com.html -->

| 键     | 含义                                                            | 接受的值       | 默认值 |
| ------ | --------------------------------------------------------------- | -------------- | ------ |
| showID | 是否包含 monitor ID (关闭此项同时也会使得各个 RSS 条目不附链接) | 0/1/true/false | true   |

</Route>

## 重庆燃气

### 停气检修通知

<Route author="Mai19930513" example="/cqgas/tqtz" path="/cqgas/tqtz" radar="1"/>

## 地震速报

### 中国地震局

<Route author="LogicJake" example="/earthquake" path="/earthquake/:region?" :paramsDesc="['区域，0全部，1国内（默认），2国外']" anticrawler="1">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

### 中国地震台

<Route author="SettingDust" example="/earthquake/ceic/1" path="/earthquake/ceic/:type?" :paramsDesc="['类型，见下表']">

| 参数 | 类型                        |
| ---- | --------------------------- |
| 1    | 最近 24 小时地震信息        |
| 2    | 最近 48 小时地震信息        |
| 5    | 最近一年 3.0 级以上地震信息 |
| 7    | 最近一年 3.0 级以下地震     |
| 8    | 最近一年 4.0 级以上地震信息 |
| 9    | 最近一年 5.0 级以上地震信息 |
| 0    | 最近一年 6.0 级以上地震信息 |

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

## 广州天气

### 突发性天气提示

<Route author="Fatpandac" example="/gov/guangdong/tqyb/tfxtq" path="/gov/guangdong/tqyb/tfxtq"/>

### 广东省内城市预警信号

<Route author="Fatpandac" example="/gov/guangdong/tqyb/sncsyjxh" path="/gov/guangdong/tqyb/sncsyjxh"/>

## 国家突发事件预警信息发布网

### 当前生效预警

<Route author="nczitzk" example="/12379" path="/12379/index"/>

## 和风天气

### 近三天天气

<Route author="Rein-Ou" example="/qweather/3days/广州" path="/qweather/3days/:location" selfhost="1">

需自行注册获取 api 的 key，并在环境变量 HEFENG_KEY 中进行配置，获取订阅近三天天气预报

</Route>

### 实时天气

<Route author="Rein-Ou" example="/qweather/广州" path="/qweather/now/:location" selfhost="1">

需自行注册获取 api 的 key，每小时更新一次数据

</Route>

## 上海市生态环境局

### 空气质量

<Route author="nczitzk" example="/gov/shanghai/sthj" path="/gov/shanghai/sthj"/>

## 停电通知

### 95598 停电查询网

<Route author="mjysci" example="/tingdiantz/95598/hb1/wh/wc/" path="/tingdiantz/95598/:province/:city/:district?" :paramsDesc="['省，2~3位拼音缩写，详情见http://www.sttcq.com/td/', '市，同上', '区，同上']"/>

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

<Route author="MoonBegonia" example="/tingshuitz/wuhan" path="/tingshuitz/wuhan/:channelId">

| channelId | 分类       |
| --------- | ---------- |
| 68        | 计划性停水 |
| 69        | 突发性停水 |

</Route>

### 长沙市

<Route author="shansing" example="/tingshuitz/changsha/78" path="/tingshuitz/changsha/:channelId?">

可能仅限于中国大陆服务器访问，以实际情况为准。

| channelId | 分类     |
| --------- | -------- |
| 78        | 计划停水 |
| 157       | 抢修停水 |

</Route>

### 深圳市

<Route author="lilPiper" example="/tingshuitz/shenzhen" path="/tingshuitz/shenzhen">

可能仅限中国大陆服务器访问，以实际情况为准。

</Route>

## 香港天文台

### Current Weather Report

<Route author="calpa" example="/hko/weather" path="/hko/weather"/>

## 中国国家应急广播

### 预警信息

<Route author="muzea nczitzk" example="/cneb/yjxx" path="/cneb/yjxx/:level?/:province?/:city?" :paramsDesc="['灾害级别，见下表，默认为全部', '省份，默认为空，即全国', '城市，默认为空，即全省']">

灾害级别

| 全部 | 红色 | 橙色 | 黄色 | 蓝色 |
| ---- | ---- | ---- | ---- | ---- |
|      | 红色 | 橙色 | 黄色 | 蓝色 |

::: tip 提示

若订阅全国的全部预警信息，此时路由为 [`/cneb/yjxx`](https://rsshub.app/cneb/yjxx)。

若订阅全国的 **红色** 预警信息，此时路由为 [`/cneb/yjxx/红色`](https://rsshub.app/cneb/yjxx/红色)。

若订阅 **北京市** 的全部预警信息，此时路由为 [`/cneb/yjxx/北京市`](https://rsshub.app/cneb/yjxx/北京市)。

若订阅 **北京市** 的 **蓝色** 预警信息，此时路由为 [`/cneb/yjxx/北京市/蓝色`](https://rsshub.app/cneb/yjxx/北京市/蓝色)。

若订阅 **广东省** 的 **橙色** 预警信息，此时路由为 [`/cneb/yjxx/广东省/橙色`](https://rsshub.app/cneb/yjxx/广东省/橙色)。

若订阅 **广东省广州市** 的全部预警信息，此时路由为 [`/cneb/yjxx/广东省/广州市`](https://rsshub.app/cneb/yjxx/广东省/广州市)。

若订阅 **广东省广州市** 的 **黄色** 预警信息，此时路由为 [`/cneb/yjxx/广东省/广州市/黄色`](https://rsshub.app/cneb/yjxx/广东省/广州市/黄色)。

:::

</Route>

### 应急新闻

<Route author="nczitzk" example="/cneb/yjxw" path="/cneb/yjxw/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部 | 国内新闻 | 国际新闻 |
| ---- | -------- | -------- |
|      | gnxw     | gjxw     |

</Route>

## 中央气象台

### 全国气象预警

<Route author="ylc395" example="/weatheralarm/广东省" path="/weatheralarm/:province?" :paramsDesc="['省份']">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>
