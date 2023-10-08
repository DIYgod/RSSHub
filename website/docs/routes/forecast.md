# ❗️ Forecast and alerts

## BADAN METEOROLOGI, KLIMATOLOGI, DAN GEOFISIKA(Indonesian) {#badan-meteorologi-klimatologi-dan-geofisika-indonesian}

### Recent Earthquakes {#badan-meteorologi-klimatologi-dan-geofisika-indonesian-recent-earthquakes}

<Route author="Shinanory" example="/bmkg/earthquake" path="/bmkg/earthquake" />

### News {#badan-meteorologi-klimatologi-dan-geofisika-indonesian-news}

<Route author="Shinanory" example="/bmkg/news" path="/bmkg/news" />

## Outage.Report {#outage.report}

### Report {#outage.report-report}

<Route author="cxumol nczitzk" example="/outagereport/ubisoft/5" path="/outagereport/:name/:count?" paramsDesc={['Service name, spelling format must be consistent with URL', 'Counting threshold, will only be written in RSS if the number of people who report to stop serving is not less than this number']}>

Please skip the local service area code for `name`, for example `https://outage.report/us/verizon-wireless` to `verizon-wireless`.

</Route>

## Uptime Robot {#uptime-robot}

### RSS {#uptime-robot-rss}

<Route author="Rongronggg9" example="/uptimerobot/rss/u358785-e4323652448755805d668f1a66506f2f" path="/uptimerobot/rss/:id/:routeParams?" paramsDesc={['the last part of your RSS URL (e.g. `u358785-e4323652448755805d668f1a66506f2f` for `https://rss.uptimerobot.com/u358785-e4323652448755805d668f1a66506f2f`)', 'extra parameters, see the table below']}>

| Key    | Description                                                              | Accepts        | Defaults to |
|--------|--------------------------------------------------------------------------|----------------|-------------|
| showID | Show monitor ID (disabling it will also disable link for each RSS entry) | 0/1/true/false | true        |

</Route>

## 重庆燃气 {#chong-qing-ran-qi}

### 停气检修通知 {#chong-qing-ran-qi-ting-qi-jian-xiu-tong-zhi}

<Route author="Mai19930513" example="/cqgas/tqtz" path="/cqgas/tqtz" radar="1"/>

## 地震速报 {#di-zhen-su-bao}

### 中国地震局 {#di-zhen-su-bao-zhong-guo-di-zhen-ju}

<Route author="LogicJake" example="/earthquake" path="/earthquake/:region?" paramsDesc={['区域，0全部，1国内（默认），2国外']} anticrawler="1">

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

### 中国地震台 {#di-zhen-su-bao-zhong-guo-di-zhen-tai}

<Route author="SettingDust" example="/earthquake/ceic/1" path="/earthquake/ceic/:type?" paramsDesc={['类型，见下表']}>

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

## 广州天气 {#guang-zhou-tian-qi}

### 突发性天气提示 {#guang-zhou-tian-qi-tu-fa-xing-tian-qi-ti-shi}

<Route author="Fatpandac" example="/gov/guangdong/tqyb/tfxtq" path="/gov/guangdong/tqyb/tfxtq"/>

### 广东省内城市预警信号 {#guang-zhou-tian-qi-guang-dong-sheng-nei-cheng-shi-yu-jing-xin-hao}

<Route author="Fatpandac" example="/gov/guangdong/tqyb/sncsyjxh" path="/gov/guangdong/tqyb/sncsyjxh"/>

## 国家突发事件预警信息发布网 {#guo-jia-tu-fa-shi-jian-yu-jing-xin-xi-fa-bu-wang}

### 当前生效预警 {#guo-jia-tu-fa-shi-jian-yu-jing-xin-xi-fa-bu-wang-dang-qian-sheng-xiao-yu-jing}

<Route author="nczitzk" example="/12379" path="/12379/index"/>

## 和风天气 {#he-feng-tian-qi}

### 近三天天气 {#he-feng-tian-qi-jin-san-tian-tian-qi}

<Route author="Rein-Ou" example="/qweather/3days/广州" path="/qweather/3days/:location" selfhost="1">

需自行注册获取 api 的 key，并在环境变量 HEFENG_KEY 中进行配置，获取订阅近三天天气预报

</Route>

### 实时天气 {#he-feng-tian-qi-shi-shi-tian-qi}

<Route author="Rein-Ou" example="/qweather/广州" path="/qweather/now/:location" selfhost="1">

需自行注册获取 api 的 key，每小时更新一次数据

</Route>

## 上海市生态环境局 {#shang-hai-shi-sheng-tai-huan-jing-ju}

### 空气质量 {#shang-hai-shi-sheng-tai-huan-jing-ju-kong-qi-zhi-liang}

<Route author="nczitzk" example="/gov/shanghai/sthj" path="/gov/shanghai/sthj"/>

## 停电通知 {#ting-dian-tong-zhi}

### 95598 停电查询网 {#ting-dian-tong-zhi-95598-ting-dian-cha-xun-wang}

<Route author="mjysci" example="/tingdiantz/95598/hb1/wh/wc/" path="/tingdiantz/95598/:province/:city/:district?" paramsDesc={['省，2~3位拼音缩写，详情见http://www.sttcq.com/td/', '市，同上', '区，同上']}/>

### 南京市 {#ting-dian-tong-zhi-nan-jing-shi}

<Route author="ocleo1" example="/tingdiantz/nanjing" path="/tingdiantz/nanjing"/>

## 停水通知 {#ting-shui-tong-zhi}

