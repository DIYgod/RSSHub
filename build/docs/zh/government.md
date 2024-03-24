# 📢 政务消息

## Constitutional Court of Baden-Württemberg (Germany) <Site url="verfgh.baden-wuerttemberg.de"/>

### Press releases <Site url="verfgh.baden-wuerttemberg.de/de/presse-und-service/pressemitteilungen/" size="sm" />

<Route namespace="verfghbw" :data='{"path":"/press/:keyword?","categories":["government"],"example":"/verfghbw/press","parameters":{"keyword":"Keyword"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["verfgh.baden-wuerttemberg.de/de/presse-und-service/pressemitteilungen/"],"target":"/press"}],"name":"Press releases","maintainers":["quinn-dev"],"url":"verfgh.baden-wuerttemberg.de/de/presse-und-service/pressemitteilungen/","location":"press.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## Hong Kong Department of Health 香港卫生署 <Site url="dh.gov.hk"/>

### Press Release <Site url="dh.gov.hk/" size="sm" />

<Route namespace="hongkong" :data='{"path":"/dh/:language?","categories":["government"],"example":"/hongkong/dh","parameters":{"language":"Language, see below, tc_chi by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dh.gov.hk/"]}],"name":"Press Release","maintainers":["nczitzk"],"url":"dh.gov.hk/","description":"Language\n\n  | English | 中文简体 | 中文繁體 |\n  | ------- | -------- | -------- |\n  | english | chs      | tc_chi  |","location":"dh.ts"}' :test='{"code":0}' />

Language

  | English | 中文简体 | 中文繁體 |
  | ------- | -------- | -------- |
  | english | chs      | tc_chi  |

### Unknown <Site url="dh.gov.hk/" size="sm" />

<Route namespace="hongkong" :data='{"path":"/chp/:category?/:language?","radar":[{"source":["dh.gov.hk/"]}],"name":"Unknown","maintainers":["nczitzk"],"url":"dh.gov.hk/","location":"chp.ts"}' :test='undefined' />

## Hong Kong Independent Commission Against Corruption 香港廉政公署 <Site url="icac.org.hk"/>

### Press Releases <Site url="icac.org.hk" size="sm" />

<Route namespace="icac" :data='{"path":"/news/:lang?","categories":["government"],"example":"/icac/news/sc","parameters":{"lang":"Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese) and `tc`(Traditional Chinese)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["icac.org.hk/:lang/press/index.html"],"target":"/news/:lang"}],"name":"Press Releases","maintainers":["linbuxiao, TonyRL"],"location":"news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## Macau Independent Commission Against Corruption 澳门廉政公署 <Site url="ccac.org.mo"/>

### Latest News <Site url="ccac.org.mo" size="sm" />

<Route namespace="ccac" :data='{"path":"/news/:type/:lang?","categories":["government"],"example":"/ccac/news/all","parameters":{"type":"Category","lang":"Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese), `tc`(Traditional Chinese) and `pt`(Portuguese)"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Latest News","maintainers":["linbuxiao"],"description":"Category\n\n  | All | Detected Cases | Investigation Reports or Recommendations | Annual Reports | CCAC&#39;s Updates |\n  | --- | -------------- | ---------------------------------------- | -------------- | -------------- |\n  | all | case           | Persuasion                               | AnnualReport   | PCANews        |","location":"news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Category

  | All | Detected Cases | Investigation Reports or Recommendations | Annual Reports | CCAC's Updates |
  | --- | -------------- | ---------------------------------------- | -------------- | -------------- |
  | all | case           | Persuasion                               | AnnualReport   | PCANews        |

## Thailand Department of Lands <Site url="announce.dol.go.th"/>

### e-LandsAnnouncement <Site url="announce.dol.go.th" size="sm" />

<Route namespace="dol" :data='{"path":"/announce/:owner?/:province?/:office?","categories":["government"],"example":"/dol/announce","parameters":{"owner":"Requester/former land owner","province":"Province which the land is belongs to","office":"DOL office name which the land is belongs to (สำนักงานที่ดิน(กรุงเทพมหานคร|จังหวัด*) [สาขา*])"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"e-LandsAnnouncement","maintainers":["itpcc"],"location":"announce.ts"}' :test='{"code":0}' />

## Thailand Parliament <Site url="parliament.go.th"/>

### Thailand Parliament Draft of Law's public hearing system <Site url="parliament.go.th" size="sm" />

<Route namespace="parliament" :data='{"path":"/section77/:type?","categories":["government"],"example":"/parliament/section77","parameters":{"type":"Type of hearing status, see below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Thailand Parliament Draft of Law&#39;s public hearing system","maintainers":["itpcc"],"description":"| Presented by MP *       | Presented by People * | Hearing Ongoing     | Hearing ended   | Hearing result reported  | Waiting for PM approval | Assigned into the session | Processed  | PM Rejected   |\n  | ------------------------ | ---------------------- | ------------------- | --------------- | ------------------------ | ----------------------- | ------------------------- | ---------- | ------------- |\n  | presentbymp              | presentbyperson        | openwsu             | closewsu        | reportwsu                | substatus1              | substatus2                | substatus3 | closewsubypm  |\n  | เสนอโดยสมาชิกสภาผู้แทนราษฏร | เสนอโดยประชาชน         | กำลังเปิดรับฟังความคิดเห็น | ปิดรับฟังความคิดเห็น | รายงานผลการรับฟังความคิดเห็น | รอคำรับรองจากนายกรัฐมนตรี   | บรรจุเข้าระเบียบวาระ         | พิจารณาแล้ว  | นายกฯ ไม่รับรอง |\n\n  *Note:* For `presentbymp` and `presentbyperson`, it can also add:\n\n  -   `-m` for the draft which Speaker of Parliament considered as a monetary draft (ประธานสภาผู้แทนราษฎรวินิจฉัยว่า เป็นร่างการเงิน), or\n  -   `-nm` for non-monetary one (ประธานสภาผู้แทนราษฎรวินิจฉัยว่า ไม่เป็นร่างการเงิน).","location":"section77.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| Presented by MP *       | Presented by People * | Hearing Ongoing     | Hearing ended   | Hearing result reported  | Waiting for PM approval | Assigned into the session | Processed  | PM Rejected   |
  | ------------------------ | ---------------------- | ------------------- | --------------- | ------------------------ | ----------------------- | ------------------------- | ---------- | ------------- |
  | presentbymp              | presentbyperson        | openwsu             | closewsu        | reportwsu                | substatus1              | substatus2                | substatus3 | closewsubypm  |
  | เสนอโดยสมาชิกสภาผู้แทนราษฏร | เสนอโดยประชาชน         | กำลังเปิดรับฟังความคิดเห็น | ปิดรับฟังความคิดเห็น | รายงานผลการรับฟังความคิดเห็น | รอคำรับรองจากนายกรัฐมนตรี   | บรรจุเข้าระเบียบวาระ         | พิจารณาแล้ว  | นายกฯ ไม่รับรอง |

  *Note:* For `presentbymp` and `presentbyperson`, it can also add:

  -   `-m` for the draft which Speaker of Parliament considered as a monetary draft (ประธานสภาผู้แทนราษฎรวินิจฉัยว่า เป็นร่างการเงิน), or
  -   `-nm` for non-monetary one (ประธานสภาผู้แทนราษฎรวินิจฉัยว่า ไม่เป็นร่างการเงิน).

## The White House <Site url="whitehouse.gov"/>

### Briefing Room <Site url="whitehouse.gov" size="sm" />

<Route namespace="whitehouse" :data='{"path":"/briefing-room/:category?","categories":["government"],"example":"/whitehouse/briefing-room","parameters":{"category":"Category, see below, all by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["whitehouse.gov/briefing-room/:category","whitehouse.gov/"],"target":"/briefing-room/:category"}],"name":"Briefing Room","maintainers":["nczitzk"],"description":"| All | Blog | Legislation | Presidential Actions | Press Briefings | Speeches and Remarks | Statements and Releases |\n  | --- | ---- | ----------- | -------------------- | --------------- | -------------------- | ----------------------- |\n  |     | blog | legislation | presidential-actions | press-briefings | speeches-remarks     | statements-releases     |","location":"briefing-room.ts"}' :test='{"code":0}' />

| All | Blog | Legislation | Presidential Actions | Press Briefings | Speeches and Remarks | Statements and Releases |
  | --- | ---- | ----------- | -------------------- | --------------- | -------------------- | ----------------------- |
  |     | blog | legislation | presidential-actions | press-briefings | speeches-remarks     | statements-releases     |

### Office of Science and Technology Policy <Site url="whitehouse.gov/ostp" size="sm" />

<Route namespace="whitehouse" :data='{"path":"/ostp","categories":["government"],"example":"/whitehouse/ostp","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["whitehouse.gov/ostp","whitehouse.gov/"]}],"name":"Office of Science and Technology Policy","maintainers":["LyleLee"],"url":"whitehouse.gov/ostp","location":"ostp.ts"}' :test='{"code":0}' />

## World Health Organization | WHO <Site url="who.int"/>

### Newsroom <Site url="who.int/news" size="sm" />

<Route namespace="who" :data='{"path":"/news-room/:category?/:language?","categories":["government"],"example":"/who/news-room/feature-stories","parameters":{"category":"Category, see below, Feature stories by default","language":"Language, see below, English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["who.int/news-room/:type"],"target":"/news-room/:type"}],"name":"Newsroom","maintainers":["LogicJake","nczitzk"],"url":"who.int/news","description":"Category\n\n  | Feature stories | Commentaries |\n  | --------------- | ------------ |\n  | feature-stories | commentaries |\n\n  Language\n\n  | English | العربية | 中文 | Français | Русский | Español | Português |\n  | ------- | ------- | ---- | -------- | ------- | ------- | --------- |\n  | en      | ar      | zh   | fr       | ru      | es      | pt        |","location":"news-room.ts"}' :test='{"code":0}' />

Category

  | Feature stories | Commentaries |
  | --------------- | ------------ |
  | feature-stories | commentaries |

  Language

  | English | العربية | 中文 | Français | Русский | Español | Português |
  | ------- | ------- | ---- | -------- | ------- | ------- | --------- |
  | en      | ar      | zh   | fr       | ru      | es      | pt        |

### News <Site url="who.int/news" size="sm" />

<Route namespace="who" :data='{"path":"/news/:language?","categories":["government"],"example":"/who/news","parameters":{"language":"Language, see below, English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["who.int/news"],"target":"/news"}],"name":"News","maintainers":["nczitzk"],"url":"who.int/news","description":"Language\n\n  | English | العربية | 中文 | Français | Русский | Español | Português |\n  | ------- | ------- | ---- | -------- | ------- | ------- | --------- |\n  | en      | ar      | zh   | fr       | ru      | es      | pt        |","location":"news.ts"}' :test='{"code":0}' />

Language

  | English | العربية | 中文 | Français | Русский | Español | Português |
  | ------- | ------- | ---- | -------- | ------- | ------- | --------- |
  | en      | ar      | zh   | fr       | ru      | es      | pt        |

### Speeches <Site url="who.int/director-general/speeches" size="sm" />

<Route namespace="who" :data='{"path":"/speeches/:language?","categories":["government"],"example":"/who/speeches","parameters":{"language":"Language, see below, English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["who.int/director-general/speeches"],"target":"/speeches"}],"name":"Speeches","maintainers":["nczitzk"],"url":"who.int/director-general/speeches","description":"Language\n\n  | English | العربية | 中文 | Français | Русский | Español | Português |\n  | ------- | ------- | ---- | -------- | ------- | ------- | --------- |\n  | en      | ar      | zh   | fr       | ru      | es      | pt        |","location":"speeches.ts"}' :test='{"code":0}' />

Language

  | English | العربية | 中文 | Français | Русский | Español | Português |
  | ------- | ------- | ---- | -------- | ------- | ------- | --------- |
  | en      | ar      | zh   | fr       | ru      | es      | pt        |

## 澳门卫生局 <Site url="www.ssm.gov.mo"/>

