---
pageClass: routes
---

# 金融

## BigQuant

### 专题报告

<Route author="nczitzk" example="/bigquant/collections" path="/bigquant/collections"/>

## CFD

### 每周股指派息调整 (GBP)

<Route author="HenryQW" example="/cfd/div_gbp" path="/cfd/div_gbp" />

## DT 财经

### 数据洞察

<Route author="nczitzk" example="/dtcj/datainsight" path="/dtcj/datainsight/:id?" :paramsDesc="['分类，见下表，默认为全部']">

| 城数 | NEXT 情报局 | 专业精选 |
| -- | -------- | ---- |
| 3  | 1        | 4    |

</Route>

### 数据侠专栏

<Route author="nczitzk" example="/dtcj/datahero" path="/dtcj/datahero/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 侠创 | 纽约数据科学学院 | RS 实验所 | 阿里云天池 |
| -- | -------- | ------ | ----- |
| 5  | 6        | 9      | 10    |

</Route>

## finviz

### 美股股票新闻

<Route author="HenryQW" example="/finviz/news/AAPL" path="/finviz/news/:ticker" :paramsDesc="['股票代码']"/>

## TokenInsight

### 博客

<Route author="fuergaosi233" example="/tokeninsight/blog" path="/tokeninsight/blog/:lang?" :paramsDesc="['语言，见下表，默认为简体中文']" />

### 快讯

<Route author="fuergaosi233" example="/tokeninsight/bulletin" path="/tokeninsight/bulletin/:lang?" :paramsDesc="['语言，见下表，默认为简体中文']" />

### 报告

<Route author="fuergaosi233" example="/tokeninsight/report" path="/tokeninsight/report/:lang?" :paramsDesc="['语言，见下表，默认为简体中文']">

语言

| 中文 | 英文 |
| -- | -- |
| zh | en |

</Route>

## WEEX 华尔街见闻旗下全球投资线上品牌

### 资讯

<Route author="SChen1024" example="/weexcn/news/1" path="/weexcn/news/:typeid" :paramsDesc="['栏目代码, 按照表列出']" />

| 最新文章 | 市场要闻 | 交易策略 | 机构观点 | 投资学堂 | 行业观察 | 基金理财 | 分析师投稿 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- |
| 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8     |

## 巴伦周刊中文版

### 栏目

<Route author="nczitzk" example="/barronschina" path="/barronschina/:id?" :paramsDesc="['栏目 id，默认为快讯']">

::: tip 提示

栏目 id 留空则返回快讯，在对应页地址栏 `columnId=` 后可以看到。

:::

</Route>

## 北京证券交易所

### 栏目

<Route author="nczitzk" example="/bse" path="/bse/:category?/:keyword?" :paramsDesc="['分类，见下表，默认为本所要闻', '关键字，默认为空']">

| 本所要闻           | 人才招聘    | 采购信息     | 业务通知      |
| -------------- | ------- | -------- | --------- |
| important_news | recruit | purchase | news_list |

| 法律法规     | 公开征求意见         | 部门规章            | 发行融资      |
| -------- | -------------- | --------------- | --------- |
| law_list | public_opinion | regulation_list | fxrz_list |

| 持续监管      | 交易管理      | 市场管理      | 上市委会议公告        |
| --------- | --------- | --------- | -------------- |
| cxjg_list | jygl_list | scgl_list | meeting_notice |

| 上市委会议结果公告      | 上市委会议变更公告      | 并购重组委会议公告   |
| -------------- | -------------- | ----------- |
| meeting_result | meeting_change | bgcz_notice |

| 并购重组委会议结果公告 | 并购重组委会议变更公告 | 终止审核              | 注册结果         |
| ----------- | ----------- | ----------------- | ------------ |
| bgcz_result | bgcz_change | termination_audit | audit_result |

</Route>

## 财联社

### 电报

<Route author="nczitzk" example="/cls/telegraph" path="/cls/telegraph/:category?" :paramsDesc="['分类，见下表']">

| 看盘    | 公告           | 解读      | 加红  | 推送    | 提醒     | 基金   |
| ----- | ------------ | ------- | --- | ----- | ------ | ---- |
| watch | announcement | explain | red | jpush | remind | fund |

</Route>

### 深度

<Route author="nczitzk" example="/cls/depth/1000" path="/cls/depth/:category?" :paramsDesc="['分类代码，可在首页导航栏的目标网址 URL 中找到']">

| 要闻   | 股市   | 环球   | 公司   | 地产   | 券商   | 金融   | 汽车   | 科创版  |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1000 | 1003 | 1007 | 1005 | 1006 | 1118 | 1032 | 1119 | 1111 |

</Route>

## 东方财富

### 天天基金用户动态

<Route author="zidekuls" example="/eastmoney/ttjj/user/6551094298949188" path="/eastmoney/ttjj/user/:uid" :paramsDesc="['用户id, 可以通过天天基金App分享用户主页到浏览器，在相应的URL中找到']"/>

## 富途牛牛

### 要闻

