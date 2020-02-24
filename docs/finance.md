---
pageClass: routes
---

# 金融

## finviz

### 美股股票新闻

<Route author="HenryQW" example="/finviz/news/AAPL" path="/finviz/news/:ticker" :paramsDesc="['股票代码']"/>

## 淘股吧股票论坛

### 论坛总版

<Route author="emdoe" example="/taoguba/index" path="/taoguba/index"/>

### 用户博客

<Route author="emdoe" example="/taoguba/user/252069" path="/taoguba/user/:uid" :paramsDesc="['用户 id']" />

## 雪球

### 用户动态

<Route author="imlonghao" example="/xueqiu/user/8152922548" path="/xueqiu/user/:id/:type?" :paramsDesc="['用户 id, 可在用户主页 URL 中找到', '动态的类型, 不填则默认全部']">

| 原发布 | 长文 | 问答 | 热门 | 交易 |
| ------ | ---- | ---- | ---- | ---- |
| 0      | 2    | 4    | 9    | 11   |

</Route>

### 用户收藏动态

<Route author="imlonghao" example="/xueqiu/favorite/8152922548" path="/xueqiu/favorite/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 用户自选动态

<Route author="hillerliao" example="/xueqiu/user_stock/1247347556" path="/xueqiu/user_stock/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 基金净值更新

<Route author="HenryQW" example="/xueqiu/fund/040008" path="/xueqiu/fund/:id" :paramsDesc="['基金代码, 可在基金主页 URL 中找到. 此路由的数据为场外基金 (`F`开头)']"/>

### 组合最新调仓信息

<Route author="ZhishanZhang" example="/xueqiu/p/ZH1288184" path="/xueqiu/snb/:id" :paramsDesc="['组合代码, 可在组合主页 URL 中找到.']"/>

### 股票信息

<Route author="YuYang" example="/xueqiu/stock_info/SZ000002" path="/xueqiu/stock_info/:id/:type?" :paramsDesc="['股票代码（需要带上交易所）', '动态的类型, 不填则为股票公告']">

| 公告         | 新闻 | 研报     |
| ------------ | ---- | -------- |
| announcement | news | research |

</Route>