### 最新消息 <Site url="www.ssm.gov.mo/" size="sm" />

<Route namespace="ssm" :data='{"path":"/news","categories":["government"],"example":"/ssm/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.ssm.gov.mo/","www.ssm.gov.mo/portal"]}],"name":"最新消息","maintainers":["Fatpandac"],"url":"www.ssm.gov.mo/","location":"news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 北京社科网 <Site url="bjsk.org.cn"/>

### 基金项目管理平台 <Site url="keti.bjsk.org.cn/indexAction!to_index.action" size="sm" />

<Route namespace="bjsk" :data='{"path":"/keti/:id?","categories":["government"],"example":"/bjsk/keti","parameters":{"id":"分类 id，见下表，默认为通知公告"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["keti.bjsk.org.cn/indexAction!to_index.action","keti.bjsk.org.cn/"],"target":"/keti/:id"}],"name":"基金项目管理平台","maintainers":["nczitzk"],"url":"keti.bjsk.org.cn/indexAction!to_index.action","description":"| 通知公告                         | 资料下载                         |\n  | -------------------------------- | -------------------------------- |\n  | 402881027cbb8c6f017cbb8e17710002 | 2c908aee818e04f401818e08645c0002 |","location":"keti.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 通知公告                         | 资料下载                         |
  | -------------------------------- | -------------------------------- |
  | 402881027cbb8c6f017cbb8e17710002 | 2c908aee818e04f401818e08645c0002 |

### 通用 <Site url="bjsk.org.cn" size="sm" />

<Route namespace="bjsk" :data='{"path":"/:path?","categories":["government"],"example":"/bjsk/newslist-1394-1474-0","parameters":{"path":"路径，默认为 `newslist-1486-0-0`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"通用","maintainers":["TonyRL"],"description":":::tip\n  路径处填写对应页面 URL 中 `https://www.bjsk.org.cn/` 和 `.html` 之间的字段。下面是一个例子。\n\n  若订阅 [社科资讯 > 社科要闻](https://www.bjsk.org.cn/newslist-1394-1474-0.html) 则将对应页面 URL `https://www.bjsk.org.cn/newslist-1394-1474-0.html` 中 `https://www.bjsk.org.cn/` 和 `.html` 之间的字段 `newslist-1394-1474-0` 作为路径填入。此时路由为 [`/bjsk/newslist-1394-1474-0`](https://rsshub.app/bjsk/newslist-1394-1474-0)\n  :::","location":"index.ts"}' :test='{"code":0}' />

