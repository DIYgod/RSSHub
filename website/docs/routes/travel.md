# 🛫 Travel

## 12306 {#12306}

### 最新动态 {#12306-zui-xin-dong-tai}

<Route author="LogicJake" example="/12306/zxdt" path="/12306/zxdt/:id?" paramsDesc={['铁路局id，可在 URL 中找到，不填默认显示所有铁路局动态']}/>

### 售票信息 {#12306-shou-piao-xin-xi}

<Route author="Fatpandac" example="/12306/2022-02-19/重庆/永川东" path="/12306/:date/:from/:to/:type?" paramsDesc={['时间，格式为（YYYY-MM-DD）', '始发站', '终点站', '售票类型，成人和学生可选，默认为成人']}/>

## All the Flight Deals {#all-the-flight-deals}

### Flight Deals {#all-the-flight-deals-flight-deals}

<Route author="HenryQW" path="/atfd/:locations/:nearby?" example="/atfd/us+new%20york,gb+london/1" paramsDesc={['the departing city, consists of an 「ISO 3166-1 country code」 and a 「city name」.  Origin\'s ISO 3166-1 country code + city name, eg. `us+new york`, [https://rsshub.app/atfd/us+new york](https://rsshub.app/atfd/us+new%20york). Multiple origins are supported via a comma separated string, eg. `us+new york,gb+london`, [https://rsshub.app/atfd/us+new york,gb+london/](https://rsshub.app/atfd/us+new%20york,gb+london/).', 'whether includes nearby airports, optional value of 0 or 1, default to 0 (exclude nearby airports)']} >

