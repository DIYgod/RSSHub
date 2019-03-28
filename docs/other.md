# 待分类

## 自如

<Route name="房源" author="DIYgod" example="/ziroom/room/sh/1/2/五角场" path="/ziroom/room/:city/:iswhole/:room/:keyword" :paramsDesc="['城市, 北京 bj; 上海 sh; 深圳 sz; 杭州 hz; 南京 nj; 广州 gz; 成都 cd; 武汉 wh; 天津 tj', '是否整租', '房间数', '关键词']"/>

## 快递

<Route name="快递" author="DIYgod" example="/express/youzhengguoji/CV054432809US" path="/express/:company/:number" :paramsDesc="['快递公司代码, 参考 [API URL 所支持的快递公司及参数说明](https://www.kuaidi100.com/download/api_kuaidi100_com%2820140729%29.doc)', '快递单号']">

::: warning 注意

快递送达后请及时取消订阅, 以免浪费服务器资源

:::

</Route>

## 腾讯吐个槽

<Route name="吐槽新帖" author="Qixingchen" example="/tucaoqq/post/28564/CdRI0728" path="/tucaoqq/post/:project/:key" :paramsDesc="['产品 ID', '产品密钥']"/>

## 今日头条

<Route name="关键词" author="uni-zheng" example="/jinritoutiao/keyword/AI" path="/jinritoutiao/keyword/:keyword" :paramsDesc="['关键词']"/>

## Readhub

<Route name="分类" author="WhiteWorld" example="/readhub/category/topic" path="/readhub/category/:category" :paramsDesc="['分类名']">

| 热门话题 | 科技动态 | 开发者资讯 | 区块链快讯 | 每日早报 |
| -------- | -------- | ---------- | ---------- | -------- |
| topic    | news     | technews   | blockchain | daily    |

</Route>

## 机核网

<Route name="分类" author="MoguCloud" example="/gcores/category/1" path="/gcores/category/:category" :paramsDesc="['分类名']">

| 文章 | 新闻 | 电台 |
| ---- | ---- | ---- |
| 1    | 2    | 9    |

</Route>

## ONE · 一个

<Route name="图片文字问答" author="fengkx" example="/one" path="/one"/>

## Hexo

<Route name="Next 主题博客" author="fengkx" example="/hexo/next/fengkx.top" path="/hexo/next/:url" :paramsDesc="['博客 Url 不带协议头']"/>

<Route name="Yilia 主题博客" author="aha2mao" example="/hexo/yilia/cloudstone.xin" path="/hexo/yilia/:url" :paramsDesc="['博客 Url 不带协议头']"/>

## Keep

<Route name="运动日记" author="Dectinc DIYgod" example="/keep/user/556b02c1ab59390afea671ea" path="/keep/user/:id" :paramsDesc="['Keep 用户 id']"/>

## 懂球帝

::: tip 提示

-   可以通过头条新闻+参数过滤的形式获得早报、专题等内容。
-   不支持 gif 集锦播放

:::

<Route name="头条新闻" author="dxmpalb" example="/dongqiudi/top_news" path="/dongqiudi/top_news"/>

<Route name="专题" author="dxmpalb" example="/dongqiudi/special/41" path="/dongqiudi/special/:id" :paramsDesc="['专题 id, 可自行通过 https://www.dongqiudi.com/special/+数字匹配']">

| 新闻大爆炸 | 懂球帝十佳球 | 懂球帝本周 MVP |
| ---------- | ------------ | -------------- |
| 41         | 52           | 53             |

</Route>

<Route name="早报" author="HenryQW" example="/dongqiudi/daily" path="/dongqiudi/daily"/>

::: tip 提示

部分球队和球员可能会有两个 id, 正确 id 应该由 `5000` 开头.

:::

<Route name="足球赛果" author="HenryQW" example="/dongqiudi/result/50001755" path="/dongqiudi/result/:team" :paramsDesc="['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']"/>

<Route name="球队新闻" author="HenryQW" example="/dongqiudi/team_news/50001755" path="/dongqiudi/team_news/:team" :paramsDesc="['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']"/>

