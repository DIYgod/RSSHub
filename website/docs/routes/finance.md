# 💰 Finance

## AI 财经社 {#ai-cai-jing-she}

### 最新文章 {#ai-cai-jing-she-zui-xin-wen-zhang}

<Route author="nczitzk" example="/aicaijing/latest" path="/aicaijing/latest"/>

### 封面文章 {#ai-cai-jing-she-feng-mian-wen-zhang}

<Route author="nczitzk" example="/aicaijing/cover" path="/aicaijing/cover"/>

### 推荐资讯 {#ai-cai-jing-she-tui-jian-zi-xun}

<Route author="nczitzk" example="/aicaijing/recommend" path="/aicaijing/recommend"/>

### 热点 & 深度 {#ai-cai-jing-she-re-dian-shen-du}

<Route author="nczitzk" example="/aicaijing/information/14" path="/aicaijing/information/:id?" paramsDesc={['栏目 id，可在对应栏目页 URL 中找到，默认为 14，即热点最新']}>

| 栏目 id | 栏目        |
| ------- | ----------- |
| 14      | 热点 - 最新 |
| 5       | 热点 - 科技 |
| 9       | 热点 - 消费 |
| 7       | 热点 - 出行 |
| 13      | 热点 - 文娱 |
| 10      | 热点 - 教育 |
| 25      | 热点 - 地产 |
| 11      | 热点 - 更多 |
| 28      | 深度 - 出行 |
| 29      | 深度 - 科技 |
| 31      | 深度 - 消费 |
| 33      | 深度 - 教育 |
| 34      | 深度 - 更多 |
| 8       | 深度 - 地产 |
| 6       | 深度 - 文娱 |

</Route>

## AInvest {#ainvest}

### Latest Article {#ainvest-latest-article}

<Route author="TonyRL" example="/ainvest/article" path="/ainvest/article" radar="1"/>

### Latest News {#ainvest-latest-news}

<Route author="TonyRL" example="/ainvest/news" path="/ainvest/news" radar="1"/>

## BigQuant {#bigquant}

### 专题报告 {#bigquant-zhuan-ti-bao-gao}

<Route author="nczitzk" example="/bigquant/collections" path="/bigquant/collections"/>

## Bloomberg {#bloomberg}

### News {#bloomberg-news}

<Route author="bigfei" example="/bloomberg" path="/bloomberg/:site?" paramsDesc={['Site, see below, News by default']} anticrawler="1">

| Site | Name |
| ---- | ---- |
| / | News |
| bpol | Politics |
| bbiz | Business |
| markets | Markets |
| technology | Technology |
| green | Green |
| wealth | Wealth |
| pursuits | Pursuits |
| bview | Opinion |
| equality | Equality |
| businessweek | Businessweek |
| citylab | CityLab |

</Route>

### Authors {#bloomberg-authors}

<Route author="josh" example="/bloomberg/authors/ARbTQlRLRjE/matthew-s-levine" path="/bloomberg/authors/:id/:slug/:source?" paramsDesc={['Author ID, can be found in URL', 'Author Slug, can be found in URL', 'Data source, either `api` or `rss`,`api` by default']} anticrawler="1" radar="1"/>

## CFD {#cfd}

### Indices Dividend Adjustment {#cfd-indices-dividend-adjustment}

<Route author="HenryQW" example="/cfd/div_gbp" path="/cfd/div_gbp" />

## DL NEWS {#dl-news}

### All Articles {#dl-news-all-articles}

<Route author="Rjnishant530" example="/dlnews" path="/dlnews" radar="1"/>

### Topic {#dl-news-topic}

<Route author="Rjnishant530" example="/dlnews/fintech" path="/dlnews/:category" paramsDesc={['Find in Table. Defaults to All articles']} radar="1">

| Topic              | Link                |
|--------------------|---------------------|
| DeFi               | defi    |
| Fintech/VC/Deals   | fintech  |
| Llama U            | llama-u  |
| Markets            | markets  |
| People & Culture   | people-culture |
| Regulation         | regulation |
| Snapshot           | snapshot |
| Web3               | web3     |

</Route>

## DT 财经 {#dt-cai-jing}

### 数据洞察 {#dt-cai-jing-shu-ju-dong-cha}

<Route author="nczitzk" example="/dtcj/datainsight" path="/dtcj/datainsight/:id?" paramsDesc={['分类，见下表，默认为全部']}>

| 城数 | NEXT 情报局 | 专业精选 |
| ---- | ----------- | -------- |
| 3    | 1           | 4        |

</Route>

### 数据侠专栏 {#dt-cai-jing-shu-ju-xia-zhuan-lan}

<Route author="nczitzk" example="/dtcj/datahero" path="/dtcj/datahero/:category?" paramsDesc={['分类，见下表，默认为全部']}>

| 侠创 | 纽约数据科学学院 | RS 实验所 | 阿里云天池 |
| ---- | ---------------- | --------- | ---------- |
| 5    | 6                | 9         | 10         |

</Route>


## Finology Insider {#finology-insider}

### Bullets {#finology-insider-bullets}

<Route author="Rjnishant530" example="/finology/bullets" path="/finology/bullets" radar="1"/>