<Route author="Wsine" example="/futunn/highlights" path="/futunn/highlights" />

## 格隆汇

### 用户文章

<Route author="nczitzk" example="/gelonghui/user/5273" path="/gelonghui/user/:id" :paramsDesc="['用户编号, 可在用户页 URL 中找到']"/>

### 主题文章

<Route author="nczitzk" example="/gelonghui/subject/4" path="/gelonghui/subject/:id"  :paramsDesc="['主题编号, 可在主题页 URL 中找到']"/>

### 搜索关键字

<Route author="nczitzk" example="/gelonghui/keyword/早报" path="/gelonghui/keyword/:keyword" :paramsDesc="['搜索关键字']"/>

## 国家金融与发展实验室

### 研究

<Route author="Fatpandac" example="/nifd/research/3333d2af-91d6-429b-be83-28b92f31b6d7" path="/nifd/research/:categoryGuid?" :paramsDesc="['资讯类型，默认为周报']">

资讯类型可以从网址中获取，如：

`http://www.nifd.cn/Research?categoryGuid=7a6a826d-b525-42aa-b550-4236e524227f` 对应 `/nifd/research/7a6a826d-b525-42aa-b550-4236e524227f`

</Route>

## 金十数据

<Route author="laampui" example="/jinshi/index" path="/jinshi/index" />
## 麦肯锡中国

<Route author="laampui" example="/mckinsey/autos" path="/mckinsey/:category?" :paramsDesc="['默认为全部，见下表']">

| 汽车    | 金融服务              | 数字化                 | 消费者       | 医药与医疗                      | 麦肯锡全球研究院                  | 全球基础材料 | 创新         | 宏观经济         | 制造业           | 人才与领导力            | 技术，媒体与通信                     | 城市化与可持续发展                   | 资本项目和基础设施                       | 旅游、运输和物流 |
| ----- | ----------------- | ------------------- | --------- | -------------------------- | ------------------------- | ------ | ---------- | ------------ | ------------- | ----------------- | ---------------------------- | --------------------------- | ------------------------------- | -------- |
| autos | banking-insurance | business-technology | consumers | healthcare-pharmaceuticals | mckinsey-global-institute | 全球基础材料 | innovation | macroeconomy | manufacturing | talent-leadership | technology-media-and-telecom | urbanization-sustainability | capital-projects-infrastructure | 交通运输与物流  |

</Route>

## 每经网

### 分类

<Route author="nczitzk" example="/nbd" path="/nbd/:id?" :paramsDesc="['分类 id，见下表，默认为要闻']">

| 头条 | 要闻 | 图片新闻 | 推荐 |
| -- | -- | ---- | -- |
| 2  | 3  | 4    | 5  |

</Route>

### 重磅原创

<Route author="MeXunco" example="/nbd/daily" path="/nbd/daily"/>

## 上海证券交易所

### 本所业务规则

<Route author="nczitzk" example="/sse/sserules" path="/sse/sserules/:slug?" :paramsDesc="['见下文，默认为 latest']">

将目标栏目的网址拆解为 `http://www.sse.com.cn/lawandrules/sserules/` 和后面的字段，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug

如：（最新规则）<http://www.sse.com.cn/lawandrules/sserules/latest> 的网址在 `http://www.sse.com.cn/lawandrules/sserules/` 后的字段是 `latest`，则对应的 slug 为 `latest`，对应的路由即为 `/sse/sserules/latest`

又如：（设立科创板并试点注册制规则 - 发行上市审核类）<http://www.sse.com.cn/lawandrules/sserules/tib/review> 的网址在 `http://www.sse.com.cn/lawandrules/sserules/` 后的字段是 `tib/review`，则对应的 slug 为 `tib-review`，对应的路由即为 `/sse/sserules/tib-review`

</Route>

## 世界经济论坛

### 报告

<Route author="nczitzk" example="/weforum/report" path="/weforum/report/:lang?/:year?/:platform?" :paramsDesc="['语言，见下表，默认为 `en`', '年份，对应年份过滤条件，默认为 `所有`', '平台，对应平台过滤条件，默认为 `所有`']">

语言

| English | Español | Français | 中文 | 日本語 |
| ------- | ------- | -------- | -- | --- |
| en      | es      | fr       | cn | jp  |