配合 [IFTTT](https://ifttt.com/) Applets [邮件通知](https://ifttt.com/applets/SEvmDVKY-) 使用实现自动通知效果.

### 杭州市 {#ting-shui-tong-zhi-hang-zhou-shi}

<Route author="znhocn" example="/tingshuitz/hangzhou" path="/tingshuitz/hangzhou"/>

### 萧山区 {#ting-shui-tong-zhi-xiao-shan-qu}

<Route author="znhocn" example="/tingshuitz/xiaoshan" path="/tingshuitz/xiaoshan"/>

### 大连市 {#ting-shui-tong-zhi-da-lian-shi}

<Route author="DIYgod" example="/tingshuitz/dalian" path="/tingshuitz/dalian"/>

### 广州市 {#ting-shui-tong-zhi-guang-zhou-shi}

<Route author="xyqfer" example="/tingshuitz/guangzhou" path="/tingshuitz/guangzhou"/>

### 东莞市 {#ting-shui-tong-zhi-dong-guan-shi}

<Route author="victoriqueko" example="/tingshuitz/dongguan" path="/tingshuitz/dongguan"/>

### 西安市 {#ting-shui-tong-zhi-xi-an-shi}

<Route author="ciaranchen" example="/tingshuitz/xian" path="/tingshuitz/xian"/>

### 阳江市 {#ting-shui-tong-zhi-yang-jiang-shi}

<Route author="ciaranchen" example="/tingshuitz/yangjiang" path="/tingshuitz/yangjiang"/>

### 南京市 {#ting-shui-tong-zhi-nan-jing-shi}

<Route author="ocleo1" example="/tingshuitz/nanjing" path="/tingshuitz/nanjing"/>

### 武汉市 {#ting-shui-tong-zhi-wu-han-shi}

<Route author="MoonBegonia" example="/tingshuitz/wuhan" path="/tingshuitz/wuhan/:channelId">

| channelId | 分类       |
| --------- | ---------- |
| 68        | 计划性停水 |
| 69        | 突发性停水 |

</Route>

### 长沙市 {#ting-shui-tong-zhi-chang-sha-shi}

<Route author="shansing" example="/tingshuitz/changsha/78" path="/tingshuitz/changsha/:channelId?">

可能仅限于中国大陆服务器访问，以实际情况为准。

| channelId | 分类     |
| --------- | -------- |
| 78        | 计划停水 |
| 157       | 抢修停水 |

</Route>

### 深圳市 {#ting-shui-tong-zhi-shen-zhen-shi}

<Route author="lilPiper" example="/tingshuitz/shenzhen" path="/tingshuitz/shenzhen">

可能仅限中国大陆服务器访问，以实际情况为准。

</Route>

## 香港天文台 {#xiang-gang-tian-wen-tai}

### Current Weather Report {#xiang-gang-tian-wen-tai-current-weather-report}

<Route author="calpa" example="/hko/weather" path="/hko/weather"/>

## 中国国家应急广播 {#zhong-guo-guo-jia-ying-ji-guang-bo}

### 预警信息 {#zhong-guo-guo-jia-ying-ji-guang-bo-yu-jing-xin-xi}

<Route author="muzea nczitzk" example="/cneb/yjxx" path="/cneb/yjxx/:level?/:province?/:city?" paramsDesc={['灾害级别，见下表，默认为全部', '省份，默认为空，即全国', '城市，默认为空，即全省']}>

灾害级别

| 全部 | 红色 | 橙色 | 黄色 | 蓝色 |
| ---- | ---- | ---- | ---- | ---- |
|      | 红色 | 橙色 | 黄色 | 蓝色 |

:::tip

若订阅全国的全部预警信息，此时路由为 [`/cneb/yjxx`](https://rsshub.app/cneb/yjxx)。

若订阅全国的 **红色** 预警信息，此时路由为 [`/cneb/yjxx/红色`](https://rsshub.app/cneb/yjxx/红色)。

若订阅 **北京市** 的全部预警信息，此时路由为 [`/cneb/yjxx/北京市`](https://rsshub.app/cneb/yjxx/北京市)。

若订阅 **北京市** 的 **蓝色** 预警信息，此时路由为 [`/cneb/yjxx/北京市/蓝色`](https://rsshub.app/cneb/yjxx/北京市/蓝色)。

若订阅 **广东省** 的 **橙色** 预警信息，此时路由为 [`/cneb/yjxx/广东省/橙色`](https://rsshub.app/cneb/yjxx/广东省/橙色)。

若订阅 **广东省广州市** 的全部预警信息，此时路由为 [`/cneb/yjxx/广东省/广州市`](https://rsshub.app/cneb/yjxx/广东省/广州市)。

若订阅 **广东省广州市** 的 **黄色** 预警信息，此时路由为 [`/cneb/yjxx/广东省/广州市/黄色`](https://rsshub.app/cneb/yjxx/广东省/广州市/黄色)。

:::

</Route>

### 应急新闻 {#zhong-guo-guo-jia-ying-ji-guang-bo-ying-ji-xin-wen}

<Route author="nczitzk" example="/cneb/yjxw" path="/cneb/yjxw/:category?" paramsDesc={['分类，见下表，默认为全部']}>

| 全部 | 国内新闻 | 国际新闻 |
| ---- | -------- | -------- |
|      | gnxw     | gjxw     |

</Route>

## 中央气象台 {#zhong-yang-qi-xiang-tai}

### 全国气象预警 {#zhong-yang-qi-xiang-tai-quan-guo-qi-xiang-yu-jing}

<Route author="ylc395" example="/weatheralarm/广东省" path="/weatheralarm/:province?" paramsDesc={['省份']}>

可通过全局过滤参数订阅您感兴趣的地区.

</Route>

