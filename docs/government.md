---
pageClass: routes
---

# 政务消息

## 安徽省科技厅

### 科技资讯 & 科技资源

<Route author="nczitzk" example="/gov/anhui/kjt/kjzx/tzgg" path="/gov/anhui/kjt/:path?" :paramsDesc="['路径，默认为通知公告']">

::: tip 提示

路径处填写对应页面 URL 中 `http://kjt.ah.gov.cn/` 和 `/index.html` 之间的字段。下面是一个例子。

若订阅 [通知公告](http://kjt.ah.gov.cn/kjzx/tzgg/index.html) 则将对应页面 URL <http://kjt.ah.gov.cn/kjzx/tzgg/index.html> 中 `http://kjt.ah.gov.cn/` 和 `/index.html` 之间的字段 `kjzx/tzgg` 作为路径填入。此时路由为 [`/gov/anhui/kjt/kjzx/tzgg`](https://rsshub.app/gov/anhui/kjt/kjzx/tzgg)

:::

</Route>

## 澳门廉政公署

### 最新消息

<Route author="linbuxiao" example="/ccac/news/all" path="/ccac/news/:type/:lang?" :paramsDesc="['类别', '语言，留空为`sc`，支持`sc`（简中），`tc`（繁中），`en`（英文），`pt`（葡萄牙文）']">

| 全部  | 案件发布 | 调查报告或勘喻    | 年度报告         | 公署消息    |
| --- | ---- | ---------- | ------------ | ------- |
| all | case | Persuasion | AnnualReport | PCANews |

</Route>

## 澳门卫生局

### 最新消息

<Route author="Fatpandac" example="/ssm/news" path="/ssm/news"/>

## 北京市科学技术委员会、中关村科技园区管理委员会

### 频道

<Route author="Fatpandac" example="/kwbeijing/col736" path="/kwbeijing/:channel" :paramsDesc="['频道']">

频道参数可在官网获取，如：

`http://kw.beijing.gov.cn/col/col736/index.html` 对应 `/kwbeijing/col736`

</Route>

## 北京市卫生健康委员会

### 新闻中心

<Route author="luyuhuang" example="/gov/beijing/mhc/wnxw" path="/gov/beijing/mhc/:caty" :paramsDesc="['类别']">

| 委内新闻 | 基层动态 | 媒体聚焦 |  热点新闻 |
| :--: | :--: | :--: | :---: |
| wnxw | jcdt | mtjj | rdxws |

</Route>

## 重庆市人民政府

### 两江新区信息公开网

#### 党务公开

<Route author="nczitzk" example="/gov/chongqing/ljxq/dwgk" path="/gov/chongqing/ljxq/dwgk"/>

#### 政务公开

<Route author="nczitzk" example="/gov/chongqing/ljxq/zwgk/lzyj" path="/gov/chongqing/ljxq/zwgk/:caty" :paramsDesc="['分类名']">

| 履职依据 | 公示公告 |
| ---- | ---- |
| lzyj | gsgg |

</Route>

## 德阳考试中心

### 考试新闻

<Route author="zytomorrow" example="/dykszx/news" path="/dykszx/news/:type?" :paramsDesc="['考试类型。']">

| 新闻中心 | 公务员考试 | 事业单位 | （职）业资格、职称考试 |   其他  |
| :--: | :---: | :--: | :---------: | :---: |
|  all |  gwy  | sydw |     zyzc    | other |

</Route>

## 德阳市人民政府

### 德阳市政府公开信息

<Route author="zytomorrow" example="/gov/sichuan/deyang/govpulicinfo/绵竹市" path="/gov/sichuan/deyang/govpulicinfo/:countyName" :paramsDesc="['区县名（**其他区县整改中，暂时只支持`绵竹市`**）。德阳市、绵竹市、广汉市、什邡市、中江县、罗江区、旌阳区、高新区']"/>

## 广东省人民政府

### 广东省教育厅

<Route author="nczitzk" example="/gov/guangdong/edu/tzgg" path="/gov/guangdong/edu/:caty" :paramsDesc="['资讯类别']">

| 通知公告 | 本厅信息 | 新闻发布 | 媒体聚焦 | 广东教育 | 教育动态 | 图片新闻 | 政声传递 |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| tzgg | btxx | xwfb | mtjj | gdjy | jydt | tpxw | zscd |

</Route>

### 广东省教育考试院

<Route author="icealtria" example="/gov/guangdong/eea/kszs" path="/gov/guangdong/eea/:caty" :paramsDesc="['资讯类别']">

| 考试招生 | 社会考试 | 招考公示 | 报考指南 | 要闻动态 | 公开专栏 | 政策文件 | 政策解读 |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| kszs | shks | zkgs | bkzn | news | gkzl | zcwj | zcjd |

</Route>

### 广东省深圳市人民政府

<Route author="laoxua" example="/gov/shenzhen/xxgk/zfxxgj/tzgg" path="/gov/shenzhen/xxgk/zfxxgj/:caty" :paramsDesc="['信息类别']">

| 通知公告 | 政府采购 | 资金信息 | 重大项目 |
| :--: | :--: | :--: | :--: |
| tzgg | zfcg | zjxx | zdxm |

</Route>

### 深圳市委组织部

<Route author="zlasd" example="/gov/shenzhen/zzb/tzgg" path="/gov/shenzhen/zzb/:caty/:page?" :paramsDesc="['信息类别', '页码']">

| 通知公告 | 任前公示 | 政策法规 | 工作动态 | 部门预算决算公开 | 业务表格下载 |
| :--: | :--: | :--: | :--: | :------: | :----: |
| tzgg | rqgs | zcfg | gzdt |   xcbd   |  bgxz  |

</Route>

### 深圳市考试院

<Route author="zlasd" example="/gov/shenzhen/hrss/szksy/bmxx/2" path="/gov/shenzhen/hrss/szksy/:caty/:page?" :paramsDesc="['信息类别', '页码']">

| 通知公告 | 报名信息 | 成绩信息 | 合格标准 | 合格人员公示 | 证书发放信息 |
| :--: | :--: | :--: | :--: | :----: | :----: |
| tzgg | bmxx | cjxx | hgbz | hgrygs |  zsff  |

</Route>

### 惠州市人民政府

#### 政务公开

<Route author="Fatpandac" example="/gov/huizhou/zwgk/jgdt" path="/gov/huizhou/zwgk/:category?" :paramsDesc="['资讯类别，可以从网址中得到，默认为政务要闻']"/>

## 国家税务总局

### 最新文件

<Route author="nczitzk" example="/gov/chinatax/latest" path="/gov/chinatax/latest"/>

## 国家新闻出版广电总局（弃用）

### 游戏审批结果

<Route author="y2361547758" example="/gov/sapprft/approval/domesticnetgame/2020年1月" path="/gov/sapprft/approval/:channel/:detail?" :paramsDesc="['栏目名', '标题关键字']">

|     栏目     |      channel      |
| :--------: | :---------------: |
| 进口网络游戏审批信息 |  importednetgame  |
| 进口电子游戏审批信息 | importedvideogame |
| 国产网络游戏审批信息 |  domesticnetgame  |
|  游戏审批变更信息  |     gamechange    |

|          描述         |    detail    |
| :-----------------: | :----------: |
|     留空，返回栏目所有文章     |              |
|   new，返回栏目第一篇文章内容   |      new     |
| 某个文章标题的一部分，返回这篇文章内容 | 例：2020 年 1 月 |

</Route>

## 国家新闻出版署

### 列表

<Route author="y2361547758" example="/gov/nppa/317" path="/gov/nppa/:channel" :paramsDesc="['栏目名id']" radar="1" rssbud="1"/>

### 详情

<Route author="y2361547758" example="/gov/nppa/318/45948" path="/gov/nppa/:channel/:content" :paramsDesc="['栏目名id', '文章id']" radar="1" rssbud="1"/>

## 国家药品审评网站

### 首页

<Route author="Fatpandac" example="/cde/news/gzdt" path="/cde/:channel/:category" :paramsDesc="['频道', '类别']">

-   频道

| 新闻中心 |  政策法规  |
| :--: | :----: |
| news | policy |

-   类别

| 新闻中心 | 政务新闻 | 要闻导读 | 图片新闻 | 工作动态 |
| :--: | :--: | :--: | :--: | :--: |
|      | zwxw | ywdd | tpxw | gzdt |

| 政策法规 | 法律法规 | 中心规章 |
| :--: | :--: | :--: |
|      | flfg | zxgz |

</Route>

## 哈尔滨市科技局

### 政务公开

<Route author="XYenon" example="/gov/harbin/kjj" path="/gov/harbin/kjj"/>

## 湖北省软件行业协会

### 新闻中心

<Route author="tudou027" example="/gov/hubei/hbsia/zxzx" path="/gov/hubei/hbsia/:caty" :paramsDesc="['类别']">

| 具体栏目 |  参数  |
| :--: | :--: |
| 最新资讯 | zxzx |
| 活动通知 | hdtz |
| 活动报道 | hdbd |
| 公示公告 | gsgg |

</Route>

## 联合国

### 安理会否决了决议

<Route author="HenryQW" example="/un/scveto" path="/un/scveto"/>

## 美国白宫办公厅

### 简报室

<Route author="nczitzk" example="/whitehouse/briefing-room" path="/whitehouse/briefing-room/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| All | Blog | Legislation | Presidential Actions | Press Briefings | Speeches and Remarks | Statements and Releases |
| --- | ---- | ----------- | -------------------- | --------------- | -------------------- | ----------------------- |
|     | blog | legislation | presidential-actions | press-briefings | speeches-remarks     | statements-releases     |

</Route>

### 科学技术政策办公室

<Route author="LyleLee" example="/whitehouse/ostp" path="/whitehouse/ostp"/>

## 美国财政部

### 新闻稿

<Route author="nczitzk" example="/treasury/press-releases" path="/treasury/press-releases/:category?/:title?" :paramsDesc="['分类，见下表，默认为全部', '标题关键字，默认为空']">

分类

| Press Releases | Statements & Remarks | Readouts | Testimonies |
| -------------- | -------------------- | -------- | ----------- |
| all            | statements-remarks   | readouts | testimonies |

</Route>

## 美国联邦最高法院

### 辩论音频

<Route author="nczitzk" example="/us/supremecourt/argument_audio" path="/us/supremecourt/argument_audio/:year?" :paramsDesc="['年份，默认为当前年份']"/>

## 美国贸易代表办公室

### 新闻稿

<Route author="nczitzk" example="/ustr/press-releases" path="/ustr/press-releases/:year?/:month?" :paramsDesc="['年份，默认为当前年份', '月份，默认为空，即全年']">

::: tip 提示

月份处填写该月的英语表达，如 12 月 应填入 `December`。

:::

</Route>

## 美国中央情报局

### 年度信息自由法报告

<Route author="nczitzk" example="/cia/foia-annual-report" path="/cia/foia-annual-report"/>

## 泉州市跨境电子商务协会

### 新闻动态

<Route author="nczitzk" example="/qzcea" path="/qzcea/:caty?" :paramsDesc="['分类 id，默认为 1']">

| 新闻动态 | 协会动态 | 通知公告 | 会员风采 | 政策法规 | 电商资讯 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 5    | 14   | 18   |

</Route>

## 日本国外務省

### 記者会見

<Route author="sgqy" example="/go.jp/mofa" path="/go.jp/mofa"/>

## 上海市人民政府

### 上海市职业能力考试院 考试项目

<Route author="Fatpandac" example="/gov/shanghai/rsj/ksxm" path="/gov/shanghai/rsj/ksxm"/>

### 上海卫健委 疫情通报

<Route author="zcf0508" example="/gov/shanghai/wsjkw/yqtb" path="/gov/shanghai/wsjkw/yqtb"/>

## 世界贸易组织

### 争端解决新闻

<Route author="nczitzk" example="/wto/dispute-settlement" path="/wto/dispute-settlement/:year?" :paramsDesc="['年份，默认为当前年份']"/>

## 世界卫生组织 WHO

### 新闻稿

<Route author="nczitzk" example="/who/news" path="/who/news/:language?" :paramsDesc="['语言，见下表，默认为英语']">

语言

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | -- | -------- | ------- | ------- | --------- |
| en      | ar      | zh | fr       | ru      | es      | pt        |

</Route>

### 媒体中心

<Route author="LogicJake nczitzk" example="/who/news-room/feature-stories" path="/who/news-room/:category?/:language?" :paramsDesc="['分类，见下表，默认为特写故事', '语言，见下表，默认为英语']">

分类

| 特写故事            | 评论           |
| --------------- | ------------ |
| feature-stories | commentaries |

语言

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | -- | -------- | ------- | ------- | --------- |
| en      | ar      | zh | fr       | ru      | es      | pt        |

</Route>

### 总干事的讲话

<Route author="nczitzk" example="/who/speeches" path="/who/speeches/:language?" :paramsDesc="['语言，见下表，默认为英语']">

语言

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | -- | -------- | ------- | ------- | --------- |
| en      | ar      | zh | fr       | ru      | es      | pt        |

</Route>

## 苏州市人民政府

### 政府新闻

<Route author="EsuRt luyuhuang" example="/gov/suzhou/news/news" path="/gov/suzhou/news/:uid" :paramsDesc="['栏目名']">

| 新闻栏目名 |       :uid      |
| :---: | :-------------: |
|  苏州要闻 |   news 或 szyw   |
|  区县快讯 | district 或 qxkx |
|  部门动态 |       bmdt      |
|  新闻视频 |       xwsp      |
|  政务公告 |       zwgg      |
|  便民公告 |       mszx      |
|  民生资讯 |       bmzx      |

| 热点专题栏目名 |  :uid  |
| :-----: | :----: |
|   热点专题  |  rdzt  |
|  市本级专题  |  sbjzt |
|  最新热点专题 | zxrdzt |
|   往期专题  |  wqzt  |
|   区县专题  |  qxzt  |

::: tip 提示

**热点专题**栏目包含**市本级专题**和**区县专题**

**市本级专题**栏目包含**最新热点专题**和**往期专题**

如需订阅完整的热点专题，仅需订阅 **热点专题**`rdzt` 一项即可。

:::

</Route>

### 政府信息公开文件

<Route author="EsuRt" example="/gov/suzhou/doc" path="/gov/suzhou/doc"/>

## 台湾行政院消费者保护会

### 消费资讯

<Route author="Fatpandac" example="/cpcey/xwg" path="/cpcey/:type?" :paramsDesc="['默认为 xwg']">

| 新闻稿 | 消费资讯 |
| :-: | :--: |
| xwg | xfzx |

</Route>

## 台灣衛生福利部

### 即時新聞澄清

<Route author="nczitzk" example="/mohw/clarification" path="/mohw/clarification"/>

## 武汉东湖新技术开发区

### 新闻中心

<Route author="tudou027" example="/gov/wuhan/wehdz/tz" path="/gov/wuhan/wehdz/:caty" :paramsDesc="['类别']">

|  通知 |  公告 |
| :-: | :-: |
|  tz |  gg |

</Route>

## 武汉市科学技术局

### 新闻中心

<Route author="tudou027" example="/gov/wuhan/kjj/tzgg" path="/gov/wuhan/kjj/:caty" :paramsDesc="['类别']">

| 通知公告 | 公示信息 |
| :--: | :--: |
| tzgg | gsxx |

</Route>

## 香港廉政公署

### 新闻公布

<Route author="linbuxiao" example="/icac/news/sc" path="/icac/news/:lang?" :paramsDesc="['语言，留空为`sc`，支持`sc`（简中），`tc`（繁中），`en`（英文）']"/>

## 香港卫生防护中心

### 分类

<Route author="nczitzk" example="/chp" path="/chp/:category?/:language?" :paramsDesc="['分类，见下表，默认为重要资讯', '语言，见下表，默认为 zh_tw']">

分类

| 重要资讯         | 新闻稿              | 应变级别          | 期刊及刊物       | 健康通告        |
| ------------ | ---------------- | ------------- | ----------- | ----------- |
| important_ft | press_data_index | ResponseLevel | publication | HealthAlert |

语言

| English | 中文简体  | 中文繁體  |
| ------- | ----- | ----- |
| en      | zh_cn | zh_tw |

</Route>

## 香港卫生署

### 新闻公报

<Route author="nczitzk" example="/hongkong/dh" path="/hongkong/dh/:language?" :paramsDesc="['语言，见下表，默认为 tc_chi']">

语言

| English | 中文简体 | 中文繁體   |
| ------- | ---- | ------ |
| english | chs  | tc_chi |

</Route>

## 浙江省土地使用权网上交易系统

### 公告信息

<Route author="Fatpandac" example="/zjgtjy/all" path="zjgtjy/:type" :paramsDesc="['分类名']">

| 全部公告 | 挂牌公告 | 拍卖公告 | 补充公告 |
| :--: | :--: | :--: | :--: |
|  all | gpgg | pmgg | bcgg |

</Route>

## 中国工业和信息化部

### 政策解读

<Route author="Yoge-Code" example="/gov/miit/zcjd" path="/gov/miit/zcjd"/>

### 文件发布

<Route author="Fatpandac" example="/gov/miit/wjfb/ghs" path="/gov/miit/wjfb/:ministry" :paramsDesc="['部门缩写，可以在对应 URL 中获取']"/>

### 意见征集

<Route author="Fatpandac" example="/gov/miit/yjzj" path="/gov/miit/yjzj"/>

### 文件公示

<Route author="Yoge-Code" example="/gov/miit/wjgs" path="/gov/miit/wjgs"/>

### 政策文件

<Route author="Yoge-Code" example="/gov/miit/zcwj" path="/gov/miit/zcwj"/>

## 中国国家认证认可监管管理员会

### 监管动态

<Route author="Yoge-Code" example="/gov/cnca/jgdt" path="/gov/cnca/jgdt"/>

### 行业动态

<Route author="Yoge-Code" example="/gov/cnca/hydt" path="/gov/cnca/hydt"/>

### 最新通知

<Route author="Yoge-Code" example="/gov/cnca/zxtz" path="/gov/cnca/zxtz"/>

## 中国农工民主党

### 新闻中心

<Route author="nczitzk" example="/ngd" path="/ngd/:slug?" :paramsDesc="['见下文']">

将目标栏目的网址拆解为 `http://www.ngd.org.cn/` 和后面的字段，去掉 `.htm` 后，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug

如：（要闻动态）<http://www.ngd.org.cn/xwzx/ywdt/index.htm> 的网址在 `http://www.ngd.org.cn/` 后的字段是 `xwzx/ywdt/index.htm`，则对应的 slug 为 `xwzx-ywdt-index`，对应的路由即为 `/ngd/xwzx-ywdt-index`

</Route>

## 中国人大网

<Route author="233yeee" example="/npc/c183" path="/npc/:caty" :paramsDesc="['分类名，支持形如`http://www.npc.gov.cn/npc/*/list.shtml`的网站，传入 npc 之后的参数']">

| 立法   | 监督   | 代表   | 理论   | 权威发布   | 滚动新闻   |
| ---- | ---- | ---- | ---- | ------ | ------ |
| c183 | c184 | c185 | c189 | c12435 | c10134 |

</Route>

## 中国庭审公开网

### 开庭信息

<Route author="Fatpandac" example="/tingshen" path="/tingshen"/>

## 中国信息通信研究院

### 白皮书

<Route author="nczitzk" example="/gov/caict/bps" path="/gov/caict/bps"/>

### 权威数据

<Route author="nczitzk" example="/gov/caict/qwsj" path="/gov/caict/qwsj"/>

### CAICT 观点

<Route author="nczitzk" example="/gov/caict/caictgd" path="/gov/caict/caictgd"/>

## 中国银行保险监督管理委员会

<Route author="JkCheung" example="/cbirc/" path="/cbirc/:category" :paramsDesc="['类目']">

| 监管动态 | 公告通知 | 政策法规 | 政策解读 | 征求意见 | 行政许可 | 行政处罚 | 行政监管措施 | 工作论文 | 金融监管研究 | 统计信息 |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :----: | :--: | :----: | :--: |
| jgdt | ggtz | zcfg | zcjd | zqyj | xzxk | xzcf | xzjgcs | gzlw | jrjgyj | tjxx |

</Route>

## 中国证券监督管理委员会

### 发审委公告

<Route author="chinobing" example="/csrc/fashenwei" path="/csrc/fashenwei"/>

### 证监会消息

<Route author="chinobing LogicJake" example="/csrc/news/zjhxwfb-xwfbh" path="/csrc/news/:suffix?" :paramsDesc="['支持形如`http://www.csrc.gov.cn/pub/newsite/*/*`的网站，将 newsite 后面的两段网址后缀以 - 连接']" />

### 申请事项进度

<Route author="hillerliao" example="/csrc/auditstatus/:apply_id" path="/csrc/auditstatus" :paramsDesc="['事项类别id， `https://neris.csrc.gov.cn/alappl/home/xkDetail` 列表中各地址的 appMatrCde 参数']"/>

## 中国政府

### 数据

<Route author="nczitzk" example="/gov/shuju/shengzhu/baitiaorou" path="/gov/shuju/:caty/:item" :paramsDesc="['分类，“生猪”对应`shengzhu`，“价格”对应`jiage`', '项目，见表']">

生猪分类可选项目：

| 白条猪价格      | 生猪屠宰与活体交易   | 仔猪价格  | 生猪出场价与玉米价           | 生猪存栏信息和生猪疫情   |
| ---------- | ----------- | ----- | ------------------- | ------------- |
| baitiaorou | huotijiaoyi | zizhu | chuchangjia_yumijia | cunlan_yiqing |

价格分类可选项目：

| 商品价格     | 农产品价格       | 油价     |
| -------- | ----------- | ------ |
| shangpin | nongchanpin | youjia |

</Route>

### 图解

<Route author="nczitzk" example="/gov/xinwen/tujie/zhengce" path="/gov/xinwen/tujie/:caty" :paramsDesc="['图解分类，见下表']">

| 总理活动图解 | 每周一画 | 其他漫画 | 图解政策    | 其他图解 |
| ------ | ---- | ---- | ------- | ---- |
| zlhd   | mzyh | qtmh | zhengce | qttj |

全部分类参见 [图解图表](http://www.gov.cn/xinwen/tujie/index.htm)

</Route>

### 最新政策

<Route author="SettingDust" example="/gov/zhengce/zuixin" path="/gov/zhengce/zuixin"/>

### 最新文件

<Route author="ciaranchen" example="/gov/zhengce/wenjian" path="/gov/zhengce/wenjian/:pcodeJiguan?" :paramsDesc="['文种分类。 国令; 国发; 国函; 国发明电; 国办发; 国办函; 国办发明电; 其他']" />

### 信息稿件

<Route author="ciaranchen" example="/gov/zhengce/govall/orpro=555&notpro=2&search_field=title" path="/gov/zhengce/govall/:advance?" :paramsDesc="['高级搜索选项，将作为请求参数直接添加到url后。目前已知的选项及其意义如下。' ]" >

|                选项               |                意义                |        备注       |
| :-----------------------------: | :------------------------------: | :-------------: |
|              orpro              |           包含以下任意一个关键词。           |      用空格分隔。     |
|              allpro             |             包含以下全部关键词            |                 |
|              notpro             |             不包含以下关键词             |                 |
|              inpro              |             完整不拆分的关键词            |                 |
|           searchfield           | title: 搜索词在标题中；content: 搜索词在正文中。 |  默认为空，即网页的任意位置。 |
| pubmintimeYear, pubmintimeMonth |               从某年某月              | 单独使用月份参数无法只筛选月份 |
| pubmaxtimeYear, pubmaxtimeMonth |               到某年某月              | 单独使用月份参数无法只筛选月份 |
|              colid              |                栏目                |    比较复杂，不建议使用   |

</Route>

### 政府新闻

<Route author="EsuRt" example="/gov/news/:uid" path="/gov/news" :paramsDesc="['分类名']">

| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 |   政策文件  |
| :--: | :--: | :--: | :---: | :-----: |
|  bm  |  gd  |  yw  |  gwy  | zhengce |

</Route>

### 吹风会

<Route author="EsuRt" example="/gov/statecouncil/briefing" path="/gov/statecouncil/briefing"/>

## 中国政协网

### 栏目

<Route author="nczitzk" example="/cppcc" path="/cppcc/:slug?" :paramsDesc="['见下文']">

将目标栏目的网址拆解为 `http://www.cppcc.gov.cn/` 和后面的字段，去掉 `.shtml` 后，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug

如：（委员建言）<http://www.cppcc.gov.cn/zxww/newcppcc/wyjy/index.shtml> 的网址在 `http://www.cppcc.gov.cn/` 后的字段是 `zxww/newcppcc/wyjy/index.shtml`，则对应的 slug 为 `zxww-newcppcc-wyjy-index`，对应的路由即为 `/cppcc/zxww-newcppcc-wyjy-index`

</Route>

### 北京市人民政府

#### 北京教育考试院

<Route author="gavin-k" example="/gov/beijing/bjeea/bjeeagg" path="/gov/beijing/bjeea/:type" :paramsDesc="['分类名']">

|   通知公告  | 招考政策 | 自考快递 |
| :-----: | :--: | :--: |
| bjeeagg | zkzc | zkkd |

</Route>

### 河北省退役军人事务厅

<Route author="SunShinenny" example="/gov/veterans/hebei/sxxx" path="/gov/veterans/hebei/:type" :paramsDesc="['分类名']">

| 省内信息 | 厅内信息 | 市县信息 |
| :--: | :--: | :--: |
| ywgz | tnxx | sxxx |

</Route>

### 湖南省政府采购网 - 公告

<Route author="Jeason0228" example="/gov/hunan/notice/all" path="/gov/hunan/notice/:type"  :paramsDesc="['all=全部，cg=采购公告,zb=中标公告,fb=废标公告,ht=合同公告,gz=更正公告,zz=终止公告,qt=其他公告']" />

### 江苏省人民政府

<Route author="ocleo1" example="/gov/province/jiangsu/important-news" path="/gov/province/jiangsu/:category" :paramsDesc="['分类名']">

|      省政府常务会议      |      要闻关注      |    部门资讯    |     市县动态    |          政策解读         |
| :---------------: | :------------: | :--------: | :---------: | :-------------------: |
| executive-meeting | important-news | department | city-county | policy-interpretation |

|   政府信息公开年度报告  |        政府信息公开制度       |   省政府及办公厅文件   |        规范性文件       |
| :-----------: | :-------------------: | :-----------: | :----------------: |
| annual-report | information-publicity | documentation | normative-document |

|             立法意见征集             |        意见征集        |
| :----------------------------: | :----------------: |
| legislative-opinion-collection | opinion-collection |

</Route>

#### 江苏省教育考试院

<Route author="schen1024" example="/gov/jiangsu/eea/zcgd" path="/gov/jiangsu/eea/:type?" :paramsDesc="['分类, 默认为 `wdyw`, 具体参数见下表']">
注意: 其他栏目的内容格式不兼容, 且不便统一, 此处只做了下标的栏目

| 具体栏目 |  参数  |
| :--: | :--: |
| 招考要闻 | zkyw |
| 政策规定 | zcgd |
| 招考信息 | zkxx |
| 招考资料 | zkzl |
| 学习交流 | xxjl |

</Route>

### 山西省人民政府

#### 山西省人社厅

<Route author="wolfyu1991" example="/gov/shanxi/rst/rsks-tzgg" path="/gov/shanxi/rst/:category" :paramsDesc="['分类名']">

|    通知公告   |    公务员考试   |    事业单位考试   |    专业技术人员资格考试   |    其他考试   |
| :-------: | :--------: | :---------: | :-------------: | :-------: |
| rsks-tzgg | rsks-gwyks | rsks-sydwks | rsks-zyjsryzgks | rsks-qtks |

</Route>

### 南京市人民政府

<Route author="ocleo1" example="/gov/city/nanjing/news" path="/gov/city/nanjing/:category" :paramsDesc="['分类名']">

| 南京信息 |    部门动态    |   各区动态   |    民生信息    |
| :--: | :--------: | :------: | :--------: |
| news | department | district | livelihood |

</Route>

## 中国驻外使领馆

### 大使馆重要通知

<Route author="HenryQW" example="/embassy/us" path="/embassy/:country" :paramsDesc="['国家短代码, 见[支持国家列表](#支持国家列表)', '城市, 对应国家列表下的`领事馆城市列表`']" />

### 领事馆重要通知

<Route author="HenryQW" example="/embassy/us/chicago" path="/embassy/:country/:city" :paramsDesc="['国家短代码, 见[支持国家列表](#支持国家列表)', '城市, 对应国家列表下的`领事馆城市列表`']" >

### 支持国家列表

#### 加拿大 `CA`

-   大使馆: `/embassy/ca`

-   领事馆城市列表:

| 城市   | 路由                     |
| ---- | ---------------------- |
| 蒙特利尔 | `/embassy/ca/montreal` |

* * *

#### 德国 `DE`

-   大使馆: `/embassy/de`

-   领事馆城市列表:

| 城市  | 路由                   |
| --- | -------------------- |
| 慕尼黑 | `/embassy/de/munich` |

* * *

#### 法国 `FR`

-   大使馆: `/embassy/fr`

-   领事馆城市列表:

| 城市    | 路由                       |
| ----- | ------------------------ |
| 马赛    | `/embassy/fr/marseille`  |
| 斯特拉斯堡 | `/embassy/fr/strasbourg` |
| 里昂    | `/embassy/fr/lyon`       |

* * *

#### 日本 `JP`

-   大使馆: `/embassy/jp`

-   领事馆城市列表:

| 城市  | 路由                     |
| --- | ---------------------- |
| 长崎  | `/embassy/jp/nagasaki` |
| 大阪  | `/embassy/jp/osaka`    |
| 福冈  | `/embassy/jp/fukuoka`  |
| 名古屋 | `/embassy/jp/nagoya`   |
| 札幌  | `/embassy/jp/sapporo`  |
| 新潟  | `/embassy/jp/niigata`  |

* * *

#### 韩国 `KR`

-   大使馆: `/embassy/kr`

-   领事馆城市列表:

| 城市 | 路由                    |
| -- | --------------------- |
| 釜山 | `/embassy/kr/busan`   |
| 济州 | `/embassy/kr/jeju`    |
| 光州 | `/embassy/kr/gwangju` |

* * *

#### 马来西亚 `MY`

-   大使馆: `/embassy/my`

* * *

#### 新加坡 `SG`

-   大使馆: `/embassy/sg`

* * *

#### 美国 `US`

-   大使馆: `/embassy/us`

-   领事馆城市列表:

| 城市  | 路由                         |
| --- | -------------------------- |
| 纽约  | `/embassy/us/newyork`      |
| 芝加哥 | `/embassy/us/chicago`      |
| 旧金山 | `/embassy/us/sanfrancisco` |

* * *

#### 英国 `UK`

-   大使馆: `/embassy/uk`

-   领事馆城市列表:

| 城市    | 路由                       |
| ----- | ------------------------ |
| 爱丁堡   | `/embassy/uk/edinburgh`  |
| 贝尔法斯特 | `/embassy/uk/belfast`    |
| 曼彻斯特  | `/embassy/uk/manchester` |

</Route>

## 中华人民共和国国家发展和改革委员会

### 新闻动态

<Route author="nczitzk" example="/gov/ndrc/xwdt" path="/gov/ndrc/xwdt/:caty?">

| 新闻发布 | 通知通告 | 委领导动态 | 司局动态 | 地方动态 |
| ---- | ---- | ----- | ---- | ---- |
| xwfb | tzgg | wlddt | sjdt | dfdt |

</Route>

## 中华人民共和国海关总署

### 拍卖信息 / 海关法规

<Route author="Jeason0228" example="/gov/customs/list/paimai" path="/gov/customs/list/:gchannel"  :paramsDesc="['支持paimai,fagui等2个频道']" />

## 中华人民共和国教育部

### 新闻

<Route author="Crawler995" example="/gov/moe/policy_anal" path="/gov/moe/:type" :paramsDesc="['分类名']">

|     政策解读    |     最新文件    |  公告公示  |       教育部简报       |
| :---------: | :---------: | :----: | :---------------: |
| policy_anal | newest_file | notice | edu_ministry_news |

</Route>

## 中华人民共和国农业农村部

### 新闻

<Route author="Origami404" example="/gov/moa/xw/zwdt" path="/gov/moa/:suburl" :paramsDesc="['分类目录的子url']">

更多例子:

-   `农业农村部动态`的网页链接是`http://www.moa.gov.cn/xw/zwdt/`, 对应的`suburl`是`xw/zwdt`
-   `财务公开`的网页链接是`http://www.moa.gov.cn/gk/cwgk_1/`, 对应的`suburl`是`gk/cwgk_1`
-   像[政策法规](http://www.moa.gov.cn/gk/zcfg/)这种页面 (`http://www.moa.gov.cn/gk/zcfg/`), 它**不是**一个合法的分类目录，它是`法律`, `行政法规`, `部门规章`等一堆栏目的集合，这时候请点开对应栏目的`更多 >>`进入栏目的目录，再根据上面的规则提取`suburl`
-   特别地，`图片新闻`对应的`suburl`为`xw/tpxw/`, `最新公开`对应的`suburl`为`govpublic`

</Route>

### 数据 - 最新发布

<Route author="MisteryMonster" example="/gov/moa/sjzxfb" path="/gov/moa/sjzxfb"/>

## 中华人民共和国人力资源和社会保障部

### 社保减免

<Route author="ncziztk" example="/gov/mohrss/sbjm" path="/gov/mohrss/sbjm/:category?" :paramsDesc="['分类，见下表']">

| 要点新闻 | 政策文件 | 工作动态 | 媒体报道 | 图片新闻 |
| ---- | ---- | ---- | ---- | ---- |
| ydxw | zcwj | gzdt | mtbd | tpxw |

</Route>

## 中华人民共和国商务部

### 政务公开

<Route author="LogicJake" example="/mofcom/article/b" path="/mofcom/article/:suffix" :paramsDesc="['支持形如`http://www.mofcom.gov.cn/article/*`的网站，传入 article 之后的后缀']" />

## 中华人民共和国生态环境部

### 要闻动态

<Route author="liuxsdev" example="/gov/mee/ywdt/hjywnews" path="/gov/mee/ywdt/:category?" :paramsDesc="['分类名，预设 `szyw`']"/>

| 时政要闻 |   环境要闻   |  地方快讯  | 新闻发布 | 视频新闻 | 公示公告 |
| :--: | :------: | :----: | :--: | :--: | :--: |
| szyw | hjywnews | dfnews | xwfb | spxw | gsgg |

## 中华人民共和国退役军人事务部

### 中华人民共和国退役军人事务部

<Route author="SunShinenny" example="/gov/veterans/bnxx" path="/gov/veterans/:type" :paramsDesc="['分类名']">

| 部内信息 | 政策解读 |  首页信息 |
| :--: | :--: | :---: |
| bnxx | zcjd | index |

</Route>

## 中华人民共和国外交部

### 外交动态

<Route author="nczitzk" example="/gov/mfa/wjdt/fyrbt" path="/gov/mfa/wjdt/:category?" :paramsDesc="['分类，见下表，默认为领导人活动']">

| 分类    | category |
| ----- | -------- |
| 领导人活动 | gjldrhd  |
| 外事日程  | wsrc     |
| 部领导活动 | wjbxw    |
| 业务动态  | sjxw     |
| 发言人表态 | fyrbt    |
| 吹风会   | cfhsl    |
| 大使任免  | dsrm     |
| 驻外报道  | zwbd     |
| 政策解读  | zcjd     |

</Route>

## 中华人民共和国住房和城乡建设部

### 政策发布

<Route author="nczitzk" example="/gov/mohurd/policy" path="/gov/mohurd/policy"/>

## 中華民國國防部

### 即時軍事動態

<Route author="nczitzk" example="/gov/taiwan/mnd" path="/gov/taiwan/mnd"/>

## 中央纪委国家监委

### 审查调查

<Route author="LogicJake" example="/ccdi/scdc" path="/ccdi/scdc"/>