年份 和 平台 这两个参数请参见 [报告页](https://www.weforum.org/reports) 过滤条件处。

</Route>

## 淘股吧股票论坛

### 论坛总版

<Route author="emdoe" example="/taoguba/index" path="/taoguba/index"/>

### 用户博客

<Route author="emdoe" example="/taoguba/user/252069" path="/taoguba/user/:uid" :paramsDesc="['用户 id']" />

## 乌拉邦

### 最新研报

<Route author="Fatpandac" example="/ulapia/research/latest" path="/ulapia/research/latest"/>

### 频道

<Route author="Fatpandac" example="/ulapia/reports/stock_research" path="/ulapia/reports/:category?" :paramsDesc="['频道类型，默认为券商晨报（今日晨报）']">

|      个股研报      |        行业研报       |        策略研报       |      宏观研报      |     新股研报     |   券商晨报（今日晨报）   |
| :------------: | :---------------: | :---------------: | :------------: | :----------: | :------------: |
| stock_research | industry_research | strategy_research | macro_research | ipo_research | brokerage_news |

</Route>

## 新浪财经

### 新浪财经－国內

<Route author="yubinbai" example="/sina/finance" path="/sina/finance" />

## 雪球

### 用户动态

<Route author="imlonghao" example="/xueqiu/user/8152922548" path="/xueqiu/user/:id/:type?" :paramsDesc="['用户 id, 可在用户主页 URL 中找到', '动态的类型, 不填则默认全部']">

| 原发布 | 长文 | 问答 | 热门 | 交易 |
| --- | -- | -- | -- | -- |
| 0   | 2  | 4  | 9  | 11 |

</Route>

### 用户收藏动态

<Route author="imlonghao" example="/xueqiu/favorite/8152922548" path="/xueqiu/favorite/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 用户自选动态

<Route author="hillerliao" example="/xueqiu/user_stock/1247347556" path="/xueqiu/user_stock/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 基金净值更新

<Route author="HenryQW" example="/xueqiu/fund/040008" path="/xueqiu/fund/:id" :paramsDesc="['基金代码, 可在基金主页 URL 中找到. 此路由的数据为场外基金 (`F`开头)']"/>

### 组合最新调仓信息

<Route author="ZhishanZhang" example="/xueqiu/snb/ZH1288184" path="/xueqiu/snb/:id" :paramsDesc="['组合代码, 可在组合主页 URL 中找到.']"/>

### 股票信息

<Route author="YuYang" example="/xueqiu/stock_info/SZ000002" path="/xueqiu/stock_info/:id/:type?" :paramsDesc="['股票代码（需要带上交易所）', '动态的类型, 不填则为股票公告']">

| 公告           | 新闻   | 研报       |
| ------------ | ---- | -------- |
| announcement | news | research |

</Route>

### 股票评论

<Route author="zytomorrow" example="/xueqiu/stock_comments/SZ002626" path="/xueqiu/stock_comments/:id/:titleLength?" :paramsDesc="['股票代码（需要带上交易所）', '标题长度']"/>

## 有知有行

### 有知文章

<Route author="broven Fatpandac" example="/youzhiyouxing/materials" path="/youzhiyouxing/materials/:column?" :paramsDesc="['分类，见下表，默认为全部']">

|  全部 | 知行小酒馆 | 知行黑板报 | 无人知晓 | 孟岩专栏 | 知行读书会 | 你好，同路人 |
| :-: | :---: | :---: | :--: | :--: | :---: | :----: |
|  0  |   4   |   2   |  10  |   1  |   3   |   11   |

</Route>

## 证券时报网

### 要闻

<Route author="nczitzk" example="/stcn/xw/news" path="/stcn/:id?" :paramsDesc="['分类 id，见下表，默认为要闻']">

| 要闻      | 滚动 | 深度    | 评论    |
| ------- | -- | ----- | ----- |
| xw/news | gd | xw/sd | xw/pl |

</Route>

### 快讯

<Route author="nczitzk" example="/stcn/kuaixun" path="/stcn/kuaixun/:id?" :paramsDesc="['分类 id，见下表，默认为快讯']">

| 快讯 | e 公司 | 研报 | 时事 | 财经 | 券中社 |
| -- | ---- | -- | -- | -- | --- |
|    | egs  | yb | ss | cj | qzs |

</Route>

### 股市

<Route author="nczitzk" example="/stcn/stock" path="/stcn/stock/:id?" :paramsDesc="['分类 id，见下表，默认为股市']">

| 股市 | 股市动态 | 独家解读 |
| -- | ---- | ---- |
|    | gsdt | djjd |

</Route>

### 数据

<Route author="nczitzk" example="/stcn/data" path="/stcn/data/:id?" :paramsDesc="['分类 id，见下表，默认为数据']">

| 数据 | 机器人新闻 | 独家数据 |
| -- | ----- | ---- |
|    | jqrxw | djsj |

</Route>

## 中国人民银行

### 沟通交流

<Route author="nczitzk" example="/gov/pbc/goutongjiaoliu" path="/gov/pbc/goutongjiaoliu"/>

### 货币政策司公开市场交易公告

<Route author="nczitzk" example="/gov/pbc/tradeAnnouncement" path="/gov/pbc/tradeAnnouncement"/>

### 政策研究

<Route author="Fatpandac" example="/gov/pbc/zcjl" path="/gov/pbc/zcjl"/>

### 工作论文

<Route author="Fatpandac" example="/gov/pbc/gzlw" path="/gov/pbc/gzlw"/>

## 中证网

### 资讯

<Route author="nczitzk" example="/cs/news/zzkx" path="/cs/news/:caty" :paramsDesc="['资讯类型']">

| 中证快讯 | 行业资讯 |
| ---- | ---- |
| zzkx | hyzx |

</Route>