For ISO 3166-1 country codes please refer to [Wikipedia ISO_3166-1](https://en.wikipedia.org/wiki/ISO_3166-1)

:::tip

If the city name contains a space like `Mexico City`, replace the space with `%20`, `Mexico%20City`.

:::

</Route>

## Hopper {#hopper}

### Flight Deals {#hopper-flight-deals}

<Route author="HenryQW" path="/hopper/:lowestOnly/:from/:to?" example="/hopper/1/LHR/PEK" paramsDesc={['set to `1` will return the cheapest deal only, instead of all deals, so you don\'t get spammed', 'origin airport IATA code', 'destination airport IATA code, if unset the destination will be set to `anywhere`']} >

This route returns a list of flight deals (in most cases, 6 flight deals) for a period defined by Hopper's algorithm, which means the travel date will be totally random (could be tomorrow or 10 months from now).

For airport IATA code please refer to [Wikipedia List of airports by IATA code](https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_A)

</Route>

## iMuseum {#imuseum}

### 展览信息 {#imuseum-zhan-lan-xin-xi}

<Route author="sinchang" example="/imuseum/shanghai/all" path="/imuseum/:city/:type?" paramsDesc={['如 shanghai, beijing', '不填则默认为 `all`']}>

| 全部 | 最新   | 热门 | 即将结束 | 即将开始 | 已结束   |
| ---- | ------ | ---- | -------- | -------- | -------- |
| all  | latest | hot  | end_soon | coming   | outdated |

</Route>

## National Geographic {#national-geographic}

### Latest Stories {#national-geographic-latest-stories}

<Route author="miles170"
    example="/nationalgeographic/latest-stories"
    path="/nationalgeographic/latest-stories" />

## 飞客茶馆 {#fei-ke-cha-guan}

### 优惠信息 {#fei-ke-cha-guan-you-hui-xin-xi}

<Route author="howel52" example="/flyert/preferential" path="/flyert/preferential" />

### 信用卡 {#fei-ke-cha-guan-xin-yong-ka}

<Route author="nicolaszf" example="/flyert/creditcard/zhongxin" path="/flyert/creditcard/:bank" paramsDesc={['信用卡板块各银行的拼音简称']}>

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

</Route>

## 福州地铁 {#fu-zhou-di-tie}

### 通知公告 {#fu-zhou-di-tie-tong-zhi-gong-gao}

<Route author="HankChow" example="/fzmtr/announcements" path="/fzmtr/announcements"/>

## 广州地铁 {#guang-zhou-di-tie}

### 新闻 {#guang-zhou-di-tie-xin-wen}

<Route author="HankChow" example="/guangzhoumetro/news" path="/guangzhoumetro/news"/>

## 国家地理 {#guo-jia-di-li}

### 分类 {#guo-jia-di-li-fen-lei}

<Route author="fengkx" example="/natgeo/environment/article" path="/natgeo/:cat/:type?" paramsDesc={['分类', '类型, 例如`https://www.natgeomedia.com/environment/photo/`对应 `cat`, `type` 分别为 `environment`, `photo`']}/>

## 活动行 {#huo-dong-xing}

### 最新活动 {#huo-dong-xing-zui-xin-huo-dong}

<Route author="kfgamehacker" example="/huodongxing/explore" path="/huodongxing/explore"/>

## 马蜂窝 {#ma-feng-wo}

### 游记 {#ma-feng-wo-you-ji}

<Route author="sinchang" example="/mafengwo/note/hot" path="/mafengwo/note/:type" paramsDesc={['目前支持两种, `hot` 代表热门游记, `latest` 代表最新游记']}/>

### 自由行 {#ma-feng-wo-zi-you-xing}

<Route author="nczitzk" example="/mafengwo/ziyouxing/10186" path="/mafengwo/ziyouxing/:code" paramsDesc={['目的地代码，可在该目的地页面的 URL 中找到']}>

目的地代码请参见 [这里](http://www.mafengwo.cn/mdd/)

</Route>

## 纽约布鲁克林博物馆 {#niu-yue-bu-lu-ke-lin-bo-wu-guan}

<Route author="chazeon"
example="/brooklynmuseum/exhibitions"
path="/brooklynmuseum/exhibitions/:state?"
paramsDesc={['展览进行的状态：`current` 对应展览当前正在进行，`past` 对应过去的展览，`upcoming` 对应即将举办的展览，默认为 `current`']}
/>

## 纽约大都会美术馆 {#niu-yue-da-dou-hui-mei-shu-guan}

<Route author="chazeon"
example="/metmuseum/exhibitions"
path="/metmusem/exhibitions/:state?"
paramsDesc={['展览进行的状态：`current` 对应展览当前正在进行，`past` 对应过去的展览，`upcoming` 对应即将举办的展览，默认为 `current`']} anticrawler="1"
/>

## 纽约古根海姆基金会 {#niu-yue-gu-gen-hai-mu-ji-jin-hui}

<Route author="chazeon" example="/guggenheim/exhibitions" path="/guggenheim/exhibitions" />

## 纽约新美术馆 {#niu-yue-xin-mei-shu-guan}

<Route author="chazeon" example="/newmuseum/exhibitions" path="/newmuseum/exhibitions" />

## 纽约犹太人博物馆 {#niu-yue-you-tai-ren-bo-wu-guan}

<Route author="chazeon" example="/jewishmuseum/exhibitions" path="/jewishmuseum/exhibitions" />

## 芝加哥当代艺术博物馆 {#zhi-jia-ge-dang-dai-yi-shu-bo-wu-guan}

<Route author="chazeon" example="/mcachicago/exhibitions" path="/mcachicago/exhibitions" />

## 中国国际航空公司 {#zhong-guo-guo-ji-hang-kong-gong-si}

### 服务公告 {#zhong-guo-guo-ji-hang-kong-gong-si-fu-wu-gong-gao}

<Route author="LandonLi" example="/airchina/announcement" path="/airchina/announcement" radar="1" />

## 中国美术馆 {#zhong-guo-mei-shu-guan}

### 美术馆新闻 {#zhong-guo-mei-shu-guan-mei-shu-guan-xin-wen}

<Route author="HenryQW" example="/namoc/announcement" path="/namoc/:type" paramsDesc={['新闻类型， 可选如下']}>

| 通知公告     | 新闻 | 媒体联报 | 展览预告   | 焦点专题 |
| ------------ | ---- | -------- | ---------- | -------- |
| announcement | news | media    | exhibition | specials |

</Route>

## 走进日本 {#zou-jin-ri-ben}

<Route author="laampui" example="/nippon/Politics" path="/nippon/:category?" paramsDesc={['默认政治，可选如下']}>

| 政治     | 经济    | 社会    | 展览预告 | 焦点专题           | 深度报道 | 话题         | 日本信息库 | 日本一蹩      | 人物访谈 | 编辑部通告    |
| -------- | ------- | ------- | -------- | ------------------ | -------- | ------------ | ---------- | ------------- | -------- | ------------- |
| Politics | Economy | Society | Culture  | Science,Technology | In-depth | japan-topics | japan-data | japan-glances | People   | Announcements |

</Route>