### Category {#finology-insider-category}

<Route author="Rjnishant530" example="/finology/success-stories" path="/finology/:category" paramDesc={['Refer Table below or find in URL']} radar="1">

:::note Category

| Category           | Link                  |
|---------------------|-----------------------|
| **Business**       | business              |
| Big Shots          | entrepreneurship     |
| Startups           | startups-india        |
| Brand Games        | success-stories       |
| Juicy Scams        | juicy-scams           |
| **Finance**        | finance               |
| Macro Moves        | economy               |
| News Platter       | market-news           |
| Tax Club           | tax                   |
| Your Money         | your-money            |
| **Invest**         | investing             |
| Stock Market       | stock-market          |
| Financial Ratios   | stock-ratios          |
| Investor's Psychology | behavioral-finance  |
| Mutual Funds       | mutual-fund           |

:::

</Route>

### Most Viewed {#finology-insider-most-viewed}

<Route author="Rjnishant530" example="/finology/most-viewed/monthly" path="/finology/most-viewed/:time" paramDesc={['Accepts : `alltime` or `monthly` only']} radar="1"/>

### Trending Topic {#finology-insider-trending-topic}

<Route author="Rjnishant530" example="/finology/tag/startups" path="/tag/:topic" paramDesc={['Refer Table below or find in URL']} radar="1">

Topic

| Topic              | Link                  |
|---------------------|-----------------------|
| Investment Decisions | investment-decisions |
| Investing 101       | investing-101         |
| Stock Markets      | stock-markets         |
| business news india | business-news-india   |
| Company Analysis   | company-analysis      |
| Business and brand tales | business-and-brand-tales |
| Featured           | featured              |
| Fundamental Analysis | fundamental-analysis |
| Business Story     | business-story        |
| All Biz            | all-biz               |
| Stock Analysis     | stock-analysis        |
| Automobile Industry | automobile-industry   |
| Indian Economy     | indian-economy        |
| Govt's Words       | govt%27s-words        |
| Behavioral Finance | behavioral-finance    |
| Global Economy     | global-economy        |
| Startups           | startups              |
| GST                | gst                   |
| Product Review     | product-review        |
| My Pocket          | my-pocket             |
| Business Games     | business-games        |
| Business Models    | business-models       |
| Indian Indices     | indian-indices        |
| Banking System     | banking-system        |
| Debt               | debt                  |
| World News         | world-news            |
| Technology         | technology            |
| Regulatory Bodies  | regulatory-bodies     |

</Route>

## finviz {#finviz}

### News {#finviz-news}

<Route author="nczitzk" example="/finviz" path="/finviz/:category?" paramsDesc={['Category, see below, News by default']}>

| News | Blog |
| ---- | ---- |
| news | blog |

</Route>

### US Stock News {#finviz-us-stock-news}

<Route author="HenryQW" example="/finviz/news/AAPL" path="/finviz/news/:ticker" paramsDesc={['The stock ticker']}/>

## Followin {#followin}

### Home {#followin-home}

<Route author="TonyRL" example="/followin" path="/followin/:categoryId?/:lang?" paramsDesc={['Category ID, see table below, `1` by default', 'Language, see table below, `en` by default']} radar="1">

Category ID

| For You | Market | Meme | BRC20 | NFT | Thread | In-depth | Tutorials | Videos |
| ------- | ------ | ---- | ----- | --- | ------ | -------- | --------- | ------ |
| 1       | 9      | 13   | 14    | 3   | 5      | 6        | 8         | 11     |

Language

| English | 简体中文 | 繁體中文 | Tiếng Việt |
| ------- | ------- | -------- | ---------- |
| en      | zh-Hans | zh-Hant  | vi      |

</Route>

### News {#followin-news}

<Route author="TonyRL" example="/followin/news" path="/followin/news/:lang?" paramsDesc={['Language, see table above, `en` by default']} radar="1" />

### KOL {#followin-kol}

<Route author="TonyRL" example="/followin/kol/4075592991" path="/followin/kol/:kolId/:lang?" paramsDesc={['KOL ID, can be found in URL', 'Language, see table above, `en` by default']} radar="1" />

### Topic {#followin-topic}

<Route author="TonyRL" example="/followin/topic/40" path="/followin/topic/:topicId/:lang?" paramsDesc={['Topic ID, can be found in URL', 'Language, see table above, `en` by default']} radar="1" />

### Tag {#followin-tag}

<Route author="TonyRL" example="/followin/tag/177008" path="/followin/tag/:tagId/:lang?" paramsDesc={['Tag ID, can be found in URL', 'Language, see table above, `en` by default']} radar="1" />

## Futubull 富途牛牛 {#futubull-fu-tu-niu-niu}

### Headlines {#futubull-fu-tu-niu-niu-headlines}

<Route author="Wsine nczitzk" example="/futunn/main" path="/futunn/main" />

## FX Markets {#fx-markets}

### Channel {#fx-markets-channel}

<Route author="mikkkee" example="/fx-markets/trading" path="/fx-markets/:channel" paramsDesc={['channel, can be found in the navi bar links at the home page']}>

