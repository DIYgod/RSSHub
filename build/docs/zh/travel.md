# 🛫 出行旅游

## 12306 <Site url="kyfw.12306.cn"/>

### 售票信息 <Site url="kyfw.12306.cn" size="sm" />

<Route namespace="12306" :data='{"path":"/:date/:from/:to/:type?","categories":["travel"],"example":"/12306/2022-02-19/重庆/永川东","parameters":{"date":"时间，格式为（YYYY-MM-DD）","from":"始发站","to":"终点站","type":"售票类型，成人和学生可选，默认为成人"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"售票信息","maintainers":["Fatpandac"],"location":"index.ts"}' />

### 最新动态 <Site url="www.12306.cn/" size="sm" />

<Route namespace="12306" :data='{"path":"/zxdt/:id?","categories":["travel"],"example":"/12306/zxdt","parameters":{"id":"铁路局id，可在 URL 中找到，不填默认显示所有铁路局动态"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.12306.cn/","www.12306.cn/mormhweb/1/:id/index_fl.html"],"target":"/zxdt/:id"}],"name":"最新动态","maintainers":["LogicJake"],"url":"www.12306.cn/","location":"zxdt.ts"}' />

## Brooklyn Museum 纽约布鲁克林博物馆 <Site url="www.brooklynmuseum.org"/>

### Exhibitions <Site url="www.brooklynmuseum.org" size="sm" />

<Route namespace="brooklynmuseum" :data='{"path":"/exhibitions/:state?","categories":["travel"],"example":"/brooklynmuseum/exhibitions","parameters":{"state":"展览进行的状态：`current` 对应展览当前正在进行，`past` 对应过去的展览，`upcoming` 对应即将举办的展览，默认为 `current`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Exhibitions","maintainers":[],"location":"exhibitions.ts"}' />

## National Geographic <Site url="www.nationalgeographic.com"/>

### Latest Stories <Site url="www.nationalgeographic.com/pages/topic/latest-stories" size="sm" />

<Route namespace="nationalgeographic" :data='{"path":"/latest-stories","categories":["travel"],"example":"/nationalgeographic/latest-stories","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.nationalgeographic.com/pages/topic/latest-stories"]}],"name":"Latest Stories","maintainers":["miles170"],"url":"www.nationalgeographic.com/pages/topic/latest-stories","location":"latest-stories.ts"}' />

## New Museum 纽约新美术馆 <Site url="www.newmuseum.org"/>

### Exhibitions <Site url="www.newmuseum.org" size="sm" />

<Route namespace="newmuseum" :data='{"path":"/exhibitions","categories":["travel"],"example":"/newmuseum/exhibitions","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Exhibitions","maintainers":["chazeon"],"location":"exhibitions.ts"}' />

## 飞客茶馆 <Site url="flyert.com"/>

### 信用卡 <Site url="flyert.com/" size="sm" />

<Route namespace="flyert" :data='{"path":"/creditcard/:bank","categories":["travel"],"example":"/flyert/creditcard/zhongxin","parameters":{"bank":"信用卡板块各银行的拼音简称"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["flyert.com/"]}],"name":"信用卡","maintainers":["nicolaszf"],"url":"flyert.com/","description":"| 信用卡模块 | bank          |\n  | ---------- | ------------- |\n  | 国内信用卡 | creditcard    |\n  | 浦发银行   | pufa          |\n  | 招商银行   | zhaoshang     |\n  | 中信银行   | zhongxin      |\n  | 交通银行   | jiaotong      |\n  | 中国银行   | zhonghang     |\n  | 工商银行   | gongshang     |\n  | 广发银行   | guangfa       |\n  | 农业银行   | nongye        |\n  | 建设银行   | jianshe       |\n  | 汇丰银行   | huifeng       |\n  | 民生银行   | mingsheng     |\n  | 兴业银行   | xingye        |\n  | 花旗银行   | huaqi         |\n  | 上海银行   | shanghai      |\n  | 无卡支付   | wuka          |\n  | 投资理财   | 137           |\n  | 网站权益汇 | 145           |\n  | 境外信用卡 | intcreditcard |","location":"creditcard.ts"}' />