<Route name="球员新闻" author="HenryQW" example="/dongqiudi/player_news/50000339" path="/dongqiudi/player_news/:id" :paramsDesc="['球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到']"/>

## 维基百科

<Route name="中国大陆新闻动态" author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

## Google

<Route name="谷歌学术关键词更新" author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" :paramsDesc="['查询语句, 支持「简单」和「高级」两种模式:']" crawlerBadge="1">

1. 简单模式, 例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2. 高级模式, 前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn&as_sdt=0,5), 点击左上角, 选择高级搜索并提交查询. 此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数. 例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

</Route>

<Route name="Google Doodles" author="xyqfer" example="/google/doodles/zh-CN" path="/google/doodles/:language?" :paramsDesc="['语言，默认为`zh-CN`简体中文，如需其他语言值可从[Google Doodles 官网](https://www.google.com/doodles)获取']" />

## 果壳网

<Route name="科学人" author="alphardex" example="/guokr/scientific" path="/guokr/scientific"/>

## 推酷

<Route name="周刊" author="zpcc" example="/tuicool/mags/tech" path="/tuicool/mags/:type" :paramsDesc="['类型如下']">

| 编程狂人 | 设计匠艺 | 创业周刊 | 科技周刊 |
| -------- | -------- | -------- | -------- |
| prog     | design   | startup  | tech     |

</Route>

## 爱范儿 ifanr

<Route name="爱范儿频道" author="HenryQW" example="/ifanr/app" path="/ifanr/:channel?" :paramsDesc="['默认 app，部分频道如下']">

-   频道为单一路径, 如 https://www.ifanr.com/`coolbuy` 则为 `/ifanr/coolbuy`.
-   频道包含多重路径, 如 https://www.ifanr.com/`category/intelligentcar` 则替换 `/` 为 `-` `/ifanr/category-intelligentcar`.

| AppSolution | 玩物志  | 董车会                  |
| ----------- | ------- | ----------------------- |
| app         | coolbuy | category-intelligentcar |

</Route>

## Apple

<Route name="更换和维修扩展计划" author="metowolf HenryQW" example="/apple/exchange_repair" path="/apple/exchange_repair/:country?" :paramsDesc="['苹果官网 URL 中的国家代码, 默认中国 `cn`']"/>

### App Store/Mac App Store