| Trading | Infrastructure | Tech and Data | Regulation |
| ------- | -------------- | ------------- | ---------- |
| trading | infrastructure | tech-and-data | regulation |

</Route>

## Paradigm {#paradigm}

### Writing {#paradigm-writing}

<Route author="Fatpandac" example="/paradigm/writing" path="/paradigm/writing" />

## Seeking Alpha {#seeking-alpha}

### Summary {#seeking-alpha-summary}

<Route author="TonyRL" example="/seekingalpha/TSM/transcripts" path="/seekingalpha/:symbol/:category?" paramsDesc={['Stock symbol', 'Category, see below, `news` by default']} radar="1" rssbud="1">

| Analysis | News | Transcripts | Press Releases | Related Analysis |
| ------- | ------- | -------- | ---- | ------ |
| analysis | news | transcripts | press-releases | related-analysis |

</Route>

## Stock Edge {#stock-edge}

### Daily Updates News {#stock-edge-daily-updates-news}

<Route author="Rjnishant530" example="/stockedge/daily-updates/news" path="/stockedge/daily-updates/news" radar="1"/>

## TokenInsight {#tokeninsight}

:::tip

TokenInsight also provides official RSS, you can take a look at <https://api.tokeninsight.com/reference/rss>.

:::

### Blogs {#tokeninsight-blogs}

<Route author="fuergaosi233" example="/tokeninsight/blog/en" path="/tokeninsight/blog/:lang?" paramsDesc={['Language, see below, Chinese by default']} />

### Latest {#tokeninsight-latest}

<Route author="fuergaosi233" example="/tokeninsight/bulletin/en" path="/tokeninsight/bulletin/:lang?" paramsDesc={['Language, see below, Chinese by default']} />

### Research {#tokeninsight-research}

<Route author="fuergaosi233" example="/tokeninsight/report/en" path="/tokeninsight/report/:lang?" paramsDesc={['Language, see below, Chinese by default']}>

Language:

| Chinese | English |
| ------- | ------- |
| zh      | en      |

</Route>

## Unusual Whales {#unusual-whales}

### News Flow {#unusual-whales-news-flow}

<Route author="TonyRL" example="/unusualwhales/news" path="/unusualwhales/news" radar="1" rssbud="1" />

## WEEX 华尔街见闻旗下全球投资线上品牌 {#weex-hua-er-jie-jian-wen-qi-xia-quan-qiu-tou-zi-xian-shang-pin-pai}

### 资讯 {#weex-hua-er-jie-jian-wen-qi-xia-quan-qiu-tou-zi-xian-shang-pin-pai-zi-xun}

<Route author="SChen1024" example="/weexcn/news/1" path="/weexcn/news/:typeid" paramsDesc={['栏目代码, 按照表列出']} />

| 最新文章 | 市场要闻 | 交易策略 | 机构观点 | 投资学堂 | 行业观察 | 基金理财 | 分析师投稿 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- |
| 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8          |

## World Economic Forum 世界经济论坛 {#world-economic-forum-shi-jie-jing-ji-lun-tan}

### Report {#world-economic-forum-shi-jie-jing-ji-lun-tan-report}

<Route author="nczitzk" example="/weforum/report" path="/weforum/report/:lang?/:year?/:platform?" paramsDesc={['Language, see below, `en` by default', 'Year, filter by year, all by default', 'Platform, filter by platform, all by default']}>

Languages

| English | Español | Français | 中文 | 日本語 |
| ------- | ------- | -------- | ---- | ------ |
| en      | es      | fr       | cn   | jp     |

