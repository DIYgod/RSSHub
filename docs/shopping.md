# 购物

## 什么值得买

::: tip 提示

网站也提供了部分 RSS: https://www.smzdm.com/dingyue

:::

<Route name="关键词" author="DIYgod" example="/smzdm/keyword/女装" path="/smzdm/keyword/:keyword" :paramsDesc="['你想订阅的关键词']"/>

<Route name="排行榜" author="DIYgod" example="/smzdm/ranking/pinlei/11/3" path="/smzdm/ranking/:rank_type/:rank_id/:hour" :paramsDesc="['榜单类型','榜单ID','时间跨度']">

-   榜单类型

| 好价品类榜 | 好价电商榜 | 海淘 TOP 榜 | 好文排行榜 | 好物排行榜 |
| ---------- | ---------- | ----------- | ---------- | ---------- |
| pinlei     | dianshang  | haitao      | haowen     | haowu      |

-   榜单 ID

好价品类榜

| 全部 | 时尚运动 | 3C 家电 | 食品家居 | 日百母婴 | 出行游玩 | 白菜 | 凑单品 |
| ---- | -------- | ------- | -------- | -------- | -------- | ---- | ------ |
| 11   | 12       | 13      | 14       | 15       | 16       | 17   | 22     |

好价电商榜

| 券活动 | 京东 | 天猫 | 亚马逊中国 | 国美在线 | 苏宁易购 | 网易 | 西集网 | 美国亚马逊 | 日本亚马逊 | ebay |
| ------ | ---- | ---- | ---------- | -------- | -------- | ---- | ------ | ---------- | ---------- | ---- |
| 24     | 23   | 25   | 26         | 27       | 28       | 29   | 30     | 31         | 32         | 33   |

海淘 TOP 榜

| 全部 | 海外直邮 | 美国榜 | 欧洲榜 | 澳新榜 | 亚洲榜 | 晒物榜 |
| ---- | -------- | ------ | ------ | ------ | ------ | ------ |
| 39   | 34       | 35     | 36     | 37     | 38     | hsw    |

好文排行榜

| 原创 | 资讯 |
| ---- | ---- |
| yc   | zx   |

好物排行榜

| 新晋榜 | 消费众测 | 新锐品牌 | 好物榜单 |
| ------ | -------- | -------- | -------- |
| hwall  | zc       | nb       | hw       |

</Route>

<Route name="好文" author="LogicJake" example="/smzdm/haowen/1" path="/smzdm/haowen/:day" :paramsDesc="['以天为时间跨度，默认为all，其余可以选择1，7，30，365']"/>

## 小米

<Route name="小米众筹" author="DIYgod" example="/mi/crowdfunding" path="/mi/crowdfunding"/>

<Route name="小米有品众筹" author="DIYgod" example="/mi/youpin/crowdfunding" path="/mi/youpin/crowdfunding"/>

<Route name="小米有品每日上新" author="xyqfer" example="/mi/youpin/new" path="/mi/youpin/new"/>

## 甩甩尾巴

<Route name="分类" author="xyqfer" example="/dgtle/trade/111" path="/dgtle/trade/:typeId?" :paramsDesc="['分类 id，默认为全部']">

| 全部 | 电脑 | 手机 | 平板 | 相机 | 影音 | 外设 | 生活 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 111  | 109  | 110  | 113  | 114  | 115  | 112  | 116  |

</Route>

## Westore

<Route name="新品" author="xyqfer" example="/westore/new" path="/westore/new"/>

## 玩物志

<Route name="最新" author="xyqfer" example="/coolbuy/newest" path="/coolbuy/newest"/>

## 京东众筹

<Route name="众筹项目" author="LogicJake" example="/jingdong/zhongchou/all/zcz/zhtj" path="/jingdong/zhongchou/:type/:status/:sort" :paramsDesc="['类型','状态','排序方式']">

类型

| 全部 | 科技 | 美食 | 家电 | 设计 | 娱乐 | 文化 | 公益 | 其他 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| all  | kj   | ms   | jd   | sj   | yl   | wh   | gy   | qt   |

状态

| 全部 | 预热中 | 众筹中 | 众筹成功 | 项目成功 |
| ---- | ------ | ------ | -------- | -------- |
| all  | yrz    | zcz    | zccg     | xmcg     |

排序方式

| 综合推荐 | 最新上线 | 金额最多 | 支持最多 | 即将结束 |
| -------- | -------- | -------- | -------- | -------- |
| zhtj     | zxsx     | jezg     | zczd     | jjjs     |

</Route>

## 淘宝众筹

<Route name="众筹项目" author="xyqfer" example="/taobao/zhongchou/all" path="/taobao/zhongchou/:type?" :paramsDesc="['类型, 默认为 `all` 全部']">

| 全部 | 科技 | 食品        | 动漫 | 设计   | 公益 | 娱乐 | 影音  | 书籍 | 游戏 | 其他  |
| ---- | ---- | ----------- | ---- | ------ | ---- | ---- | ----- | ---- | ---- | ----- |
| all  | tech | agriculture | acg  | design | love | tele | music | book | game | other |

</Route>

## 多抓鱼

<Route name="搜索结果" author="fengkx" example="/duozhuayu/search/JavaScript" path="/duozhuayu/search/:wd" :paramsDesc="['搜索关键词']"/>
