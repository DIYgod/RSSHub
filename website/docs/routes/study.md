# 📖 Study

## 51VOA 美国之音 {#51voa-mei-guo-zhi-yin}

### 频道 {#51voa-mei-guo-zhi-yin-pin-dao}

<Route author="guhuaijin" example="/51voa/address" path="/51voa/:channel" paramsDesc={['频道名称']}/>

| `:channel`  | 对应网站栏目                                 |
| ----------- | -------------------------------------------- |
| standard    | 常速英语 (VOA Standard English)              |
| archive     | 常速英语存档 (VOA Standard English Archives) |
| technology  | 科技报道 (Technology Report)                 |
| daily       | 今日美国 (This is America)                   |
| sciences    | 科技报道 (Science in the News)               |
| health      | 健康报道 (Health Report)                     |
| education   | 教育报道 (Education Report)                  |
| economics   | 经济报道 (Economics Report)                  |
| culture     | 文化艺术 (American Mosaic)                   |
| events      | 时事新闻 (In the News)                       |
| stories     | 美国故事 (American Stories)                  |
| words       | 词汇掌故 (Words And Their Stories)           |
| trending    | 今日热点 (Trending Today)                    |
| magazine    | 新闻杂志 (AS IT IS)                          |
| grammar     | 日常语法 (Everyday Grammar)                  |
| queries     | 名师答疑 (Ask a Teacher)                     |
| history     | 美国历史 (U.S. History)                      |
| park        | 国家公园 (America's National Parks)          |
| president   | 美国总统 (America's Presidents)              |
| agriculture | 农业报道 (Agriculture Report)                |
| exploration | 自然探索 (Explorations)                      |
| people      | 美国人物 (People in America)                 |
| bilingual   | 双语新闻 (Bilingual News)                    |
| address     | 总统演讲 (President Address)                 |

## Asian Innovation and Entrepreneurship Association {#asian-innovation-and-entrepreneurship-association}

### Seminar Series {#asian-innovation-and-entrepreneurship-association-seminar-series}

<Route author="zxx-457" example="/aiea/seminars/upcoming" path="/aiea/seminars/:period" paramsDesc={['Time frame']}>

| Time frame |
| ----- |
| upcoming |
| past |
| both|

</Route>

## Chinese Social Science Net {#chinese-social-science-net}

### Institute of Law {#chinese-social-science-net-institute-of-law}

<Route author="HankChow" example="/cssn/iolaw/zxzp" path="/cssn/iolaw/:section?" paramsDesc={['Section ID, can be found in the URL. For example, the Section ID of URL `http://iolaw.cssn.cn/zxzp/` is `zxzp`. The default value is `zxzp`']}/>

## CTFHub Calendar {#ctfhub-calendar}

### 查询国内外 CTF 赛事信息 {#ctfhub-calendar-cha-xun-guo-nei-wai-ctf-sai-shi-xin-xi}

<Route author="frankli0324" example="/ctfhub/search"
path="/ctfhub/search/:limit?/:form?/:class?/:title?"
paramsDesc={['一个整数，筛选最新的limit场比赛，默认为10', '比赛形式', '比赛类型', '通过CTF赛事名称过滤']}>

| `:class` | 类型                              |
| :------: | --------------------------------- |
|     0    | Jeopardy [解题]                   |
|     1    | Attack with Defense [AwD 攻防]    |
|     2    | Robo Hacking Game [RHG AI 自动化] |
|     3    | Real World [RW 真实世界]          |
|     4    | King of The Hill [KoH 抢占山头]   |
|     5    | Mix [混合]                        |

> class 以 [https://api.ctfhub.com/User_API/Event/getType](https://api.ctfhub.com/User_API/Event/getType) 的返回结果为准

| `:form` | 形式   |
| :-----: | ------ |
|    0    | 线上赛 |
|    1    | 线下赛 |

</Route>

### 查询近期赛事 {#ctfhub-calendar-cha-xun-jin-qi-sai-shi}

<Route author="frankli0324" example="/ctfhub/upcoming" path="/ctfhub/upcoming/:limit?" paramsDesc={['一个整数，筛选最近的limit场比赛，默认为5']}>

</Route>

## DBLP {#dblp}

### Keyword Search {#dblp-keyword-search}

<Route author="ytno1" example="/dblp/knowledge%20tracing" path="/dblp/:field" paramsDesc={['Research field']} radar="1" />

## gradCafe {#gradcafe}

### gradCafe result {#gradcafe-gradcafe-result}

<Route author="liecn" example="/gradcafe/result" path="/gradcafe/result" />

### gradCafe result by key words {#gradcafe-gradcafe-result-by-key-words}

<Route author="liecn" example="/gradcafe/result/computer" path="/gradcafe/result/:type" paramsDesc={['Keyword']}/>

## Great Britain China Centre {#great-britain-china-centre}

### Educational Trust {#great-britain-china-centre-educational-trust}

<Route author="HenryQW" example="/gbcc/trust" path="/gbcc/trust" />

## iciba {#iciba}

### Daily English Sentence {#iciba-daily-english-sentence}

<Route author="mashirozx" example="/iciba/7/poster" path="/iciba/:days?/:img_type?" paramsDesc={['number of items to show (min = 1, max = 7, default = 1)', 'image style']}>

| `:img_type` | image style    |
| ----------- | -------------- |
| original    | Original size  |
| medium      | Medium size    |
| thumbnail   | Thumbnail size |
| poster      | Art poster     |

</Route>

## IELTS 雅思 {#ielts-ya-si}

### 最新消息 {#ielts-ya-si-zui-xin-xiao-xi}

<Route author="zenxds" example="/ielts" path="/ielts" puppeteer="1"/>

## Link Research {#link-research}

### Theses {#link-research-theses}

<Route author="y9c" example="/linkresearcher/category=theses&subject=生物" path="/linkresearcher/theses/:param" supportScihub="1" paramsDesc={['key=value，eg. subject=生物']} radar="1" rssbud="1">

| `:param` | example         | definition                             |
| -------- | --------------- | -------------------------------------- |
| category | category=thesis | **one of** theses/information/careers |
| subject  | subject=生物    | string / undefined                     |
| columns  | columns=健康    | string / undefined                     |
| columns  | columns=virus   | string / undefined                     |

</Route>

## MarginNote {#marginnote}

### 标签 {#marginnote-biao-qian}

<Route author="nczitzk" example="/marginnote/tag/经验分享" path="/marginnote/tag/:id?" paramsDesc={['标签名，见下表，默认为 经验分享']}>

| 经验分享 | 论坛精华 | 待跟进反馈 | 优秀建议 | 精选回答 | 官方签名 | 自动更新 | 3674 以上版本支持 | 368 以上版本支持 | 未经验证的安全风险 | 笔记本分享 | 关键反馈 | 精选话题讨论 | 灵感盒 | 引用 |
| -------- | -------- | ---------- | -------- | -------- | -------- | -------- | ----------------- | ---------------- | ------------------ | ---------- | -------- | ------------ | ------ | ---- |

</Route>

## Mind42 {#mind42}

### 分类 {#mind42-fen-lei}

<Route author="nczitzk" example="/mind42" path="/mind42/:caty?" paramsDesc={['分类，见下表，默认为 Overview']}>

| Overview | Popular | All    |
| -------- | ------- | ------ |
| mindmaps | popular | public |

</Route>

### 标签 {#mind42-biao-qian}

<Route author="nczitzk" example="/mind42/tag/online" path="/mind42/tag/:id" paramsDesc={['标签，见下表']}>

| in | online | cleaning | buy | best | services | for | carpet | service | india | company | and | de | mapa | control | malware | online-dating-website-reviews | virus | international-online-dating-sites-review | repair |
| -- | ------ | -------- | --- | ---- | -------- | --- | ------ | ------- | ----- | ------- | --- | -- | ---- | ------- | ------- | ----------------------------- | ----- | ---------------------------------------- | ------ |

</Route>

### 搜索 {#mind42-sou-suo}

<Route author="nczitzk" example="/mind42/search/online" path="/mind42/search/:keyword" paramsDesc={['关键字']}/>

## MindMeister {#mindmeister}

### Public Maps {#mindmeister-public-maps}

<Route author="TonyRL" example="/mindmeister/mind-map-examples" path="/mindmeister/:category?/:language?" paramsDesc={['Categories, see the table below, `mind-map-examples` by default', 'Languages, see the table below, `en` by default']} radar="1" rssbud="1">

| Categories | parameter |
| -------- | --------------- |
| Featured Map | mind-map-examples |
| Business | business |
| Design | design |
| Education | education |
| Entertainment | entertainment |
| Life | life |
| Marketing | marketing |
| Productivity | productivity |
| Summaries | summaries |
| Technology | technology |
| Other | other |

| Languages | parameter |
| -------- | --------------- |
| English | en |
| Deutsch | de |
| Français | fr |
| Español | es |
| Português | pt |
| Nederlands | nl |
| Dansk | da |
| Русский | ru |
| 日本語 | ja |
| Italiano | it |
| 简体中文 | zh |
| 한국어 | ko |
| Other | other |

</Route>

## NEEA 中国教育考试网 {#neea-zhong-guo-jiao-yu-kao-shi-wang}

### 国家教育考试 {#neea-zhong-guo-jiao-yu-kao-shi-wang-guo-jia-jiao-yu-kao-shi}

<Route author="SunShinenny" example="/neea/gaokao" path="/neea/:type" paramsDesc={['类别，如 gaokao']}/>

| `:type`  | 类别名称           |
| -------- | ------------------ |
| gaokao   | 普通高考           |
| chengkao | 成人高考           |
| yankao   | 研究生考试         |
| zikao    | 自学考试           |
| ntce     | 中小学教师资格考试 |

### 社会证书考试 {#neea-zhong-guo-jiao-yu-kao-shi-wang-she-hui-zheng-shu-kao-shi}

<Route author="SunShinenny" example="/neea/cet" path="/neea/:type" paramsDesc={['类别，如 cet']}/>

| `:type` | 类别名称                      |
| ------- | ----------------------------- |
| cet     | 全国四六级（CET）             |
| ncre    | 全国计算机等级考试（NCRE）    |
| nit     | 全国计算机应用水平考试（NIT） |
| pets    | 全国英语等级考试 (PETS)       |
| wsk     | 全国外语水平考试 (WSK)        |
| ccpt    | 书画等级考试 (CCPT)           |
| wsk     | 全国外语水平考试 (WSK)        |
| mets    | 医护英语水平考试 (METS)       |

### 教育部考试中心日本语能力测试重要通知 {#neea-zhong-guo-jiao-yu-kao-shi-wang-jiao-yu-bu-kao-shi-zhong-xin-ri-ben-yu-neng-li-ce-shi-zhong-yao-tong-zhi}

<Route author="nczitzk" example="/neea/jlpt" path="/neea/jlpt"/>

## ORCID {#orcid}

### Works List {#orcid-works-list}

<Route author="OrangeEd1t" example="/orcid/0000-0002-4731-9700" path="/orcid/:id" paramsDesc={['Open Researcher and Contributor ID']}/>

## ProcessOn {#processon}

### 推荐 {#processon-tui-jian}

<Route author="nczitzk" example="/processon/popular" path="/processon/popular/:cate?/:sort?" paramsDesc={['分类，见下表，默认为所有类型', '排序，见下表，默认为人气']}>

分类

| 所有类型 | 流程图 | BPMN | 思维导图 | UI 原型图 | UML | Org 组织结构图 | 网络拓扑图 | 韦恩图  |      |
| -------- | ------ | ---- | -------- | --------- | --- | -------------- | ---------- | ------- | ---- |
|          | es     | flow | bpmn     | mind_free | ui  | uml            | org        | network | venn |

排序

| 人气 | 最多人赞  | 最多收藏       | 最多浏览  | 最新发布    |
| ---- | --------- | -------------- | --------- | ----------- |
|      | likeCount | favouriteCount | viewCount | publishTime |

</Route>

## ResearchGate {#researchgate}

### Publications {#researchgate-publications}

<Route author="nczitzk" example="/researchgate/publications/Somsak-Panha" path="/researchgate/publications/:username" paramsDesc={['Username, can be found in URL']} puppeteer="1" anticrawler="1"/>

## Tableau {#tableau}

### Viz of the day {#tableau-viz-of-the-day}

<Route author="KaiyoungYu" example="/tableau/viz-of-the-day" path="/tableau/viz-of-the-day" radar="1" />

## The Korea Institute of Marine Law {#the-korea-institute-of-marine-law}

### Thesis {#the-korea-institute-of-marine-law-thesis}

<Route author="TonyRL" example="/kimlaw/thesis" path="/kimlaw/thesis" radar="1"/>

## X-MOL {#x-mol}

### News {#x-mol-news}

<Route author="cssxsh" example="/x-mol/news/3" path="/x-mol/news/:tag?" paramsDesc={['Tag number, can be obtained from news list URL. Empty value means news index.']} />

## XMind {#xmind}

### Mindmap Gallery {#xmind-mindmap-gallery}

<Route author="nczitzk" example="/xmind/mindmap" path="/xmind/mindmap/:lang?" paramsDesc={['language code, all languages by default']}>

| English | Español | Deutsch | Français | 中文 | 日本語 |
| ------- | ------- | ------- | -------- | ---- | ------ |
| en      | es      | de      | fr       | zh   | jp     |

</Route>

## zhimap 思维导图社区 {#zhimap-si-wei-dao-tu-she-qu}

<Route author="laampui" example="/zhimap/820156a42e9a490796c7fd56916aa95b/1" path="/zhimap/:categoryUuid?/:recommend?" paramsDesc={['分类 uuid，见下表，默认为33b67d1bad1d4e37812f71d42764af34', '1 为按推荐排序，0 为按最新排序，默认为 0']}>

| 热门                             | 学科                             | 学习                             | 语言                             | 工作                             | 提升                             | 生活                             | 互联网                           | 教育                             | 其他                             | 行业                             | 服务发布                         | 医疗                             |
| -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- |
| 33b67d1bad1d4e37812f71d42764af34 | 9434268e893a46aa9a1a231059849984 | 820156a42e9a490796c7fd56916aa95b | 959c81f606ca495c882c7e461429eb2a | 5af4bca5496e4733a2d582690627e25f | 5300988dff564756b5d462cea8a865b7 | 02fdcc2ab6374bc6b9b9717e70c87723 | 437d434fe9eb410a94dcefb889994e2b | 9747cbf78f96492c973aa6ab23925eee | d4c3a92a9cf64da7b187763211dc6ff6 | 58231ab9cef34af7819c3f6e2160c007 | 73d89972bee0457997c983d7fca19f9f | 853ce8b3a4c24b87a03f66af95c5e06c |

</Route>

## ZhiShiFenZi {#zhishifenzi}

### News {#zhishifenzi-news}

<Route author="y9c" example="/zhishifenzi/news/ai" path="/zhishifenzi/news/:type" paramsDesc={['type，eg. ai']}>

| `:type`   | type name |
| --------- | --------- |
| biology   | Biology   |
| medicine  | Medicine  |
| ai        | AI        |
| physics   | physics   |
| chymistry | Chymistry |
| astronomy | Astronomy |
| others    | Others    |

> leave it blank（`/zhishifenzi/news`）to get all

</Route>

### depth {#zhishifenzi-depth}

<Route author="y9c" example="/zhishifenzi/depth" path="/zhishifenzi/depth" />

### innovation {#zhishifenzi-innovation}

<Route author="y9c" example="/zhishifenzi/innovation/company" path="/zhishifenzi/innovation/:type" paramsDesc={['type，eg. company']}>

| `:type`       | type name     |
| ------------- | ------------- |
| ~~multiple~~  | ~~Multiple~~  |
| company       | Company       |
| product       | Product       |
| technology    | Technology    |
| ~~character~~ | ~~Character~~ |
| policy        | Policy        |

> leave it blank（`/zhishifenzi/innovation`）to get all

</Route>

## 德阳考试中心 {#de-yang-kao-shi-zhong-xin}

### 考试新闻 {#de-yang-kao-shi-zhong-xin-kao-shi-xin-wen}

<Route author="zytomorrow" example="/dykszx/news" path="/dykszx/news/:type?" paramsDesc={['考试类型']}>

| 新闻中心 | 公务员考试 | 事业单位 | （职）业资格、职称考试 |  其他 |
| :------: | :--------: | :------: | :--------------------: | :---: |
|    all   |     gwy    |   sydw   |          zyzc          | other |

</Route>

## 东莞教研网 {#dong-guan-jiao-yan-wang}

### 分类 {#dong-guan-jiao-yan-wang-fen-lei}

<Route author="nczitzk" example="/dgjyw/tz" path="/dgjyw/:category?" paramsDesc={['分类，见下表，默认为通知']}>

| 通知 | 动态 | 公示 |
| ---- | ---- | ---- |
| tz   | dt   | gs   |

:::tip

分类字段处填写的是对应东莞教研网网址中中介于 **`https://www.dgjyw.com/`** 和 **.htm** 中间的一段。

如 [通知](https://www.dgjyw.com/tz.htm) 的网址为 `https://www.dgjyw.com/tz.htm`，其中间字段为 `tz`，所以可得路由为 [`/dgjyw/tz`](https://rsshub.app/dgjyw/tz)；

同理，[教育科研 - 科研文件](https://www.dgjyw.com/jyky/kywj.htm) 的网址为 `https://www.dgjyw.com/jyky/kywj.htm`，其中间字段为 `jyky/kywj`，所以可得路由为 [`/dgjyw/jyky/kywj`](https://rsshub.app/dgjyw/jyky/kywj)。

:::

</Route>

## 福建考试报名网 {#fu-jian-kao-shi-bao-ming-wang}

### 分类 {#fu-jian-kao-shi-bao-ming-wang-fen-lei}

<Route author="nczitzk" example="/fjksbm" path="/fjksbm/:category?" paramsDesc={['分类，见下表，默认为网络报名进行中']} radar="1">

| 已发布公告 (方案)，即将开始 | 网络报名进行中 | 网络报名结束等待打印准考证 | 正在打印准考证 | 考试结束，等待发布成绩 | 已发布成绩 | 新闻动态 | 政策法规 |
| --------------------------- | -------------- | -------------------------- | -------------- | ---------------------- | ---------- | -------- | -------- |
| 0                           | 1              | 2                          | 3              | 4                      | 5          | news     | policy   |

</Route>

## 杭州市国家普通话测试网报信息 {#hang-zhou-shi-guo-jia-pu-tong-hua-ce-shi-wang-bao-xin-xi}

### 考试信息 {#hang-zhou-shi-guo-jia-pu-tong-hua-ce-shi-wang-bao-xin-xi-kao-shi-xin-xi}

<Route author="ChaosTong" example="/putonghua" path="/putonghua" />

## 湖南人事考试网 {#hu-nan-ren-shi-kao-shi-wang}

### 公告 {#hu-nan-ren-shi-kao-shi-wang-gong-gao}

<Route author="TonyRL" example="/hunanpea/rsks/2f1a6239-b4dc-491b-92af-7d95e0f0543e" path="/hunanpea/rsks/:guid" paramsDesc={['分类 id，可在 URL 中找到']} radar="1"/>

## 唧唧堂 {#ji-ji-tang}

### 论文 {#ji-ji-tang-lun-wen}

<Route author="xfangbao" example="/jijitang/publication" path="/jijitang/publication/" />

### 文档 {#ji-ji-tang-wen-dang}

<Route author="xfangbao" example="/jijitang/article/latest" path="/jijitang/article/:id" paramsDesc={['类别，latest 或者 recommand']}/>

## 经济 50 人论坛 {#jing-ji-50-ren-lun-tan}

### 专家文章 {#jing-ji-50-ren-lun-tan-zhuan-jia-wen-zhang}

<Route author="sddiky" example="/50forum" path="/50forum" radar="1"/>

## 码农周刊 {#ma-nong-zhou-kan}

### issues {#ma-nong-zhou-kan-issues}

<Route author="tonghs" example="/manong-weekly" path="/manong-weekly" />

## 幕布精选 {#mu-bu-jing-xuan}

<Route author="laampui nczitzk" example="/mubu/explore/16/读书笔记" path="/mubu/explore/:category?/:title?" paramsDesc={['分类 id', '显示标题']} />

## 山东省教育招生考试院 {#shan-dong-sheng-jiao-yu-zhao-sheng-kao-shi-yuan}

### 新闻 {#shan-dong-sheng-jiao-yu-zhao-sheng-kao-shi-yuan-xin-wen}

<Route author="nczitzk" example="/sdzk" path="/sdzk/:bcid?/:cid?" paramsDesc={['板块 id，可在对应板块页 URL 中找到，默认为 `1`，即信息与政策', '栏目 id，可在对应板块页 URL 中找到，默认为 `16`，即通知公告']}>

:::tip

若订阅 [信息与政策](https://www.sdzk.cn/NewsList.aspx?BCID=1)，网址为 `https://www.sdzk.cn/NewsList.aspx?BCID=1`。截取 `BCID=1` 作为参数，此时路由为 [`/sdzk/1`](https://rsshub.app/sdzk/1)。

若订阅 [通知公告](https://www.sdzk.cn/NewsList.aspx?BCID=1&CID=16)，网址为 `https://www.sdzk.cn/NewsList.aspx?BCID=1&CID=16`。截取 `BCID=1` 与 `CID=16` 作为参数，此时路由为 [`/sdzk/1/16`](https://rsshub.app/sdzk/1/16)。

:::

</Route>

## 扇贝 {#shan-bei}

### 用户打卡 {#shan-bei-yong-hu-da-ka}

<Route author="DIYgod" example="/shanbay/checkin/ddwej" path="/shanbay/checkin/:id" paramsDesc={['用户 id']} />

### 精选文章 {#shan-bei-jing-xuan-wen-zhang}

<Route author="qiwihui" example="/shanbay/footprints" path="/shanbay/footprints/:category?" paramsDesc={['分类 id']}>

| 用户故事 | 地道表达法 | 实用口语 | 语法教室 | 读新闻学英语 | 单词鸡汤 | 扇贝理念 | 英语知识 | 原汁英文 |
| -------- | ---------- | -------- | -------- | ------------ | -------- | -------- | -------- | -------- |
| 1        | 31         | 46       | 34       | 40           | 43       | 16       | 7        | 10       |

| 学习方法 | 影视剧讲义 | 产品更新 | 精读文章 | 他山之石 | Quora 翻译 | TED 推荐 | 大耳狐小课堂 | 互动话题 |
| -------- | ---------- | -------- | -------- | -------- | ---------- | -------- | ------------ | -------- |
| 13       | 22         | 28       | 4        | 19       | 25         | 37       | 49           | 52       |

</Route>

## 上海市教育考试院 {#shang-hai-shi-jiao-yu-kao-shi-yuan}

### 消息速递 {#shang-hai-shi-jiao-yu-kao-shi-yuan-xiao-xi-su-di}

官方网址：[http://www.shmeea.edu.cn](http://www.shmeea.edu.cn)

<Route author="jialinghui" example="/shmeea" path="/shmeea" radar="1" rssbud="1"/>

### 自学考试通知公告 {#shang-hai-shi-jiao-yu-kao-shi-yuan-zi-xue-kao-shi-tong-zhi-gong-gao}

<Route author="h2ws" example="/shmeea/self-study" path="/shmeea/self-study" radar="1" rssbud="1"/>

## 思维导图社区 {#si-wei-dao-tu-she-qu}

### 热门导图 {#si-wei-dao-tu-she-qu-re-men-dao-tu}

<Route author="nczitzk" example="/edrawsoft/mindmap/1/PV/DESC/CN/1" path="/edrawsoft/mindmap/:classId?/:order?/:sort?/:lang?/:price?/:search?" paramsDesc={['分类编号，见下表，默认为全部分类', '排序参数，`PV` 指 最多浏览，`TIME` 指 最新发布，`LIKE` 指 最多点赞，默认为 `PV` 即 最多浏览', '排序方式，`DESC` 指 降序，`ASC` 指 升序，默认为 `DESC` 即 降序', '模板语言，默认为 `CN`', '是否免费，`1` 指 全部，`2` 指 免费，`3` 指 付费，`4` 指 会员免费，默认为 `1` 即 全部', '搜索关键词，默认为空']}>

:::tip

不支持分类搜索和自定义搜索排序，即 `search` 参数不为空时，其他参数不起作用。

:::

分类编号如下表（选择全部则填入编号 0）

| 职业技能 | 企业家 / 管理者 | 程序员 | 产品经理 | 运营 / 市场营销 | 人事 / 培训 / 行政 | 法律 / 法务 | 医学 / 药学 / 保健 | 银行 / 金融 / 证券 / 保险 | 电商 / 微商 / 零售 | 编辑 / 媒体 / 出版 | 机械 / 电子 / 制造业 | 城市 / 建筑 / 房地产 | 其他技能 |
| -------- | --------------- | ------ | -------- | --------------- | ------------------ | ----------- | ------------------ | ------------------------- | ------------------ | ------------------ | -------------------- | -------------------- | -------- |
| 1        | 7               | 8      | 9        | 10              | 11                 | 12          | 13                 | 14                        | 15                 | 16                 | 17                   | 58                   | 59       |

| 考研考证 | 研究生考试 | 建考 | 法考 | 教师资格证 | 公考 | 英语 | 医考 | 会计师 | 计算机 | 专升本 |
| -------- | ---------- | ---- | ---- | ---------- | ---- | ---- | ---- | ------ | ------ | ------ |
| 2        | 18         | 19   | 20   | 21         | 22   | 23   | 24   | 25     | 26     | 27     |

| 生活娱乐 | 体育 | 音乐 | 影视 | 旅游 | 游戏 | 兴趣 | 生活 |
| -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 3        | 29   | 30   | 31   | 32   | 33   | 34   | 56   |

| 校园教育 | 大学 | 高中 | 初中 | 小学 | 教育 |
| -------- | ---- | ---- | ---- | ---- | ---- |
| 4        | 35   | 36   | 37   | 38   | 39   |

| 读书笔记 | 文学作品 | 心灵成长 | 经管知识 | 终身学习 | 通用知识 | 知识栏目 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 5        | 40       | 41       | 42       | 43       | 44       | 45       |

| 创意脑图 | 长图 | 鱼骨图 | 时间线 | 圆圈图 | 组织结构 | 树状图 | 流程图 |
| -------- | ---- | ------ | ------ | ------ | -------- | ------ | ------ |
| 6        | 46   | 47     | 48     | 49     | 50       | 51     | 57     |

</Route>

## 搜韵网 {#sou-yun-wang}

### 诗词日历 {#sou-yun-wang-shi-ci-ri-li}

<Route author="nczitzk" example="/souyun/today" path="/souyun/today"/>

## 网易公开课 {#wang-yi-gong-kai-ke}

### 精品课程 {#wang-yi-gong-kai-ke-jing-pin-ke-cheng}

<Route author="hoilc" example="/163/open/vip" path="/163/open/vip" radar="1" rssbud="1"/>

## 下厨房 {#xia-chu-fang}

### 用户作品 {#xia-chu-fang-yong-hu-zuo-pin}

<Route author="xyqfer" example="/xiachufang/user/cooked/103309404" path="/xiachufang/user/cooked/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']}/>

### 用户菜谱 {#xia-chu-fang-yong-hu-cai-pu}

<Route author="xyqfer" example="/xiachufang/user/created/103309404" path="/xiachufang/user/created/:id" paramsDesc={['用户 id, 可在用户主页 URL 中找到']}/>

### 作品动态 {#xia-chu-fang-zuo-pin-dong-tai}

<Route author="xyqfer" example="/xiachufang/popular/hot" path="/xiachufang/popular/:timeframe?" paramsDesc={['默认最新上传']}>

| 正在流行 | 24 小时最佳 | 本周最受欢迎 | 新秀菜谱 | 月度最佳   |
| -------- | ----------- | ------------ | -------- | ---------- |
| hot      | pop         | week         | rising   | monthhonor |

</Route>

## 学堂在线 {#xue-tang-zai-xian}

### 课程信息 {#xue-tang-zai-xian-ke-cheng-xin-xi}

<Route author="sanmmm" example="/xuetangx/course/course-v1:TsinghuaX+20240103X+2019_T1/status" path="/xuetangx/course/:cid/:type" paramsDesc={['课程id, 从课程页URL中可得到', '课程信息类型']}>

课程信息类型

| 课程开始时间 | 课程结束时间 | 课程进度 |
| ------------ | ------------ | -------- |
| start        | end          | status   |

</Route>

### 课程列表 {#xue-tang-zai-xian-ke-cheng-lie-biao}

<Route author="sanmmm" example="/xuetangx/course/list/0/1/0" path="/xuetangx/course/list/:mode/:status/:credential/:type?" paramsDesc={['课程模式', '课程状态', '课程认证类型', '学科分类 默认为`全部`']}>

课程模式

| 自主 | 随堂 | 付费 | 全部 |
| ---- | ---- | ---- | ---- |
| 0    | 1    | 2    | -1   |

课程状态

| 即将开课 | 已开课 | 已结课 | 全部 |
| -------- | ------ | ------ | ---- |
| 1        | 2      | 3      | -1   |

课程认证类型

| 签字认证 | 认证开放 | 全部 |
| -------- | -------- | ---- |
| 1        | 2        | -1   |

学科分类

| 全部 | 计算机 | 经管・会计 | 创业 | 电子 | 工程 | 环境・地球 | 医学・健康 | 生命科学 | 数学 | 物理 | 化学 | 社科・法律 | 文学 | 历史 | 哲学 | 艺术・设计 | 外语 | 教育 | 其他 | 大学先修课 | 公共管理 | 建筑 | 职场 | 全球胜任力 |
| ---- | ------ | ---------- | ---- | ---- | ---- | ---------- | ---------- | -------- | ---- | ---- | ---- | ---------- | ---- | ---- | ---- | ---------- | ---- | ---- | ---- | ---------- | -------- | ---- | ---- | ---------- |
| -1   | 117    | 118        | 119  | 120  | 121  | 122        | 123        | 124      | 125  | 126  | 127  | 128        | 129  | 130  | 131  | 132        | 133  | 134  | 135  | 201        | 2550     | 2783 | 2952 | 6200       |

</Route>

## 阳光高考 {#yang-guang-gao-kao}

### 教育部阳光高考信息公开平台招生政策规定 {#yang-guang-gao-kao-jiao-yu-bu-yang-guang-gao-kao-xin-xi-gong-kai-ping-tai-zhao-sheng-zheng-ce-gui-ding}

<Route author="nczitzk" example="/chsi/zszcgd" path="/chsi/zszcgd/:category?" paramsDesc={['分类，默认为招生政策']}>

| 招生政策 | 深化考试招生制度改革 | 教育法律法规 |
| -------- | -------------------- | ------------ |
| dnzszc   | zdgg                 | jyflfg       |

</Route>

## 印象识堂 {#yin-xiang-shi-tang}

### 印象剪藏 {#yin-xiang-shi-tang-yin-xiang-jian-cang}

<Route author="nczitzk" example="/yinxiang/note" path="/yinxiang/note" />

### 卡片清单 {#yin-xiang-shi-tang-ka-pian-qing-dan}

<Route author="nczitzk" example="/yinxiang/card/32" path="/yinxiang/card/:id?" paramsDesc={['卡片 id，见下表，默认为每周收藏排行榜・TOP5']}>

:::tip

卡片对应的话题、专题等内容过期后，该卡片 id 也会失效，此时填入该卡片 id 将会报错。

:::

| 每周收藏排行榜・TOP5 | 每周热门「读书笔记」榜 TOP5 | 【印象话题】选择的悖论 | 【印象专题】如何一秒洞察问题本质？ | 「识堂开讲」5 位嘉宾精华笔记大放送 | 【印象话题】培养专注力的 5 个步骤 | 🎁 购物清单主题活动获奖结果 |
| -------------------- | --------------------------- | ---------------------- | ---------------------------------- | ---------------------------------- | --------------------------------- | --------------------------- |
| 32                   | 33                          | 101                    | 103                                | 104                                | 105                               | 106                         |

</Route>

### 用户公开笔记 {#yin-xiang-shi-tang-yong-hu-gong-kai-bi-ji}

<Route author="nczitzk" example="/yinxiang/personal/ZUhuRTmW5SKE7vvHPqI7cg" path="/yinxiang/personal/:id" paramsDesc={['用户 id，可在用户页 URL 中找到']} />

### 笔记分类 {#yin-xiang-shi-tang-bi-ji-fen-lei}

<Route author="nczitzk" example="/yinxiang/category/28" path="/yinxiang/category/:id" paramsDesc={['分类 id，可在分类页 URL 中找到']} />

### 笔记标签 {#yin-xiang-shi-tang-bi-ji-biao-qian}

<Route author="nczitzk" example="/yinxiang/tag/人生算法" path="/yinxiang/tag/:id" paramsDesc={['标签名，可在标签页中找到']} />

## 有道云笔记 {#you-dao-yun-bi-ji}

### 学霸感悟 {#you-dao-yun-bi-ji-xue-ba-gan-wu}

<Route author="nczitzk" example="/youdao/xueba" path="/youdao/xueba" />

### 笔记最新动态 {#you-dao-yun-bi-ji-bi-ji-zui-xin-dong-tai}

<Route author="nczitzk" example="/youdao/latest" path="/youdao/latest" />

## 语雀 {#yu-que}

### 知识库 {#yu-que-zhi-shi-ku}

<Route author="aha2mao ltaoo" example="/yuque/ruanyf/weekly" path="/yuque/:name/:book" paramsDesc={['用戶名', '知识库 ID']} radar="1">

| Node.js 专栏                                             | 阮一峰每周分享                                                 | 语雀使用手册                                             |
| -------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| [/yuque/egg/nodejs](https://rsshub.app/yuque/egg/nodejs) | [/yuque/ruanyf/weekly](https://rsshub.app/yuque/ruanyf/weekly) | [/yuque/yuque/help](https://rsshub.app/yuque/yuque/help) |

</Route>

## 中国大学 MOOC (慕课) {#zhong-guo-da-xue-mooc-mu-ke}

### 最新 {#zhong-guo-da-xue-mooc-mu-ke-zui-xin}

<Route author="xyqfer" example="/icourse163/newest" path="/icourse163/newest" />

## 中国管理现代化研究会 {#zhong-guo-guan-li-xian-dai-hua-yan-jiu-hui}

### 栏目 {#zhong-guo-guan-li-xian-dai-hua-yan-jiu-hui-lan-mu}

<Route author="nczitzk" example="/camchina" path="/camchina/:id?" paramsDesc={['分类，见下表，默认为 1，即新闻']}>

| 新闻 | 通告栏 |
| ---- | ------ |
| 1    | 2      |

</Route>

## 中国计算机学会 {#zhong-guo-ji-suan-ji-xue-hui}

### 新闻 {#zhong-guo-ji-suan-ji-xue-hui-xin-wen}

<Route author="nczitzk" example="/ccf/news" path="/ccf/news/:category?" paramsDesc={['分类，见下表，默认为 CCF 新闻']}>

| CCF 新闻   | CCF 聚焦 | ACM 信息 |
| ---------- | -------- | -------- |
| Media_list | Focus    | ACM_News |

</Route>

### 计算机视觉专委会 - 学术动态 - 分类 {#zhong-guo-ji-suan-ji-xue-hui-ji-suan-ji-shi-jue-zhuan-wei-hui-xue-shu-dong-tai-fen-lei}

<Route author="elxy" example="/ccf/ccfcv/xsdt/xsqy" path="/ccf/ccfcv/:channel/:category" paramsDesc={['频道，仅支持 `xsdt`', '分类，见下表，亦可在网站 url 里找到']}>

| 学术前沿 | 热点征文 | 学术会议 |
| -------- | -------- | -------- |
| xsqy     | rdzw     | xshy     |

</Route>

### 大数据专家委员会 {#zhong-guo-ji-suan-ji-xue-hui-da-shu-ju-zhuan-jia-wei-yuan-hui}

<Route author="tudou027" example="/ccf/tfbd/xwdt/tzgg" path="/ccf/tfbd/:caty/:id" paramsDesc={['主分类，可在 URL 找到', '子分类，可在 URL 找到']} radar="1"/>

## 中国技术经济学会 {#zhong-guo-ji-shu-jing-ji-xue-hui}

### 栏目 {#zhong-guo-ji-shu-jing-ji-xue-hui-lan-mu}

<Route author="nczitzk" example="/cste" path="/cste/:id?" paramsDesc={['分类，见下表，默认为 16，即通知公告']}>

| 通知公告 | 学会新闻 | 科协简讯 | 学科动态 | 往事钩沉 |
| -------- | -------- | -------- | -------- | -------- |
| 16       | 18       | 19       | 20       | 21       |

</Route>

## 中国留学网 {#zhong-guo-liu-xue-wang}

### 通知公告 {#zhong-guo-liu-xue-wang-tong-zhi-gong-gao}

<Route author="nczitzk" example="/cscse/tzgg" path="/cscse/tzgg"/>

## 中国人工智能学会 {#zhong-guo-ren-gong-zhi-neng-xue-hui}

### 学会动态 {#zhong-guo-ren-gong-zhi-neng-xue-hui-xue-hui-dong-tai}

<Route author="tudou027" example="/caai/45" path="/caai/:caty" paramsDesc={['分类 ID，可在 URL 找到']} radar="1"/>

## 中国人事考试网 {#zhong-guo-ren-shi-kao-shi-wang}

### 通知公告 {#zhong-guo-ren-shi-kao-shi-wang-tong-zhi-gong-gao}

<Route author="nczitzk" example="/cpta/notice" path="/cpta/notice" />

## 中国研究生招生信息网 {#zhong-guo-yan-jiu-sheng-zhao-sheng-xin-xi-wang}

### 考研热点新闻 {#zhong-guo-yan-jiu-sheng-zhao-sheng-xin-xi-wang-kao-yan-re-dian-xin-wen}

<Route author="yanbot-team" example="/chsi/hotnews" path="/chsi/hotnews" radar="1" />

### 考研动态 {#zhong-guo-yan-jiu-sheng-zhao-sheng-xin-xi-wang-kao-yan-dong-tai}

<Route author="SunBK201" example="/chsi/kydt" path="/chsi/kydt" radar="1" />

### 考研资讯 {#zhong-guo-yan-jiu-sheng-zhao-sheng-xin-xi-wang-kao-yan-zi-xun}

<Route author="yanbot-team" example="/chsi/kyzx/fstj" path="/chsi/kyzx/:type" radar="1" paramsDesc={[' type 见下表，亦可在网站 URL 找到']} >

| `:type` | 专题名称 |
| ------- | -------- |
| fstj    | 复试调剂 |
| kydt    | 考研动态 |
| zcdh    | 政策导航 |
| kyrw    | 考研人物 |
| jyxd    | 经验心得 |

</Route>

## 中国智库网 {#zhong-guo-zhi-ku-wang}

### 观点与实践 {#zhong-guo-zhi-ku-wang-guan-dian-yu-shi-jian}

<Route author="AEliu" example="/chinathinktanks/57" path="/chinathinktanks/:id" radar="1" paramsDesc={['见下表，亦可在网站 url 里找到']} >

| `:id` | 专题名称 |
| ----- | -------- |
| 2     | 党的建设 |
| 3     | 社会     |
| 4     | 生态     |
| 5     | 政治     |
| 6     | 经济     |
| 7     | 文化     |
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
| 133   | 民主     |
| 134   | 法治     |
| 135   | 行政     |
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
| 146   | 资源     |
| 147   | 能源     |
| 148   | 环境     |
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

## 中华人民共和国学位证书查询 {#zhong-hua-ren-min-gong-he-guo-xue-wei-zheng-shu-cha-xun}

### 各学位授予单位学位证书上网进度 {#zhong-hua-ren-min-gong-he-guo-xue-wei-zheng-shu-cha-xun-ge-xue-wei-shou-yu-dan-wei-xue-wei-zheng-shu-shang-wang-jin-du}

<Route author="TonyRL" example="/chinadegrees/11" path="/chinadegrees/:province?" paramsDesc={['省市代号，见下表，亦可在 [这里](http://www.chinadegrees.com.cn/help/provinceSwqk.html) 找到，默认为 `11`']} radar="1" rssbud="1" puppeteer="1" >

| 省市             | 代号 |
| ---------------- | ---- |
| 北京市           | 11   |
| 天津市           | 12   |
| 河北省           | 13   |
| 山西省           | 14   |
| 内蒙古自治区     | 15   |
| 辽宁省           | 21   |
| 吉林省           | 22   |
| 黑龙江省         | 23   |
| 上海市           | 31   |
| 江苏省           | 32   |
| 浙江省           | 33   |
| 安徽省           | 34   |
| 福建省           | 35   |
| 江西省           | 36   |
| 山东省           | 37   |
| 河南省           | 41   |
| 湖北省           | 42   |
| 湖南省           | 43   |
| 广东省           | 44   |
| 广西壮族自治区   | 45   |
| 海南省           | 46   |
| 重庆市           | 50   |
| 四川省           | 51   |
| 贵州省           | 52   |
| 云南省           | 53   |
| 西藏自治区       | 54   |
| 陕西省           | 61   |
| 甘肃省           | 62   |
| 青海省           | 63   |
| 宁夏回族自治区   | 64   |
| 新疆维吾尔自治区 | 65   |
| 台湾             | 71   |

</Route>