See filters in [Report](https://www.weforum.org/reports) for Year and Platform these two parameters.

</Route>

## 巴伦周刊中文版 {#ba-lun-zhou-kan-zhong-wen-ban}

### 栏目 {#ba-lun-zhou-kan-zhong-wen-ban-lan-mu}

<Route author="nczitzk" example="/barronschina" path="/barronschina/:id?" paramsDesc={['栏目 id，默认为快讯']}>

:::tip

栏目 id 留空则返回快讯，在对应页地址栏 `columnId=` 后可以看到。

:::

</Route>

## 百度股市通 {#bai-du-gu-shi-tong}

### 首页指数 {#bai-du-gu-shi-tong-shou-ye-zhi-shu}

<Route author="CaoMeiYouRen" example="/baidu/gushitong/index" path="/baidu/gushitong/index"></Route>

## 北京证券交易所 {#bei-jing-zheng-quan-jiao-yi-suo}

### 栏目 {#bei-jing-zheng-quan-jiao-yi-suo-lan-mu}

<Route author="nczitzk" example="/bse" path="/bse/:category?/:keyword?" paramsDesc={['分类，见下表，默认为本所要闻', '关键字，默认为空']}>

| 本所要闻       | 人才招聘 | 采购信息 | 业务通知  |
| -------------- | -------- | -------- | --------- |
| important_news | recruit  | purchase | news_list |

| 法律法规 | 公开征求意见   | 部门规章        | 发行融资  |
| -------- | -------------- | --------------- | --------- |
| law_list | public_opinion | regulation_list | fxrz_list |

| 持续监管  | 交易管理  | 市场管理  | 上市委会议公告 |
| --------- | --------- | --------- | -------------- |
| cxjg_list | jygl_list | scgl_list | meeting_notice |

| 上市委会议结果公告 | 上市委会议变更公告 | 并购重组委会议公告 |
| ------------------ | ------------------ | ------------------ |
| meeting_result     | meeting_change     | bgcz_notice        |

| 并购重组委会议结果公告 | 并购重组委会议变更公告 | 终止审核          | 注册结果     |
| ---------------------- | ---------------------- | ----------------- | ------------ |
| bgcz_result            | bgcz_change            | termination_audit | audit_result |

</Route>

## 财经网 {#cai-jing-wang}

### 滚动新闻 {#cai-jing-wang-gun-dong-xin-wen}

<Route author="TonyRL" example="/caijing/roll" path="/caijing/roll" rardr="1" rssbud="1"/>

## 财联社 {#cai-lian-she}

### 电报 {#cai-lian-she-dian-bao}

<Route author="nczitzk" example="/cls/telegraph" path="/cls/telegraph/:category?" paramsDesc={['分类，见下表，默认为全部']} radar="1">

| 看盘  | 公司         | 解读    | 加红 | 推送  | 提醒   | 基金 | 港股 |
| ----- | ------------ | ------- | ---- | ----- | ------ | ---- | ---- |
| watch | announcement | explain | red  | jpush | remind | fund | hk   |

</Route>

### 深度 {#cai-lian-she-shen-du}

<Route author="nczitzk" example="/cls/depth/1000" path="/cls/depth/:category?" paramsDesc={['分类代码，可在首页导航栏的目标网址 URL 中找到']} radar="1">

| 头条 | 股市 | 港股 | 环球 | 公司 | 券商 | 基金 | 地产 | 金融 | 汽车 | 科创 | 创业版 | 品见 | 期货 | 投教 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- |
| 1000 | 1003 | 1135 | 1007 | 1005 | 1118 | 1110 | 1006 | 1032 | 1119 | 1111 | 1127   | 1160 | 1124 | 1176 |

</Route>

### 热门文章排行榜 {#cai-lian-she-re-men-wen-zhang-pai-hang-bang}

<Route author="5upernova-heng nczitzk" example="/cls/hot" path="/cls/hot" radar="1"/>

## 第一财经杂志 {#di-yi-cai-jing-za-zhi}

### 首页 {#di-yi-cai-jing-za-zhi-shou-ye}

<Route author="nczitzk" example="/cbnweek" path="/cbnweek"/>

## 东方财富 {#dong-fang-cai-fu}

### 天天基金用户动态 {#dong-fang-cai-fu-tian-tian-ji-jin-yong-hu-dong-tai}

<Route author="zidekuls" example="/eastmoney/ttjj/user/6551094298949188" path="/eastmoney/ttjj/user/:uid" paramsDesc={['用户id, 可以通过天天基金App分享用户主页到浏览器，在相应的URL中找到']}/>

### 搜索 {#dong-fang-cai-fu-sou-suo}

<Route author="drgnchan" example="/eastmoney/search/web3" path="/eastmoney/search/:keyword" paramsDesc={['关键词，可以设置为自己需要检索的关键词']} radar="1"/>

### 研究报告 {#dong-fang-cai-fu-yan-jiu-bao-gao}

<Route author="syzq" example="/eastmoney/report/strategyreport" path="/eastmoney/report/:category" paramsDesc={['研报类型']}>

| 策略报告       | 宏观研究    | 券商晨报     | 行业研究 |
| -------------- | ----------- | ------------ | -------- |
| strategyreport | macresearch | brokerreport | industry |

</Route>

## 法布财经 {#fa-bu-cai-jing}

### 新闻 {#fa-bu-cai-jing-xin-wen}

<Route author="nczitzk" example="/fastbull/news" path="/fastbull/news"/>

### 快讯 {#fa-bu-cai-jing-kuai-xun}

<Route author="nczitzk" example="/fastbull/express-news" path="/fastbull/express-news"/>

## 格隆汇 {#ge-long-hui}

### 首页 {#ge-long-hui-shou-ye}

<Route author="TonyRL" example="/gelonghui/home" path="/gelonghui/home/:tag?" paramsDesc={['分类标签，见下表，默认为 `web_home_page`']} radar="1" rssbud="1">

| 推荐          | 股票  | 基金 | 新股      | 研报     |
| ------------- | ----- | ---- | --------- | -------- |
| web_home_page | stock | fund | new_stock | research |

</Route>

### 用户文章 {#ge-long-hui-yong-hu-wen-zhang}

<Route author="nczitzk" example="/gelonghui/user/5273" path="/gelonghui/user/:id" paramsDesc={['用户编号，可在用户页 URL 中找到']} radar="1" rssbud="1"/>

### 主题文章 {#ge-long-hui-zhu-ti-wen-zhang}

<Route author="nczitzk" example="/gelonghui/subject/4" path="/gelonghui/subject/:id"  paramsDesc={['主题编号，可在主题页 URL 中找到']} radar="1" rssbud="1"/>

### 搜索关键字 {#ge-long-hui-sou-suo-guan-jian-zi}

<Route author="nczitzk" example="/gelonghui/keyword/早报" path="/gelonghui/keyword/:keyword" paramsDesc={['搜索关键字']} radar="1" rssbud="1"/>

### 最热文章 {#ge-long-hui-zui-re-wen-zhang}

<Route author="TonyRL" example="/gelonghui/hot-article" path="/gelonghui/hot-article/:type?" paramsDesc={['`day` 为日排行，`week` 为周排行，默认为 `day`']} radar="1" rssbud="1"/>

### 实时快讯 {#ge-long-hui-shi-shi-kuai-xun}

<Route author="TonyRL" example="/gelonghui/live" path="/gelonghui/live" radar="1" rssbud="1"/>

## 国家金融与发展实验室 {#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi}

### 研究 {#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu}

<Route author="Fatpandac" example="/nifd/research/3333d2af-91d6-429b-be83-28b92f31b6d7" path="/nifd/research/:categoryGuid?" paramsDesc={['资讯类型，默认为周报']}>

资讯类型可以从网址中获取，如：

`http://www.nifd.cn/Research?categoryGuid=7a6a826d-b525-42aa-b550-4236e524227f` 对应 `/nifd/research/7a6a826d-b525-42aa-b550-4236e524227f`

</Route>

## 汇通网 {#hui-tong-wang}

### 7x24 小时快讯 {#hui-tong-wang-7x24-xiao-shi-kuai-xun}

<Route author="occupy5 dousha" example="/fx678/kx" path="/fx678/kx" radar="1"/>

## 金十数据 {#jin-shi-shu-ju}

### 市场快讯 {#jin-shi-shu-ju-shi-chang-kuai-xun}

<Route author="laampui" example="/jin10" path="/jin10/:important?" paramsDesc={['只看重要，任意值开启，留空关闭']} radar="1"/>

### 主题文章 {#jin-shi-shu-ju-zhu-ti-wen-zhang}

<Route author="miles170" example="/jin10/topic/396" path="/jin10/topic/:id" radar="1"/>

## 老虎社区 {#lao-hu-she-qu}

### 个人主页 {#lao-hu-she-qu-ge-ren-zhu-ye}

<Route author="Fatpandac" example="/laohu8/personal/3527667596890271" path="/laohu8/personal/:id" paramsDesc={['用户 ID，见网址链接']} rssbud="1" radar="1"/>

## 麦肯锡 {#mai-ken-xi}

### 洞见 {#mai-ken-xi-dong-jian}

<Route author="laampui" example="/mckinsey/cn" path="/mckinsey/cn/:category?" paramsDesc={['分类，见下表，默认为全部']} radar="1" rssbud="1">

| 分类 | 分类名             |
| ---- | ------------------ |
| 25   | 全部洞见           |
| 2    | 汽车               |
| 3    | 金融服务           |
| 4    | 消费者             |
| 5    | 医药               |
| 7    | 数字化             |
| 8    | 制造业             |
| 9    | 私募               |
| 10   | 技术，媒体与通信   |
| 12   | 城市化与可持续发展 |
| 13   | 创新               |
| 16   | 人才与领导力       |
| 18   | 宏观经济           |
| 19   | 麦肯锡全球研究院   |
| 37   | 麦肯锡季刊         |
| 41   | 资本项目和基础设施 |
| 42   | 旅游、运输和物流   |
| 45   | 全球基础材料       |

</Route>

## 每经网 {#mei-jing-wang}

### 分类 {#mei-jing-wang-fen-lei}

<Route author="nczitzk" example="/nbd" path="/nbd/:id?" paramsDesc={['分类 id，见下表，默认为要闻']}>

| 头条 | 要闻 | 图片新闻 | 推荐 |
| ---- | ---- | -------- | ---- |
| 2    | 3    | 4        | 5    |

</Route>

### 重磅原创 {#mei-jing-wang-zhong-bang-yuan-chuang}

<Route author="MeXunco" example="/nbd/daily" path="/nbd/daily"/>

## 前瞻网 {#qian-zhan-wang}

### 文章列表 {#qian-zhan-wang-wen-zhang-lie-biao}

<Route author="moke8" example="/qianzhan/analyst/column/all" path="/qianzhan/analyst/column/:type?" paramsDesc={['分类，见下表']}>

| 全部 | 研究员专栏 | 规划师专栏 | 观察家专栏 |
| ---- | ---------- | ---------- | ---------- |
| all  | 220        | 627        | 329        |

</Route>

### 排行榜 {#qian-zhan-wang-pai-hang-bang}

<Route author="moke8" example="/qianzhan/analyst/rank/week" path="/qianzhan/analyst/rank/:type?" paramsDesc={['分类，见下表']}>

| 周排行 | 月排行 |
| ------ | ------ |
| week   | month  |

</Route>

## 上海证券交易所 {#shang-hai-zheng-quan-jiao-yi-suo}

### 本所业务指南与流程 {#shang-hai-zheng-quan-jiao-yi-suo-ben-suo-ye-wu-zhi-nan-yu-liu-cheng}

<Route author="nczitzk" example="/sse/lawandrules" path="/sse/lawandrules/:slug?" paramsDesc={['见下文，默认为 `latest`']} radar="1" rssbud="1">

将目标栏目的网址拆解为 `https://www.sse.com.cn/lawandrules/guide/` 和后面的字段，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug

如：（最新指南与流程）<https://www.sse.com.cn/lawandrules/guide/latest> 的网址在 `https://www.sse.com.cn/lawandrules/guide/` 后的字段是 `latest`，则对应的 slug 为 `latest`，对应的路由即为 `/sse/lawandrules/latest`

又如：（主板业务指南与流程 - 发行承销业务指南）<https://www.sse.com.cn/lawandrules/guide/zbywznylc/fxcxywzn> 的网址在 `https://www.sse.com.cn/lawandrules/guide/` 后的字段是 `zbywznylc/fxcxywzn`，则对应的 slug 为 `zbywznylc-fxcxywzn`，对应的路由即为 `/sse/lawandrules/zbywznylc-fxcxywzn`

</Route>

### 上市公司信息最新公告披露 {#shang-hai-zheng-quan-jiao-yi-suo-shang-shi-gong-si-xin-xi-zui-xin-gong-gao-pi-lu}

<Route author="harveyqiu" example="/sse/disclosure/beginDate=2018-08-18&endDate=2020-08-25&productId=600696" path="/sse/disclosure/:query?"  paramsDesc={['筛选条件，见示例']} radar="1" rssbud="1"/>

### 可转换公司债券公告 {#shang-hai-zheng-quan-jiao-yi-suo-ke-zhuan-huan-gong-si-zhai-quan-gong-gao}

<Route author="kt286" example="/sse/convert/beginDate=2018-08-18&endDate=2019-08-18&companyCode=603283&title=股份" path="/sse/convert/:query?" paramsDesc={['筛选条件，见示例']} radar="1" rssbud="1"/>

### 科创板项目动态 {#shang-hai-zheng-quan-jiao-yi-suo-ke-chuang-ban-xiang-mu-dong-tai}

<Route author="Jeason0228" example="/sse/renewal" path="/sse/renewal" radar="1" rssbud="1"/>

### 监管问询 {#shang-hai-zheng-quan-jiao-yi-suo-jian-guan-wen-xun}

<Route author="Jeason0228" example="/sse/inquire" path="/sse/inquire" radar="1" rssbud="1"/>

## 深圳证券交易所 {#shen-zhen-zheng-quan-jiao-yi-suo}

### 上市公告 - 可转换债券 {#shen-zhen-zheng-quan-jiao-yi-suo-shang-shi-gong-gao-ke-zhuan-huan-zhai-quan}

<Route author="Jeason0228 nczitzk" example="/szse/notice" path="/szse/notice"/>

### 问询函件 {#shen-zhen-zheng-quan-jiao-yi-suo-wen-xun-han-jian}

<Route author="Jeason0228 nczitzk" example="/szse/inquire" path="/szse/inquire/:category?/:select?/:keyword?" paramsDesc={['类型，见下表，默认为 `0` 即 主板', '函件类别, 见下表，默认为全部函件类别', '公司代码或简称，默认为空']}>

类型

| 主板 | 创业板 |
| ---- | ------ |
| 0    | 1      |

函件类别

| 全部函件类别 | 非许可类重组问询函 | 问询函 | 违法违规线索分析报告 | 许可类重组问询函 | 监管函（会计师事务所模板） | 提请关注函（会计师事务所模板） | 年报问询函 | 向中介机构发函 | 半年报问询函 | 关注函 | 公司部函 | 三季报问询函 |
| ------------ | ------------------ | ------ | -------------------- | ---------------- | -------------------------- | ------------------------------ | ---------- | -------------- | ------------ | ------ | -------- | ------------ |

</Route>

### 最新规则 {#shen-zhen-zheng-quan-jiao-yi-suo-zui-xin-gui-ze}

<Route author="nczitzk" example="/szse/rule" path="/szse/rule"/>

### 创业板项目动态 {#shen-zhen-zheng-quan-jiao-yi-suo-chuang-ye-ban-xiang-mu-dong-tai}

<Route author="nczitzk" example="/szse/projectdynamic" path="/szse/projectdynamic/:type?/:stage?/:status?" paramsDesc={['类型，见下表，默认为IPO', '阶段，见下表，默认为全部', '状态，见下表，默认为全部']}>

类型

| IPO | 再融资 | 重大资产重组 |
| --- | ------ | ------------ |
| 1   | 2      | 3            |

阶段

| 全部 | 受理 | 问询 | 上市委会议 |
| ---- | ---- | ---- | ---------- |
| 0    | 10   | 20   | 30         |

| 提交注册 | 注册结果 | 中止 | 终止 |
| -------- | -------- | ---- | ---- |
| 35       | 40       | 50   | 60   |

状态

| 全部 | 新受理 | 已问询 | 通过 | 未通过 |
| ---- | ------ | ------ | ---- | ------ |
| 0    | 20     | 30     | 45   | 44     |

| 暂缓审议 | 复审通过 | 复审不通过 | 提交注册 |
| -------- | -------- | ---------- | -------- |
| 46       | 56       | 54         | 60       |

| 注册生效 | 不予注册 | 补充审核 | 终止注册 |
| -------- | -------- | -------- | -------- |
| 70       | 74       | 78       | 76       |

| 中止 | 审核不通过 | 撤回 |
| ---- | ---------- | ---- |
| 80   | 90         | 95   |

</Route>

## 首席经济学家论坛 {#shou-xi-jing-ji-xue-jia-lun-tan}

### 最新更新 {#shou-xi-jing-ji-xue-jia-lun-tan-zui-xin-geng-xin}

<Route author="FledgeXu" example="/chinacef" path="/chinacef"/>

### 专家 {#shou-xi-jing-ji-xue-jia-lun-tan-zhuan-jia}

<Route author="kdanfly" example="/chinacef/17/" path="/chinacef/:experts_id/" paramsDesc={['专家编号']} radar="1" rssbud="1">

| 李迅雷 | 夏斌 |
| ------ | ---- |
| 17     | 35   |

</Route>

### 金融热点 {#shou-xi-jing-ji-xue-jia-lun-tan-jin-rong-re-dian}

<Route author="kdanfly" example="/chinacef/portal/hot" path="/chinacef/portal/hot" radar="1" rssbud="1" />

## 淘股吧 {#tao-gu-ba}

### 淘股论坛 {#tao-gu-ba-tao-gu-lun-tan}

<Route author="emdoe nczitzk" example="/taoguba" path="/taoguba/:category?" paramsDesc={['分类，见下表，默认为社区总版']}>

| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |
| -------- | -------- | -------- | -------- |
| bbs      | zongban  | jinghua  | dianzan  |

</Route>

### 用户博客 {#tao-gu-ba-yong-hu-bo-ke}

<Route author="emdoe nczitzk" example="/taoguba/blog/252069" path="/taoguba/blog/:id" paramsDesc={['博客 id，可在对应博客页中找到']} />

## 乌拉邦 {#wu-la-bang}

### 最新研报 {#wu-la-bang-zui-xin-yan-bao}

<Route author="Fatpandac" example="/ulapia/research/latest" path="/ulapia/research/latest"/>

### 频道 {#wu-la-bang-pin-dao}

<Route author="Fatpandac" example="/ulapia/reports/stock_research" path="/ulapia/reports/:category?" paramsDesc={['频道类型，默认为券商晨报（今日晨报）']}>

|    个股研报    |      行业研报     |      策略研报     |    宏观研报    |   新股研报   | 券商晨报（今日晨报） |
| :------------: | :---------------: | :---------------: | :------------: | :----------: | :------------------: |
| stock_research | industry_research | strategy_research | macro_research | ipo_research |    brokerage_news    |

</Route>

## 雪球 {#xue-qiu}

### 今日话题 {#xue-qiu-jin-ri-hua-ti}

<Route author="nczitzk" example="/xueqiu/today" path="/xueqiu/today"/>

### 用户动态 {#xue-qiu-yong-hu-dong-tai}

<Route author="imlonghao" example="/xueqiu/user/8152922548" path="/xueqiu/user/:id/:type?" paramsDesc={['用户 id, 可在用户主页 URL 中找到', '动态的类型, 不填则默认全部']}>

| 原发布 | 长文 | 问答 | 热门 | 交易 |
| ------ | ---- | ---- | ---- | ---- |
| 0      | 2    | 4    | 9    | 11   |

</Route>

### 用户收藏动态 {#xue-qiu-yong-hu-shou-cang-dong-tai}

<Route author="imlonghao" example="/xueqiu/favorite/8152922548" path="/xueqiu/favorite/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']}/>

### 用户自选动态 {#xue-qiu-yong-hu-zi-xuan-dong-tai}

<Route author="hillerliao" example="/xueqiu/user_stock/1247347556" path="/xueqiu/user_stock/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']}/>

### 用户专栏 {#xue-qiu-yong-hu-zhuan-lan}

<Route author="TonyRL" example="/xueqiu/column/9962554712" path="/xueqiu/column/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']} radar="1" rssbud="1"/>

### 蛋卷基金净值更新 {#xue-qiu-dan-juan-ji-jin-jing-zhi-geng-xin}

<Route author="HenryQW NathanDai" example="/xueqiu/fund/040008" path="/xueqiu/fund/:id" paramsDesc={['基金代码, 可在基金主页 URL 中找到. 此路由的数据为场外基金 (`F`开头)']}/>

### 组合最新调仓信息 {#xue-qiu-zu-he-zui-xin-tiao-cang-xin-xi}

<Route author="ZhishanZhang" example="/xueqiu/snb/ZH1288184" path="/xueqiu/snb/:id" paramsDesc={['组合代码, 可在组合主页 URL 中找到.']}/>

### 股票信息 {#xue-qiu-gu-piao-xin-xi}

<Route author="YuYang" example="/xueqiu/stock_info/SZ000002" path="/xueqiu/stock_info/:id/:type?" paramsDesc={['股票代码（需要带上交易所）', '动态的类型, 不填则为股票公告']}>

| 公告         | 新闻 | 研报     |
| ------------ | ---- | -------- |
| announcement | news | research |

</Route>

### 股票评论 {#xue-qiu-gu-piao-ping-lun}

<Route author="zytomorrow" example="/xueqiu/stock_comments/SZ002626" path="/xueqiu/stock_comments/:id/:titleLength?" paramsDesc={['股票代码（需要带上交易所）', '标题长度']}/>

### 热帖 {#xue-qiu-re-tie}

<Route author="hillerliao" example="/xueqiu/hots" path="/xueqiu/hots"/>

## 有知有行 {#you-zhi-you-xing}

### 有知文章 {#you-zhi-you-xing-you-zhi-wen-zhang}

<Route author="broven Fatpandac nczitzk" example="/youzhiyouxing/materials" path="/youzhiyouxing/materials/:id?" paramsDesc={['分类，见下表，默认为全部']}>

| 全部 | 知行小酒馆 | 知行黑板报 | 无人知晓 | 孟岩专栏 | 知行读书会 | 你好，同路人 |
| :--: | :--------: | :--------: | :------: | :------: | :--------: | :----------: |
|   0  |      4     |      2     |    10    |     1    |      3     |      11      |

</Route>

## 证券时报网 {#zheng-quan-shi-bao-wang}

### 栏目 {#zheng-quan-shi-bao-wang-lan-mu}

<Route author="nczitzk" example="/stcn/yw" path="/stcn/:id?" paramsDesc={['栏目 id，见下表，默认为要闻']}>

| 快讯 | 要闻 | 股市 | 公司    | 数据 |
| ---- | ---- | ---- | ------- | ---- |
| kx   | yw   | gs   | company | data |

| 基金 | 金融    | 评论    | 产经 | 创投 |
| ---- | ------- | ------- | ---- | ---- |
| fund | finance | comment | cj   | ct   |

| 科创板 | 新三板 | 投教 | ESG | 滚动 |
| ------ | ------ | ---- | --- | ---- |
| kcb    | xsb    | tj   | zk  | gd   |

| 股市一览 | 独家解读 |
| -------- | -------- |
| gsyl     | djjd     |

| 公司新闻 | 公司动态 |
| -------- | -------- |
| gsxw     | gsdt     |

| 独家数据 | 看点数据 | 资金流向 | 科创板 | 行情总貌 |
| -------- | -------- | -------- | ------ | -------- |
| djsj     | kd       | zj       | sj_kcb | hq       |

| 专栏 | 作者   |
| ---- | ------ |
| zl   | author |

| 行业 | 汽车 |
| ---- | ---- |
| cjhy | cjqc |

| 投教课堂 | 政策知识 | 投教动态 | 专题活动 |
| -------- | -------- | -------- | -------- |
| tjkt     | zczs     | tjdt     | zthd     |

</Route>

## 智通财经网 {#zhi-tong-cai-jing-wang}

### 推荐 {#zhi-tong-cai-jing-wang-tui-jian}

<Route author="nczitzk" example="/zhitongcaijing" path="/zhitongcaijing/:id?/:category?" paramsDesc={['栏目 id，可在对应栏目页 URL 中找到，默认为 recommend，即推荐', '分类 id，可在对应栏目子分类页 URL 中找到，默认为全部']}>

| id           | 栏目 |
| ------------ | ---- |
| recommend    | 推荐 |
| hkstock      | 港股 |
| meigu        | 美股 |
| agu          | 沪深 |
| ct           | 创投 |
| esg          | ESG  |
| aqs          | 券商 |
| ajj          | 基金 |
| focus        | 要闻 |
| announcement | 公告 |
| research     | 研究 |
| shares       | 新股 |
| bazaar       | 市场 |
| company      | 公司 |

</Route>

## 中国人民银行 {#zhong-guo-ren-min-yin-hang}

### 沟通交流 {#zhong-guo-ren-min-yin-hang-gou-tong-jiao-liu}

<Route author="nczitzk" example="/gov/pbc/goutongjiaoliu" path="/gov/pbc/goutongjiaoliu" puppeteer="1"/>

### 货币政策司公开市场交易公告 {#zhong-guo-ren-min-yin-hang-huo-bi-zheng-ce-si-gong-kai-shi-chang-jiao-yi-gong-gao}

<Route author="nczitzk" example="/gov/pbc/tradeAnnouncement" path="/gov/pbc/tradeAnnouncement" puppeteer="1"/>

### 政策研究 {#zhong-guo-ren-min-yin-hang-zheng-ce-yan-jiu}

<Route author="Fatpandac" example="/gov/pbc/zcjl" path="/gov/pbc/zcjl"/>

### 工作论文 {#zhong-guo-ren-min-yin-hang-gong-zuo-lun-wen}

<Route author="Fatpandac" example="/gov/pbc/gzlw" path="/gov/pbc/gzlw"/>

## 中证网 {#zhong-zheng-wang}

### 资讯 {#zhong-zheng-wang-zi-xun}

<Route author="nczitzk" example="/cs/news/zzkx" path="/cs/news/:caty" paramsDesc={['资讯类型']}>

| 中证快讯 | 行业资讯 |
| -------- | -------- |
| zzkx     | hyzx     |

</Route>