见 [#app-store-mac-app-store](/program-update.html#app-store-mac-app-store)

## 少数派 sspai

<Route name="最新上架付费专栏" author="HenryQW" example="/sspai/series" path="/sspai/series">

> 少数派专栏需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

</Route>

<Route name="Shortcuts Gallery" author="Andiedie" example="/sspai/shortcuts" path="/sspai/shortcuts" />

<Route name="Matrix" author="feigaoxyz" example="/sspai/matrix" path="/sspai/matrix" />

## 趣头条

<Route name="分类" author="alphardex" example="/qutoutiao/category/1" path="/qutoutiao/category/:cid" :paramsDesc="['分类 id']">

| 推荐 | 热点 | 娱乐 | 健康 | 养生 | 励志 | 科技 | ... |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| 255  | 1    | 6    | 42   | 5    | 4    | 7    | ... |

更多的 cid 可通过访问[官网](http://home.qutoutiao.net)切换分类，观察 url 获得。

</Route>

## The Verge

<Route name="The Verge" author="HenryQW" example="/verge" path="/verge">

通过提取文章全文, 以提供比官方源更佳的阅读体验.

</Route>

## 后续

<Route name="Live" author="ciaranchen" example="/houxu/live/5/original" path="/houxu/live/:id/:timeline?" :paramsDesc="['Live ID', '时间线筛选条件。默认为all。']">

| 全部 | 原创     | 精选     |
| ---- | -------- | -------- |
| all  | original | featured |

</Route>

<Route name="最新Live" author="ciaranchen" example="/houxu/lives/new" path="/houxu/lives/:type" :paramsDesc="['类型。实时进展`realtime` 或 最近关注`new`']" />

<Route name="最新专栏" author="ciaranchen" example="/houxu/events" path="/houxu/events"/>

## 老司机

<Route name="首页" author="xyqfer" example="/laosiji/feed" path="/laosiji/feed"/>
<Route name="24小时热门" author="xyqfer" example="/laosiji/hot" path="/laosiji/hot"/>
<Route name="节目" author="xyqfer" example="/laosiji/hotshow/128" path="/laosiji/hotshow/:id" :paramsDesc="['节目 id']"/>

## 99% Invisible

<Route name="Transcript" author="Ji4n1ng" example="/99percentinvisible/transcript" path="/99percentinvisible/transcript"/>

## 腾讯大家

<Route name="首页" author="xyqfer" example="/dajia" path="/dajia"/>
<Route name="作者作品" author="LogicJake" example="/dajia/author/404" path="/dajia/author/:uid" :paramsDesc="['作者id']"/>
<Route name="专栏" author="LogicJake" example="/dajia/zhuanlan/404" path="/dajia/zhuanlan/:uid" :paramsDesc="['专栏id']"/>

## 抽屉

<Route name="新热榜" author="xyqfer" example="/chouti/hot" path="/chouti/:subject?" :paramsDesc="['主题名称']">

| 热榜 | 42 区 | 段子  | 图片 | 挨踢 1024 | 你问我答 |
| ---- | ----- | ----- | ---- | --------- | -------- |
| hot  | news  | scoff | pic  | tec       | ask      |

</Route>

## 油价

<Route name="今日油价" author="xyqfer" example="/oilprice/shanghai" path="/oilprice/:area" :paramsDesc="['地区拼音，详见[成品油价格网](http://oil.usd-cny.com/)']"/>

## AutoTrader

<Route name="搜索结果" author="HenryQW" example="/autotrader/radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on" path="/autotrader/:query" :paramsDesc="['查询语句']">

1. 在 AutoTrader 选择筛选条件进行搜索
1. 复制查询结果 URL 中`?`后的部分，例如 `https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on` 则为 `radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on`

</Route>

## 百度

<Route name="百度趣画" author="xyqfer" example="/baidu/doodles" path="/baidu/doodles"/>

<Route name="搜索风云榜" author="xyqfer" example="/baidu/topwords/1" path="/baidu/topwords/:boardId?" :paramsDesc="['榜单 id, 默认为`1`']">

| 实时热点 | 今日热点 | 七日热点 | 民生热点 | 娱乐热点 | 体育热点 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 341      | 42       | 342      | 344      | 11       |

</Route>

## 搜狗

<Route name="搜狗特色LOGO" author="xyqfer" example="/sogou/doodles" path="/sogou/doodles"/>

## IT 桔子

<Route name="投融资事件" author="xyqfer" example="/itjuzi/invest" path="/itjuzi/invest"/>

<Route name="并购事件" author="xyqfer" example="/itjuzi/merge" path="/itjuzi/merge"/>

## 探物

<Route name="产品" author="xyqfer" example="/tanwu/products" path="/tanwu/products"/>

## 下厨房

<Route name="用户作品" author="xyqfer" example="/xiachufang/user/cooked/103309404" path="/xiachufang/user/cooked/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

<Route name="用户菜谱" author="xyqfer" example="/xiachufang/user/created/103309404" path="/xiachufang/user/created/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

<Route name="作品动态" author="xyqfer" example="/xiachufang/popular/hot" path="/xiachufang/popular/:timeframe?" :paramsDesc="['默认最新上传']">

| 正在流行 | 24 小时最佳 | 本周最受欢迎 | 新秀菜谱 | 月度最佳   |
| -------- | ----------- | ------------ | -------- | ---------- |
| hot      | pop         | week         | rising   | monthhonor |

</Route>

## TSSstatus（iOS 降级通道）

<Route name="Status" author="xyqfer" example="/tssstatus/j42dap/14W585a" path="/tssstatus/:board/:build" :paramsDesc="['平台 id', '版本 id']">

board 和 build 可在[这里](http://api.ineal.me/tss/status)查看

</Route>

## iDownloadBlog

<Route name="blog" author="HenryQW" example="/iDownloadBlog" path="/iDownloadBlog/index">

通过提取文章全文, 以提供比官方源更佳的阅读体验.

</Route>

## 9To5

<Route name="9To5 分站" author="HenryQW" example="/9to5/mac" path="/9to5/:type" :paramsDesc="['分站名字']">

支持分站：
| Mac | Google | Toys |
| --- | ------ | ---- |
| Mac | Google | Toys |

</Route>

## 刷屏

<Route name="最新" author="xyqfer" example="/weseepro/newest" path="/weseepro/newest"/>
<Route name="最新（无中间页）" author="xyqfer yefoenix" example="/weseepro/newest-direct" path="/weseepro/newest-direct"/>
<Route name="朋友圈" author="xyqfer" example="/weseepro/circle" path="/weseepro/circle"/>

## 虎嗅

<Route name="标签" author="xyqfer HenryQW" example="/huxiu/tag/291" path="/huxiu/tag/:id" :paramsDesc="['标签 id']" />

<Route name="搜索" author="xyqfer HenryQW" example="/huxiu/search/%E8%99%8E%E5%97%85%E6%97%A9%E6%8A%A5" path="/huxiu/search/:keyword" :paramsDesc="['关键字']" />

<Route name="作者" author="HenryQW" example="/huxiu/author/29318" path="/huxiu/author/:id" :paramsDesc="['用户 id']" />

## 扇贝

<Route name="打卡" author="DIYgod" example="/shanbay/checkin/ddwej" path="/shanbay/checkin/:id" :paramsDesc="['用户 id']" />

## 36kr

<Route name="搜索文章" author="xyqfer" example="/36kr/search/article/8%E7%82%B91%E6%B0%AA" path="/36kr/search/article/:keyword" :paramsDesc="['关键字']" />

## 中国大学 MOOC(慕课)

<Route name="最新" author="xyqfer" example="/icourse163/newest" path="/icourse163/newest" />

## 创业邦

<Route name="作者" author="xyqfer" example="/cyzone/author/1225562" path="/cyzone/author/:id" :paramsDesc="['作者 id']"/>

## 惠誉评级

<Route name="板块信息" author="LogicJake" example="/fitchratings/site/economics" path="/fitchratings/site/:type" :paramsDesc="['板块名称，在网址 site 后面']"/>

## 移动支付网

<Route name="新闻" author="LogicJake" example="/mpaypass/news" path="/mpaypass/news"/>

## 日报 | D2 资源库

<Route name="日报 | D2 资源库" author="Andiedie" example="/d2/daily" path="/d2/daily"/>

## 摩根大通研究所

<Route name="新闻" author="howel52" example="/jpmorganchase" path="/jpmorganchase"/>

## 多知网

<Route name="首页" author="WenryXu" example="/duozhi" path="/duozhi"/>

## 人人都是产品经理

<Route name="热门文章" author="WenryXu" example="/woshipm/popular" path="/woshipm/popular"/>

<Route name="用户收藏" author="LogicJake" example="/woshipm/bookmarks/324696" path="/woshipm/bookmarks/:id" :paramsDesc="['用户 id']"/>

<Route name="用户文章" author="LogicJake" example="/woshipm/user_article/324696" path="/woshipm/user_article/:id" :paramsDesc="['用户 id']"/>

## 鲸跃汽车

<Route name="首页" author="LogicJake" example="/whalegogo/home" path="/whalegogo/home"/>

## 每日安全

<Route name="推送" author="LogicJake" example="/security/pulses" path="/security/pulses"/>

## DoNews

<Route name="栏目" author="HenryQW" example="/donews" path="/donews/:column?" :paramsDesc="['栏目代码, 默认为首页.']">

| 首页 | 商业    | 创业     | 互娱 | 科技       | 专栏    |
| ---- | ------- | -------- | ---- | ---------- | ------- |
| (空) | company | business | ent  | technology | idonews |

</Route>

## WeGene

<Route name="最近更新" author="LogicJake" example="/wegene/newest" path="/wegene/newest"/>
<Route name="栏目" author="LogicJake" example="/wegene/column/all/all" path="/wegene/column/:type/:category" :paramsDesc="['栏目类型，all（全部项目） 或 weapp（专业版）','栏目分类']">

:::
type 为 all 时，category 参数不支持 cost 和 free
:::

| 全部 | 祖源分析 | 付费 | 遗传性疾病 | 药物指南 | 免费 | 运动基因 | 营养代谢   | 心理特质   | 健康风险 | 皮肤特性 | 遗传特征 |
| ---- | -------- | ---- | ---------- | -------- | ---- | -------- | ---------- | ---------- | -------- | -------- | -------- |
| all  | ancestry | cost | disease    | drug     | free | genefit  | metabolism | psychology | risk     | skin     | traits   |

</Route>

## Instapaper

<Route name="个人分享" author="LogicJake" example="/instapaper/person/viridiano" path="/instapaper/person"/>

## UI 中国

<Route name="推荐文章" author="WenryXu" example="/ui-cn/article" path="/ui-cn/article"/>

<Route name="个人作品" author="WenryXu" example="/ui-cn/user/85974" path="/ui-cn/user/:id" :paramsDesc="['用户id']"/>

## 12306

<Route name="最新动态" author="LogicJake" example="/12306/zxdt" path="/12306/zxdt/:id?" :paramsDesc="['铁路局id，可在 URL 中找到，不填默认显示所有铁路局动态']"/>

## 北京天文馆

<Route name="每日一图" author="HenryQW" example="/bjp/apod" path="/bjp/apod"/>

## 洛谷

<Route name="日报" author="LogicJake" example="/luogu/daily" path="/luogu/daily/:id?" :paramsDesc="['年度日报所在帖子id，可在 URL 中找到，不填默认为2019年日报']"/>

## 决胜网

<Route name="最新资讯" author="WenryXu" example="/juesheng" path="/juesheng"/>

## 播客 IBC 岩手放送｜ IBC ラジオ　イヤーマイッタマイッタ

<Route name="IBC岩手放送｜IBCラジオ　イヤーマイッタマイッタ" author="fengkx" example="/maitta" path="/maitta" />

## 博客: 敬维

<Route name="博客: 敬维" author="a180285" example="/blogs/jingwei.link" path="/blogs/jingwei.link"/>

## 裏垢女子まとめ

<Route name="主页" author="SettingDust"  example="/uraaka-joshi" path="/uraaka-joshi"/>

<Route name="用户" author="SettingDust"  example="/uraaka-joshi/_rrwq" path="/uraaka-joshi/:id" :paramsDesc="['用户名']"/>

## 西祠胡同

<Route name="频道" author="LogicJake" example="/xici" path="/xici/:id?" :paramsDesc="['频道id，默认为首页推荐']">

| 首页推荐 | 民生 | 情感 | 亲子 |
| -------- | ---- | ---- | ---- |
| (空)     | ms   | qg   | qz   |

</Route>

## 今日热榜

<Route name="榜单" author="LogicJake"  example="/tophub/Om4ejxvxEN" path="/tophub/:id" :paramsDesc="['榜单id，可在 URL 中找到']"/>

## 親子王國

<Route name="板块" author="LogicJake"  example="/babykingdom/19/view" path="/babykingdom/:id/:order?" :paramsDesc="['板块id，可在 URL 中找到', '排序方式']">

| 发帖时间 | 回复/查看 | 查看 | 最后发表 | 热门 |
| -------- | --------- | ---- | -------- | ---- |
| dateline | reply     | view | lastpost | heat |

</Route>

## 大众点评

<Route name="用户" author="brilon"  example="/dianping/user/35185271" path="/dianping/user/:id" :paramsDesc="['用户id，可在 URL 中找到']"/>

## InfoQ 中文

<Route name="推荐" author="brilon" example="/infoq/recommend" path="/infoq/recommend"/>

<Route name="话题" author="brilon" example="/infoq/topic/1" path="/infoq/topic/:id" :paramsDesc="['话题id，可在[InfoQ全部话题](https://www.infoq.cn/topics)页面找到URL里的话题id']" />

### 艾瑞

<route name="产业研究报告" author="brilon" example="/iresearch/report" path="/iresearch/report"/>
