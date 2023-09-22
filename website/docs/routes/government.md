# 📢 Government

## Australia Department of Home Affairs {#australia-department-of-home-affairs}

### Immigration and Citizenship - News {#australia-department-of-home-affairs-immigration-and-citizenship-news}

<Route author="liu233w" example="/gov/immiau/news" path="/gov/immiau/news"/>

## Central Intelligence Agency CIA {#central-intelligence-agency-cia}

### Annual FOIA Reports {#central-intelligence-agency-cia-annual-foia-reports}

<Route author="nczitzk" example="/cia/foia-annual-report" path="/cia/foia-annual-report"/>

## Constitutional Court of Baden-Württemberg (Germany) {#constitutional-court-of-baden-wvrttemberg-germany}

### Press releases {#constitutional-court-of-baden-wvrttemberg-germany-press-releases}

<Route author="quinn-dev" example="/verfghbw/press" path="/verfghbw/press/:keyword?" paramsDesc={['Keyword']}/>

## Hong Kong Centre for Health Protection {#hong-kong-centre-for-health-protection}

### Category {#hong-kong-centre-for-health-protection-category}

<Route author="nczitzk" example="/chp" path="/chp/:category?/:language?" paramsDesc={['Category, see below, Important Topics by default', 'Language, see below, zh_tw by default']}>

Category

| Important Topics | Press Releases   | Response Level | Periodicals & Publications | Health Notice |
| ---------------- | ---------------- | -------------- | -------------------------- | ------------- |
| important_ft     | press_data_index | ResponseLevel  | publication                | HealthAlert   |

Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| en      | zh_cn    | zh_tw    |

</Route>

## Hong Kong Department of Health 香港卫生署 {#hong-kong-department-of-health-xiang-gang-wei-sheng-shu}

### Press Release {#hong-kong-department-of-health-xiang-gang-wei-sheng-shu-press-release}

<Route author="nczitzk" example="/hongkong/dh" path="/hongkong/dh/:language?" paramsDesc={['Language, see below, tc_chi by default']}>

Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| english | chs | tc_chi |

</Route>

## Hong Kong Independent Commission Against Corruption 香港廉政公署 {#hong-kong-independent-commission-against-corruption-xiang-gang-lian-zheng-gong-shu}

### Press Releases {#hong-kong-independent-commission-against-corruption-xiang-gang-lian-zheng-gong-shu-press-releases}

<Route author="linbuxiao" example="/icac/news/sc" path="/icac/news/:lang?" paramsDesc={['Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese) and `tc`(Traditional Chinese)']}/>

## Macau Independent Commission Against Corruption 澳门廉政公署 {#macau-independent-commission-against-corruption-ao-men-lian-zheng-gong-shu}

### Latest News {#macau-independent-commission-against-corruption-ao-men-lian-zheng-gong-shu-latest-news}

<Route author="linbuxiao" example="/ccac/news/all" path="/ccac/news/:type/:lang?" paramsDesc={['Category', 'Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese), `tc`(Traditional Chinese) and `pt`(Portuguese)']} puppeteer="1">
Category

| All  | Detected Cases | Investigation Reports or Recommendations  | Annual Reports | CCAC's Updates |
| ---- | -------------- | ----------------------------------------- | -------------- | -------------- |
| all  | case           | Persuasion                                | AnnualReport   | PCANews        |

</Route>

## Ministry of Foreign Affairs of Japan 日本国外務省 {#ministry-of-foreign-affairs-of-japan-ri-ben-guo-wai-wu-sheng}

### Press conference {#ministry-of-foreign-affairs-of-japan-ri-ben-guo-wai-wu-sheng-press-conference}

<Route author="sgqy" example="/go.jp/mofa" path="/go.jp/mofa"/>

## Supreme Court of the United States {#supreme-court-of-the-united-states}

### Arguments Audios {#supreme-court-of-the-united-states-arguments-audios}

<Route author="nczitzk" example="/us/supremecourt/argument_audio" path="/us/supremecourt/argument_audio/:year?" paramsDesc={['Year, current year by default']}/>

## The United States Trade Representative {#the-united-states-trade-representative}

### Press Releases {#the-united-states-trade-representative-press-releases}

<Route author="nczitzk" example="/ustr/press-releases" path="/ustr/press-releases/:year?/:month?" paramsDesc={['Year, current year by default', 'Month, empty by default, show contents in all year']}>

:::tip

Fill in the English expression for the month in the Month field, eg `December` for the 12th Month。

:::

</Route>

## The White House {#the-white-house}

### Briefing Room {#the-white-house-briefing-room}

<Route author="nczitzk" example="/whitehouse/briefing-room" path="/whitehouse/briefing-room/:category?" paramsDesc={['Category, see below, all by default']}>

| All | Blog | Legislation | Presidential Actions | Press Briefings | Speeches and Remarks | Statements and Releases |
| - | - | - | - | - | - | - |
| | blog | legislation | presidential-actions | press-briefings | speeches-remarks | statements-releases |

</Route>

### Office of Science and Technology Policy {#the-white-house-office-of-science-and-technology-policy}

<Route author="LyleLee" example="/whitehouse/ostp" path="/whitehouse/ostp"/>

## U.S. Department of the Treasury {#u.s.-department-of-the-treasury}

### Press Releases {#u.s.-department-of-the-treasury-press-releases}

<Route author="nczitzk" example="/treasury/press-releases" path="/treasury/press-releases/:category?/:title?" paramsDesc={['Category, see below, all by default', 'Title keywords, empty by default']}>

Category

| Press Releases | Statements & Remarks | Readouts | Testimonies |
| -------------- | -------------------- | -------- | ----------- |
| all            | statements-remarks   | readouts | testimonies |

</Route>

## U.S. Food and Drug Administration {#u.s.-food-and-drug-administration}

### CDRHNew {#u.s.-food-and-drug-administration-cdrhnew}

<Route author="nczitzk" example="/fda/cdrh" path="/fda/cdrh" />

## United Nations {#united-nations}

### Security Council Vetoed a Resolution {#united-nations-security-council-vetoed-a-resolution}

<Route author="HenryQW" example="/un/scveto" path="/un/scveto"/>

## World Health Organization | WHO {#world-health-organization-who}

### News {#world-health-organization-who-news}

<Route author="nczitzk" example="/who/news" path="/who/news/:language?" paramsDesc={['Language, see below, English by default']}>

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |

</Route>

### Newsroom {#world-health-organization-who-newsroom}

<Route author="LogicJake nczitzk" example="/who/news-room/feature-stories" path="/who/news-room/:category?/:language?" paramsDesc={['Category, see below, Feature stories by default', 'Language, see below, English by default']}>

Category

| Feature stories | Commentaries |
| --------------- | ------------ |
| feature-stories | commentaries |

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |

</Route>

### Speeches {#world-health-organization-who-speeches}

<Route author="nczitzk" example="/who/speeches" path="/who/speeches/:language?" paramsDesc={['Language, see below, English by default']}>

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |

</Route>

## World Trade Organization {#world-trade-organization}

### Dispute settlement news {#world-trade-organization-dispute-settlement-news}

<Route author="nczitzk" example="/wto/dispute-settlement" path="/wto/dispute-settlement/:year?" paramsDesc={['Year, current year by default']}/>

## 安徽省科技厅 {#an-hui-sheng-ke-ji-ting}

### 科技资讯 & 科技资源 {#an-hui-sheng-ke-ji-ting-ke-ji-zi-xun-ke-ji-zi-yuan}

<Route author="nczitzk" example="/gov/anhui/kjt/kjzx/tzgg" path="/gov/anhui/kjt/:path?" paramsDesc={['路径，默认为通知公告']}>

:::tip

路径处填写对应页面 URL 中 `http://kjt.ah.gov.cn/` 和 `/index.html` 之间的字段。下面是一个例子。