| 信用卡模块 | bank          |
  | ---------- | ------------- |
  | 国内信用卡 | creditcard    |
  | 浦发银行   | pufa          |
  | 招商银行   | zhaoshang     |
  | 中信银行   | zhongxin      |
  | 交通银行   | jiaotong      |
  | 中国银行   | zhonghang     |
  | 工商银行   | gongshang     |
  | 广发银行   | guangfa       |
  | 农业银行   | nongye        |
  | 建设银行   | jianshe       |
  | 汇丰银行   | huifeng       |
  | 民生银行   | mingsheng     |
  | 兴业银行   | xingye        |
  | 花旗银行   | huaqi         |
  | 上海银行   | shanghai      |
  | 无卡支付   | wuka          |
  | 投资理财   | 137           |
  | 网站权益汇 | 145           |
  | 境外信用卡 | intcreditcard |

### 优惠信息 <Site url="flyert.com/" size="sm" />

<Route namespace="flyert" :data='{"path":"/preferential","categories":["travel"],"example":"/flyert/preferential","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["flyert.com/"]}],"name":"优惠信息","maintainers":["howel52"],"url":"flyert.com/","location":"preferential.ts"}' />

## 福州地铁 <Site url="www.fzmtr.com"/>

### 通知公告 <Site url="www.fzmtr.com" size="sm" />

<Route namespace="fzmtr" :data='{"path":"/announcements","categories":["travel"],"example":"/fzmtr/announcements","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"通知公告","maintainers":["HankChow"],"location":"announcements.ts"}' />

## 广州地铁 <Site url="www.gzmtr.com"/>

### 新闻 <Site url="www.gzmtr.com" size="sm" />

<Route namespace="guangzhoumetro" :data='{"path":"/news","categories":["travel"],"example":"/guangzhoumetro/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["HankChow"],"location":"news.ts"}' />

## 国家地理 <Site url="nationalgeographic.com"/>

### 分类 <Site url="nationalgeographic.com" size="sm" />

<Route namespace="natgeo" :data='{"path":"/:cat/:type?","categories":["travel"],"example":"/natgeo/environment/article","parameters":{"cat":"分类","type":"类型, 例如`https://www.natgeomedia.com/environment/photo/`对应 `cat`, `type` 分别为 `environment`, `photo`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["natgeomedia.com/:cat/:type","natgeomedia.com/"],"target":"/:cat/:type"}],"name":"分类","maintainers":["fengkx"],"location":"natgeo.ts"}' />

## 纽约犹太人博物馆 <Site url="thejewishmuseum.org"/>

### Exhibitions <Site url="thejewishmuseum.org" size="sm" />

<Route namespace="jewishmuseum" :data='{"path":"/exhibitions","categories":["travel"],"example":"/jewishmuseum/exhibitions","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Exhibitions","maintainers":["chazeon"],"location":"exhibitions.ts"}' />

## 中国国际航空公司 <Site url="www.airchina.com.cn"/>

### 服务公告 <Site url="www.airchina.com.cn/" size="sm" />

<Route namespace="airchina" :data='{"path":"/announcement","categories":["travel"],"example":"/airchina/announcement","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.airchina.com.cn/"]}],"name":"服务公告","maintainers":["LandonLi"],"url":"www.airchina.com.cn/","location":"index.ts"}' />

## 走进日本 <Site url="www.nippon.com"/>

### 政治外交 <Site url="www.nippon.com" size="sm" />

<Route namespace="nippon" :data='{"path":"/:category?","categories":["travel"],"example":"/nippon/Politics","parameters":{"category":"默认政治，可选如下"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.nippon.com/nippon/:category?","www.nippon.com/cn"]}],"name":"政治外交","description":"| 政治     | 经济    | 社会    | 展览预告 | 焦点专题           | 深度报道 | 话题         | 日本信息库 | 日本一蹩      | 人物访谈 | 编辑部通告    |\n    | -------- | ------- | ------- | -------- | ------------------ | -------- | ------------ | ---------- | ------------- | -------- | ------------- |\n    | Politics | Economy | Society | Culture  | Science,Technology | In-depth | japan-topics | japan-data | japan-glances | People   | Announcements |","maintainers":["laampui"],"location":"index.ts"}' />

| 政治     | 经济    | 社会    | 展览预告 | 焦点专题           | 深度报道 | 话题         | 日本信息库 | 日本一蹩      | 人物访谈 | 编辑部通告    |
    | -------- | ------- | ------- | -------- | ------------------ | -------- | ------------ | ---------- | ------------- | -------- | ------------- |
    | Politics | Economy | Society | Culture  | Science,Technology | In-depth | japan-topics | japan-data | japan-glances | People   | Announcements |

