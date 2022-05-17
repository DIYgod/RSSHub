---
pageClass: routes
---

# 学习

## 51VOA 美国之音

### 频道

<Route author="guhuaijin" example="/51voa/address" path="/51voa/:channel" :paramsDesc="['频道名称']"/>

| `:channel`  | 对应网站栏目                                 |
| ----------- | -------------------------------------- |
| standard    | 常速英语 (VOA Standard English)            |
| archive     | 常速英语存档 (VOA Standard English Archives) |
| technology  | 科技报道 (Technology Report)               |
| daily       | 今日美国 (This is America)                 |
| sciences    | 科技报道 (Science in the News)             |
| health      | 健康报道 (Health Report)                   |
| education   | 教育报道 (Education Report)                |
| economics   | 经济报道 (Economics Report)                |
| culture     | 文化艺术 (American Mosaic)                 |
| events      | 时事新闻 (In the News)                     |
| stories     | 美国故事 (American Stories)                |
| words       | 词汇掌故 (Words And Their Stories)         |
| trending    | 今日热点 (Trending Today)                  |
| magazine    | 新闻杂志 (AS IT IS)                        |
| grammar     | 日常语法 (Everyday Grammar)                |
| queries     | 名师答疑 (Ask a Teacher)                   |
| history     | 美国历史 (U.S. History)                    |
| park        | 国家公园 (America's National Parks)        |
| president   | 美国总统 (America's Presidents)            |
| agriculture | 农业报道 (Agriculture Report)              |
| exploration | 自然探索 (Explorations)                    |
| people      | 美国人物 (People in America)               |
| bilingual   | 双语新闻 (Bilingual News)                  |
| address     | 总统演讲 (President Address)               |

## CTFHub Calendar

### 查询国内外 CTF 赛事信息

<Route author="frankli0324" example="/ctfhub/search" 
path="/ctfhub/search/:limit?/:form?/:class?/:title?" 
:paramsDesc="['一个整数，筛选最新的limit场比赛，默认为10', '比赛形式', '比赛类型', '通过CTF赛事名称过滤']">

| `:class` | 类型                             |
| :------: | ------------------------------ |
|     0    | Jeopardy [解题]                  |
|     1    | Attack with Defense [AwD 攻防]   |
|     2    | Robo Hacking Game [RHG AI 自动化] |
|     3    | Real World [RW 真实世界]           |
|     4    | King of The Hill [KoH 抢占山头]    |
|     5    | Mix [混合]                       |

> class 以 <https://api.ctfhub.com/User_API/Event/getType> 的返回结果为准

| `:form` | 形式  |
| :-----: | --- |
|    0    | 线上赛 |
|    1    | 线下赛 |

</Route>

### 查询近期赛事

<Route author="frankli0324" example="/ctfhub/upcoming" 
path="/ctfhub/upcoming/:limit?" 
:paramsDesc="['一个整数，筛选最近的limit场比赛，默认为5']">

</Route>

## gradCafe

### gradCafe result

<Route author="liecn" example="/gradcafe/result" path="/gradcafe/result" />

### gradCafe result by key words

<Route author="liecn" example="/gradcafe/result/computer" path="/gradcafe/result/:type" :paramsDesc="['按关键词进行搜索，如 computer']"/>

## IELTS 雅思

### 最新消息

<Route author="zenxds" example="/ielts" path="/ielts" puppeteer="1"/>

## MarginNote

### 标签

<Route author="nczitzk" example="/marginnote/tag/经验分享" path="/marginnote/tag/:id?" :paramsDesc="['标签名，见下表，默认为 经验分享']">

| 经验分享 | 论坛精华 | 待跟进反馈 | 优秀建议 | 精选回答 | 官方签名 | 自动更新 | 3674 以上版本支持 | 368 以上版本支持 | 未经验证的安全风险 | 笔记本分享 | 关键反馈 | 精选话题讨论 | 灵感盒 | 引用 |
| ---- | ---- | ----- | ---- | ---- | ---- | ---- | ----------- | ---------- | --------- | ----- | ---- | ------ | --- | -- |

</Route>

## Mind42

### 分类

<Route author="nczitzk" example="/mind42" path="/mind42/:caty?" :paramsDesc="['分类，见下表，默认为 Overview']">

| Overview | Popular | All    |
| -------- | ------- | ------ |
| mindmaps | popular | public |

</Route>

### 标签

<Route author="nczitzk" example="/mind42/tag/online" path="/mind42/tag/:id" :paramsDesc="['标签，见下表']">

| in | online | cleaning | buy | best | services | for | carpet | service | india | company | and | de | mapa | control | malware | online-dating-website-reviews | virus | international-online-dating-sites-review | repair |
| -- | ------ | -------- | --- | ---- | -------- | --- | ------ | ------- | ----- | ------- | --- | -- | ---- | ------- | ------- | ----------------------------- | ----- | ---------------------------------------- | ------ |

</Route>

### 搜索

<Route author="nczitzk" example="/mind42/search/online" path="/mind42/search/:keyword" :paramsDesc="['关键字']"/>

## NEEA 中国教育考试网

### 国家教育考试

<Route author="SunShinenny" example="/neea/gaokao" path="/neea/:type" :paramsDesc="['类别，如 gaokao']"/>

| `:type`  | 类别名称      |
| -------- | --------- |
| gaokao   | 普通高考      |
| chengkao | 成人高考      |
| yankao   | 研究生考试     |
| zikao    | 自学考试      |
| ntce     | 中小学教师资格考试 |

### 社会证书考试

<Route author="SunShinenny" example="/neea/cet" path="/neea/:type" :paramsDesc="['类别，如 cet']"/>

| `:type` | 类别名称             |
| ------- | ---------------- |
| cet     | 全国四六级（CET）       |
| ncre    | 全国计算机等级考试（NCRE）  |
| nit     | 全国计算机应用水平考试（NIT） |
| pets    | 全国英语等级考试 (PETS)  |
| wsk     | 全国外语水平考试 (WSK)   |
| ccpt    | 书画等级考试 (CCPT)    |
| wsk     | 全国外语水平考试 (WSK)   |
| mets    | 医护英语水平考试 (METS)  |

### 教育部考试中心日本语能力测试重要通知

<Route author="nczitzk" example="/neea/jlpt" path="/neea/jlpt"/>

## ORCID

### 作品列表

<Route author="OrangeEd1t" example="/orcid/0000-0002-4731-9700" path="/orcid/:id" :paramsDesc="['学术识别号']"/>

## ProcessOn

### 推荐

<Route author="nczitzk" example="/processon/popular" path="/processon/popular/:cate?/:sort?" :paramsDesc="['分类，见下表，默认为所有类型', '排序，见下表，默认为人气']">

分类

| 所有类型 | 流程图 | BPMN | 思维导图 | UI 原型图    | UML | Org 组织结构图 | 网络拓扑图 | 韦恩图     |      |
| ---- | --- | ---- | ---- | --------- | --- | --------- | ----- | ------- | ---- |
|      | es  | flow | bpmn | mind_free | ui  | uml       | org   | network | venn |

排序

| 人气 | 最多人赞      | 最多收藏           | 最多浏览      | 最新发布        |
| -- | --------- | -------------- | --------- | ----------- |
|    | likeCount | favouriteCount | viewCount | publishTime |

</Route>

## X-MOL 平台

### 新闻

<Route author="cssxsh" example="/x-mol/news/3" path="/x-mol/news/:tag?" :paramsDesc="['数字编号，可从新闻列表URL得到。为空时从新闻主页获取新闻。']" />

## XMind

### Mindmap Gallery

<Route author="nczitzk" example="/xmind/mindmap" path="/xmind/mindmap/:lang?" :paramsDesc="['语言代码，见下表，默认为所有语言']">

| English | Español | Deutsch | Français | 中文 | 日本語 |
| ------- | ------- | ------- | -------- | -- | --- |
| en      | es      | de      | fr       | zh | jp  |

</Route>

## zhimap 思维导图社区

<Route author="laampui" example="/zhimap/820156a42e9a490796c7fd56916aa95b/1" path="/zhimap/:categoryUuid?/:recommend?" :paramsDesc="['分类 uuid，见下表，默认为33b67d1bad1d4e37812f71d42764af34', '1 为按推荐排序，0 为按最新排序，默认为 0']">

| 热门                               | 学科                               | 学习                               | 语言                               | 工作                               | 提升                               | 生活                               | 互联网                              | 教育                               | 其他                               | 行业                               | 服务发布                             | 医疗                               |
| -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- |
| 33b67d1bad1d4e37812f71d42764af34 | 9434268e893a46aa9a1a231059849984 | 820156a42e9a490796c7fd56916aa95b | 959c81f606ca495c882c7e461429eb2a | 5af4bca5496e4733a2d582690627e25f | 5300988dff564756b5d462cea8a865b7 | 02fdcc2ab6374bc6b9b9717e70c87723 | 437d434fe9eb410a94dcefb889994e2b | 9747cbf78f96492c973aa6ab23925eee | d4c3a92a9cf64da7b187763211dc6ff6 | 58231ab9cef34af7819c3f6e2160c007 | 73d89972bee0457997c983d7fca19f9f | 853ce8b3a4c24b87a03f66af95c5e06c |

</Route>

## 杭州市国家普通话测试网报信息

### 考试信息

<Route author="ChaosTong" example="/putonghua" path="/putonghua" />

## 唧唧堂

### 论文

<Route author="xfangbao" example="/jijitang/publication" path="/jijitang/publication/" />

### 文档

<Route author="xfangbao" example="/jijitang/article/latest" path="/jijitang/article/:id" :paramsDesc="['类别，latest 或者 recommand']"/>

## 金山词霸

### 每日一句

<Route author="mashirozx" example="/iciba/7/poster" path="/iciba/:days?/:img_type?" :paramsDesc="['展示的条目数（最小1，最大7，默认1，只展示当天的条目）', '图片格式']">

| `:img_type` | 图片格式 |
| ----------- | ---- |
| original    | 原图   |
| medium      | 尺寸优化 |
| thumbnail   | 缩略图  |
| poster      | 文艺海报 |

</Route>

## 领研

### 论文

<Route author="yech1990" example="/linkresearcher/category=theses&subject=生物" path="/linkresearcher/theses/:param" supportScihub="1" :paramsDesc="['参数，如 subject=生物']"/>

| `:param` | 举例              | 定义                                |
| -------- | --------------- | --------------------------------- |
| category | category=thesis | **必填**，theses/information/careers |
| subject  | subject = 生物    | 可置空                               |
| columns  | columns = 健康    | 可置空                               |
| query    | query = 病毒      | 可置空                               |

## 码农周刊

### issues

<Route author="tonghs" example="/manong-weekly" path="/manong-weekly" />

## 幕布精选

<Route author="laampui nczitzk" example="/mubu/explore/16/读书笔记" path="/mubu/explore/:category?/:title?" :paramsDesc="['分类 id', '显示标题']" />

## 扇贝

### 用户打卡

<Route author="DIYgod" example="/shanbay/checkin/ddwej" path="/shanbay/checkin/:id" :paramsDesc="['用户 id']" />

### 精选文章

<Route author="qiwihui" example="/shanbay/footprints" path="/shanbay/footprints/:category?" :paramsDesc="['分类 id']">

| 用户故事 | 地道表达法 | 实用口语 | 语法教室 | 读新闻学英语 | 单词鸡汤 | 扇贝理念 | 英语知识 | 原汁英文 |
| ---- | ----- | ---- | ---- | ------ | ---- | ---- | ---- | ---- |
| 1    | 31    | 46   | 34   | 40     | 43   | 16   | 7    | 10   |

| 学习方法 | 影视剧讲义 | 产品更新 | 精读文章 | 他山之石 | Quora 翻译 | TED 推荐 | 大耳狐小课堂 | 互动话题 |
| ---- | ----- | ---- | ---- | ---- | -------- | ------ | ------ | ---- |
| 13   | 22    | 28   | 4    | 19   | 25       | 37     | 49     | 52   |

</Route>

## 上海市教育考试院

### 消息速递

官方网址：<http://www.shmeea.edu.cn>

<Route author="jialinghui" example="/shmeea" path="/shmeea" radar="1" rssbud="1"/>

### 自学考试通知公告

<Route author="h2ws" example="/shmeea/self-study" path="/shmeea/self-study" radar="1" rssbud="1"/>

## 思维导图社区

### 热门导图

<Route author="nczitzk" example="/edrawsoft/mindmap/1/PV/DESC/CN/1" path="/edrawsoft/mindmap/:classId?/:order?/:sort?/:lang?/:price?/:search?" :paramsDesc="['分类编号，见下表，默认为全部分类', '排序参数，`PV` 指 最多浏览，`TIME` 指 最新发布，`LIKE` 指 最多点赞，默认为 `PV` 即 最多浏览', '排序方式，`DESC` 指 降序，`ASC` 指 升序，默认为 `DESC` 即 降序', '模板语言，默认为 `CN`', '是否免费，`1` 指 全部，`2` 指 免费，`3` 指 付费，`4` 指 会员免费，默认为 `1` 即 全部', '搜索关键词，默认为空']">

::: tip 提示

不支持分类搜索和自定义搜索排序，即 `search` 参数不为空时，其他参数不起作用。

:::

分类编号如下表（选择全部则填入编号 0）

| 职业技能 | 企业家 / 管理者 | 程序员 | 产品经理 | 运营 / 市场营销 | 人事 / 培训 / 行政 | 法律 / 法务 | 医学 / 药学 / 保健 | 银行 / 金融 / 证券 / 保险 | 电商 / 微商 / 零售 | 编辑 / 媒体 / 出版 | 机械 / 电子 / 制造业 | 城市 / 建筑 / 房地产 | 其他技能 |
| ---- | --------- | --- | ---- | --------- | ------------ | ------- | ------------ | ----------------- | ------------ | ------------ | ------------- | ------------- | ---- |
| 1    | 7         | 8   | 9    | 10        | 11           | 12      | 13           | 14                | 15           | 16           | 17            | 58            | 59   |

| 考研考证 | 研究生考试 | 建考 | 法考 | 教师资格证 | 公考 | 英语 | 医考 | 会计师 | 计算机 | 专升本 |
| ---- | ----- | -- | -- | ----- | -- | -- | -- | --- | --- | --- |
| 2    | 18    | 19 | 20 | 21    | 22 | 23 | 24 | 25  | 26  | 27  |

| 生活娱乐 | 体育 | 音乐 | 影视 | 旅游 | 游戏 | 兴趣 | 生活 |
| ---- | -- | -- | -- | -- | -- | -- | -- |
| 3    | 29 | 30 | 31 | 32 | 33 | 34 | 56 |

| 校园教育 | 大学 | 高中 | 初中 | 小学 | 教育 |
| ---- | -- | -- | -- | -- | -- |
| 4    | 35 | 36 | 37 | 38 | 39 |

| 读书笔记 | 文学作品 | 心灵成长 | 经管知识 | 终身学习 | 通用知识 | 知识栏目 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 5    | 40   | 41   | 42   | 43   | 44   | 45   |

| 创意脑图 | 长图 | 鱼骨图 | 时间线 | 圆圈图 | 组织结构 | 树状图 | 流程图 |
| ---- | -- | --- | --- | --- | ---- | --- | --- |
| 6    | 46 | 47  | 48  | 49  | 50   | 51  | 57  |

</Route>

## 搜韵网

### 诗词日历

<Route author="nczitzk" example="/souyun/today" path="/souyun/today"/>

## 网易公开课

### 精品课程

<Route author="hoilc" example="/open163/vip" path="/open163/vip" radar="1" rssbud="1"/>

### 最新课程

<Route author="hoilc" example="/open163/latest" path="/open163/latest" radar="1" rssbud="1"/>

## 下厨房

### 用户作品

<Route author="xyqfer" example="/xiachufang/user/cooked/103309404" path="/xiachufang/user/cooked/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 用户菜谱

<Route author="xyqfer" example="/xiachufang/user/created/103309404" path="/xiachufang/user/created/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 作品动态

<Route author="xyqfer" example="/xiachufang/popular/hot" path="/xiachufang/popular/:timeframe?" :paramsDesc="['默认最新上传']">

| 正在流行 | 24 小时最佳 | 本周最受欢迎 | 新秀菜谱   | 月度最佳       |
| ---- | ------- | ------ | ------ | ---------- |
| hot  | pop     | week   | rising | monthhonor |

</Route>

## 学堂在线

### 课程信息

<Route author="sanmmm" example="/xuetangx/course/course-v1:TsinghuaX+20240103X+2019_T1/status" path="/xuetangx/course/:cid/:type" :paramsDesc="['课程id, 从课程页URL中可得到', '课程信息类型']">

课程信息类型

| 课程开始时间 | 课程结束时间 | 课程进度   |
| ------ | ------ | ------ |
| start  | end    | status |

</Route>

### 课程列表

<Route author="sanmmm" example="/xuetangx/course/list/0/1/0" path="/xuetangx/course/list/:mode/:status/:credential/:type?" :paramsDesc="['课程模式', '课程状态', '课程认证类型', '学科分类 默认为`全部`']">

课程模式

| 自主 | 随堂 | 付费 | 全部 |
| -- | -- | -- | -- |
| 0  | 1  | 2  | -1 |

课程状态

| 即将开课 | 已开课 | 已结课 | 全部 |
| ---- | --- | --- | -- |
| 1    | 2   | 3   | -1 |

课程认证类型

| 签字认证 | 认证开放 | 全部 |
| ---- | ---- | -- |
| 1    | 2    | -1 |

学科分类

| 全部 | 计算机 | 经管・会计 | 创业  | 电子  | 工程  | 环境・地球 | 医学・健康 | 生命科学 | 数学  | 物理  | 化学  | 社科・法律 | 文学  | 历史  | 哲学  | 艺术・设计 | 外语  | 教育  | 其他  | 大学先修课 | 公共管理 | 建筑   | 职场   | 全球胜任力 |
| -- | --- | ----- | --- | --- | --- | ----- | ----- | ---- | --- | --- | --- | ----- | --- | --- | --- | ----- | --- | --- | --- | ----- | ---- | ---- | ---- | ----- |
| -1 | 117 | 118   | 119 | 120 | 121 | 122   | 123   | 124  | 125 | 126 | 127 | 128   | 129 | 130 | 131 | 132   | 133 | 134 | 135 | 201   | 2550 | 2783 | 2952 | 6200  |

</Route>

## 阳光高考

### 教育部阳光高考信息公开平台招生政策规定

<Route author="nczitzk" example="/chsi/zszcgd" path="/chsi/zszcgd/:category?" :paramsDesc="['分类，默认为招生政策']">

| 招生政策   | 深化考试招生制度改革 | 教育法律法规 |
| ------ | ---------- | ------ |
| dnzszc | zdgg       | jyflfg |

</Route>

## 印象识堂

### 印象剪藏

<Route author="nczitzk" example="/yinxiang/note" path="/yinxiang/note" />

### 卡片清单

<Route author="nczitzk" example="/yinxiang/card/32" path="/yinxiang/card/:id?" :paramsDesc="['卡片 id，见下表，默认为每周收藏排行榜・TOP5']">

::: tip 提示

卡片对应的话题、专题等内容过期后，该卡片 id 也会失效，此时填入该卡片 id 将会报错。

:::

| 每周收藏排行榜・TOP5 | 每周热门「读书笔记」榜 TOP5 | 【印象话题】选择的悖论 | 【印象专题】如何一秒洞察问题本质？ | 「识堂开讲」5 位嘉宾精华笔记大放送 | 【印象话题】培养专注力的 5 个步骤 | 🎁购物清单主题活动获奖结果 |
| ------------ | ---------------- | ----------- | ----------------- | ------------------ | ------------------ | -------------- |
| 32           | 33               | 101         | 103               | 104                | 105                | 106            |

</Route>

### 用户公开笔记

<Route author="nczitzk" example="/yinxiang/personal/ZUhuRTmW5SKE7vvHPqI7cg" path="/yinxiang/personal/:id" :paramsDesc="['用户 id，可在用户页 URL 中找到']" />

### 笔记分类

<Route author="nczitzk" example="/yinxiang/category/28" path="/yinxiang/category/:id" :paramsDesc="['分类 id，可在分类页 URL 中找到']" />

### 笔记标签

<Route author="nczitzk" example="/yinxiang/tag/人生算法" path="/yinxiang/tag/:id" :paramsDesc="['标签名，可在标签页中找到']" />

## 英中协会

### 奖学金

<Route author="HenryQW" example="/gbcc/trust" path="/gbcc/trust" />

## 有道云笔记

### 学霸感悟

<Route author="nczitzk" example="/youdao/xueba" path="/youdao/xueba" />

### 笔记最新动态

<Route author="nczitzk" example="/youdao/latest" path="/youdao/latest" />

## 语雀

### 知识库

<Route author="aha2mao" example="/yuque/doc/75258" path="/yuque/doc/:repo_id" :paramsDesc="['仓库id，可在对应知识库主页的`/api/books/${repo_id}/docs`请求里找到']">

| Node.js 专栏 | 阮一峰每周分享 | 语雀使用手册 |
| ---------- | ------- | ------ |
| 75258      | 102804  | 75257  |

</Route>

## 知識分子

### 新聞

<Route author="yech1990" example="/zhishifenzi/news/ai" path="/zhishifenzi/news/:type" :paramsDesc="['类别，如 ai']"/>

| `:type`   | 类别名称 |
| --------- | ---- |
| biology   | 生物   |
| medicine  | 医药   |
| ai        | 人工智能 |
| physics   | 物理   |
| chymistry | 化学   |
| astronomy | 天文   |
| others    | 其他   |

> 参数置空（`/zhishifenzi/news`）获取所有类别

### 深度

<Route author="yech1990" example="/zhishifenzi/depth" path="/zhishifenzi/depth" />

### 创新

<Route author="yech1990" example="/zhishifenzi/innovation/company" path="/zhishifenzi/innovation/:type" :paramsDesc="['类别，如 company']"/>

| `:type`       | 类别名称   |
| ------------- | ------ |
| ~~multiple~~  | ~~综合~~ |
| company       | 公司     |
| product       | 产品     |
| technology    | 技术     |
| ~~character~~ | ~~人物~~ |
| policy        | 政策     |

> 参数置空（`/zhishifenzi/innovation`）获取所有类别

## 中国大学 MOOC (慕课)

### 最新

<Route author="xyqfer" example="/icourse163/newest" path="/icourse163/newest" />

## 中国人事考试网

### 通知公告

<Route author="nczitzk" example="/cpta/notice" path="/cpta/notice" />

## 中国智库网

### 观点与实践

<Route author="AEliu" example="/chinathinktanks/57" path="/chinathinktanks/:id" radar="1" :paramsDesc="['见下表，亦可在网站 url 里找到']" />

| `:id` | 专题名称 |
| ----- | ---- |
| 2     | 党的建设 |
| 3     | 社会   |
| 4     | 生态   |
| 5     | 政治   |
| 6     | 经济   |
| 7     | 文化   |
| 9     | 热点专题 |
| 10    | 国际关系 |
| 13    | 国外智库 |
| 46    | 智库报告 |
| 57    | 智库要闻 |
| 126   | 世界经济 |
| 127   | 宏观经济 |
| 128   | 区域经济 |
| 129   | 产业企业 |
| 130   | 三农问题 |
| 131   | 财政金融 |
| 132   | 科技创新 |
| 133   | 民主   |
| 134   | 法治   |
| 135   | 行政   |
| 136   | 国家治理 |
| 137   | 社会事业 |
| 138   | 社会保障 |
| 139   | 民族宗教 |
| 140   | 人口就业 |
| 141   | 社会治理 |
| 142   | 文化产业 |
| 143   | 公共文化 |
| 144   | 文化体制 |
| 145   | 文化思想 |
| 146   | 资源   |
| 147   | 能源   |
| 148   | 环境   |
| 149   | 生态文明 |
| 150   | 思想建设 |
| 151   | 作风建设 |
| 152   | 组织建设 |
| 153   | 制度建设 |
| 154   | 反腐倡廉 |
| 155   | 中国外交 |
| 156   | 全球治理 |
| 157   | 大国关系 |
| 158   | 地区政治 |
| 181   | 执政能力 |

</Route>