若订阅 [通知公告](http://kjt.ah.gov.cn/kjzx/tzgg/index.html) 则将对应页面 URL <http://kjt.ah.gov.cn/kjzx/tzgg/index.html> 中 `http://kjt.ah.gov.cn/` 和 `/index.html` 之间的字段 `kjzx/tzgg` 作为路径填入。此时路由为 [`/gov/anhui/kjt/kjzx/tzgg`](https://rsshub.app/gov/anhui/kjt/kjzx/tzgg)

:::

</Route>

## 澳门卫生局 {#ao-men-wei-sheng-ju}

### 最新消息 {#ao-men-wei-sheng-ju-zui-xin-xiao-xi}

<Route author="Fatpandac" example="/ssm/news" path="/ssm/news"/>

## 北京社科网 {#bei-jing-she-ke-wang}

### 通用 {#bei-jing-she-ke-wang-tong-yong}

<Route author="TonyRL" example="/bjsk/newslist-1394-1474-0" path="/bjsk/:path?" paramsDesc={['路径，默认为 `newslist-1486-0-0`']} radar="1">

:::tip

路径处填写对应页面 URL 中 `https://www.bjsk.org.cn/` 和 `.html` 之间的字段。下面是一个例子。

若订阅 [社科资讯 > 社科要闻](https://www.bjsk.org.cn/newslist-1394-1474-0.html) 则将对应页面 URL <https://www.bjsk.org.cn/newslist-1394-1474-0.html> 中 `https://www.bjsk.org.cn/` 和 `.html` 之间的字段 `newslist-1394-1474-0` 作为路径填入。此时路由为 [`/bjsk/newslist-1394-1474-0`](https://rsshub.app/bjsk/newslist-1394-1474-0)

:::

</Route>

### 基金项目管理平台 {#bei-jing-she-ke-wang-ji-jin-xiang-mu-guan-li-ping-tai}

<Route author="nczitzk" example="/bjsk/keti" path="/bjsk/keti/:id?" paramsDesc={['分类 id，见下表，默认为通知公告']}>

| 通知公告                         | 资料下载                         |
| -------------------------------- | -------------------------------- |
| 402881027cbb8c6f017cbb8e17710002 | 2c908aee818e04f401818e08645c0002 |

</Route>

## 北京市保障房中心有限公司 {#bei-jing-shi-bao-zhang-fang-zhong-xin-you-xian-gong-si}

### 北京市共有产权住房租赁服务平台 {#bei-jing-shi-bao-zhang-fang-zhong-xin-you-xian-gong-si-bei-jing-shi-gong-you-chan-quan-zhu-fang-zu-lin-fu-wu-ping-tai}

<Route author="bigfei" example="/gov/beijing/bphc/announcement" path="/gov/beijing/bphc/:cat" paramsDesc={['类别']}>

|   通知公告   | 项目介绍 |
| :----------: | :------: |
| announcement |  project |

</Route>

## 北京市教育委员会 {#bei-jing-shi-jiao-yu-wei-yuan-hui}

### 通知公告 {#bei-jing-shi-jiao-yu-wei-yuan-hui-tong-zhi-gong-gao}

<Route author="nczitzk" example="/gov/beijing/jw/tzgg" path="/gov/beijing/jw/tzgg" />

## 北京市科学技术委员会、中关村科技园区管理委员会 {#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui}

### 频道 {#bei-jing-shi-ke-xue-ji-shu-wei-yuan-hui-zhong-guan-cun-ke-ji-yuan-qu-guan-li-wei-yuan-hui-pin-dao}

<Route author="Fatpandac" example="/kwbeijing/col736" path="/kwbeijing/:channel" paramsDesc={['频道']}>

频道参数可在官网获取，如：

`http://kw.beijing.gov.cn/col/col736/index.html` 对应 `/kwbeijing/col736`

</Route>

## 北京市人民政府 {#bei-jing-shi-ren-min-zheng-fu}

### 北京教育考试院 {#bei-jing-shi-ren-min-zheng-fu-bei-jing-jiao-yu-kao-shi-yuan}

<Route author="gavin-k" example="/gov/beijing/bjeea/bjeeagg" path="/gov/beijing/bjeea/:type" paramsDesc={['分类名']}>

| 通知公告 | 招考政策 | 自考快递 |
| :------: | :------: | :------: |
|  bjeeagg |   zkzc   |   zkkd   |

</Route>

## 北京市卫生健康委员会 {#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui}

### 新闻中心 {#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui-xin-wen-zhong-xin}

<Route author="luyuhuang" example="/gov/beijing/mhc/wnxw" path="/gov/beijing/mhc/:caty" paramsDesc={['类别']}>

| 委内新闻 | 基层动态 | 媒体聚焦 | 热点新闻 |
| :------: | :------: | :------: | :------: |
|   wnxw   |   jcdt   |   mtjj   |   rdxws  |

</Route>

## 北京无线电协会 {#bei-jing-wu-xian-dian-xie-hui}

### 最新资讯 {#bei-jing-wu-xian-dian-xie-hui-zui-xin-zi-xun}

<Route author="Misaka13514" example="/bjwxdxh/114" path="/bjwxdxh/:type?" paramsDesc={['类型，见下表，默认为全部']} radar="1" rssbud="1">

| 协会活动 | 公告通知 | 会议情况 | 简报 | 政策法规 | 学习园地 | 业余无线电服务中心 | 经验交流 | 新技术推介 | 活动通知 | 爱好者园地 | 结果查询 | 资料下载 | 会员之家 | 会员简介 | 会员风采 | 活动报道 |
| -------- | -------- | -------- | ---- | -------- | -------- | ------------------ | -------- | ---------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 86       | 99       | 102      | 103  | 106      | 107      | 108                | 111      | 112        | 114      | 115        | 116      | 118      | 119      | 120      | 121      | 122      |

</Route>

## 重庆市人民政府 {#chong-qing-shi-ren-min-zheng-fu}

### 两江新区信息公开网 {#chong-qing-shi-ren-min-zheng-fu-liang-jiang-xin-qu-xin-xi-gong-kai-wang}

#### 党务公开 {#chong-qing-shi-ren-min-zheng-fu-liang-jiang-xin-qu-xin-xi-gong-kai-wang-dang-wu-gong-kai}

<Route author="nczitzk" example="/gov/chongqing/ljxq/dwgk" path="/gov/chongqing/ljxq/dwgk"/>

#### 政务公开 {#chong-qing-shi-ren-min-zheng-fu-liang-jiang-xin-qu-xin-xi-gong-kai-wang-zheng-wu-gong-kai}

<Route author="nczitzk" example="/gov/chongqing/ljxq/zwgk/lzyj" path="/gov/chongqing/ljxq/zwgk/:caty" paramsDesc={['分类名']}>

| 履职依据 | 公示公告 |
| -------- | -------- |
| lzyj     | gsgg     |

</Route>

### 人力社保局 {#chong-qing-shi-ren-min-zheng-fu-ren-li-she-bao-ju}

#### 人事考试通知 {#chong-qing-shi-ren-min-zheng-fu-ren-li-she-bao-ju-ren-shi-kao-shi-tong-zhi}

<Route author="Mai19930513" example="/gov/chongqing/rsks" path="/gov/chongqing/rsks" radar="1"/>

#### 事业单位公开招聘 {#chong-qing-shi-ren-min-zheng-fu-ren-li-she-bao-ju-shi-ye-dan-wei-gong-kai-zhao-pin}

<Route author="MajexH" example="/gov/chongqing/sydwgkzp" path="/gov/chongqing/sydwgkzp" radar="1"/>

## 德阳市人民政府 {#de-yang-shi-ren-min-zheng-fu}

### 政府公开信息 {#de-yang-shi-ren-min-zheng-fu-zheng-fu-gong-kai-xin-xi}

<Route author="zytomorrow" example="/gov/sichuan/deyang/govpublicinfo/绵竹市" path="/gov/sichuan/deyang/govpublicinfo/:countyName/:infoType?" paramsDesc={['区县名（**其他区县整改中，暂时只支持`绵竹市`**）。德阳市、绵竹市、广汉市、什邡市、中江县、罗江区、旌阳区、高新区', '信息类型。默认值:fdzdnr-“法定主动内容”']}>

| 法定主动内容 | 公示公告 |
| :----------: | :------: |
|    fdzdnr    |   gsgg   |

</Route>

### 今日绵竹 {#de-yang-shi-ren-min-zheng-fu-jin-ri-mian-zhu}

<Route author="zytomorrow" example="/gov/sichuan/deyang/mztoday/zx" path="/gov/sichuan/deyang/mztoday/:infoType?" paramsDesc={['信息栏目名称。默认最新(zx)']}>

| 最新 | 推荐 | 时政 | 教育 | 民生 | 文旅 | 经济 | 文明创建 | 部门 | 镇（街道） | 健康绵竹 | 南轩讲堂 | 视频 | 文明实践 | 领航中国 | 绵竹年画 | 绵竹历史 | 绵竹旅游 | 外媒看绵竹 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | ---------- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- | ---------- |
| zx   | tj   | sz   | jy   | ms   | wl   | jj   | wmcj     | bm   | zj         | jkmz     | nxjt     | sp   | wmsj     | lhzg     | mznh     | mzls     | mzly     | wmkmz      |

</Route>

## 广东省人民政府 {#guang-dong-sheng-ren-min-zheng-fu}

### 省教育厅 {#guang-dong-sheng-ren-min-zheng-fu-sheng-jiao-yu-ting}

<Route author="nczitzk" example="/gov/guangdong/edu/tzgg" path="/gov/guangdong/edu/:caty" paramsDesc={['资讯类别']}>

| 通知公告 | 本厅信息 | 新闻发布 | 媒体聚焦 | 广东教育 | 教育动态 | 图片新闻 | 政声传递 |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
|   tzgg   |   btxx   |   xwfb   |   mtjj   |   gdjy   |   jydt   |   tpxw   |   zscd   |

</Route>

### 省教育考试院 {#guang-dong-sheng-ren-min-zheng-fu-sheng-jiao-yu-kao-shi-yuan}

<Route author="icealtria" example="/gov/guangdong/eea/kszs" path="/gov/guangdong/eea/:caty" paramsDesc={['资讯类别']}>

| 考试招生 | 社会考试 | 招考公示 | 报考指南 | 要闻动态 | 公开专栏 | 政策文件 | 政策解读 |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
|   kszs   |   shks   |   zkgs   |   bkzn   |   news   |   gkzl   |   zcwj   |   zcjd   |

</Route>

### 深圳市人民政府 {#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-ren-min-zheng-fu}

<Route author="laoxua" example="/gov/shenzhen/xxgk/zfxxgj/tzgg" path="/gov/shenzhen/xxgk/zfxxgj/:caty" paramsDesc={['信息类别']}>

| 通知公告 | 政府采购 | 资金信息 | 重大项目 |
| :------: | :------: | :------: | :------: |
|   tzgg   |   zfcg   |   zjxx   |   zdxm   |

</Route>

### 深圳市委组织部 {#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-wei-zu-zhi-bu}

<Route author="zlasd" example="/gov/shenzhen/zzb/tzgg" path="/gov/shenzhen/zzb/:caty/:page?" paramsDesc={['信息类别', '页码']}>

| 通知公告 | 任前公示 | 政策法规 | 工作动态 | 部门预算决算公开 | 业务表格下载 |
| :------: | :------: | :------: | :------: | :--------------: | :----------: |
|   tzgg   |   rqgs   |   zcfg   |   gzdt   |       xcbd       |     bgxz     |

</Route>

### 深圳市考试院 {#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-kao-shi-yuan}

<Route author="zlasd" example="/gov/shenzhen/hrss/szksy/bmxx/2" path="/gov/shenzhen/hrss/szksy/:caty/:page?" paramsDesc={['信息类别', '页码']}>

| 通知公告 | 报名信息 | 成绩信息 | 合格标准 | 合格人员公示 | 证书发放信息 |
| :------: | :------: | :------: | :------: | :----------: | :----------: |
|   tzgg   |   bmxx   |   cjxx   |   hgbz   |    hgrygs    |     zsff     |

</Route>

### 深圳市住房和建设局 {#guang-dong-sheng-ren-min-zheng-fu-shen-zhen-shi-zhu-fang-he-jian-she-ju}

<Route author="lonn" example="/gov/shenzhen/zjj/xxgk/tzgg" path="/gov/shenzhen/zjj/xxgk/:caty" paramsDesc={['信息类别']}>

| 通知公告 |
| :------: |
|   tzgg   |

</Route>

### 惠州市人民政府 {#guang-dong-sheng-ren-min-zheng-fu-hui-zhou-shi-ren-min-zheng-fu}

#### 政务公开 {#guang-dong-sheng-ren-min-zheng-fu-hui-zhou-shi-ren-min-zheng-fu-zheng-wu-gong-kai}

<Route author="Fatpandac" example="/gov/huizhou/zwgk/jgdt" path="/gov/huizhou/zwgk/:category?" paramsDesc={['资讯类别，可以从网址中得到，默认为政务要闻']}/>

## 广州市人民政府 {#guang-zhou-shi-ren-min-zheng-fu}

### 新闻 {#guang-zhou-shi-ren-min-zheng-fu-xin-wen}

<Route author="drgnchan" example="/gov/gz/xw/gzyw" path="/gov/gz/xw/:category" paramsDesc={['新闻分类']}>

| 广州要闻 | 今日头条 | 通知公告 |
| -------- | -------- | -------- |
| gzyw     | jrtt     | tzgg     |

</Route>

### 政务公开 {#guang-zhou-shi-ren-min-zheng-fu-zheng-wu-gong-kai}

<Route author="drgnchan" example="/gov/gz/zwgk/zcjd" path="/gov/gz/zwgk/:category" paramsDesc={['政务话你知']}>

| 文字解读 |
| -------- |
| zcjd     |

</Route>

## 国家广播电视总局 {#guo-jia-guang-bo-dian-shi-zong-ju}

### 分类 {#guo-jia-guang-bo-dian-shi-zong-ju-fen-lei}

<Route author="yuxinliu-alex" example="/gov/nrta/news" path="/gov/nrta/news/:category?" paramsDesc={['资讯类别，可从地址中获取，默认为总局要闻']}>

| 总局要闻 | 公告公示 | 工作动态 | 其他 |
| -------- | -------- | -------- | ---- |
| 112      | 113      | 114      |      |

</Route>

### 电视剧政务平台 {#guo-jia-guang-bo-dian-shi-zong-ju-dian-shi-ju-zheng-wu-ping-tai}

<Route author="nczitzk" example="/gov/nrta/dsj" path="/gov/nrta/dsj/:category?" paramsDesc={['分类，见下表，默认为备案公示']}>

| 备案公示 | 发行许可通告 | 重大题材立项     | 重大题材摄制    | 变更通报 |
| -------- | ------------ | ---------------- | --------------- | -------- |
| note     | announce     | importantLixiang | importantShezhi | changing |

</Route>

## 国家税务总局 {#guo-jia-shui-wu-zong-ju}

### 最新文件 {#guo-jia-shui-wu-zong-ju-zui-xin-wen-jian}

<Route author="nczitzk" example="/gov/chinatax/latest" path="/gov/chinatax/latest"/>

## 国家统计局 {#guo-jia-tong-ji-ju}

### 通用 {#guo-jia-tong-ji-ju-tong-yong}

<Route author="bigfei nczitzk" example="/gov/stats/sj/zxfb" path="/gov/stats/:path+" paramsDesc={['路径，默认为数据最新发布']}>

:::tip

路径处填写对应页面 URL 中 `http://www.stats.gov.cn/` 后的字段。下面是一个例子。

若订阅 [数据 > 数据解读](http://www.stats.gov.cn/sj/sjjd/) 则将对应页面 URL <http://www.stats.gov.cn/sj/sjjd/> 中 `http://www.stats.gov.cn/` 后的字段 `sj/sjjd` 作为路径填入。此时路由为 [`/gov/stats/sj/sjjd`](https://rsshub.app/gov/stats/sj/sjjd)

若订阅 [新闻 > 时政要闻 > 中央精神](http://www.stats.gov.cn/xw/szyw/zyjs/) 则将对应页面 URL <http://www.stats.gov.cn/xw/szyw/zyjs/> 中 `http://www.stats.gov.cn/` 后的字段 `xw/szyw/zyjs` 作为路径填入。此时路由为 [`/gov/stats/xw/szyw/zyjs`](https://rsshub.app/gov/stats/xw/szyw/zyjs)

:::

</Route>

## 国家新闻出版广电总局（弃用） {#guo-jia-xin-wen-chu-ban-guang-dian-zong-ju-qi-yong}

### 游戏审批结果 {#guo-jia-xin-wen-chu-ban-guang-dian-zong-ju-qi-yong-you-xi-shen-pi-jie-guo}

<Route author="y2361547758" example="/gov/sapprft/approval/domesticnetgame/2020年1月" path="/gov/sapprft/approval/:channel/:detail?" paramsDesc={['栏目名', '标题关键字']}>

|         栏目         |      channel      |
| :------------------: | :---------------: |
| 进口网络游戏审批信息 |  importednetgame  |
| 进口电子游戏审批信息 | importedvideogame |
| 国产网络游戏审批信息 |  domesticnetgame  |
|   游戏审批变更信息   |     gamechange    |

|                  描述                  |      detail      |
| :------------------------------------: | :--------------: |
|         留空，返回栏目所有文章         |                  |
|       new，返回栏目第一篇文章内容      |        new       |
| 某个文章标题的一部分，返回这篇文章内容 | 例：2020 年 1 月 |

</Route>

## 国家新闻出版署 {#guo-jia-xin-wen-chu-ban-shu}

### 列表 {#guo-jia-xin-wen-chu-ban-shu-lie-biao}

<Route author="y2361547758" example="/gov/nppa/317" path="/gov/nppa/:channel" paramsDesc={['栏目名 id']} radar="1" rssbud="1"/>

### 详情 {#guo-jia-xin-wen-chu-ban-shu-xiang-qing}

<Route author="y2361547758" example="/gov/nppa/318/45948" path="/gov/nppa/:channel/:content" paramsDesc={['栏目名 id', '文章 id']} radar="1" rssbud="1"/>

## 国家药品监督管理局 {#guo-jia-yao-pin-jian-du-guan-li-ju}

### 通用 {#guo-jia-yao-pin-jian-du-guan-li-ju-tong-yong}

<Route author="TonyRL" example="/gov/nmpa/xxgk/ggtg" path="/gov/nmpa/:path+" paramsDesc={['路径，默认为公告通告']} radar="1" rssbud="1">

:::tip

路径处填写对应页面 URL 中 `https://www.nmpa.gov.cn/` 与 `/index.html` 之间的字段，下面是一个例子。

若订阅 [公告通告](https://www.nmpa.gov.cn/xxgk/ggtg/index.html) 则将对应页面 URL <https://www.nmpa.gov.cn/xxgk/ggtg/index.html> 中 `https://www.nmpa.gov.cn/` 和 `/index.html` 之间的字段 `xxgk/ggtg` 作为路径填入。此时路由为 [`/gov/nmpa/xxgk/ggtg`](https://rsshub.app/gov/nmpa/xxgk/ggtg)

:::

</Route>

## 国家药品监督管理局医疗器械标准管理中心 {#guo-jia-yao-pin-jian-du-guan-li-ju-yi-liao-qi-xie-biao-zhun-guan-li-zhong-xin}

### 通用 {#guo-jia-yao-pin-jian-du-guan-li-ju-yi-liao-qi-xie-biao-zhun-guan-li-zhong-xin-tong-yong}

<Route author="nczitzk" example="/gov/nifdc/bshff/ylqxbzhgl/qxggtzh" path="/gov/nifdc/:path+" paramsDesc={['路径，默认为公告通告']} radar="1" rssbud="1">

:::tip

路径处填写对应页面 URL 中 `https://www.nifdc.gov.cn/nifdc/` 与 `/index.html` 之间的字段，下面是一个例子。

若订阅 [公告通告](https://www.nifdc.org.cn/nifdc/bshff/ylqxbzhgl/qxggtzh/index.html) 则将对应页面 URL <https://www.nifdc.org.cn/nifdc/bshff/ylqxbzhgl/qxggtzh/index.html> 中 `https://www.nifdc.org.cn/nifdc/` 和 `/index.html` 之间的字段 `bshff/ylqxbzhgl/qxggtzh` 作为路径填入。此时路由为 [`/gov/nifdc/bshff/ylqxbzhgl/qxggtzh`](https://rsshub.app/gov/nifdc/bshff/ylqxbzhgl/qxggtzh)

:::

</Route>

## 国家药品监督管理局医疗器械技术审评中心 {#guo-jia-yao-pin-jian-du-guan-li-ju-yi-liao-qi-xie-ji-shu-shen-ping-zhong-xin}

### 通用 {#guo-jia-yao-pin-jian-du-guan-li-ju-yi-liao-qi-xie-ji-shu-shen-ping-zhong-xin-tong-yong}

<Route author="run-ze" example="/cmde/xwdt/zxyw" path="/cmde/:cate*" paramsDesc={['路径，默认为最新要闻']} radar="1" puppeteer="1">

:::tip

路径处填写对应页面 URL 中 `https://www.cmde.org.cn/` 与 `/index.html` 之间的字段，下面是一个例子。

若订阅 [最新要闻](https://www.cmde.org.cn/xwdt/zxyw/index.html) 则将对应页面 URL <https://www.cmde.org.cn/xwdt/zxyw/index.html> 中 `https://www.cmde.org.cn/` 和 `/index.html` 之间的字段 `xwdt/zxyw` 作为路径填入。此时路由为 [`/cmde/xwdt/zxyw`](https://rsshub.app//cmde/xwdt/zxyw)

:::

</Route>

## 国家药品审评网站 {#guo-jia-yao-pin-shen-ping-wang-zhan}

### 首页 {#guo-jia-yao-pin-shen-ping-wang-zhan-shou-ye}

<Route author="Fatpandac" example="/cde/news/gzdt" path="/cde/:channel/:category" paramsDesc={['频道', '类别']}>

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

</Route>

### 信息公开 {#guo-jia-yao-pin-shen-ping-wang-zhan-xin-xi-gong-kai}

<Route author="TonyRL" example="/cde/xxgk/priorityApproval" path="/cde/xxgk/:category" paramsDesc={['类别，见下表']} radar="1" rssbud="1">

|   优先审评公示   |  突破性治疗公示  | 临床试验默示许可 |
| :--------------: | :--------------: | :--------------: |
| priorityApproval | breakthroughCure |     cliniCal     |

</Route>

### 指导原则专栏 {#guo-jia-yao-pin-shen-ping-wang-zhan-zhi-dao-yuan-ze-zhuan-lan}

<Route author="TonyRL" example="/cde/zdyz/domesticGuide" path="/cde/zdyz/:category" paramsDesc={['类别，见下表']} radar="1" rssbud="1">

|    发布通告   |   征求意见  |
| :-----------: | :---------: |
| domesticGuide | opinionList |

</Route>

## 国家自然科学基金委员会 {#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui}

### 通用 {#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui-tong-yong}

<Route author="Derekmini nczitzk" example="/gov/nsfc" path="/gov/nsfc/path+" paramsDesc={['路径，默认为基金要闻']} radar="1" rssbud="1">

:::tip

若订阅 [基金要闻 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab442)，网址为 <https://www.nsfc.gov.cn/publish/portal0/tab442>。截取 `https://www.nsfc.gov.cn` 到末尾的部分 `/publish/portal0/tab442` 作为参数，此时路由为 [`/gov/nsfc/publish/portal0/tab442`](https://rsshub.app/gov/nsfc/publish/portal0/tab442)。

当然，也可以填入路径在下表中对应的快捷方式。其中 [基金要闻 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab442) 的快捷方式为 `tzgg`，此时路由为 [`/gov/nsfc/tzgg`](https://rsshub.app/gov/nsfc/tzgg)。

若订阅 [管理科学部 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab1212)，网址为 <https://www.nsfc.gov.cn/publish/portal0/tab1212>。截取 `https://www.nsfc.gov.cn` 到末尾的部分 `/publish/portal0/tab1212` 作为参数，此时路由为 [`/gov/nsfc/publish/portal0/tab1212`](https://rsshub.app/gov/nsfc/publish/portal0/tab1212)。

同理，也可以填入路径在下表中对应的快捷方式。其中 [管理科学部 - 通知公告](https://www.nsfc.gov.cn/publish/portal0/tab1212) 的快捷方式为 `glkxb-tzgg`，此时路由为 [`/gov/nsfc/glkxb-tzgg`](https://rsshub.app/gov/nsfc/glkxb-tzgg)。

:::

基金要闻

| 基金要闻 | 通知公告 | 部门动态 | 科普快讯 | 资助成果 |
| -------- | -------- | -------- | -------- | -------- |
| jjyw     | tzgg     | bmdt     | kpkx     | zzcg     |

政策法规

| 国家自然科学基金条例 | 国家自然科学基金发展规划 | 国家自然科学基金规章制度 | 国家科学技术相关法律法规 |
| -------------------- | ------------------------ | ------------------------ | ------------------------ |
| zcfg-jjtl            | zcfg-fzgh                | zcfg-gzzd                | zcfg-flfg                |

管理科学部

| 工作动态   | 通知公告   | 资助成果   |
| ---------- | ---------- | ---------- |
| glkxb-gzdt | glkxb-tzgg | glkxb-zzcg |

国际合作局

| 项目指南   | 初审结果   | 批准通知   | 进程简表   | 信息公开   |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| gjhzj-xmzn | gjhzj-csjg | gjhzj-pztz | gjhzj-jcjb | gjhzj-xxgk |

</Route>

## 国务院国有资产监督管理委员会 {#guo-wu-yuan-guo-you-zi-chan-jian-du-guan-li-wei-yuan-hui}

### 通用 {#guo-wu-yuan-guo-you-zi-chan-jian-du-guan-li-wei-yuan-hui-tong-yong}

<Route author="TonyRL" example="/gov/sasac/n2588030/n16436141" path="/gov/sasac/:path+" paramsDesc={['路径，可在 URL 找到']} radar="1" rssbud="1" >

:::tip

路径处填写对应页面 URL 中 `http://www.sasac.gov.cn/` 与 `/index.html` 之间的字段，下面是一个例子。

若订阅 [其他](http://www.sasac.gov.cn/n2588030/n16436141/index.html) 则将对应页面 URL <http://www.sasac.gov.cn/n2588030/n16436141/index.html> 中 `http://www.sasac.gov.cn/` 和 `/index.html` 之间的字段 `n2588030/n16436141` 作为路径填入。此时路由为 [`/gov/sasac/n2588030/n16436141`](https://rsshub.app/gov/nmpa/n2588030/n16436141)

:::

</Route>

## 哈尔滨市科技局 {#ha-er-bin-shi-ke-ji-ju}

### 政务公开 {#ha-er-bin-shi-ke-ji-ju-zheng-wu-gong-kai}

<Route author="XYenon" example="/gov/harbin/kjj" path="/gov/harbin/kjj"/>

## 河北省财政厅 {#he-bei-sheng-cai-zheng-ting}

<Route author="nczitzk" example="/gov/hebei/czt/xwdt" path="/gov/hebei/czt/xwdt/:category?" paramsDesc={['分类，见下表，默认为财政动态']}>

| 财政动态 | 综合新闻 | 通知公告 |
| -------- | -------- | -------- |
| gzdt     | zhxw     | tzgg     |

</Route>

## 河北省退役军人事务厅 {#he-bei-sheng-tui-yi-jun-ren-shi-wu-ting}

<Route author="SunShinenny" example="/gov/veterans/hebei/sxxx" path="/gov/veterans/hebei/:type" paramsDesc={['分类名']}>

| 省内信息 | 厅内信息 | 市县信息 |
| :------: | :------: | :------: |
|   ywgz   |   tnxx   |   sxxx   |

</Route>

## 湖北省软件行业协会 {#hu-bei-sheng-ruan-jian-hang-ye-xie-hui}

### 新闻中心 {#hu-bei-sheng-ruan-jian-hang-ye-xie-hui-xin-wen-zhong-xin}

<Route author="tudou027" example="/gov/hubei/hbsia/zxzx" path="/gov/hubei/hbsia/:caty" paramsDesc={['类别']}>

| 具体栏目 | 参数 |
| :------: | :--: |
| 最新资讯 | zxzx |
| 活动通知 | hdtz |
| 活动报道 | hdbd |
| 公示公告 | gsgg |

</Route>

## 湖南省人民政府 {#hu-nan-sheng-ren-min-zheng-fu}

### 长沙市人民政府 {#hu-nan-sheng-ren-min-zheng-fu-chang-sha-shi-ren-min-zheng-fu}

#### 市长信箱 {#hu-nan-sheng-ren-min-zheng-fu-chang-sha-shi-ren-min-zheng-fu-shi-zhang-xin-xiang}

<Route author="shansing" example="/gov/hunan/changsha/major-email" path="/gov/hunan/changsha/major-email" />

可能仅限中国大陆服务器访问，以实际情况为准。

## 湖南省政府采购网 {#hu-nan-sheng-zheng-fu-cai-gou-wang}

### 公告 {#hu-nan-sheng-zheng-fu-cai-gou-wang-gong-gao}

<Route author="Jeason0228" example="/gov/hunan/notice/all" path="/gov/hunan/notice/:type"  paramsDesc={['all=全部，cg=采购公告,zb=中标公告,fb=废标公告,ht=合同公告,gz=更正公告,zz=终止公告,qt=其他公告']} />

## 济南市卫生健康委员会 {#ji-nan-shi-wei-sheng-jian-kang-wei-yuan-hui}

### 获取国家医师资格考试通知 {#ji-nan-shi-wei-sheng-jian-kang-wei-yuan-hui-huo-qu-guo-jia-yi-shi-zi-ge-kao-shi-tong-zhi}

<Route author="tzjyxb" example="/gov/jinan/healthcommission/medical_exam_notice" path="/gov/jinan/healthcommission/medical_exam_notice" radar="1"/>

## 江苏省人民政府 {#jiang-su-sheng-ren-min-zheng-fu}

### 动态 {#jiang-su-sheng-ren-min-zheng-fu-dong-tai}

<Route author="ocleo1" example="/gov/province/jiangsu/important-news" path="/gov/province/jiangsu/:category" paramsDesc={['分类名']}>

|   省政府常务会议  |    要闻关注    |  部门资讯  |   市县动态  |        政策解读       |
| :---------------: | :------------: | :--------: | :---------: | :-------------------: |
| executive-meeting | important-news | department | city-county | policy-interpretation |

| 政府信息公开年度报告 |    政府信息公开制度   | 省政府及办公厅文件 |     规范性文件     |
| :------------------: | :-------------------: | :----------------: | :----------------: |
|     annual-report    | information-publicity |    documentation   | normative-document |

|          立法意见征集          |      意见征集      |
| :----------------------------: | :----------------: |
| legislative-opinion-collection | opinion-collection |

</Route>

### 省教育考试院 - 新闻中心 {#jiang-su-sheng-ren-min-zheng-fu-sheng-jiao-yu-kao-shi-yuan-xin-wen-zhong-xin}

<Route author="schen1024" example="/jseea/news/zkyw" path="/gov/jiangsu/eea/:type?" paramsDesc={['分类，默认为 `zkyw`，具体参数见下表']} radar="1" rssbud="1">

| 招考要闻 | 教育动态 | 招考信息 | 政策文件 | 院校动态 |
| :------: | :------: | :------: | :------: | :------: |
|   zkyw   |   jydt   |   zkxx   |   zcwj   |   yxdt   |

</Route>

## 茂名市人民政府 {#mao-ming-shi-ren-min-zheng-fu}

### 茂名市人民政府门户网站 {#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-ren-min-zheng-fu-men-hu-wang-zhan}

<Route author="ShuiHuo" example="/gov/maoming/www/zwgk/zcjd/jd" path="/gov/maoming/:path+" paramsDesc={['路径']}>

:::tip

路径处填写对应页面 URL 中茂名有关政府网站的域名最前面的部分和域名后的字段。下面是一个例子。

若订阅 [茂名市人民政府门户网站 > 政务公开 > 政策解读](http://www.maoming.gov.cn/zwgk/zcjd/jd/) 则将对应页面 URL <http://www.maoming.gov.cn/zwgk/zcjd/jd/> 中 `http://www.maoming.gov.cn/` 的字段 `www` 和 `/zwgk/zcjd/jd/` 作为路径填入。此时路由为 [`/gov/maoming/www/zwgk/zcjd/jd/`](https://rsshub.app/gov/maoming/www/zwgk/zcjd/jd/)

若订阅 [茂名市农业农村局网站 > 政务区 > 政务公开 > 通知公告](http://mmny.maoming.gov.cn/zwq/zwgk/tzgg/) 则将对应页面 URL <http://mmny.maoming.gov.cn/zwq/zwgk/tzgg/> 中 `http://mmny.maoming.gov.cn/` 的字段 `mmny` 和 `/zwq/zwgk/tzgg/` 作为路径填入。此时路由为 [`/gov/maoming/mmny/zwq/zwgk/tzgg/`](https://rsshub.app/gov/maoming/mmny/zwq/zwgk/tzgg/)

:::

</Route>

### 茂名市茂南区人民政府 {#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-mao-nan-qu-ren-min-zheng-fu}

<Route author="ShuiHuo" example="/gov/maonan/zwgk" path="/gov/maonan/:category" paramsDesc={['分类名']}>

| 政务公开 | 政务新闻 | 茂南动态 | 重大会议 | 公告公示 | 招录信息 | 政策解读 |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: |
|   zwgk   |   zwxw   |   mndt   |   zdhy   |   tzgg   |   zlxx   |   zcjd   |

</Route>

### 茂名市电白区人民政府 {#mao-ming-shi-ren-min-zheng-fu-mao-ming-shi-dian-bai-qu-ren-min-zheng-fu}

<Route author="ShuiHuo" example="/gov/dianbai/www/zwgk/zcjd" path="/gov/dianbai/:path+" paramsDesc={['路径，只填写 `www` 默认为 政务公开 > 政策解读']}>

:::tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.dianbai.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.dianbai.gov.cn/zwgk/zcjd/> 中 `http://www.dianbai.gov.cn/` 的字段`www` 和 `zwgk/zcjd/` 作为路径填入。此时路由为 [`/gov/dianbai/www/zwgk/zcjd/`](https://rsshub.app/gov/dianbai/www/zwgk/zcjd/)

:::

</Route>

### 信宜市人民政府 {#mao-ming-shi-ren-min-zheng-fu-xin-yi-shi-ren-min-zheng-fu}

<Route author="ShuiHuo" example="/gov/xinyi/www/zwgk/zcjd" path="/gov/xinyi/:path+" paramsDesc={['路径，只填写 `www` 默认为 政务公开 > 政策解读']}>

:::tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.xinyi.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.xinyi.gov.cn/zwgk/zcjd/> 中 `http://www.xinyi.gov.cn/` 的字段 `www` 和 `zwgk/zcjd/` 作为路径填入。此时路由为 [`/gov/xinyi/www/zwgk/zcjd/`](https://rsshub.app/gov/xinyi/www/zwgk/zcjd/)

:::

</Route>

### 高州市人民政府 {#mao-ming-shi-ren-min-zheng-fu-gao-zhou-shi-ren-min-zheng-fu}

<Route author="ShuiHuo" example="/gov/gaozhou/www/zwgk/zcjd" path="/gov/gaozhou/:path+" paramsDesc={['路径，只填写 `www` 默认为 政策解读']}>

:::tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政策解读](http://www.gaozhou.gov.cn/zcjd/) 则将对应页面 URL <http://www.gaozhou.gov.cn/zcjd/> 中 `http://www.gaozhou.gov.cn/` 的字段 `www` 和 `zcjd/` 作为路径填入。此时路由为 [`/gov/gaozhou/www/zcjd/`](https://rsshub.app/gov/gaozhou/www/zcjd/)

:::

</Route>

### 化州市人民政府 {#mao-ming-shi-ren-min-zheng-fu-hua-zhou-shi-ren-min-zheng-fu}

<Route author="ShuiHuo" example="/gov/huazhou/www/zwgk/zcjd" path="/gov/huazhou/:path+" paramsDesc={['路径，只填写 `www` 默认为 政策解读']}>

:::tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政策解读](http://www.huazhou.gov.cn/syzl/zcjd/) 则将对应页面 URL <http://www.huazhou.gov.cn/syzl/zcjd/> 中 `http://www.huazhou.gov.cn/` 的字段 `www` `syzl/zcjd/` 作为路径填入。此时路由为 [`/gov/huazhou/www/syzl/zcjd/`](https://rsshub.app/gov/huazhou/www/syzl/zcjd/)

:::

</Route>

### 广东茂名滨海新区政务网 {#mao-ming-shi-ren-min-zheng-fu-guang-dong-mao-ming-bin-hai-xin-qu-zheng-wu-wang}

<Route author="ShuiHuo" example="/gov/mgs/www/zwgk/zcjd" path="/gov/mgs/:path+" paramsDesc={['路径，只填写 `www` 默认为 政务公开 > 政策解读']}>

:::tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.mgs.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.mgs.gov.cn/zwgk/zcjd/> 中 `http://www.mgs.gov.cn/` 的字段 `www` 和 `zwgk/zcjd/` 作为路径填入。此时路由为 [`/gov/mgs/www/zwgk/zcjd/`](https://rsshub.app/gov/mgs/www/zwgk/zcjd/)

:::

</Route>

### 广东茂名高新技术产业开发区 {#mao-ming-shi-ren-min-zheng-fu-guang-dong-mao-ming-gao-xin-ji-shu-chan-ye-kai-fa-qu}

<Route author="ShuiHuo" example="/gov/mmht/www/xwzx/zcjd" path="/gov/mmht/:path+" paramsDesc={['路径，只填写 `www` 默认为 政务公开 > 政策解读']}>

:::tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.mmht.gov.cn/xwzx/zcjd/) 则将对应页面 URL <http://www.mmht.gov.cn/xwzx/zcjd/> 中 `http://www.mmht.gov.cn/` 的字段 `www` 和   `xwzx/zcjd/` 作为路径填入。此时路由为 [`/gov/mmht/www/xwzx/zcjd/`](https://rsshub.app/gov/mmht/www/xwzx/zcjd/)

:::

</Route>

### 广东省茂名水东湾新城建设管理委员会 {#mao-ming-shi-ren-min-zheng-fu-guang-dong-sheng-mao-ming-shui-dong-wan-xin-cheng-jian-she-guan-li-wei-yuan-hui}

<Route author="ShuiHuo" example="/gov/sdb/www/zwgk/zcjd" path="/gov/sdb/:path+" paramsDesc={['路径，只填写 `www` 默认为 政务公开 > 政策解读']}>

:::tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.sdb.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.sdb.gov.cn/zwgk/zcjd/> 中 `http://www.sdb.gov.cn/` 的字段 `www` 和   `zwgk/zcjd/` 作为路径填入。此时路由为 [`/gov/sdb/www/zwgk/zcjd/`](https://rsshub.app/gov/sdb/www/zwgk/zcjd/)

:::

</Route>

## 南京鼓楼医院 {#nan-jing-gu-lou-yi-yuan}

### 员工版教育培训 {#nan-jing-gu-lou-yi-yuan-yuan-gong-ban-jiao-yu-pei-xun}

<Route author="real-jiakai" example="/njglyy/ygbjypx" path="/njglyy/ygbjypx" radar="1" />

## 南京市人民政府 {#nan-jing-shi-ren-min-zheng-fu}

### 信息公开 {#nan-jing-shi-ren-min-zheng-fu-xin-xi-gong-kai}

<Route author="ocleo1" example="/gov/city/nanjing/news" path="/gov/city/nanjing/:category" paramsDesc={['分类名']}>

| 南京信息 |  部门动态  | 各区动态 |  民生信息  |
| :------: | :--------: | :------: | :--------: |
|   news   | department | district | livelihood |

</Route>

## 全国哲学社会科学工作办公室 {#quan-guo-zhe-xue-she-hui-ke-xue-gong-zuo-ban-gong-shi}

### 通用 {#quan-guo-zhe-xue-she-hui-ke-xue-gong-zuo-ban-gong-shi-tong-yong}

<Route author="nczitzk" example="/gov/nopss/GB/219469" path="/gov/nopss/:path+" paramsDesc={['路径，默认为通知公告']}>

:::tip

路径处填写对应页面 URL 中 `http://www.nopss.gov.cn/` 后的字段。下面是一个例子。

若订阅 [年度项目、青年项目和西部项目](http://www.nopss.gov.cn/GB/219469/431027) 则将对应页面 URL <http://www.nopss.gov.cn/GB/219469/431027> 中 `http://www.nopss.gov.cn/` 后的字段 `GB/219469/431027` 作为路径填入。此时路由为 [`/gov/nopss/GB/219469/431027`](https://rsshub.app/gov/nopss/GB/219469/431027)

:::

</Route>

## 泉州市跨境电子商务协会 {#quan-zhou-shi-kua-jing-dian-zi-shang-wu-xie-hui}

### 新闻动态 {#quan-zhou-shi-kua-jing-dian-zi-shang-wu-xie-hui-xin-wen-dong-tai}

<Route author="nczitzk" example="/qzcea" path="/qzcea/:caty?" paramsDesc={['分类 id，默认为 `1`']}>

| 新闻动态 | 协会动态 | 通知公告 | 会员风采 | 政策法规 | 电商资讯 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 5        | 14       | 18       |

</Route>

## 山西省人民政府 {#shan-xi-sheng-ren-min-zheng-fu}

### 人社厅 {#shan-xi-sheng-ren-min-zheng-fu-ren-she-ting}

<Route author="wolfyu1991" example="/gov/shanxi/rst/rsks-tzgg" path="/gov/shanxi/rst/:category" paramsDesc={['分类名']}>

|  通知公告 | 公务员考试 | 事业单位考试 | 专业技术人员资格考试 |  其他考试 |
| :-------: | :--------: | :----------: | :------------------: | :-------: |
| rsks-tzgg | rsks-gwyks |  rsks-sydwks |    rsks-zyjsryzgks   | rsks-qtks |

</Route>

## 陕西省省人民政府 {#shan-xi-sheng-sheng-ren-min-zheng-fu}

### 省科学技术厅 {#shan-xi-sheng-sheng-ren-min-zheng-fu-sheng-ke-xue-ji-shu-ting}

<Route author="nczitzk" example="/gov/shaanxi/kjt" path="/gov/shaanxi/kjt/:id?" paramsDesc={['分类，见下表，默认为通知公告']}>

| 科技头条 | 工作动态 | 基层科技 | 科技博览 | 媒体聚焦 | 通知公告 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1061     | 24       | 27       | 25       | 28       | 221      |

</Route>

## 上海市人民政府 {#shang-hai-shi-ren-min-zheng-fu}

### 上海市职业能力考试院 考试项目 {#shang-hai-shi-ren-min-zheng-fu-shang-hai-shi-zhi-ye-neng-li-kao-shi-yuan-kao-shi-xiang-mu}

<Route author="Fatpandac" example="/gov/shanghai/rsj/ksxm" path="/gov/shanghai/rsj/ksxm"/>

### 上海卫健委 疫情通报 {#shang-hai-shi-ren-min-zheng-fu-shang-hai-wei-jian-wei-yi-qing-tong-bao}

<Route author="zcf0508" example="/gov/shanghai/wsjkw/yqtb" path="/gov/shanghai/wsjkw/yqtb"/>

### 上海市药品监督管理局 {#shang-hai-shi-ren-min-zheng-fu-shang-hai-shi-yao-pin-jian-du-guan-li-ju}

<Route author="nczitzk" example="/gov/shanghai/yjj/zh" path="/gov/shanghai/yjj/:path+" paramsDesc={['路径参数']} radar="1" rssbud="1">

:::tip

路径处填写对应页面 URL 中 `https://yjj.sh.gov.cn/` 与 `/index.html` 之间的字段，下面是一个例子。

若订阅 [最新信息公开 > 综合](https://yjj.sh.gov.cn/zh/index.html) 则将对应页面 URL <https://yjj.sh.gov.cn/zh/index.html> 中 `https://yjj.sh.gov.cn/` 和 `/index.html` 之间的字段 `zh` 作为路径填入。此时路由为 [`/gov/shanghai/yjj/zh`](https://rsshub.app/gov/shanghai/yjj/zh)

:::

</Route>

### 上海市文旅局审批公告 {#shang-hai-shi-ren-min-zheng-fu-shang-hai-shi-wen-lv-ju-shen-pi-gong-gao}

<Route author="gideonsenku" example="/gov/shanghai/wgj" path="/gov/shanghai/wgj/:page?" paramsDesc={['页数，默认第 1 页']} radar="1">
</Route>

## 苏州市人民政府 {#su-zhou-shi-ren-min-zheng-fu}

### 政府新闻 {#su-zhou-shi-ren-min-zheng-fu-zheng-fu-xin-wen}

<Route author="EsuRt luyuhuang" example="/gov/suzhou/news/news" path="/gov/suzhou/news/:uid" paramsDesc={['栏目名']}>

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

</Route>

### 政府信息公开文件 {#su-zhou-shi-ren-min-zheng-fu-zheng-fu-xin-xi-gong-kai-wen-jian}

<Route author="EsuRt" example="/gov/suzhou/doc" path="/gov/suzhou/doc"/>

## 台湾行政院消费者保护会 {#tai-wan-xing-zheng-yuan-xiao-fei-zhe-bao-hu-hui}

### 消费资讯 {#tai-wan-xing-zheng-yuan-xiao-fei-zhe-bao-hu-hui-xiao-fei-zi-xun}

<Route author="Fatpandac" example="/cpcey/xwg" path="/cpcey/:type?" paramsDesc={['默认为 `xwg`']}>

| 新闻稿 | 消费资讯 |
| :----: | :------: |
|   xwg  |   xfzx   |

</Route>

## 台灣法務部廉政署 {#tai-wan-fa-wu-bu-lian-zheng-shu}

### 最新消息 {#tai-wan-fa-wu-bu-lian-zheng-shu-zui-xin-xiao-xi}

<Route author="TonyRL" example="/gov/moj/aac/news" path="/gov/moj/aac/news/:type?" paramsDesc={['資料大類，留空為全部']}>

| 全部 | 其他 | 採購公告 | 新聞稿 | 肅貪 | 預防 | 綜合 | 防疫專區 |
| ---- | ---- | -------- | ------ | ---- | ---- | ---- | -------- |
|      | 02   | 01       | 06     | 05   | 04   | 03   | 99       |

</Route>

## 台灣衛生福利部 {#tai-wan-wei-sheng-fu-li-bu}

### 即時新聞澄清 {#tai-wan-wei-sheng-fu-li-bu-ji-shi-xin-wen-cheng-qing}

<Route author="nczitzk" example="/mohw/clarification" path="/mohw/clarification"/>

## 太原市人民政府 {#tai-yuan-shi-ren-min-zheng-fu}

### 太原市人力资源和社会保障局政府公开信息 {#tai-yuan-shi-ren-min-zheng-fu-tai-yuan-shi-ren-li-zi-yuan-he-she-hui-bao-zhang-ju-zheng-fu-gong-kai-xin-xi}

<Route author="2PoL" example="/gov/taiyuan/rsj/gggs" path="/gov/taiyuan/rsj/:caty/:page?" paramsDesc={['信息类别', '页码']}>

| 工作动态 | 太原新闻 | 通知公告 | 县区动态 | 国内动态 | 图片新闻 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| gzdt     | tyxw     | gggs     | xqdt     | gndt     | tpxw     |

</Route>

## 武汉东湖新技术开发区 {#wu-han-dong-hu-xin-ji-shu-kai-fa-qu}

### 新闻中心 {#wu-han-dong-hu-xin-ji-shu-kai-fa-qu-xin-wen-zhong-xin}

<Route author="tudou027" example="/gov/wuhan/wehdz/tz" path="/gov/wuhan/wehdz/:caty" paramsDesc={['类别']}>

| 通知 | 公告 |
| :--: | :--: |
|  tz  |  gg  |

</Route>

## 武汉市科学技术局 {#wu-han-shi-ke-xue-ji-shu-ju}

### 新闻中心 {#wu-han-shi-ke-xue-ji-shu-ju-xin-wen-zhong-xin}

<Route author="tudou027" example="/gov/wuhan/kjj/tzgg" path="/gov/wuhan/kjj/:caty" paramsDesc={['类别']}>

| 通知公告 | 公示信息 |
| :------: | :------: |
|   tzgg   |   gsxx   |

</Route>

## 武汉市人民政府 {#wu-han-shi-ren-min-zheng-fu}

### 武汉要闻 {#wu-han-shi-ren-min-zheng-fu-wu-han-yao-wen}

<Route author="nczitzk" example="/gov/wuhan/sy/whyw" path="/gov/wuhan/sy/whyw"  radar="1" rssbud="1" />

## 香港卫生防护中心 {#xiang-gang-wei-sheng-fang-hu-zhong-xin}

### 分类 {#xiang-gang-wei-sheng-fang-hu-zhong-xin-fen-lei}

<Route author="nczitzk" example="/chp" path="/chp/:category?/:language?" paramsDesc={['分类，见下表，默认为重要资讯', '语言，见下表，默认为 `zh_tw`']}>

分类

| 重要资讯     | 新闻稿           | 应变级别      | 期刊及刊物  | 健康通告    |
| ------------ | ---------------- | ------------- | ----------- | ----------- |
| important_ft | press_data_index | ResponseLevel | publication | HealthAlert |

语言

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| en      | zh_cn    | zh_tw    |

</Route>

## 徐州市人民政府 {#xu-zhou-shi-ren-min-zheng-fu}

### 徐州市人力资源和社会保障局 {#xu-zhou-shi-ren-min-zheng-fu-xu-zhou-shi-ren-li-zi-yuan-he-she-hui-bao-zhang-ju}

<Route author="nczitzk" example="/gov/xuzhou/hrss" path="/gov/xuzhou/hrss/:category?" paramsDesc={['分类，见下表，默认为通知公告']}>

| 通知公告 | 要闻动态 | 县区动态 | 事业招聘 | 企业招聘 | 政声传递 |
| -------- | -------- | -------- | -------- | -------- | -------- |
|          | 001001   | 001002   | 001004   | 001005   | 001006   |

</Route>

## 浙江省土地使用权网上交易系统 {#zhe-jiang-sheng-tu-di-shi-yong-quan-wang-shang-jiao-yi-xi-tong}

### 公告信息 {#zhe-jiang-sheng-tu-di-shi-yong-quan-wang-shang-jiao-yi-xi-tong-gong-gao-xin-xi}

<Route author="Fatpandac" example="/zjgtjy/all" path="zjgtjy/:type" paramsDesc={['分类名']}>

| 全部公告 | 挂牌公告 | 拍卖公告 | 补充公告 |
| :------: | :------: | :------: | :------: |
|    all   |   gpgg   |   pmgg   |   bcgg   |

</Route>

## 中国工业和信息化部 {#zhong-guo-gong-ye-he-xin-xi-hua-bu}

### 政策解读 {#zhong-guo-gong-ye-he-xin-xi-hua-bu-zheng-ce-jie-du}

<Route author="Yoge-Code" example="/gov/miit/zcjd" path="/gov/miit/zcjd"/>

### 文件发布 {#zhong-guo-gong-ye-he-xin-xi-hua-bu-wen-jian-fa-bu}

<Route author="Fatpandac" example="/gov/miit/wjfb/ghs" path="/gov/miit/wjfb/:ministry" paramsDesc={['部门缩写，可以在对应 URL 中获取']}/>

### 意见征集 {#zhong-guo-gong-ye-he-xin-xi-hua-bu-yi-jian-zheng-ji}

<Route author="Fatpandac" example="/gov/miit/yjzj" path="/gov/miit/yjzj"/>

### 文件公示 {#zhong-guo-gong-ye-he-xin-xi-hua-bu-wen-jian-gong-shi}

<Route author="Yoge-Code" example="/gov/miit/wjgs" path="/gov/miit/wjgs"/>

### 政策文件 {#zhong-guo-gong-ye-he-xin-xi-hua-bu-zheng-ce-wen-jian}

<Route author="Yoge-Code" example="/gov/miit/zcwj" path="/gov/miit/zcwj"/>

## 中国国家认证认可监管管理员会 {#zhong-guo-guo-jia-ren-zheng-ren-ke-jian-guan-guan-li-yuan-hui}

### 监管动态 {#zhong-guo-guo-jia-ren-zheng-ren-ke-jian-guan-guan-li-yuan-hui-jian-guan-dong-tai}

<Route author="Yoge-Code" example="/gov/cnca/jgdt" path="/gov/cnca/jgdt"/>

### 行业动态 {#zhong-guo-guo-jia-ren-zheng-ren-ke-jian-guan-guan-li-yuan-hui-hang-ye-dong-tai}

<Route author="Yoge-Code" example="/gov/cnca/hydt" path="/gov/cnca/hydt"/>

### 最新通知 {#zhong-guo-guo-jia-ren-zheng-ren-ke-jian-guan-guan-li-yuan-hui-zui-xin-tong-zhi}

<Route author="Yoge-Code" example="/gov/cnca/zxtz" path="/gov/cnca/zxtz"/>

## 中国互联网络信息中心 {#zhong-guo-hu-lian-wang-luo-xin-xi-zhong-xin}

### 新闻中心 {#zhong-guo-hu-lian-wang-luo-xin-xi-zhong-xin-xin-wen-zhong-xin}

<Route author="nczitzk" example="/gov/cnnic/gywm/xwzx/xwzxtzgg/" path="/gov/cnnic/:path+" paramsDesc={['路径，默认为热点信息']}>

:::tip

路径处填写对应页面 URL 中 `http://www.cnnic.net.cn/` 后的字段。下面是一个例子。

若订阅 [热点信息](http://www.cnnic.net.cn/gywm/xwzx/rdxw) 则将对应页面 URL <http://www.cnnic.net.cn/gywm/xwzx/rdxw> 中 `http://www.cnnic.net.cn/` 后的字段 `gywm/xwzx/rdxw` 作为路径填入。此时路由为 [`/gov/cnnic/gywm/xwzx/rdxw`](https://rsshub.app/gov/cnnic/gywm/xwzx/rdxw)

:::

</Route>

## 中国军网 {#zhong-guo-jun-wang}

### 军队人才网 {#zhong-guo-jun-wang-jun-dui-ren-cai-wang}

<Route author="nczitzk" example="/81/81rc" path="/81/81rc/:path+" paramsDesc={['路径，默认为工作动态']}>

:::tip

若订阅 [文职人员 - 工作动态](https://81rc.81.cn/wzry/gzdt)，网址为 <https://81rc.81.cn/wzry/gzdt>。截取 `https://81rc.81.cn` 到末尾的部分 `/wzry/gzdt` 作为参数，此时路由为 [`/81/81rc/wzry/gzdt`](https://rsshub.app/81/81rc/wzry/gzdt)。

若订阅子分类 [文职人员 - 各部门各单位招考动态](https://81rc.81.cn/wzry/jwjgbmhddwzkdt)，网址为 <https://81rc.81.cn/wzry/jwjgbmhddwzkdt>。截取 `https://81rc.81.cn` 到末尾的部分 `/wzry/jwjgbmhddwzkdt` 作为参数，此时路由为 [`/81/81rc/wzry/jwjgbmhddwzkdt`](https://rsshub.app/81/81rc/wzry/jwjgbmhddwzkdt)。

:::

</Route>

## 中国科学技术协会 {#zhong-guo-ke-xue-ji-shu-xie-hui}

### 通用 {#zhong-guo-ke-xue-ji-shu-xie-hui-tong-yong}

<Route author="TonyRL" example="/cast" path="/cast/:column?" paramsDesc={['栏目 ID，即 URL 中的数字，默认为 `457`']} radar="1"/>

## 中国农工民主党 {#zhong-guo-nong-gong-min-zhu-dang}

### 新闻中心 {#zhong-guo-nong-gong-min-zhu-dang-xin-wen-zhong-xin}

<Route author="nczitzk" example="/ngd" path="/ngd/:slug?" paramsDesc={['见下文']}>

将目标栏目的网址拆解为 `http://www.ngd.org.cn/` 和后面的字段，去掉 `.htm` 后，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug

如：（要闻动态）<http://www.ngd.org.cn/xwzx/ywdt/index.htm> 的网址在 `http://www.ngd.org.cn/` 后的字段是 `xwzx/ywdt/index.htm`，则对应的 slug 为 `xwzx-ywdt-index`，对应的路由即为 `/ngd/xwzx-ywdt-index`

</Route>

## 中国人大网 {#zhong-guo-ren-da-wang}

<Route author="233yeee" example="/npc/c183" path="/npc/:caty" paramsDesc={['分类名，支持形如 `http://www.npc.gov.cn/npc/*/list.shtml` 的网站，传入 npc 之后的参数']}>

| 立法 | 监督 | 代表 | 理论 | 权威发布 | 滚动新闻 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| c183 | c184 | c185 | c189 | c12435   | c10134   |

</Route>

## 中国庭审公开网 {#zhong-guo-ting-shen-gong-kai-wang}

### 开庭信息 {#zhong-guo-ting-shen-gong-kai-wang-kai-ting-xin-xi}

<Route author="Fatpandac" example="/tingshen" path="/tingshen"/>

## 中国无线电协会业余无线电分会 {#zhong-guo-wu-xian-dian-xie-hui-ye-yu-wu-xian-dian-fen-hui}

### 最新资讯 {#zhong-guo-wu-xian-dian-xie-hui-ye-yu-wu-xian-dian-fen-hui-zui-xin-zi-xun}

<Route author="Misaka13514" example="/crac/2" path="/crac/:type?" paramsDesc={['类型，见下表，默认为全部']} radar="1" rssbud="1">

| 新闻动态 | 通知公告 | 政策法规 | 常见问题 | 资料下载 | English | 业余中继台 | 科普专栏 |
| -------- | -------- | -------- | -------- | -------- | ------- | ---------- | -------- |
| 1        | 2        | 3        | 5        | 6        | 7       | 8          | 9        |

</Route>

## 中国信息通信研究院 {#zhong-guo-xin-xi-tong-xin-yan-jiu-yuan}

### 白皮书 {#zhong-guo-xin-xi-tong-xin-yan-jiu-yuan-bai-pi-shu}

<Route author="nczitzk" example="/gov/caict/bps" path="/gov/caict/bps"/>

### 权威数据 {#zhong-guo-xin-xi-tong-xin-yan-jiu-yuan-quan-wei-shu-ju}

<Route author="nczitzk" example="/gov/caict/qwsj" path="/gov/caict/qwsj"/>

### CAICT 观点 {#zhong-guo-xin-xi-tong-xin-yan-jiu-yuan-caict-guan-dian}

<Route author="nczitzk" example="/gov/caict/caictgd" path="/gov/caict/caictgd"/>

## 中国银行保险监督管理委员会 {#zhong-guo-yin-hang-bao-xian-jian-du-guan-li-wei-yuan-hui}

<Route author="JkCheung" example="/cbirc/" path="/cbirc/:category" paramsDesc={['类目']}>

| 监管动态 | 公告通知 | 政策法规 | 政策解读 | 征求意见 | 行政许可 | 行政处罚 | 行政监管措施 | 工作论文 | 金融监管研究 | 统计信息 |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: | :----------: | :------: | :----------: | :------: |
|   jgdt   |   ggtz   |   zcfg   |   zcjd   |   zqyj   |   xzxk   |   xzcf   |    xzjgcs    |   gzlw   |    jrjgyj    |   tjxx   |

</Route>

## 中国载人航天 {#zhong-guo-zai-ren-hang-tian}

### 综合新闻 {#zhong-guo-zai-ren-hang-tian-zong-he-xin-wen}

<Route author="nczitzk" example="/gov/cmse/xwzx/zhxw" path="/gov/cmse/xwzx/zhxw" />

### 研制进展 {#zhong-guo-zai-ren-hang-tian-yan-zhi-jin-zhan}

<Route author="nczitzk" example="/gov/cmse/xwzx/yzjz" path="/gov/cmse/xwzx/yzjz" />

### 官方公告 {#zhong-guo-zai-ren-hang-tian-guan-fang-gong-gao}

<Route author="nczitzk" example="/gov/cmse/gfgg" path="/gov/cmse/gfgg" />

### 飞行任务 {#zhong-guo-zai-ren-hang-tian-fei-xing-ren-wu}

<Route author="nczitzk" example="/gov/cmse/fxrw" path="/gov/cmse/fxrw" />

### 任务动态 {#zhong-guo-zai-ren-hang-tian-ren-wu-dong-tai}

<Route author="nczitzk" example="/gov/cmse/fxrw/wtfx/rwdt" path="/gov/cmse/fxrw/:id/:category" paramsDesc={['任务 id，可在对应任务页 URL 中找到', '分类 id，见下表，可在对应任务页 URL 中找到']}>

:::tip

下表分类可能并不完整。请查看各飞行任务详情页获得完整分类。

:::

| 任务动态 | 综合新闻 | 视频 | 图片新闻 | 媒体聚焦 |
| -------- | -------- | ---- | -------- | -------- |
| rwdt     | zhxw     | sp   | tpxw     | mtjj     |

</Route>

### 空间科学 {#zhong-guo-zai-ren-hang-tian-kong-jian-ke-xue}

<Route author="nczitzk" example="/gov/cmse/kjkx/kjkxyjyyy" path="/gov/cmse/kjkx/:id" paramsDesc={['分类 id，见下表，可在对应分类页 URL 中找到']}>

| 空间科学研究与应用 | 航天技术试验 | 航天医学实验 |
| ------------------ | ------------ | ------------ |
| kjkxyjyyy          | htjssy       | htyxsy       |

</Route>

### 国际合作 {#zhong-guo-zai-ren-hang-tian-guo-ji-he-zuo}

<Route author="nczitzk" example="/gov/cmse/gjhz" path="/gov/cmse/gjhz" />

### 环球视野 {#zhong-guo-zai-ren-hang-tian-huan-qiu-shi-ye}

<Route author="nczitzk" example="/gov/cmse/hqsy/zxdta" path="/gov/cmse/hqsy/:id" paramsDesc={['分类 id，见下表，可在对应分类页 URL 中找到']}>

| 最新动态 | 美国 | 俄罗斯 | 欧洲 | 日本 | 印度 | 领域动态 |
| -------- | ---- | ------ | ---- | ---- | ---- | -------- |
| zxdta    | mg   | els    | oz   | rb   | yd   | lydt     |

</Route>

### 专题报道 {#zhong-guo-zai-ren-hang-tian-zhuan-ti-bao-dao}

<Route author="nczitzk" example="/gov/cmse/ztbd/xwfbh" path="/gov/cmse/ztbd/:id" paramsDesc={['分类 id，见下表，可在对应分类页 URL 中找到']}>

| 新闻发布会 | 学术大会 | 标准 | 新闻专题 |
| ---------- | -------- | ---- | -------- |
| xwfdh      | xsdh     | bz   | xwzt     |

</Route>

### 科普教育 {#zhong-guo-zai-ren-hang-tian-ke-pu-jiao-yu}

<Route author="nczitzk" example="/gov/cmse/kpjy/kphd" path="/gov/cmse/kpjy/:id" paramsDesc={['分类 id，见下表，可在对应分类页 URL 中找到']}>

| 科普活动 | 太空课堂 | 航天知识 |
| -------- | -------- | -------- |
| kphd     | tkkt     | ttzs     |

</Route>

## 中国证券监督管理委员会 {#zhong-guo-zheng-quan-jian-du-guan-li-wei-yuan-hui}

### 通用 {#zhong-guo-zheng-quan-jian-du-guan-li-wei-yuan-hui-tong-yong}

<Route author="chinobing LogicJake" example="/gov/csrc/news/c101975/zfxxgk_zdgk.shtml" path="/gov/csrc/news/:suffix*" paramsDesc={['路径，预设为 `c100028/common_xq_list.shtml`']} radar="1">

:::tip

路径处填写对应页面 URL 中 `http://www.csrc.gov.cn/csrc/` 后的字段。下面是一个例子。

若订阅 [证监会要闻](http://www.csrc.gov.cn/csrc/c100028/common_xq_list.shtml) 则将对应页面 URL <http://www.csrc.gov.cn/csrc/c100028/common_xq_list.shtml> 中 `http://www.csrc.gov.cn/csrc/` 后的字段 `c100028/common_xq_list.shtml` 作为路径填入。此时路由为 [`/gov/csrc/news/c100028/common_xq_list.shtml`](https://rsshub.app/gov/csrc/news/c100028/common_xq_list.shtml)

:::

</Route>

### 申请事项进度 {#zhong-guo-zheng-quan-jian-du-guan-li-wei-yuan-hui-shen-qing-shi-xiang-jin-du}

<Route author="hillerliao" example="/gov/csrc/auditstatus/9ce91cf2d750ee62de27fbbcb05fa483" path="/gov/csrc/auditstatus/:apply_id" paramsDesc={['事项类别id，`https://neris.csrc.gov.cn/alappl/home/xkDetail` 列表中各地址的 appMatrCde 参数']} radar="1"/>

## 中国政府网 {#zhong-guo-zheng-fu-wang}

### 数据 {#zhong-guo-zheng-fu-wang-shu-ju}

<Route author="nczitzk" example="/gov/shuju/shengzhu/baitiaorou" path="/gov/shuju/:caty/:item" paramsDesc={['分类，“生猪”对应`shengzhu`，“价格”对应`jiage`', '项目，见表']}>

生猪分类可选项目：

| 白条猪价格 | 生猪屠宰与活体交易 | 仔猪价格 | 生猪出场价与玉米价  | 生猪存栏信息和生猪疫情 |
| ---------- | ------------------ | -------- | ------------------- | ---------------------- |
| baitiaorou | huotijiaoyi        | zizhu    | chuchangjia_yumijia | cunlan_yiqing          |

价格分类可选项目：

| 商品价格 | 农产品价格  | 油价   |
| -------- | ----------- | ------ |
| shangpin | nongchanpin | youjia |

</Route>

### 图解 {#zhong-guo-zheng-fu-wang-tu-jie}

<Route author="nczitzk" example="/gov/xinwen/tujie/zhengce" path="/gov/xinwen/tujie/:caty" paramsDesc={['图解分类，见下表']}>

| 总理活动图解 | 每周一画 | 其他漫画 | 图解政策 | 其他图解 |
| ------------ | -------- | -------- | -------- | -------- |
| zlhd         | mzyh     | qtmh     | zhengce  | qttj     |

全部分类参见 [图解图表](http://www.gov.cn/xinwen/tujie/index.htm)

</Route>

### 最新政策 {#zhong-guo-zheng-fu-wang-zui-xin-zheng-ce}

<Route author="SettingDust" example="/gov/zhengce/zuixin" path="/gov/zhengce/zuixin"/>

### 最新文件 {#zhong-guo-zheng-fu-wang-zui-xin-wen-jian}

<Route author="ciaranchen" example="/gov/zhengce/wenjian" path="/gov/zhengce/wenjian/:pcodeJiguan?" paramsDesc={['文种分类。国令、国发、国函、国发明电、国办发、国办函、国办发明电、其他']} />

### 信息稿件 {#zhong-guo-zheng-fu-wang-xin-xi-gao-jian}

<Route author="ciaranchen" example="/gov/zhengce/govall/orpro=555&notpro=2&search_field=title" path="/gov/zhengce/govall/:advance?" paramsDesc={['高级搜索选项，将作为请求参数直接添加到url后。目前已知的选项及其意义如下。' ]} >

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

</Route>

### 国务院政策文件库 {#zhong-guo-zheng-fu-wang-guo-wu-yuan-zheng-ce-wen-jian-ku}

<Route author="zxx-457" example="/gov/zhengce/zhengceku/bmwj" path="/gov/zhengce/zhengceku/:department" paramsDesc={['库名']} />

### 政府新闻 {#zhong-guo-zheng-fu-wang-zheng-fu-xin-wen}

<Route author="EsuRt" example="/gov/news/:uid" path="/gov/news" paramsDesc={['分类名']}>

| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 | 政策文件 |
| :------: | :------: | :------: | :--------: | :------: |
|    bm    |    gd    |    yw    |     gwy    |  zhengce |

</Route>

### 吹风会 {#zhong-guo-zheng-fu-wang-chui-feng-hui}

<Route author="EsuRt" example="/gov/statecouncil/briefing" path="/gov/statecouncil/briefing"/>

## 中国政协网 {#zhong-guo-zheng-xie-wang}

### 栏目 {#zhong-guo-zheng-xie-wang-lan-mu}

<Route author="nczitzk" example="/cppcc" path="/cppcc/:slug?" paramsDesc={['见下文']}>

将目标栏目的网址拆解为 `http://www.cppcc.gov.cn/` 和后面的字段，去掉 `.shtml` 后，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug

如：（委员建言）<http://www.cppcc.gov.cn/zxww/newcppcc/wyjy/index.shtml> 的网址在 `http://www.cppcc.gov.cn/` 后的字段是 `zxww/newcppcc/wyjy/index.shtml`，则对应的 slug 为 `zxww-newcppcc-wyjy-index`，对应的路由即为 `/cppcc/zxww-newcppcc-wyjy-index`

</Route>

## 中国驻外使领馆 {#zhong-guo-zhu-wai-shi-ling-guan}

支持国家列表

加拿大 `CA`

-   大使馆: `/embassy/ca`

-   领事馆城市列表:

| 城市     | 路由                   |
| -------- | ---------------------- |
| 蒙特利尔 | `/embassy/ca/montreal` |

* * *

德国 `DE`

-   大使馆: `/embassy/de`

-   领事馆城市列表:

| 城市   | 路由                 |
| ------ | -------------------- |
| 慕尼黑 | `/embassy/de/munich` |

* * *

法国 `FR`

-   大使馆: `/embassy/fr`

-   领事馆城市列表:

| 城市       | 路由                     |
| ---------- | ------------------------ |
| 马赛       | `/embassy/fr/marseille`  |
| 斯特拉斯堡 | `/embassy/fr/strasbourg` |
| 里昂       | `/embassy/fr/lyon`       |

* * *

日本 `JP`

-   大使馆: `/embassy/jp`

-   领事馆城市列表:

| 城市   | 路由                   |
| ------ | ---------------------- |
| 长崎   | `/embassy/jp/nagasaki` |
| 大阪   | `/embassy/jp/osaka`    |
| 福冈   | `/embassy/jp/fukuoka`  |
| 名古屋 | `/embassy/jp/nagoya`   |
| 札幌   | `/embassy/jp/sapporo`  |
| 新潟   | `/embassy/jp/niigata`  |

* * *

韩国 `KR`

-   大使馆: `/embassy/kr`

-   领事馆城市列表:

| 城市 | 路由                  |
| ---- | --------------------- |
| 釜山 | `/embassy/kr/busan`   |
| 济州 | `/embassy/kr/jeju`    |
| 光州 | `/embassy/kr/gwangju` |

* * *

马来西亚 `MY`

-   大使馆: `/embassy/my`

* * *

新加坡 `SG`

-   大使馆: `/embassy/sg`

* * *

美国 `US`

-   大使馆: `/embassy/us`

-   领事馆城市列表:

| 城市   | 路由                       |
| ------ | -------------------------- |
| 纽约   | `/embassy/us/newyork`      |
| 芝加哥 | `/embassy/us/chicago`      |
| 旧金山 | `/embassy/us/sanfrancisco` |

* * *

英国 `UK`

-   大使馆: `/embassy/uk`

-   领事馆城市列表:

| 城市       | 路由                     |
| ---------- | ------------------------ |
| 爱丁堡     | `/embassy/uk/edinburgh`  |
| 贝尔法斯特 | `/embassy/uk/belfast`    |
| 曼彻斯特   | `/embassy/uk/manchester` |

### 大使馆重要通知 {#zhong-guo-zhu-wai-shi-ling-guan-da-shi-guan-zhong-yao-tong-zhi}

<Route author="HenryQW" example="/embassy/us" path="/embassy/:country" paramsDesc={['国家短代码, 见支持国家列表', '城市, 对应国家列表下的`领事馆城市列表`']} />

### 领事馆重要通知 {#zhong-guo-zhu-wai-shi-ling-guan-ling-shi-guan-zhong-yao-tong-zhi}

<Route author="HenryQW" example="/embassy/us/chicago" path="/embassy/:country/:city" paramsDesc={['国家短代码, 见支持国家列表', '城市, 对应国家列表下的`领事馆城市列表`']} />

## 中华人民共和国国家发展和改革委员会 {#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui}

### 新闻动态 {#zhong-hua-ren-min-gong-he-guo-guo-jia-fa-zhan-he-gai-ge-wei-yuan-hui-xin-wen-dong-tai}

<Route author="nczitzk" example="/gov/ndrc/xwdt" path="/gov/ndrc/xwdt/:caty?">

| 新闻发布 | 通知通告 | 委领导动态 | 司局动态 | 地方动态 |
| -------- | -------- | ---------- | -------- | -------- |
| xwfb     | tzgg     | wlddt      | sjdt     | dfdt     |

</Route>

## 中华人民共和国海关总署 {#zhong-hua-ren-min-gong-he-guo-hai-guan-zong-shu}

### 拍卖信息 / 海关法规 {#zhong-hua-ren-min-gong-he-guo-hai-guan-zong-shu-pai-mai-xin-xi-hai-guan-fa-gui}

<Route author="Jeason0228 TonyRL" example="/gov/customs/list/paimai" path="/gov/customs/list/:gchannel?" paramsDesc={['支持 `paimai` 及 `fagui` 2个频道，默认为 `paimai`']} anticrawler="1" puppeteer="1" radar="1" rssbud="1">

:::caution

由于区域限制，建议在国内 IP 的机器上自建

:::

</Route>

## 中华人民共和国教育部 {#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu}

### 新闻 {#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu-xin-wen}

<Route author="Crawler995" example="/gov/moe/policy_anal" path="/gov/moe/:type" paramsDesc={['分类名']}>

|   政策解读  |   最新文件  | 公告公示 |     教育部简报    |    教育要闻    |
| :---------: | :---------: | :------: | :---------------: | :------------: |
| policy_anal | newest_file |  notice  | edu_ministry_news | edu_focus_news |

</Route>

### 司局通知 {#zhong-hua-ren-min-gong-he-guo-jiao-yu-bu-si-ju-tong-zhi}

<Route author="TonyRL" example="/gov/moe/s78/A13" path="/gov/moe/s78/:column" paramsDesc={['司局 ID，可在 URL 找到']} radar="1"/>

## 中华人民共和国农业农村部 {#zhong-hua-ren-min-gong-he-guo-nong-ye-nong-cun-bu}

### 新闻 {#zhong-hua-ren-min-gong-he-guo-nong-ye-nong-cun-bu-xin-wen}

<Route author="Origami404" example="/gov/moa/xw/zwdt" path="/gov/moa/:suburl" paramsDesc={['分类目录的子 url']}>

更多例子:

-   `农业农村部动态`的网页链接是`http://www.moa.gov.cn/xw/zwdt/`, 对应的`suburl`是`xw/zwdt`
-   `财务公开`的网页链接是`http://www.moa.gov.cn/gk/cwgk_1/`, 对应的`suburl`是`gk/cwgk_1`
-   像[政策法规](http://www.moa.gov.cn/gk/zcfg/)这种页面 (`http://www.moa.gov.cn/gk/zcfg/`), 它**不是**一个合法的分类目录，它是`法律`, `行政法规`, `部门规章`等一堆栏目的集合，这时候请点开对应栏目的`更多 >>`进入栏目的目录，再根据上面的规则提取`suburl`
-   特别地，`图片新闻`对应的`suburl`为`xw/tpxw/`, `最新公开`对应的`suburl`为`govpublic`

</Route>

### 数据 - 最新发布 {#zhong-hua-ren-min-gong-he-guo-nong-ye-nong-cun-bu-shu-ju-zui-xin-fa-bu}

<Route author="MisteryMonster" example="/gov/moa/sjzxfb" path="/gov/moa/sjzxfb"/>

## 中华人民共和国人力资源和社会保障部 {#zhong-hua-ren-min-gong-he-guo-ren-li-zi-yuan-he-she-hui-bao-zhang-bu}

### 社保减免 {#zhong-hua-ren-min-gong-he-guo-ren-li-zi-yuan-he-she-hui-bao-zhang-bu-she-bao-jian-mian}

<Route author="ncziztk" example="/gov/mohrss/sbjm" path="/gov/mohrss/sbjm/:category?" paramsDesc={['分类，见下表']}>

| 要点新闻 | 政策文件 | 工作动态 | 媒体报道 | 图片新闻 |
| -------- | -------- | -------- | -------- | -------- |
| ydxw     | zcwj     | gzdt     | mtbd     | tpxw     |

</Route>

## 中华人民共和国商务部 {#zhong-hua-ren-min-gong-he-guo-shang-wu-bu}

### 政务公开 {#zhong-hua-ren-min-gong-he-guo-shang-wu-bu-zheng-wu-gong-kai}

<Route author="LogicJake" example="/gov/mofcom/article/xwfb" path="/gov/mofcom/article/:suffix+" paramsDesc={['支持形如 `http://www.mofcom.gov.cn/article/*` 的网站，传入 article 之后的后缀，支持多级']} radar="1" rssbud="1"/>

## 中华人民共和国生态环境部 {#zhong-hua-ren-min-gong-he-guo-sheng-tai-huan-jing-bu}

### 要闻动态 {#zhong-hua-ren-min-gong-he-guo-sheng-tai-huan-jing-bu-yao-wen-dong-tai}

<Route author="liuxsdev" example="/gov/mee/ywdt/hjywnews" path="/gov/mee/ywdt/:category?" paramsDesc={['分类名，预设 `szyw`']}/>

| 时政要闻 | 环境要闻 | 地方快讯 | 新闻发布 | 视频新闻 | 公示公告 |
| :------: | :------: | :------: | :------: | :------: | :------: |
|   szyw   | hjywnews |  dfnews  |   xwfb   |   spxw   |   gsgg   |

## 中华人民共和国退役军人事务部 {#zhong-hua-ren-min-gong-he-guo-tui-yi-jun-ren-shi-wu-bu}

### 中华人民共和国退役军人事务部 {#zhong-hua-ren-min-gong-he-guo-tui-yi-jun-ren-shi-wu-bu-zhong-hua-ren-min-gong-he-guo-tui-yi-jun-ren-shi-wu-bu}

<Route author="SunShinenny" example="/gov/veterans/bnxx" path="/gov/veterans/:type" paramsDesc={['分类名']}>

| 部内信息 | 政策解读 | 首页信息 |
| :------: | :------: | :------: |
|   bnxx   |   zcjd   |   index  |

</Route>

## 中华人民共和国外交部 {#zhong-hua-ren-min-gong-he-guo-wai-jiao-bu}

### 外交动态 {#zhong-hua-ren-min-gong-he-guo-wai-jiao-bu-wai-jiao-dong-tai}

<Route author="nczitzk" example="/gov/mfa/wjdt/fyrbt" path="/gov/mfa/wjdt/:category?" paramsDesc={['分类，见下表，默认为领导人活动']}>

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

</Route>

## 中华人民共和国住房和城乡建设部 {#zhong-hua-ren-min-gong-he-guo-zhu-fang-he-cheng-xiang-jian-she-bu}

### 政策发布 {#zhong-hua-ren-min-gong-he-guo-zhu-fang-he-cheng-xiang-jian-she-bu-zheng-ce-fa-bu}

<Route author="nczitzk" example="/gov/mohurd/policy" path="/gov/mohurd/policy"/>

## 中華民國國防部 {#zhong-hua-min-guo-guo-fang-bu}

### 即時軍事動態 {#zhong-hua-min-guo-guo-fang-bu-ji-shi-jun-shi-dong-tai}

<Route author="nczitzk" example="/gov/taiwan/mnd" path="/gov/taiwan/mnd"/>

## 中央纪委国家监委 {#zhong-yang-ji-wei-guo-jia-jian-wei}

### 要闻 {#zhong-yang-ji-wei-guo-jia-jian-wei-yao-wen}

<Route author="bigfei" example="/gov/ccdi/yaowenn" path="/gov/ccdi/:path+" paramsDesc={['路径，默认为 要闻']}>

:::tip

路径处填写对应页面 URL 中 `http://www.ccdi.gov.cn/` 后的字段。下面是一个例子。

若订阅 [审查调查 > 中管干部 > 执纪审查](https://www.ccdi.gov.cn/scdcn/zggb/zjsc/) 则将对应页面 URL <https://www.ccdi.gov.cn/scdcn/zggb/zjsc/> 中 `http://www.ccdi.gov.cn/` 后的字段 `scdcn/zggb/zjsc` 作为路径填入。此时路由为 [`/gov/ccdi/scdcn/zggb/zjsc`](https://rsshub.app/gov/ccdi/scdcn/zggb/zjsc)

:::

</Route>

## 中央网信办 {#zhong-yang-wang-xin-ban}

### 分类 {#zhong-yang-wang-xin-ban-fen-lei}

<Route author="drgnchan" example="/gov/cac/xxh" path="/gov/cac/:path+" paramsDesc={['路径，比如xxh表示信息化']} radar='1'>

:::tip

路径填写对应页面 URL 中间部分。例如：

首页 > 权威发布 > 办公室发布： <http://www.cac.gov.cn/qwfb/bgsfb/A090302index_1.htm>
此时，path 参数为：/qwfb/bgsfb

:::

</Route>