:::tip
  路径处填写对应页面 URL 中 `https://www.bjsk.org.cn/` 和 `.html` 之间的字段。下面是一个例子。

  若订阅 [社科资讯 > 社科要闻](https://www.bjsk.org.cn/newslist-1394-1474-0.html) 则将对应页面 URL `https://www.bjsk.org.cn/newslist-1394-1474-0.html` 中 `https://www.bjsk.org.cn/` 和 `.html` 之间的字段 `newslist-1394-1474-0` 作为路径填入。此时路由为 [`/bjsk/newslist-1394-1474-0`](https://rsshub.app/bjsk/newslist-1394-1474-0)
  :::

## 北京无线电协会 <Site url="www.bjwxdxh.org.cn"/>

### 最新资讯 <Site url="www.bjwxdxh.org.cn" size="sm" />

<Route namespace="bjwxdxh" :data='{"path":"/:type?","categories":["government"],"example":"/bjwxdxh/114","parameters":{"type":"类型，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新资讯","maintainers":["Misaka13514"],"description":"| 协会活动 | 公告通知 | 会议情况 | 简报 | 政策法规 | 学习园地 | 业余无线电服务中心 | 经验交流 | 新技术推介 | 活动通知 | 爱好者园地 | 结果查询 | 资料下载 | 会员之家 | 会员简介 | 会员风采 | 活动报道 |\n  | -------- | -------- | -------- | ---- | -------- | -------- | ------------------ | -------- | ---------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 86       | 99       | 102      | 103  | 106      | 107      | 108                | 111      | 112        | 114      | 115        | 116      | 118      | 119      | 120      | 121      | 122      |","location":"index.ts"}' :test='{"code":0}' />

| 协会活动 | 公告通知 | 会议情况 | 简报 | 政策法规 | 学习园地 | 业余无线电服务中心 | 经验交流 | 新技术推介 | 活动通知 | 爱好者园地 | 结果查询 | 资料下载 | 会员之家 | 会员简介 | 会员风采 | 活动报道 |
  | -------- | -------- | -------- | ---- | -------- | -------- | ------------------ | -------- | ---------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | 86       | 99       | 102      | 103  | 106      | 107      | 108                | 111      | 112        | 114      | 115        | 116      | 118      | 119      | 120      | 121      | 122      |

## 国家药品审评网站 <Site url="www.cde.org.cn"/>

### 首页 <Site url="www.cde.org.cn" size="sm" />

<Route namespace="cde" :data='{"path":"/:channel/:category","categories":["government"],"example":"/cde/news/gzdt","parameters":{"channel":"频道","category":"类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"首页","maintainers":["Fatpandac"],"description":"-   频道\n\n  | 新闻中心 | 政策法规 |\n  | :------: | :------: |\n  |   news   |  policy  |\n\n  -   类别\n\n  | 新闻中心 | 政务新闻 | 要闻导读 | 图片新闻 | 工作动态 |\n  | :------: | :------: | :------: | :------: | :------: |\n  |          |   zwxw   |   ywdd   |   tpxw   |   gzdt   |\n\n  | 政策法规 | 法律法规 | 中心规章 |\n  | :------: | :------: | :------: |\n  |          |   flfg   |   zxgz   |","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

-   频道

  | 新闻中心 | 政策法规 |
  | :------: | :------: |
  |   news   |  policy  |

  -   类别

  | 新闻中心 | 政务新闻 | 要闻导读 | 图片新闻 | 工作动态 |
  | :------: | :------: | :------: | :------: | :------: |
  |          |   zwxw   |   ywdd   |   tpxw   |   gzdt   |

  | 政策法规 | 法律法规 | 中心规章 |
  | :------: | :------: | :------: |
  |          |   flfg   |   zxgz   |

### 信息公开 <Site url="www.cde.org.cn" size="sm" />

<Route namespace="cde" :data='{"path":"/xxgk/:category","categories":["government"],"example":"/cde/xxgk/priorityApproval","parameters":{"category":"类别，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"信息公开","maintainers":["TonyRL"],"description":"|   优先审评公示   |  突破性治疗公示  | 临床试验默示许可 |\n  | :--------------: | :--------------: | :--------------: |\n  | priorityApproval | breakthroughCure |     cliniCal     |","location":"xxgk.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

|   优先审评公示   |  突破性治疗公示  | 临床试验默示许可 |
  | :--------------: | :--------------: | :--------------: |
  | priorityApproval | breakthroughCure |     cliniCal     |

### 指导原则专栏 <Site url="www.cde.org.cn" size="sm" />

<Route namespace="cde" :data='{"path":"/zdyz/:category","categories":["government"],"example":"/cde/zdyz/domesticGuide","parameters":{"category":"类别，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"指导原则专栏","maintainers":["TonyRL"],"description":"|    发布通告   |   征求意见  |\n  | :-----------: | :---------: |\n  | domesticGuide | opinionList |","location":"zdyz.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

|    发布通告   |   征求意见  |
  | :-----------: | :---------: |
  | domesticGuide | opinionList |

## 南京鼓楼医院 <Site url="njglyy.com"/>

### 员工版教育培训 <Site url="njglyy.com/ygb/jypx/jypx.aspx" size="sm" />

<Route namespace="njglyy" :data='{"path":"/ygbjypx","categories":["government"],"example":"/njglyy/ygbjypx","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["njglyy.com/ygb/jypx/jypx.aspx","njglyy.com/"]}],"name":"员工版教育培训","maintainers":["real-jiakai"],"url":"njglyy.com/ygb/jypx/jypx.aspx","location":"ygbjypx.ts"}' :test='{"code":0}' />

## 台湾行政院消费者保护会 <Site url="cpc.ey.gov.tw"/>

### 消费资讯 <Site url="cpc.ey.gov.tw" size="sm" />

<Route namespace="cpcey" :data='{"path":"/:type?","categories":["government"],"example":"/cpcey/xwg","parameters":{"type":"默认为 `xwg`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"消费资讯","maintainers":["Fatpandac"],"description":"| 新闻稿 | 消费资讯 |\n  | :----: | :------: |\n  |   xwg  |   xfzx   |","location":"index.ts"}' :test='{"code":0}' />

| 新闻稿 | 消费资讯 |
  | :----: | :------: |
  |   xwg  |   xfzx   |

## 台灣衛生福利部 <Site url="mohw.gov.tw"/>

### 即時新聞澄清 <Site url="mohw.gov.tw/" size="sm" />

<Route namespace="mohw" :data='{"path":"/clarification","categories":["government"],"example":"/mohw/clarification","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mohw.gov.tw/"]}],"name":"即時新聞澄清","maintainers":["nczitzk"],"url":"mohw.gov.tw/","location":"clarification.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## 中国科学学与科技政策研究会 <Site url="casssp.org.cn"/>

### 研究会动态 <Site url="casssp.org.cn" size="sm" />

<Route namespace="casssp" :data='{"path":"/news/:category?","categories":["government"],"example":"/casssp/news/3","parameters":{"category":"分类，见下表，默认为通知公告"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"研究会动态","maintainers":["nczitzk"],"description":"| 通知公告 | 新闻动态 | 信息公开 | 时政要闻 |\n  | -------- | -------- | -------- | -------- |\n  | 3        | 2        | 92       | 93       |","location":"news.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 通知公告 | 新闻动态 | 信息公开 | 时政要闻 |
  | -------- | -------- | -------- | -------- |
  | 3        | 2        | 92       | 93       |

## 中国科学技术协会 <Site url="cast.org.cn"/>

### 通用 <Site url="cast.org.cn" size="sm" />

<Route namespace="cast" :data='{"path":"/:column/:subColumn/:category?","categories":["government"],"example":"/cast/xw/tzgg/ZH","parameters":{"column":"栏目编号，见下表","subColumn":"二级栏目编号","category":"分类"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cast.org.cn/:column/:subColumn/:category/index.html","cast.org.cn/:column/:subColumn/index.html"],"target":"/:column/:subColumn/:category?"}],"name":"通用","maintainers":["KarasuShin","TonyRL"],"description":":::tip\n  在路由末尾处加上 `?limit=限制获取数目` 来限制获取条目数量，默认值为`10`\n  :::\n\n  | 分类     | 编码 |\n  | -------- | ---- |\n  | 全景科协 | qjkx |\n  | 智库     | zk   |\n  | 学术     | xs   |\n  | 科普     | kp   |\n  | 党建     | dj   |\n  | 数据     | sj   |\n  | 新闻     | xw   |","location":"index.ts"}' :test='{"code":0}' />

:::tip
  在路由末尾处加上 `?limit=限制获取数目` 来限制获取条目数量，默认值为`10`
  :::

  | 分类     | 编码 |
  | -------- | ---- |
  | 全景科协 | qjkx |
  | 智库     | zk   |
  | 学术     | xs   |
  | 科普     | kp   |
  | 党建     | dj   |
  | 数据     | sj   |
  | 新闻     | xw   |

## 中国无线电协会业余无线电分会 <Site url="www.crac.org.cn"/>

### 最新资讯 <Site url="www.crac.org.cn" size="sm" />

<Route namespace="crac" :data='{"path":"/:type?","categories":["government"],"example":"/crac/2","parameters":{"type":"类型，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新资讯","maintainers":["Misaka13514"],"description":"| 新闻动态 | 通知公告 | 政策法规 | 常见问题 | 资料下载 | English | 业余中继台 | 科普专栏 |\n  | -------- | -------- | -------- | -------- | -------- | ------- | ---------- | -------- |\n  | 1        | 2        | 3        | 5        | 6        | 7       | 8          | 9        |","location":"index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 新闻动态 | 通知公告 | 政策法规 | 常见问题 | 资料下载 | English | 业余中继台 | 科普专栏 |
  | -------- | -------- | -------- | -------- | -------- | ------- | ---------- | -------- |
  | 1        | 2        | 3        | 5        | 6        | 7       | 8          | 9        |

## 中国人民银行 <Site url="kjt.ah.gov.cn"/>

<details>
  <summary>*业务咨询* 和 *投诉建议* 可用的站点参数</summary>

  | 上海市   | 北京市  | 天津市  | 河北省 |
  | -------- | ------- | ------- | ------ |
  | shanghai | beijing | tianjin | hebei  |

  | 山西省 | 内蒙古自治区 | 辽宁省   | 吉林省 |
  | ------ | ------------ | -------- | ------ |
  | shanxi | neimenggu    | liaoning | jilin  |

  | 黑龙江省     | 江苏省  | 浙江省   | 安徽省 |
  | ------------ | ------- | -------- | ------ |
  | heilongjiang | jiangsu | zhejiang | anhui  |

  | 福建省 | 江西省  | 山东省   | 河南省 |
  | ------ | ------- | -------- | ------ |
  | fujian | jiangxi | shandong | henan  |

  | 湖北省 | 湖南省 | 广东省    | 广西壮族自治区 |
  | ------ | ------ | --------- | -------------- |
  | hubei  | hunan  | guangdong | guangxi        |

  | 海南省 | 重庆市    | 四川省  | 贵州省  |
  | ------ | --------- | ------- | ------- |
  | hainan | chongqing | sichuan | guizhou |

  | 云南省 | 西藏自治区 | 陕西省  | 甘肃省 |
  | ------ | ---------- | ------- | ------ |
  | yunnan | xizang     | shaanxi | gansu  |

  | 青海省  | 宁夏回族自治区 | 新疆维吾尔自治区 | 大连市 |
  | ------- | -------------- | ---------------- | ------ |
  | qinghai | ningxia        | xinjiang         | dalian |

  | 宁波市 | 厦门市 | 青岛市  | 深圳市   |
  | ------ | ------ | ------- | -------- |
  | ningbo | xiamen | qingdao | shenzhen |
</details>

### Immigration and Citizenship - News <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/immiau/news","categories":["government"],"example":"/gov/immiau/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Immigration and Citizenship - News","maintainers":["liu233w"],"location":"immiau/news.ts"}' :test='{"code":0}' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/anhui/kjt/*","name":"Unknown","maintainers":[],"location":"anhui/kjt.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/beijing/bphc/*","name":"Unknown","maintainers":[],"location":"beijing/bphc/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/beijing/kw/:channel","name":"Unknown","maintainers":["Fatpandac"],"location":"beijing/kw/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/cac/*","name":"Unknown","maintainers":[],"location":"cac/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/ccdi/*","name":"Unknown","maintainers":[],"location":"ccdi/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/chinamine-safety/xw/:category{.+}?","name":"Unknown","maintainers":[],"location":"chinamine-safety/xw.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/chinamine-safety/zfxxgk/:category{.+}?","name":"Unknown","maintainers":[],"location":"chinamine-safety/zfxxgk.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/cmse/*","name":"Unknown","maintainers":[],"location":"cmse/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/cnnic/*","name":"Unknown","maintainers":[],"location":"cnnic/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/csrc/news/:suffix{.+}?","name":"Unknown","maintainers":[],"location":"csrc/news.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/dianbai/*","name":"Unknown","maintainers":[],"location":"dianbai/dianbai.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/gaozhou/*","name":"Unknown","maintainers":[],"location":"gaozhou/gaozhou.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/gz/:channel/:category","name":"Unknown","maintainers":[],"location":"gz/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/huazhou/*","name":"Unknown","maintainers":[],"location":"huazhou/huazhou.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/maoming/*","name":"Unknown","maintainers":[],"location":"maoming/maoming.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":["/fmprc/:category?","/mfa/wjdt/:category?"],"name":"Unknown","maintainers":["nicolaszf","nczitzk"],"description":"| 分类       | category |\n  | ---------- | -------- |\n  | 领导人活动 | gjldrhd  |\n  | 外事日程   | wsrc     |\n  | 部领导活动 | wjbxw    |\n  | 业务动态   | sjxw     |\n  | 发言人表态 | fyrbt    |\n  | 吹风会     | cfhsl    |\n  | 大使任免   | dsrm     |\n  | 驻外报道   | zwbd     |\n  | 政策解读   | zcjd     |","location":"mfa/wjdt.ts"}' :test='undefined' />

| 分类       | category |
  | ---------- | -------- |
  | 领导人活动 | gjldrhd  |
  | 外事日程   | wsrc     |
  | 部领导活动 | wjbxw    |
  | 业务动态   | sjxw     |
  | 发言人表态 | fyrbt    |
  | 吹风会     | cfhsl    |
  | 大使任免   | dsrm     |
  | 驻外报道   | zwbd     |
  | 政策解读   | zcjd     |

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":["/fmprc/:category?","/mfa/wjdt/:category?"],"name":"Unknown","maintainers":["nicolaszf","nczitzk"],"description":"| 分类       | category |\n  | ---------- | -------- |\n  | 领导人活动 | gjldrhd  |\n  | 外事日程   | wsrc     |\n  | 部领导活动 | wjbxw    |\n  | 业务动态   | sjxw     |\n  | 发言人表态 | fyrbt    |\n  | 吹风会     | cfhsl    |\n  | 大使任免   | dsrm     |\n  | 驻外报道   | zwbd     |\n  | 政策解读   | zcjd     |","location":"mfa/wjdt.ts"}' :test='undefined' />

| 分类       | category |
  | ---------- | -------- |
  | 领导人活动 | gjldrhd  |
  | 外事日程   | wsrc     |
  | 部领导活动 | wjbxw    |
  | 业务动态   | sjxw     |
  | 发言人表态 | fyrbt    |
  | 吹风会     | cfhsl    |
  | 大使任免   | dsrm     |
  | 驻外报道   | zwbd     |
  | 政策解读   | zcjd     |

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/mgs/*","name":"Unknown","maintainers":[],"location":"mgs/mgs.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/mmht/*","name":"Unknown","maintainers":[],"location":"mmht/mmht.ts"}' :test='undefined' />

### Unknown <Site url="moa.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/moa/:suburl{.+}","radar":[{"source":["moa.gov.cn/"],"target":"/moa/:suburl"}],"name":"Unknown","maintainers":[],"url":"moa.gov.cn/","location":"moa/moa.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":["/moa/sjzxfb/:category{.+}?","/moa/zdscxx/:category{.+}?"],"name":"Unknown","maintainers":[],"location":"moa/zdscxx.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":["/moa/sjzxfb/:category{.+}?","/moa/zdscxx/:category{.+}?"],"name":"Unknown","maintainers":[],"location":"moa/zdscxx.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/mofcom/article/:suffix{.+}","name":"Unknown","maintainers":[],"location":"mofcom/article.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/mot/:category{.+}?","name":"Unknown","maintainers":[],"location":"mot/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/ndrc/fggz/:category{.+}?","name":"Unknown","maintainers":[],"location":"ndrc/fggz.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/ndrc/xwdt/:category{.+}?","name":"Unknown","maintainers":[],"location":"ndrc/xwdt.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/nifdc/:path{.+}?","name":"Unknown","maintainers":[],"location":"nifdc/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/nmpa/*","name":"Unknown","maintainers":[],"location":"nmpa/generic.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/nopss/*","name":"Unknown","maintainers":[],"location":"nopss/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/nsfc/*","name":"Unknown","maintainers":[],"location":"nsfc/index.ts"}' :test='undefined' />

### Unknown <Site url="pbc.gov.cn/redianzhuanti/118742/4122386/4122510/index.html" size="sm" />

<Route namespace="gov" :data='{"path":"/pbc/zcyj","radar":[{"source":["pbc.gov.cn/redianzhuanti/118742/4122386/4122510/index.html"]}],"name":"Unknown","maintainers":["Fatpandac"],"url":"pbc.gov.cn/redianzhuanti/118742/4122386/4122510/index.html","location":"pbc/zcyj.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/sasac/:path{.+}","name":"Unknown","maintainers":[],"location":"sasac/generic.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/sdb/*","name":"Unknown","maintainers":[],"location":"sdb/sdb.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/shanghai/yjj/*","name":"Unknown","maintainers":[],"location":"shanghai/yjj/index.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/suzhou/fg/:category{.+}?","name":"Unknown","maintainers":[],"location":"suzhou/fg.ts"}' :test='undefined' />

### Unknown <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/xinyi/*","name":"Unknown","maintainers":[],"location":"xinyi/xinyi.ts"}' :test='undefined' />

### 财政厅 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/hebei/czt/xwdt/:category?","categories":["government"],"example":"/gov/hebei/czt/xwdt","parameters":{"category":"分类，见下表，默认为财政动态"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"财政厅","maintainers":["nczitzk"],"description":"| 财政动态 | 综合新闻 | 通知公告 |\n  | -------- | -------- | -------- |\n  | gzdt     | zhxw     | tzgg     |","location":"hebei/czt.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 财政动态 | 综合新闻 | 通知公告 |
  | -------- | -------- | -------- |
  | gzdt     | zhxw     | tzgg     |

### 电视剧政务平台 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/nrta/dsj/:category?","categories":["government"],"example":"/gov/nrta/dsj","parameters":{"category":"分类，见下表，默认为备案公示"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"电视剧政务平台","maintainers":["nczitzk"],"description":"| 备案公示 | 发行许可通告 | 重大题材立项     | 重大题材摄制    | 变更通报 |\n  | -------- | ------------ | ---------------- | --------------- | -------- |\n  | note     | announce     | importantLixiang | importantShezhi | changing |","location":"nrta/dsj.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 备案公示 | 发行许可通告 | 重大题材立项     | 重大题材摄制    | 变更通报 |
  | -------- | ------------ | ---------------- | --------------- | -------- |
  | note     | announce     | importantLixiang | importantShezhi | changing |

### 发展规划司 <Site url="nea.gov.cn/sjzz/ghs/" size="sm" />

<Route namespace="gov" :data='{"path":"/nea/sjzz/ghs","categories":["government"],"example":"/gov/nea/sjzz/ghs","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nea.gov.cn/sjzz/ghs/"]}],"name":"发展规划司","maintainers":["nczitzk"],"url":"nea.gov.cn/sjzz/ghs/","location":"nea/ghs.ts"}' :test='{"code":0}' />

### 飞行任务 <Site url="www.cmse.gov.cn/fxrw" size="sm" />

<Route namespace="gov" :data='{"path":"/cmse/fxrw","categories":["government"],"example":"/gov/cmse/fxrw","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.cmse.gov.cn/fxrw"]}],"name":"飞行任务","maintainers":["nczitzk"],"url":"www.cmse.gov.cn/fxrw","location":"cmse/fxrw.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 分类 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/nrta/news/:category?","categories":["government"],"example":"/gov/nrta/news","parameters":{"category":"资讯类别，可从地址中获取，默认为总局要闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["yuxinliu-alex"],"description":"| 总局要闻 | 公告公示 | 工作动态 | 其他 |\n  | -------- | -------- | -------- | ---- |\n  | 112      | 113      | 114      |      |","location":"nrta/news.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 总局要闻 | 公告公示 | 工作动态 | 其他 |
  | -------- | -------- | -------- | ---- |
  | 112      | 113      | 114      |      |

### 公众留言 <Site url="caac.gov.cn/HDJL/" size="sm" />

<Route namespace="gov" :data='{"path":"/caac/cjwt/:category?","categories":["government"],"example":"/gov/caac/cjwt","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["caac.gov.cn/HDJL/"],"target":"/caac/cjwt"}],"name":"公众留言","maintainers":["nczitzk"],"url":"caac.gov.cn/HDJL/","description":"| 机票 | 托运 | 无人机 | 体检 | 行政审批 | 投诉 |\n  | ---- | ---- | ------ | ---- | -------- | ---- |","location":"caac/cjwt.ts"}' :test='{"code":0}' />

| 机票 | 托运 | 无人机 | 体检 | 行政审批 | 投诉 |
  | ---- | ---- | ------ | ---- | -------- | ---- |

### 国家林草科技大讲堂 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/forestry/gjlckjdjt/:category?","categories":["government"],"example":"/gov/forestry/gjlckjdjt","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"国家林草科技大讲堂","maintainers":["nczitzk"],"description":"| 分类     | id   |\n  | -------- | ---- |\n  | 经济林   | jjl  |\n  | 林木良种 | lmlz |\n  | 林下经济 | lxjj |\n  | 生态修复 | stxf |\n  | 用材林   | ycl  |\n  | 其他     | qt   |","location":"forestry/gjlckjdjt.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 分类     | id   |
  | -------- | ---- |
  | 经济林   | jjl  |
  | 林木良种 | lmlz |
  | 林下经济 | lxjj |
  | 生态修复 | stxf |
  | 用材林   | ycl  |
  | 其他     | qt   |

### 国家统计局 通用 <Site url="www.stats.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/stats/*","name":"国家统计局 通用","url":"www.stats.gov.cn","categories":["government"],"maintainers":["bigfei","nczitzk"],"example":"/stats/sj/zxfb","radar":[{"title":"国家统计局 通用","source":["www.stats.gov.cn/*path"],"target":"/gov/stats/*path"}],"description":"::: tip\n    路径处填写对应页面 URL 中 `http://www.stats.gov.cn/` 后的字段。下面是一个例子。\n\n    若订阅 [数据 > 数据解读](http://www.stats.gov.cn/sj/sjjd/) 则将对应页面 URL `http://www.stats.gov.cn/sj/sjjd/` 中 `http://www.stats.gov.cn/` 后的字段 `sj/sjjd` 作为路径填入。此时路由为 [`/gov/stats/sj/sjjd`](https://rsshub.app/gov/stats/sj/sjjd)\n\n    若订阅 [新闻 > 时政要闻 > 中央精神](http://www.stats.gov.cn/xw/szyw/zyjs/) 则将对应页面 URL `http://www.stats.gov.cn/xw/szyw/zyjs/` 中 `http://www.stats.gov.cn/` 后的字段 `xw/szyw/zyjs` 作为路径填入。此时路由为 [`/gov/stats/xw/szyw/zyjs`](https://rsshub.app/gov/stats/xw/szyw/zyjs)\n    :::","location":"stats/index.ts"}' :test='{"code":1,"message":"expected 404 to be 200 // Object.is equality"}' />

::: tip
    路径处填写对应页面 URL 中 `http://www.stats.gov.cn/` 后的字段。下面是一个例子。

    若订阅 [数据 > 数据解读](http://www.stats.gov.cn/sj/sjjd/) 则将对应页面 URL `http://www.stats.gov.cn/sj/sjjd/` 中 `http://www.stats.gov.cn/` 后的字段 `sj/sjjd` 作为路径填入。此时路由为 [`/gov/stats/sj/sjjd`](https://rsshub.app/gov/stats/sj/sjjd)

    若订阅 [新闻 > 时政要闻 > 中央精神](http://www.stats.gov.cn/xw/szyw/zyjs/) 则将对应页面 URL `http://www.stats.gov.cn/xw/szyw/zyjs/` 中 `http://www.stats.gov.cn/` 后的字段 `xw/szyw/zyjs` 作为路径填入。此时路由为 [`/gov/stats/xw/szyw/zyjs`](https://rsshub.app/gov/stats/xw/szyw/zyjs)
    :::

### 国务院政策文件库 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/zhengce/zhengceku/:department","categories":["government"],"example":"/gov/zhengce/zhengceku/bmwj","parameters":{"department":"库名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"国务院政策文件库","maintainers":["zxx-457"],"location":"zhengce/zhengceku.ts"}' :test='{"code":0}' />

### 惠州市人民政府 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/huizhou/zwgk/:category?","categories":["government"],"example":"/gov/huizhou/zwgk/jgdt","parameters":{"category":"资讯类别，可以从网址中得到，默认为政务要闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"惠州市人民政府","maintainers":["Fatpandac"],"description":"#### 政务公开 {#guang-dong-sheng-ren-min-zheng-fu-hui-zhou-shi-ren-min-zheng-fu-zheng-wu-gong-kai}","location":"huizhou/zwgk/index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

#### 政务公开 {#guang-dong-sheng-ren-min-zheng-fu-hui-zhou-shi-ren-min-zheng-fu-zheng-wu-gong-kai}

### 获取国家医师资格考试通知 <Site url="jnmhc.jinan.gov.cn/*" size="sm" />

<Route namespace="gov" :data='{"path":"/jinan/healthcommission/medical_exam_notice","categories":["government"],"example":"/gov/jinan/healthcommission/medical_exam_notice","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["jnmhc.jinan.gov.cn/*"]}],"name":"获取国家医师资格考试通知","maintainers":["tzjyxb"],"url":"jnmhc.jinan.gov.cn/*","location":"jinan/healthcommission/medical-exam-notice.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 价格监测中心 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/jgjcndrc/:id?","categories":["government"],"example":"/gov/jgjcndrc","parameters":{"id":"栏目 id，见下表，默认为 692，即通知公告"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"价格监测中心","maintainers":["nczitzk"],"description":"| 通知公告 | 中心工作动态 | 地方工作动态 | 监测信息 | 分析预测 | 调查报告 |\n  | -------- | ------------ | ------------ | -------- | -------- | -------- |\n  | 692      | 693          | 694          | 695      | 696      | 697      |\n\n  | 价格指数 | 地方价格监测 | 价格监测报告制度 | 监测法规 | 媒体聚焦 |\n  | -------- | ------------ | ---------------- | -------- | -------- |\n  | 698      | 699          | 700              | 701      | 753      |\n\n  #### 监测信息\n\n  | 国内外市场价格监测情况周报 | 主要粮油副食品日报 | 生猪出厂价与玉米价格周报 | 国际市场石油价格每日 动态 |\n  | -------------------------- | ------------------ | ------------------------ | ------------------------- |\n  | 749                        | 703                | 704                      | 705                       |\n\n  | 非学科类培训服务价格 | 监测周期价格动态 | 月度监测行情表 | 猪料、鸡料、蛋料比价 |\n  | -------------------- | ---------------- | -------------- | -------------------- |\n  | 821                  | 706              | 707            | 708                  |","location":"jgjcndrc/index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 通知公告 | 中心工作动态 | 地方工作动态 | 监测信息 | 分析预测 | 调查报告 |
  | -------- | ------------ | ------------ | -------- | -------- | -------- |
  | 692      | 693          | 694          | 695      | 696      | 697      |

  | 价格指数 | 地方价格监测 | 价格监测报告制度 | 监测法规 | 媒体聚焦 |
  | -------- | ------------ | ---------------- | -------- | -------- |
  | 698      | 699          | 700              | 701      | 753      |

  #### 监测信息

  | 国内外市场价格监测情况周报 | 主要粮油副食品日报 | 生猪出厂价与玉米价格周报 | 国际市场石油价格每日 动态 |
  | -------------------------- | ------------------ | ------------------------ | ------------------------- |
  | 749                        | 703                | 704                      | 705                       |

  | 非学科类培训服务价格 | 监测周期价格动态 | 月度监测行情表 | 猪料、鸡料、蛋料比价 |
  | -------------------- | ---------------- | -------------- | -------------------- |
  | 821                  | 706              | 707            | 708                  |

### 今日绵竹 <Site url="www.mztoday.gov.cn/*" size="sm" />

<Route namespace="gov" :data='{"path":"/sichuan/deyang/mztoday/:infoType?","categories":["government"],"example":"/gov/sichuan/deyang/mztoday/zx","parameters":{"infoType":"信息栏目名称。默认最新(zx)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.mztoday.gov.cn/*"],"target":"/sichuan/deyang/mztoday"}],"name":"今日绵竹","maintainers":["zytomorrow"],"url":"www.mztoday.gov.cn/*","description":"| 最新 | 推荐 | 时政 | 教育 | 民生 | 文旅 | 经济 | 文明创建 | 部门 | 镇（街道） | 健康绵竹 | 南轩讲堂 | 视频 | 文明实践 | 领航中国 | 绵竹年画 | 绵竹历史 | 绵竹旅游 | 外媒看绵竹 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | ---------- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- | ---------- |\n  | zx   | tj   | sz   | jy   | ms   | wl   | jj   | wmcj     | bm   | zj         | jkmz     | nxjt     | sp   | wmsj     | lhzg     | mznh     | mzls     | mzly     | wmkmz      |","location":"sichuan/deyang/mztoday.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 最新 | 推荐 | 时政 | 教育 | 民生 | 文旅 | 经济 | 文明创建 | 部门 | 镇（街道） | 健康绵竹 | 南轩讲堂 | 视频 | 文明实践 | 领航中国 | 绵竹年画 | 绵竹历史 | 绵竹旅游 | 外媒看绵竹 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | ---------- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- | ---------- |
  | zx   | tj   | sz   | jy   | ms   | wl   | jj   | wmcj     | bm   | zj         | jkmz     | nxjt     | sp   | wmsj     | lhzg     | mznh     | mzls     | mzly     | wmkmz      |

### 立法意见征集 <Site url="www.moj.gov.cn/lfyjzj/lflfyjzj/*" size="sm" />

<Route namespace="gov" :data='{"path":"/moj/lfyjzj","categories":["government"],"example":"/gov/moj/lfyjzj","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.moj.gov.cn/lfyjzj/lflfyjzj/*","www.moj.gov.cn/pub/sfbgw/lfyjzj/lflfyjzj/*"]}],"name":"立法意见征集","maintainers":["la3rence"],"url":"www.moj.gov.cn/lfyjzj/lflfyjzj/*","location":"moj/lfyjzj.ts"}' :test='{"code":0}' />

### 留言咨询 <Site url="xgzlyhd.samr.gov.cn/gjjly/index" size="sm" />

<Route namespace="gov" :data='{"path":"/samr/xgzlyhd/:category?/:department?","categories":["government"],"example":"/gov/samr/xgzlyhd","parameters":{"category":"留言类型，见下表，默认为全部","department":"回复部门，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xgzlyhd.samr.gov.cn/gjjly/index"]}],"name":"留言咨询","maintainers":["nczitzk"],"url":"xgzlyhd.samr.gov.cn/gjjly/index","description":"#### 留言类型\n\n  | 类型                                       | 类型 id                          |\n  | ------------------------------------------ | -------------------------------- |\n  | 反腐倡廉                                   | 14101a4192df48b592b5cfd77a26c0cf |\n  | 规划统计                                   | b807cf9cdf434635ae908d48757e0f39 |\n  | 行政执法和复议                             | 8af2530e77154d7b939428667b7413f6 |\n  | 假冒仿冒行为                               | 75374a34b95341829e08e54d4a0d8c04 |\n  | 走私贩私                                   | 84c728530e1e478e94fe3f0030171c53 |\n  | 登记注册                                   | 07fff64612dc41aca871c06587abf71d |\n  | 个体工商户登记                             | ca8f91ba9a2347a0acd57ea5fd12a5c8 |\n  | 信用信息公示系统                           | 1698886c3cdb495998d5ea9285a487f5 |\n  | 市场主体垄断                               | 77bfe965843844449c47d29f2feb7999 |\n  | 反不正当竞争                               | 2c919b1dc39440d8850c4f6c405869f8 |\n  | 商业贿赂                                   | b494e6535af149c5a51fd4197993f061 |\n  | 打击传销与规范直销                         | 407a1404844e48558da46139f16d6232 |\n  | 消费环境建设                               | 94c2003331dd4c5fa19b0cf88d720676 |\n  | 网络交易监管                               | 6302aac5b87140598da53f85c1ccb8fa |\n  | 动产抵押登记                               | 3856de5835444229943b18cac7781e9f |\n  | 广告监管                                   | d0e38171042048c2bf31b05c5e57aa68 |\n  | 三包                                       | c4dbd85692604a428b1ea7613e67beb8 |\n  | 缺陷产品召回                               | f93c9a6b81e941d09a547406370e1c0c |\n  | 工业生产许可                               | 2b41afaabaa24325b53a5bd7deba895b |\n  | 产品质量监督抽查                           | 4388504cb0c04e988e2cf0c90d4a3f14 |\n  | 食品安全协调                               | 3127b9f409c24d0eaa60b13c25f819fa |\n  | 食品生产监管                               | beaa5555d1364e5bb2a0f0a7cc9720e5 |\n  | 食品销售、餐饮服务、食用农产品销售监管     | 3b6c49c6ce934e1b9505601a3b881a6a |\n  | 保健、特殊医学用途配方和婴幼儿配方乳粉监管 | 13b43888f8554e078b1dfa475e2aaab0 |\n  | 食品监督抽检、召回                         | 0eb6c75581bf41ecaedc629370cb425c |\n  | 食品安全标准                               | 399cfd9abfa34c22a5cb3bb971a43819 |\n  | 特种设备人员、机构管理                     | e5d0e51cc7d0412790efac605008bf20 |\n  | 特种设备检验                               | 03f22fb3d4cd4f09b632079359e9dd7d |\n  | 计量器具                                   | 90b25e22861446d5822e07c7c1f5169a |\n  | 计量机构和人员管理                         | 76202742f06c459da7482160e0ce17ad |\n  | 国家标准                                   | 299b9672e1c246e69485a5b695f42c5b |\n  | 行业、地方、团体、企业标准                 | cbdc804c9b2c4e259a159c32eccf4ca9 |\n  | 认证监督管理                               | 41259262a42e4de49b5c0b7362ac3796 |\n  | 认可与检验检测                             | cb3c9d1e3d364f2a8b1cd70efa69d1cb |\n  | 新闻宣传                                   | e3e553e4019c46ccbdc06136900138e9 |\n  | 科技财务                                   | 47367b9704964355ba52899a4c5abbb0 |\n  | 干部人事                                   | 6b978e3c127c489ea8e2d693b768887e |\n  | 国际合作                                   | dd5ce768e33e435ab4bfb769ab6e079a |\n  | 党群工作                                   | aa71052978af4304937eb382f24f9902 |\n  | 退休干部                                   | 44505fc58c81428eb5cef15706007b5e |\n  | 虚假宣传                                   | 5bb2b83ecadb4bf89a779cee414a81dd |\n  | 滥用行政权力                               | 1215206156dc48029b98da825f26fcbc |\n  | 公平竞争                                   | 9880a23dcbb04deba2cc7b4404e13ff6 |\n  | 滥用市场支配地位                           | fea04f0acd84486e84cf71d9c13005b0 |\n  | 数字经济领域反垄断执法                     | 4bea424a6e4c4e2aac19fe3c73f9be23 |\n  | 并购行为                                   | 90e315647acd415ca68f97fc1b42053d |\n  | 经营者集中案件                             | d6571d2cd5624bc18191b342a2e8defb |\n  | 数字经济领域反垄断审查                     | 03501ef176ef44fba1c7c70da44ba8a0 |\n  | 综合执法                                   | cfbb1b5dade446299670ca38844b265e |\n  | 信用监管                                   | a9d76ea04a3a4433946bc02b0bdb77eb |\n  | 3C 认证                                    | 111decc7b14a4fdbae86fb4a3ba5c0c1 |\n  | 食用农产品                                 | 3159db51f8ca4f23a9340d87d5572d40 |\n  | 食品添加                                   | 4e4b0e0152334cbb9c62fd1b80138305 |\n\n  #### 回复部门\n\n  | 部门                         | 部门 id                          |\n  | ---------------------------- | -------------------------------- |\n  | 办公厅                       | 6ed539b270634667afc4d466b67a53f7 |\n  | 法规司                       | 8625ec7ff8d744ad80a1d1a2bf19cf19 |\n  | 执法稽查局                   | 313a8cb1c09042dea52be52cb392c557 |\n  | 登记注册局                   | e4553350549f45f38da5602147cf8639 |\n  | 信用监督管理司               | 6af98157255a4a858eac5f94ba8d98f4 |\n  | 竞争政策协调司               | 8d2266be4791483297822e1aa5fc0a96 |\n  | 综合规划司                   | 958e1619159c45a7b76663a59d9052ea |\n  | 反垄断执法一司               | f9fb3f6225964c71ab82224a91f21b2c |\n  | 反垄断执法二司               | 7986c79e4f16403493d5b480aec30be4 |\n  | 价格监督检查和反不正当竞争局 | c5d2b1b273b545cfbc6f874f670654ab |\n  | 网络交易监督管理司           | 6ac05b4dbd4e41c69f4529262540459b |\n  | 广告监督管理司               | 96457dfe16c54840885b79b4e6e17523 |\n  | 质量发展局                   | cb8d2b16fbb540dca296aa33a43fc573 |\n  | 质量监督司                   | af2c4e0a54c04f76b512c29ddd075d40 |\n  | 食品安全协调司               | cc29962c74e84ef2b21e44336da6c6c5 |\n  | 食品生产安全监督管理司       | b334db85a253458285db70b30ee26b0a |\n  | 食品经营安全监督管理司       | 4315f0261a5d49f7bdcc5a7524e19ce3 |\n  | 特殊食品安全监督管理司       | 62d14f386317486ca94bc53ca7f88891 |\n  | 食品安全抽检监测司           | abfc910832cc460a81876ad418618159 |\n  | 特种设备安全监察局           | ea79f90bec5840ef9b0881c83682225a |\n  | 计量司                       | b0556236fbcf4f45b6fdec8004dac3e4 |\n  | 标准技术管理司               | a558d07a51f4454fa59290e0d6e93c26 |\n  | 标准创新管理司               | ffb3a80984b344ed8d168f4af6508af0 |\n  | 认证监督管理司               | ca4987393d514debb4d1e2126f576987 |\n  | 认可与检验检测监督管理司     | 796bfab21b15498e88c9032fe3e3c9f1 |\n  | 新闻宣传司                   | 884fc0ea6c184ad58dda10e2170a1eda |\n  | 科技和财务司                 | 117355eea94c426199e2e519fd98ce07 |\n  | 人事司                       | a341e8b7929e44769b9424b7cf69d32a |\n  | 国际司                       | f784499ef24541f5b20de4c24cfc61e7 |\n  | 机关党委                     | a49119c6f40045dd994f3910500cedfa |\n  | 离退办                       | 6bf265ffd1c94fa4a3f1687b03fa908b |","location":"samr/xgzlyhd.ts"}' :test='{"code":0}' />

#### 留言类型

  | 类型                                       | 类型 id                          |
  | ------------------------------------------ | -------------------------------- |
  | 反腐倡廉                                   | 14101a4192df48b592b5cfd77a26c0cf |
  | 规划统计                                   | b807cf9cdf434635ae908d48757e0f39 |
  | 行政执法和复议                             | 8af2530e77154d7b939428667b7413f6 |
  | 假冒仿冒行为                               | 75374a34b95341829e08e54d4a0d8c04 |
  | 走私贩私                                   | 84c728530e1e478e94fe3f0030171c53 |
  | 登记注册                                   | 07fff64612dc41aca871c06587abf71d |
  | 个体工商户登记                             | ca8f91ba9a2347a0acd57ea5fd12a5c8 |
  | 信用信息公示系统                           | 1698886c3cdb495998d5ea9285a487f5 |
  | 市场主体垄断                               | 77bfe965843844449c47d29f2feb7999 |
  | 反不正当竞争                               | 2c919b1dc39440d8850c4f6c405869f8 |
  | 商业贿赂                                   | b494e6535af149c5a51fd4197993f061 |
  | 打击传销与规范直销                         | 407a1404844e48558da46139f16d6232 |
  | 消费环境建设                               | 94c2003331dd4c5fa19b0cf88d720676 |
  | 网络交易监管                               | 6302aac5b87140598da53f85c1ccb8fa |
  | 动产抵押登记                               | 3856de5835444229943b18cac7781e9f |
  | 广告监管                                   | d0e38171042048c2bf31b05c5e57aa68 |
  | 三包                                       | c4dbd85692604a428b1ea7613e67beb8 |
  | 缺陷产品召回                               | f93c9a6b81e941d09a547406370e1c0c |
  | 工业生产许可                               | 2b41afaabaa24325b53a5bd7deba895b |
  | 产品质量监督抽查                           | 4388504cb0c04e988e2cf0c90d4a3f14 |
  | 食品安全协调                               | 3127b9f409c24d0eaa60b13c25f819fa |
  | 食品生产监管                               | beaa5555d1364e5bb2a0f0a7cc9720e5 |
  | 食品销售、餐饮服务、食用农产品销售监管     | 3b6c49c6ce934e1b9505601a3b881a6a |
  | 保健、特殊医学用途配方和婴幼儿配方乳粉监管 | 13b43888f8554e078b1dfa475e2aaab0 |
  | 食品监督抽检、召回                         | 0eb6c75581bf41ecaedc629370cb425c |
  | 食品安全标准                               | 399cfd9abfa34c22a5cb3bb971a43819 |
  | 特种设备人员、机构管理                     | e5d0e51cc7d0412790efac605008bf20 |
  | 特种设备检验                               | 03f22fb3d4cd4f09b632079359e9dd7d |
  | 计量器具                                   | 90b25e22861446d5822e07c7c1f5169a |
  | 计量机构和人员管理                         | 76202742f06c459da7482160e0ce17ad |
  | 国家标准                                   | 299b9672e1c246e69485a5b695f42c5b |
  | 行业、地方、团体、企业标准                 | cbdc804c9b2c4e259a159c32eccf4ca9 |
  | 认证监督管理                               | 41259262a42e4de49b5c0b7362ac3796 |
  | 认可与检验检测                             | cb3c9d1e3d364f2a8b1cd70efa69d1cb |
  | 新闻宣传                                   | e3e553e4019c46ccbdc06136900138e9 |
  | 科技财务                                   | 47367b9704964355ba52899a4c5abbb0 |
  | 干部人事                                   | 6b978e3c127c489ea8e2d693b768887e |
  | 国际合作                                   | dd5ce768e33e435ab4bfb769ab6e079a |
  | 党群工作                                   | aa71052978af4304937eb382f24f9902 |
  | 退休干部                                   | 44505fc58c81428eb5cef15706007b5e |
  | 虚假宣传                                   | 5bb2b83ecadb4bf89a779cee414a81dd |
  | 滥用行政权力                               | 1215206156dc48029b98da825f26fcbc |
  | 公平竞争                                   | 9880a23dcbb04deba2cc7b4404e13ff6 |
  | 滥用市场支配地位                           | fea04f0acd84486e84cf71d9c13005b0 |
  | 数字经济领域反垄断执法                     | 4bea424a6e4c4e2aac19fe3c73f9be23 |
  | 并购行为                                   | 90e315647acd415ca68f97fc1b42053d |
  | 经营者集中案件                             | d6571d2cd5624bc18191b342a2e8defb |
  | 数字经济领域反垄断审查                     | 03501ef176ef44fba1c7c70da44ba8a0 |
  | 综合执法                                   | cfbb1b5dade446299670ca38844b265e |
  | 信用监管                                   | a9d76ea04a3a4433946bc02b0bdb77eb |
  | 3C 认证                                    | 111decc7b14a4fdbae86fb4a3ba5c0c1 |
  | 食用农产品                                 | 3159db51f8ca4f23a9340d87d5572d40 |
  | 食品添加                                   | 4e4b0e0152334cbb9c62fd1b80138305 |

  #### 回复部门

  | 部门                         | 部门 id                          |
  | ---------------------------- | -------------------------------- |
  | 办公厅                       | 6ed539b270634667afc4d466b67a53f7 |
  | 法规司                       | 8625ec7ff8d744ad80a1d1a2bf19cf19 |
  | 执法稽查局                   | 313a8cb1c09042dea52be52cb392c557 |
  | 登记注册局                   | e4553350549f45f38da5602147cf8639 |
  | 信用监督管理司               | 6af98157255a4a858eac5f94ba8d98f4 |
  | 竞争政策协调司               | 8d2266be4791483297822e1aa5fc0a96 |
  | 综合规划司                   | 958e1619159c45a7b76663a59d9052ea |
  | 反垄断执法一司               | f9fb3f6225964c71ab82224a91f21b2c |
  | 反垄断执法二司               | 7986c79e4f16403493d5b480aec30be4 |
  | 价格监督检查和反不正当竞争局 | c5d2b1b273b545cfbc6f874f670654ab |
  | 网络交易监督管理司           | 6ac05b4dbd4e41c69f4529262540459b |
  | 广告监督管理司               | 96457dfe16c54840885b79b4e6e17523 |
  | 质量发展局                   | cb8d2b16fbb540dca296aa33a43fc573 |
  | 质量监督司                   | af2c4e0a54c04f76b512c29ddd075d40 |
  | 食品安全协调司               | cc29962c74e84ef2b21e44336da6c6c5 |
  | 食品生产安全监督管理司       | b334db85a253458285db70b30ee26b0a |
  | 食品经营安全监督管理司       | 4315f0261a5d49f7bdcc5a7524e19ce3 |
  | 特殊食品安全监督管理司       | 62d14f386317486ca94bc53ca7f88891 |
  | 食品安全抽检监测司           | abfc910832cc460a81876ad418618159 |
  | 特种设备安全监察局           | ea79f90bec5840ef9b0881c83682225a |
  | 计量司                       | b0556236fbcf4f45b6fdec8004dac3e4 |
  | 标准技术管理司               | a558d07a51f4454fa59290e0d6e93c26 |
  | 标准创新管理司               | ffb3a80984b344ed8d168f4af6508af0 |
  | 认证监督管理司               | ca4987393d514debb4d1e2126f576987 |
  | 认可与检验检测监督管理司     | 796bfab21b15498e88c9032fe3e3c9f1 |
  | 新闻宣传司                   | 884fc0ea6c184ad58dda10e2170a1eda |
  | 科技和财务司                 | 117355eea94c426199e2e519fd98ce07 |
  | 人事司                       | a341e8b7929e44769b9424b7cf69d32a |
  | 国际司                       | f784499ef24541f5b20de4c24cfc61e7 |
  | 机关党委                     | a49119c6f40045dd994f3910500cedfa |
  | 离退办                       | 6bf265ffd1c94fa4a3f1687b03fa908b |

### 茂名市茂南区人民政府 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/maonan/:category","categories":["government"],"example":"/gov/maonan/zwgk","parameters":{"category":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"茂名市茂南区人民政府","maintainers":["ShuiHuo"],"description":"| 政务公开 | 政务新闻 | 茂南动态 | 重大会议 | 公告公示 | 招录信息 | 政策解读 |\n  | :------: | :------: | :------: | :------: | :------: | :------: | :------: |\n  |   zwgk   |   zwxw   |   mndt   |   zdhy   |   tzgg   |   zlxx   |   zcjd   |","location":"maonan/maonan.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 政务公开 | 政务新闻 | 茂南动态 | 重大会议 | 公告公示 | 招录信息 | 政策解读 |
  | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
  |   zwgk   |   zwxw   |   mndt   |   zdhy   |   tzgg   |   zlxx   |   zcjd   |

### 拍卖信息 / 海关法规 <Site url="www.customs.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/customs/list/:gchannel?","categories":["government"],"example":"/gov/customs/list/paimai","parameters":{"gchannel":"支持 `paimai` 及 `fagui` 2个频道，默认为 `paimai`"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.customs.gov.cn/"],"target":"/customs/list"}],"name":"拍卖信息 / 海关法规","maintainers":["Jeason0228","TonyRL","he1q"],"url":"www.customs.gov.cn/","description":":::warning\n  由于区域限制，建议在国内 IP 的机器上自建\n  :::","location":"customs/list.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

:::warning
  由于区域限制，建议在国内 IP 的机器上自建
  :::

### 上海市职业能力考试院 考试项目 <Site url="rsj.sh.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/shanghai/rsj/ksxm","categories":["government"],"example":"/gov/shanghai/rsj/ksxm","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["rsj.sh.gov.cn/"]}],"name":"上海市职业能力考试院 考试项目","maintainers":["Fatpandac"],"url":"rsj.sh.gov.cn/","location":"shanghai/rsj/ksxm.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 上海市文旅局审批公告 <Site url="wsbs.wgj.sh.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/shanghai/wgj/:page?","categories":["government"],"example":"/gov/shanghai/wgj","parameters":{"page":"页数，默认第 1 页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wsbs.wgj.sh.gov.cn/"],"target":"/shanghai/wgj"}],"name":"上海市文旅局审批公告","maintainers":["gideonsenku"],"url":"wsbs.wgj.sh.gov.cn/","location":"shanghai/wgj/wgj.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 上海卫健委 疫情通报 <Site url="wsjkw.sh.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/shanghai/wsjkw/yqtb","categories":["government"],"example":"/gov/shanghai/wsjkw/yqtb","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wsjkw.sh.gov.cn/"]}],"name":"上海卫健委 疫情通报","maintainers":["zcf0508"],"url":"wsjkw.sh.gov.cn/","location":"shanghai/wsjkw/yqtb/index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 申请事项进度 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/csrc/auditstatus/:apply_id","categories":["government"],"example":"/gov/csrc/auditstatus/9ce91cf2d750ee62de27fbbcb05fa483","parameters":{"apply_id":"事项类别id，`https://neris.csrc.gov.cn/alappl/home/xkDetail` 列表中各地址的 appMatrCde 参数"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"申请事项进度","maintainers":["hillerliao"],"location":"csrc/auditstatus.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 深圳市考试院 <Site url="hrss.sz.gov.cn/*" size="sm" />

<Route namespace="gov" :data='{"path":"/shenzhen/hrss/szksy/:caty/:page?","categories":["government"],"example":"/gov/shenzhen/hrss/szksy/bmxx/2","parameters":{"caty":"信息类别","page":"页码"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xxgk.sz.gov.cn/cn/xxgk/zfxxgj/:caty"]}],"name":"深圳市考试院","maintainers":["zlasd"],"url":"hrss.sz.gov.cn/*","description":"| 通知公告 | 报名信息 | 成绩信息 | 合格标准 | 合格人员公示 | 证书发放信息 |\n  | :------: | :------: | :------: | :------: | :----------: | :----------: |\n  |   tzgg   |   bmxx   |   cjxx   |   hgbz   |    hgrygs    |     zsff     |","location":"shenzhen/hrss/szksy/index.ts"}' :test='{"code":1,"message":"expected { &#39;$&#39;: { isPermaLink: &#39;false&#39; } } to deeply equal Any<String>"}' />

| 通知公告 | 报名信息 | 成绩信息 | 合格标准 | 合格人员公示 | 证书发放信息 |
  | :------: | :------: | :------: | :------: | :----------: | :----------: |
  |   tzgg   |   bmxx   |   cjxx   |   hgbz   |    hgrygs    |     zsff     |

### 深圳市人民政府 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/shenzhen/xxgk/zfxxgj/:caty","categories":["government"],"example":"/gov/shenzhen/xxgk/zfxxgj/tzgg","parameters":{"caty":"信息类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"深圳市人民政府","maintainers":["laoxua"],"description":"| 通知公告 | 政府采购 | 资金信息 | 重大项目 |\n  | :------: | :------: | :------: | :------: |\n  |   tzgg   |   zfcg   |   zjxx   |   zdxm   |","location":"shenzhen/xxgk/zfxxgj.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 通知公告 | 政府采购 | 资金信息 | 重大项目 |
  | :------: | :------: | :------: | :------: |
  |   tzgg   |   zfcg   |   zjxx   |   zdxm   |

### 深圳市住房和建设局 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/shenzhen/zjj/xxgk/:caty","categories":["government"],"example":"/gov/shenzhen/zjj/xxgk/tzgg","parameters":{"caty":"信息类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zjj.sz.gov.cn/xxgk/:caty"]}],"name":"深圳市住房和建设局","maintainers":["lonn"],"description":"| 通知公告 |\n  | :------: |\n  |   tzgg   |","location":"shenzhen/zjj/index.ts"}' :test='{"code":0}' />

| 通知公告 |
  | :------: |
  |   tzgg   |

### 深圳市委组织部 <Site url="zzb.sz.gov.cn/*" size="sm" />

<Route namespace="gov" :data='{"path":"/shenzhen/zzb/:caty/:page?","categories":["government"],"example":"/gov/shenzhen/zzb/tzgg","parameters":{"caty":"信息类别","page":"页码"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zzb.sz.gov.cn/*"]}],"name":"深圳市委组织部","maintainers":["zlasd"],"url":"zzb.sz.gov.cn/*","description":"| 通知公告 | 任前公示 | 政策法规 | 工作动态 | 部门预算决算公开 | 业务表格下载 |\n  | :------: | :------: | :------: | :------: | :--------------: | :----------: |\n  |   tzgg   |   rqgs   |   zcfg   |   gzdt   |       xcbd       |     bgxz     |","location":"shenzhen/zzb/index.ts"}' :test='{"code":0}' />

| 通知公告 | 任前公示 | 政策法规 | 工作动态 | 部门预算决算公开 | 业务表格下载 |
  | :------: | :------: | :------: | :------: | :--------------: | :----------: |
  |   tzgg   |   rqgs   |   zcfg   |   gzdt   |       xcbd       |     bgxz     |

### 省科学技术厅 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/shaanxi/kjt/:id?","categories":["government"],"example":"/gov/shaanxi/kjt","parameters":{"id":"分类，见下表，默认为通知公告"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"省科学技术厅","maintainers":["nczitzk"],"description":"| 科技头条 | 工作动态 | 基层科技 | 科技博览 | 媒体聚焦 | 通知公告 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 1061     | 24       | 27       | 25       | 28       | 221      |","location":"shaanxi/kjt.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 科技头条 | 工作动态 | 基层科技 | 科技博览 | 媒体聚焦 | 通知公告 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | 1061     | 24       | 27       | 25       | 28       | 221      |

### 事故及灾害查处 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/mem/gk/sgcc/:category?","categories":["government"],"example":"/gov/mem/gk/sgcc/tbzdsgdcbg","parameters":{"category":"分类，见下表，默认为挂牌督办"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.mem.gov.cn/gk/sgcc/:category"],"target":"/mem/gk/sgcc/:category"}],"name":"事故及灾害查处","maintainers":["nczitzk"],"description":"| 挂牌督办 | 调查报告   |\n  | -------- | ---------- |\n  | sggpdbqk | tbzdsgdcbg |","location":"mem/sgcc.ts"}' :test='{"code":0}' />

| 挂牌督办 | 调查报告   |
  | -------- | ---------- |
  | sggpdbqk | tbzdsgdcbg |

### 司局通知 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/moe/s78/:column","categories":["government"],"example":"/gov/moe/s78/A13","parameters":{"column":"司局 ID，可在 URL 找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["moe.gov.cn/s78/:column/tongzhi","moe.gov.cn/s78/:column"]}],"name":"司局通知","maintainers":["TonyRL"],"location":"moe/s78.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 太原市人力资源和社会保障局政府公开信息 <Site url="rsj.taiyuan.gov.cn/*" size="sm" />

<Route namespace="gov" :data='{"path":"/taiyuan/rsj/:caty/:page?","categories":["government"],"example":"/gov/taiyuan/rsj/gggs","parameters":{"caty":"信息类别","page":"页码"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["rsj.taiyuan.gov.cn/*"]}],"name":"太原市人力资源和社会保障局政府公开信息","maintainers":["2PoL"],"url":"rsj.taiyuan.gov.cn/*","description":"| 工作动态 | 太原新闻 | 通知公告 | 县区动态 | 国内动态 | 图片新闻 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | gzdt     | tyxw     | gggs     | xqdt     | gndt     | tpxw     |","location":"taiyuan/rsj.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 工作动态 | 太原新闻 | 通知公告 | 县区动态 | 国内动态 | 图片新闻 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | gzdt     | tyxw     | gggs     | xqdt     | gndt     | tpxw     |

### 通用 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/beijing/bjedu/gh/:urlPath?","categories":["government"],"example":"/gov/beijing/bjedu/gh","parameters":{"urlPath":"路径，默认为 `zxtzgg`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gh.bjedu.gov.cn/ghsite/:urlPath/index.html","gh.bjedu.gov.cn/ghsite/:urlPath"],"target":"/beijing/bjedu/gh/:urlPath"}],"name":"通用","maintainers":["TonyRL"],"description":":::tip\n  路径处填写对应页面 URL 中 `https://gh.bjedu.cn/ghsite/` 和 `/index.html` 之间的字段。下面是一个例子。\n\n  若订阅 [通知公告](https://gh.bjedu.cn/ghsite/zxtzgg/index.html) 则将对应页面 URL `https://gh.bjedu.cn/ghsite/zxtzgg/index.html` 中 `https://gh.bjedu.cn/ghsite/` 和 `/index.html` 之间的字段 `zxtzgg` 作为路径填入。此时路由为 [`/gov/beijing/bjedu/gh/zxtzgg`](https://rsshub.app/gov/beijing/bjedu/gh/zxtzgg)\n  :::","location":"beijing/bjedu/gh.ts"}' :test='{"code":0}' />

:::tip
  路径处填写对应页面 URL 中 `https://gh.bjedu.cn/ghsite/` 和 `/index.html` 之间的字段。下面是一个例子。

  若订阅 [通知公告](https://gh.bjedu.cn/ghsite/zxtzgg/index.html) 则将对应页面 URL `https://gh.bjedu.cn/ghsite/zxtzgg/index.html` 中 `https://gh.bjedu.cn/ghsite/` 和 `/index.html` 之间的字段 `zxtzgg` 作为路径填入。此时路由为 [`/gov/beijing/bjedu/gh/zxtzgg`](https://rsshub.app/gov/beijing/bjedu/gh/zxtzgg)
  :::

### 通知公告 <Site url="jw.beijing.gov.cn/tzgg" size="sm" />

<Route namespace="gov" :data='{"path":"/beijing/jw/tzgg","categories":["government"],"example":"/gov/beijing/jw/tzgg","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["jw.beijing.gov.cn/tzgg"]}],"name":"通知公告","maintainers":["nczitzk"],"url":"jw.beijing.gov.cn/tzgg","location":"beijing/jw/tzgg.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 通用 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/npc/:caty","categories":["government"],"example":"/gov/npc/c183","parameters":{"caty":"分类名，支持形如 `http://www.npc.gov.cn/npc/c2/*/` 的网站，传入 npc 之后的参数"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["npc.gov.cn/npc/c2/:caty"]}],"name":"通用","maintainers":["233yeee"],"description":"| 立法 | 监督 | 代表 | 理论 | 权威发布 | 滚动新闻 |\n  | ---- | ---- | ---- | ---- | -------- | -------- |\n  | c183 | c184 | c185 | c189 | c12435   | c10134   |","location":"npc/index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 立法 | 监督 | 代表 | 理论 | 权威发布 | 滚动新闻 |
  | ---- | ---- | ---- | ---- | -------- | -------- |
  | c183 | c184 | c185 | c189 | c12435   | c10134   |

### 通知 <Site url="zjks.gov.cn/zjgwy/website/init.htm" size="sm" />

<Route namespace="gov" :data='{"path":"/zhejiang/gwy/:category?/:column?","categories":["government"],"example":"/gov/zhejiang/gwy/1","parameters":{"category":"分类，见下表，默认为全部","column":"地市专栏，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zjks.gov.cn/zjgwy/website/init.htm","zjks.gov.cn/zjgwy/website/queryDetail.htm","zjks.gov.cn/zjgwy/website/queryMore.htm"],"target":"/zhejiang/gwy"}],"name":"通知","maintainers":["nczitzk"],"url":"zjks.gov.cn/zjgwy/website/init.htm","description":"| 分类         | id |\n  | ------------ | -- |\n  | 重要通知     | 1  |\n  | 招考公告     | 2  |\n  | 招考政策     | 3  |\n  | 面试体检考察 | 4  |\n  | 录用公示专栏 | 5  |\n\n  | 地市         | id    |\n  | ------------ | ----- |\n  | 浙江省       | 133   |\n  | 浙江省杭州市 | 13301 |\n  | 浙江省宁波市 | 13302 |\n  | 浙江省温州市 | 13303 |\n  | 浙江省嘉兴市 | 13304 |\n  | 浙江省湖州市 | 13305 |\n  | 浙江省绍兴市 | 13306 |\n  | 浙江省金华市 | 13307 |\n  | 浙江省衢州市 | 13308 |\n  | 浙江省舟山市 | 13309 |\n  | 浙江省台州市 | 13310 |\n  | 浙江省丽水市 | 13311 |\n  | 省级单位     | 13317 |","location":"zhejiang/gwy.ts"}' :test='{"code":0}' />

| 分类         | id |
  | ------------ | -- |
  | 重要通知     | 1  |
  | 招考公告     | 2  |
  | 招考政策     | 3  |
  | 面试体检考察 | 4  |
  | 录用公示专栏 | 5  |

  | 地市         | id    |
  | ------------ | ----- |
  | 浙江省       | 133   |
  | 浙江省杭州市 | 13301 |
  | 浙江省宁波市 | 13302 |
  | 浙江省温州市 | 13303 |
  | 浙江省嘉兴市 | 13304 |
  | 浙江省湖州市 | 13305 |
  | 浙江省绍兴市 | 13306 |
  | 浙江省金华市 | 13307 |
  | 浙江省衢州市 | 13308 |
  | 浙江省舟山市 | 13309 |
  | 浙江省台州市 | 13310 |
  | 浙江省丽水市 | 13311 |
  | 省级单位     | 13317 |

### 投诉建议 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/safe/complaint/:site?","categories":["government"],"example":"/gov/safe/complaint/beijing","parameters":{"site":"站点，见上表，默认为 beijing"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"投诉建议","maintainers":["nczitzk"],"location":"safe/complaint.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 文件发布 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/miit/wjfb/:ministry","categories":["government"],"example":"/gov/miit/wjfb/ghs","parameters":{"ministry":"部门缩写，可以在对应 URL 中获取"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["miit.gov.cn/jgsj/:ministry/wjfb/index.html"]}],"name":"文件发布","maintainers":["Fatpandac"],"location":"miit/wjfb.ts"}' :test='{"code":0}' />

### 文件公示 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/miit/wjgs","categories":["government"],"example":"/gov/miit/wjgs","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文件公示","maintainers":["Yoge-Code"],"location":"miit/wjgs.ts"}' :test='{"code":0}' />

### 武汉要闻 <Site url="wuhan.gov.cn/sy/whyw/" size="sm" />

<Route namespace="gov" :data='{"path":"/wuhan/sy/whyw","categories":["government"],"example":"/gov/wuhan/sy/whyw","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wuhan.gov.cn/sy/whyw/","wuhan.gov.cn/whyw","wuhan.gov.cn/"]}],"name":"武汉要闻","maintainers":["nczitzk"],"url":"wuhan.gov.cn/sy/whyw/","location":"wuhan/whyw.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 新闻 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/moe/:type","categories":["government"],"example":"/gov/moe/policy_anal","parameters":{"type":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["Crawler995"],"description":"|   政策解读   |   最新文件   | 公告公示 |      教育部简报     |     教育要闻     |\n  | :----------: | :----------: | :------: | :-----------------: | :--------------: |\n  | policy_anal | newest_file |  notice  | edu_ministry_news | edu_focus_news |","location":"moe/moe.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

|   政策解读   |   最新文件   | 公告公示 |      教育部简报     |     教育要闻     |
  | :----------: | :----------: | :------: | :-----------------: | :--------------: |
  | policy_anal | newest_file |  notice  | edu_ministry_news | edu_focus_news |

### 信息稿件 <Site url="www.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/zhengce/govall/:advance?","categories":["government"],"example":"/gov/zhengce/govall/orpro=555&notpro=2&search_field=title","parameters":{"advance":"高级搜索选项，将作为请求参数直接添加到url后。目前已知的选项及其意义如下。"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.gov.cn/"],"target":"/zhengce/govall"}],"name":"信息稿件","maintainers":["ciaranchen"],"url":"www.gov.cn/","description":"|               选项              |                       意义                       |              备注              |\n  | :-----------------------------: | :----------------------------------------------: | :----------------------------: |\n  |              orpro              |             包含以下任意一个关键词。             |          用空格分隔。          |\n  |              allpro             |                包含以下全部关键词                |                                |\n  |              notpro             |                 不包含以下关键词                 |                                |\n  |              inpro              |                完整不拆分的关键词                |                                |\n  |           searchfield           | title: 搜索词在标题中；content: 搜索词在正文中。 |  默认为空，即网页的任意位置。  |\n  | pubmintimeYear, pubmintimeMonth |                    从某年某月                    | 单独使用月份参数无法只筛选月份 |\n  | pubmaxtimeYear, pubmaxtimeMonth |                    到某年某月                    | 单独使用月份参数无法只筛选月份 |\n  |              colid              |                       栏目                       |      比较复杂，不建议使用      |","location":"zhengce/govall.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

|               选项              |                       意义                       |              备注              |
  | :-----------------------------: | :----------------------------------------------: | :----------------------------: |
  |              orpro              |             包含以下任意一个关键词。             |          用空格分隔。          |
  |              allpro             |                包含以下全部关键词                |                                |
  |              notpro             |                 不包含以下关键词                 |                                |
  |              inpro              |                完整不拆分的关键词                |                                |
  |           searchfield           | title: 搜索词在标题中；content: 搜索词在正文中。 |  默认为空，即网页的任意位置。  |
  | pubmintimeYear, pubmintimeMonth |                    从某年某月                    | 单独使用月份参数无法只筛选月份 |
  | pubmaxtimeYear, pubmaxtimeMonth |                    到某年某月                    | 单独使用月份参数无法只筛选月份 |
  |              colid              |                       栏目                       |      比较复杂，不建议使用      |

### 徐州市人力资源和社会保障局 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/xuzhou/hrss/:category?","categories":["government"],"example":"/gov/xuzhou/hrss","parameters":{"category":"分类，见下表，默认为通知公告"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"徐州市人力资源和社会保障局","maintainers":["nczitzk"],"description":"| 通知公告 | 要闻动态 | 县区动态 | 事业招聘 | 企业招聘 | 政声传递 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  |          | 001001   | 001002   | 001004   | 001005   | 001006   |","location":"xuzhou/hrss.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 通知公告 | 要闻动态 | 县区动态 | 事业招聘 | 企业招聘 | 政声传递 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  |          | 001001   | 001002   | 001004   | 001005   | 001006   |

### 要闻动态 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/mee/ywdt/:category?","categories":["government"],"example":"/gov/mee/ywdt/hjywnews","parameters":{"category":"分类名，预设 `szyw`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.mee.gov.cn/ywdt/:category"],"target":"/mee/ywdt/:category"}],"name":"要闻动态","maintainers":["liuxsdev"],"description":"| 时政要闻 | 环境要闻 | 地方快讯 | 新闻发布 | 视频新闻 | 公示公告 |\n| :------: | :------: | :------: | :------: | :------: | :------: |\n|   szyw   | hjywnews |  dfnews  |   xwfb   |   spxw   |   gsgg   |","location":"mee/ywdt.ts"}' :test='{"code":0}' />

| 时政要闻 | 环境要闻 | 地方快讯 | 新闻发布 | 视频新闻 | 公示公告 |
| :------: | :------: | :------: | :------: | :------: | :------: |
|   szyw   | hjywnews |  dfnews  |   xwfb   |   spxw   |   gsgg   |

### 业务咨询 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/safe/business/:site?","categories":["government"],"example":"/gov/safe/business/beijing","parameters":{"site":"站点，见上表，默认为 beijing"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"业务咨询","maintainers":["nczitzk"],"location":"safe/business.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 意见征集 <Site url="miit.gov.cn/gzcy/yjzj/index.html" size="sm" />

<Route namespace="gov" :data='{"path":"/miit/yjzj","categories":["government"],"example":"/gov/miit/yjzj","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["miit.gov.cn/gzcy/yjzj/index.html"]}],"name":"意见征集","maintainers":["Fatpandac"],"url":"miit.gov.cn/gzcy/yjzj/index.html","location":"miit/yjzj.ts"}' :test='{"code":0}' />

### 长沙市人民政府 <Site url="wlwz.changsha.gov.cn/webapp/cs2020/email/*" size="sm" />

<Route namespace="gov" :data='{"path":"/hunan/changsha/major-email","categories":["government"],"example":"/gov/hunan/changsha/major-email","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wlwz.changsha.gov.cn/webapp/cs2020/email/*"]}],"name":"长沙市人民政府","maintainers":["shansing"],"url":"wlwz.changsha.gov.cn/webapp/cs2020/email/*","description":"#### 市长信箱 {#hu-nan-sheng-ren-min-zheng-fu-chang-sha-shi-ren-min-zheng-fu-shi-zhang-xin-xiang}\n\n\n可能仅限中国大陆服务器访问，以实际情况为准。","location":"hunan/changsha/major-email.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

#### 市长信箱 {#hu-nan-sheng-ren-min-zheng-fu-chang-sha-shi-ren-min-zheng-fu-shi-zhang-xin-xiang}


可能仅限中国大陆服务器访问，以实际情况为准。

### 政策解读 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/miit/zcjd","categories":["government"],"example":"/gov/miit/zcjd","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"政策解读","maintainers":["Yoge-Code"],"location":"miit/zcjd.ts"}' :test='{"code":0}' />

### 政策文件 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/miit/zcwj","categories":["government"],"example":"/gov/miit/zcwj","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"政策文件","maintainers":["Yoge-Code"],"location":"miit/zcwj.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 政府新闻 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/news/:uid","categories":["government"],"example":"/gov/news/bm","parameters":{"uid":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"政府新闻","maintainers":["EsuRt"],"description":"| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 | 政策文件 |\n  | :------: | :------: | :------: | :--------: | :------: |\n  |    bm    |    gd    |    yw    |     gwy    |  zhengce |","location":"news/index.ts"}' :test='{"code":0}' />

| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 | 政策文件 |
  | :------: | :------: | :------: | :--------: | :------: |
  |    bm    |    gd    |    yw    |     gwy    |  zhengce |

### 政府公开信息 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/sichuan/deyang/govpublicinfo/:countyName/:infoType?","categories":["government"],"example":"/gov/sichuan/deyang/govpublicinfo/绵竹市","parameters":{"countyName":"区县名（**其他区县整改中，暂时只支持`绵竹市`**）。德阳市、绵竹市、广汉市、什邡市、中江县、罗江区、旌阳区、高新区","infoType":"信息类型。默认值:fdzdnr-“法定主动内容”"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"政府公开信息","maintainers":["zytomorrow"],"description":"| 法定主动内容 | 公示公告 |\n  | :----------: | :------: |\n  |    fdzdnr    |   gsgg   |","location":"sichuan/deyang/govpublicinfo.ts"}' :test='{"code":0}' />

| 法定主动内容 | 公示公告 |
  | :----------: | :------: |
  |    fdzdnr    |   gsgg   |

### 政府信息公开文件 <Site url="www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp" size="sm" />

<Route namespace="gov" :data='{"path":"/suzhou/doc","categories":["government"],"example":"/gov/suzhou/doc","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp","www.suzhou.gov.cn/"]}],"name":"政府信息公开文件","maintainers":["EsuRt"],"url":"www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp","location":"suzhou/doc.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 政府新闻 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/suzhou/news/:uid","categories":["government"],"example":"/gov/suzhou/news/news","parameters":{"uid":"栏目名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.suzhou.gov.cn/szsrmzf/:uid/nav_list.shtml"]}],"name":"政府新闻","maintainers":["EsuRt","luyuhuang"],"description":"| 新闻栏目名 |       :uid       |\n  | :--------: | :--------------: |\n  |  苏州要闻  |   news 或 szyw   |\n  |  区县快讯  | district 或 qxkx |\n  |  部门动态  |       bmdt       |\n  |  新闻视频  |       xwsp       |\n  |  政务公告  |       zwgg       |\n  |  便民公告  |       mszx       |\n  |  民生资讯  |       bmzx       |\n\n  | 热点专题栏目名 |  :uid  |\n  | :------------: | :----: |\n  |    热点专题    |  rdzt  |\n  |   市本级专题   |  sbjzt |\n  |  最新热点专题  | zxrdzt |\n  |    往期专题    |  wqzt  |\n  |    区县专题    |  qxzt  |\n\n  :::tip\n  **热点专题**栏目包含**市本级专题**和**区县专题**\n\n  **市本级专题**栏目包含**最新热点专题**和**往期专题**\n\n  如需订阅完整的热点专题，仅需订阅 **热点专题**`rdzt` 一项即可。\n  :::","location":"suzhou/news.ts"}' :test='{"code":0}' />

| 新闻栏目名 |       :uid       |
  | :--------: | :--------------: |
  |  苏州要闻  |   news 或 szyw   |
  |  区县快讯  | district 或 qxkx |
  |  部门动态  |       bmdt       |
  |  新闻视频  |       xwsp       |
  |  政务公告  |       zwgg       |
  |  便民公告  |       mszx       |
  |  民生资讯  |       bmzx       |

  | 热点专题栏目名 |  :uid  |
  | :------------: | :----: |
  |    热点专题    |  rdzt  |
  |   市本级专题   |  sbjzt |
  |  最新热点专题  | zxrdzt |
  |    往期专题    |  wqzt  |
  |    区县专题    |  qxzt  |

  :::tip
  **热点专题**栏目包含**市本级专题**和**区县专题**

  **市本级专题**栏目包含**最新热点专题**和**往期专题**

  如需订阅完整的热点专题，仅需订阅 **热点专题**`rdzt` 一项即可。
  :::

### 重庆市人民政府 国有资产监督管理委员会 <Site url="gzw.cq.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/chongqing/gzw/:category{.+}?","parameters":{"category":"分类，见下表，默认为通知公告"},"name":"重庆市人民政府 国有资产监督管理委员会","url":"gzw.cq.gov.cn","maintainers":["nczitzk"],"radar":[{"source":"gzw.cq.gov.cn/*category","target":"/chongqing/gzw/*category"}],"description":"| 通知公告  | 国企资讯 | 国企简介 | 国企招聘 |\n    | --------- | -------- | -------- | -------- |\n    | tzgg_191 | gqdj     | gqjj     | gqzp     |","location":"chongqing/gzw.ts"}' :test='undefined' />

| 通知公告  | 国企资讯 | 国企简介 | 国企招聘 |
    | --------- | -------- | -------- | -------- |
    | tzgg_191 | gqdj     | gqjj     | gqzp     |

### 重庆市人民政府 人力社保局 - 人事考试通知 <Site url="rlsbj.cq.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/chongqing/rsks","categories":["government"],"example":"/gov/chongqing/rsks","radar":[{"source":["rlsbj.cq.gov.cn/"]}],"name":"重庆市人民政府 人力社保局 - 人事考试通知","maintainers":["Mai19930513"],"url":"rlsbj.cq.gov.cn/","location":"chongqing/rsks.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 重庆市人民政府 人力社保局 - 事业单位公开招聘 <Site url="rlsbj.cq.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/chongqing/sydwgkzp/:year?","url":"rlsbj.cq.gov.cn/","categories":["government"],"example":"/gov/chongqing/sydwgkzp","parameters":{"year":"需要订阅的年份，格式为`YYYY`，必须小于等于当前年份，默认为当前年份"},"radar":[{"source":["rlsbj.cq.gov.cn/"]}],"name":"重庆市人民政府 人力社保局 - 事业单位公开招聘","maintainers":["MajexH"],"location":"chongqing/sydwgkzp.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 专题 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/mof/bond/:category?","categories":["government"],"example":"/gov/mof/bond","parameters":{"category":"专题，见下表，默认为国债管理工作动态"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"专题","maintainers":["la3rence"],"description":"#### 政府债券管理\n\n  | 国债管理工作动态 | 记账式国债 (含特别国债) 发行 | 储蓄国债发行 | 地方政府债券管理      |\n  | ---------------- | ---------------------------- | ------------ | --------------------- |\n  | gzfxgzdt         | gzfxzjs                      | gzfxdzs      | difangzhengfuzhaiquan |","location":"mof/bond.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

#### 政府债券管理

  | 国债管理工作动态 | 记账式国债 (含特别国债) 发行 | 储蓄国债发行 | 地方政府债券管理      |
  | ---------------- | ---------------------------- | ------------ | --------------------- |
  | gzfxgzdt         | gzfxzjs                      | gzfxdzs      | difangzhengfuzhaiquan |

### 最新文件 <Site url="www.chinatax.gov.cn/*" size="sm" />

<Route namespace="gov" :data='{"path":"/chinatax/latest","categories":["government"],"example":"/gov/chinatax/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.chinatax.gov.cn/*"]}],"name":"最新文件","maintainers":["nczitzk","fuzy112"],"url":"www.chinatax.gov.cn/*","location":"chinatax/latest.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 最新消息 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/moj/aac/news/:type?","categories":["government"],"example":"/gov/moj/aac/news","parameters":{"type":"資料大類，留空為全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新消息","maintainers":["TonyRL"],"description":"| 全部 | 其他 | 採購公告 | 新聞稿 | 肅貪 | 預防 | 綜合 | 防疫專區 |\n  | ---- | ---- | -------- | ------ | ---- | ---- | ---- | -------- |\n  |      | 02   | 01       | 06     | 05   | 04   | 03   | 99       |","location":"moj/aac/news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 全部 | 其他 | 採購公告 | 新聞稿 | 肅貪 | 預防 | 綜合 | 防疫專區 |
  | ---- | ---- | -------- | ------ | ---- | ---- | ---- | -------- |
  |      | 02   | 01       | 06     | 05   | 04   | 03   | 99       |

### 最新政策 <Site url="www.gov.cn/zhengce/zuixin.htm" size="sm" />

<Route namespace="gov" :data='{"path":["/zhengce/zuixin","/zhengce/:category{.+}?"],"categories":["government"],"example":"/gov/zhengce/zuixin","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.gov.cn/zhengce/zuixin.htm","www.gov.cn/"]}],"name":"最新政策","maintainers":["SettingDust","nczitzk"],"url":"www.gov.cn/zhengce/zuixin.htm","location":"zhengce/index.ts"}' :test='{"code":0}' />

### 最新政策 <Site url="www.gov.cn/zhengce/zuixin.htm" size="sm" />

<Route namespace="gov" :data='{"path":["/zhengce/zuixin","/zhengce/:category{.+}?"],"categories":["government"],"example":"/gov/zhengce/zuixin","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.gov.cn/zhengce/zuixin.htm","www.gov.cn/"]}],"name":"最新政策","maintainers":["SettingDust","nczitzk"],"url":"www.gov.cn/zhengce/zuixin.htm","location":"zhengce/index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 最新文件 <Site url="www.gov.cn/" size="sm" />

<Route namespace="gov" :data='{"path":"/zhengce/wenjian/:pcodeJiguan?","categories":["government"],"example":"/gov/zhengce/wenjian","parameters":{"pcodeJiguan":"文种分类。国令、国发、国函、国发明电、国办发、国办函、国办发明电、其他"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.gov.cn/"],"target":"/zhengce/wenjian"}],"name":"最新文件","maintainers":["ciaranchen"],"url":"www.gov.cn/","location":"zhengce/wenjian.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

