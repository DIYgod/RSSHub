---
pageClass: routes
---

# 大学通知

## MIT

### MIT OCW 每月热门课程

<Route author="dwemerx" example="/mit/ocw-top" path="/mit/ocw-top"/>

### MIT graduateadmissions's all blogs

<Route author="LogicJake" example="/mit/graduateadmissions/index/all" path="/mit/graduateadmissions/index/all"/>

### MIT graduateadmissions's blogs by department

<Route author="LogicJake" example="/mit/graduateadmissions/department/eecs" path="/mit/graduateadmissions/department/:name" :paramsDesc="['department name which can be found in url']"/>

### MIT graduateadmissions's blogs by category

<Route author="LogicJake" example="/mit/graduateadmissions/category/beyond-the-lab" path="/mit/graduateadmissions/category/:name" :paramsDesc="['category name which can be found in url']"/>

### MIT CSAIL

<Route author="nczitzk" example="/mit/csail/news" path="/mit/csail/news"/>

## Polimi

### News

<Route author="exuanbo" example="/polimi/news" path="/polimi/news/:language?" :paramsDesc="['English language code en']" />

## UTDallas

### International Student Services

<Route author="Chang4Tech" example="/utdallas/isso" path="/utdallas/isso" />

## 安徽工业大学

### 教务处

<Route author="Diffumist" example="/ahut/jwc" path="/ahut/jwc" />

### 学校要闻

<Route author="Diffumist" example="/ahut/news" path="/ahut/news" />

### 计算机学院公告

<Route author="Diffumist" example="/ahut/cstzgg" path="/ahut/cstzgg" />

## 安徽建筑大学

### 通知公告

<Route author="Yuk-0v0" example="/ahjzu/news" path="/ahjzu/news" />

## 安徽农业大学

### 计算机学院

<Route author="SimonHu-HN" example="/ahau/cs_news/xxtg" path="/ahau/cs_news/:type" :paramsDesc="['类型名']">

| 信息通告 | 新闻动态   |
| ---- | ------ |
| xxtg | xwddyn |

</Route>

### 教务处

<Route author="SimonHu-HN" example="/ahau/jwc/jwyw" path="/ahau/jwc/:type" :paramsDesc="['类型名']">

| 教务要闻 | 通知公告 |
| ---- | ---- |
| jwyw | tzgg |

</Route>

### 安农大官网新闻

<Route author="SimonHu-HN" example="/ahau/main/xnyw" path="/ahau/main/:type" :paramsDesc="['类型名']">

| 校内要闻 | 学院动态 |
| ---- | ---- |
| xnyw | xydt |

</Route>

## 安徽医科大学

### 研究生学院通知公告

<Route author="Origami404" example="/ahmu/news" path="/ahmu/news" />

## 北华航天工业学院

### 新闻

<Route author="SunShinenny" example="/nciae/news" path="/nciae/news" />

### 学术信息

<Route author="SunShinenny" example="/nciae/xsxx" path="/nciae/xsxx" />

### 通知公告

<Route author="SunShinenny" example="/nciae/tzgg" path="/nciae/tzgg" />

## 北京大学

### 信科公告通知

<Route author="Ir1d" example="/pku/eecs/0" path="/pku/eecs/:type" :paramsDesc="['分区 type，可在网页 URL 中找到']" radar="1" rssbud="1">

| 全部 | 学院通知 | 人事通知 | 教务通知 | 学工通知 | 科研通知 | 财务通知 | 工会通知 | 院友通知 |
| -- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0  | 1    | 2    | 6    | 8    | 7    | 5    | 3    | 4    |

</Route>

### 每周一推 - 中国政治学研究中心

<Route author="vhxubo" example="/pku/rccp/mzyt" path="/pku/rccp/mzyt" radar="1" rssbud="1"/>

### 生命科学学院近期讲座

<Route author="TPOB" example="/pku/cls/lecture" path="/pku/cls/lecture" radar="1" rssbud="1"/>

### 北大未名 BBS 全站十大

<Route author="wooddance" example="/pku/bbs/hot" path="/pku/bbs/hot" radar="1" rssbud="1">

::: warning 注意

论坛部分帖子正文内容的获取需要用户登录后的 Cookie 值，详情见部署页面的配置模块。

:::

</Route>

### 学生就业指导服务中心

<Route author="DylanXie123" example="/pku/scc/recruit/zpxx" path="/pku/scc/recruit/:type?" :paramsDesc="['分区，见下表，默认请求 `tzgg`']" radar="1" rssbud="1">

| xwrd | tzgg | zpxx | gfjgxx | sxxx | cyxx |
| ---- | ---- | ---- | ------ | ---- | ---- |
| 新闻热点 | 通知公告 | 招聘信息 | 国防军工信息 | 实习信息 | 创业信息 |

</Route>

### 人事处

<Route author="nczitzk" example="/pku/hr" path="/pku/hr/:category?" :paramsDesc="['分类，见下方说明，默认为首页最新公告']" radar="1" rssbud="1">

::: tip 提示

分类字段处填写的是对应北京大学人事处分类页网址中介于 **<http://hr.pku.edu.cn/>** 和 **/index.htm** 中间的一段，并将其中的 `/` 修改为 `-`。

如 [北京大学人事处 - 人才招聘 - 教师 - 教学科研人员](https://hr.pku.edu.cn/rczp/js/jxkyry/index.htm) 的网址为 <https://hr.pku.edu.cn/rczp/js/jxkyry/index.htm> 其中介于 **<http://hr.pku.edu.cn/>** 和 **/index.htm** 中间的一段为 `rczp/js/jxkyry`。随后，并将其中的 `/` 修改为 `-`，可以得到 `rczp-js-jxkyry`。所以最终我们的路由为 [`/pku/hr/rczp-js-jxkyry`](https://rsshub.app/pku/hr/rczp-js-jxkyry)

:::

</Route>

### 研究生招生网

<Route author="shengmaosu" example="/pku/admission/sszs" path="/pku/admission/sszs" radar="1" rssbud="1"/>

### 观点 - 国家发展研究院

<Route author="MisLink" example="/pku/nsd/gd" path="/pku/nsd/gd" radar="1" rssbud="1"/>

### 软件与微电子学院 - 通知公告

<Route author="legr4ndk" example="/pku/ss/notices" path="/pku/ss/notices" radar="1" rssbud="1"/>

### 软件与微电子学院 - 招生通知

<Route author="legr4ndk" example="/pku/ss/admission" path="/pku/ss/admission" radar="1" rssbud="1"/>

### 软件与微电子学院 - 硕士统考招生通知

<Route author="legr4ndk" example="/pku/ss/pgadmin" path="/pku/ss/pgadmin" radar="1" rssbud="1"/>

## 北京航空航天大学

### 北京航空航天大学

<Route author="AlanDecode" example="/buaa/news/zonghe" path="/buaa/news/:type" :paramsDesc="['新闻版块']">

| 综合新闻   | 信息公告    | 学术文化         | 校园风采    | 科教在线   | 媒体北航  | 专题新闻    | 北航人物  |
| ------ | ------- | ------------ | ------- | ------ | ----- | ------- | ----- |
| zonghe | gonggao | xueshuwenhua | fengcai | kejiao | meiti | zhuanti | renwu |

</Route>

## 北京交通大学

### 研究生院

<Route author="E1nzbern" example="/bjtu/gs/all" path="/bjtu/gs/:type" :paramsDesc="['文章类别']">

| 所有文章 | 通知公告 | 新闻动态 | 招生宣传 | 培养 | 学位 | 招生 | 硕士招生 | 博士招生 | 招生简章 | 招生政策法规 | 研工部通知公告 | 研工部新闻动态 |
| ---- | ---- | ---- | ---- | -- | -- | -- | ---- | ---- | ---- | ------ | ------- | ------- |
| all  | noti | news | zsxc | py | xw | zs | sszs | bszs | zsjz | zcfg   | ygbtzgg | ygbnews |

</Route>

## 北京科技大学

### 研究生院

<Route author="DA1Y1" example="/ustb/yjsy/news/all" path="/ustb/yjsy/news/:type" :paramsDesc="['文章类别']">

| 北京科技大学研究生院 | 土木与资源工程学院 | 能源与环境工程学院 | 冶金与生态工程学院 | 材料科学与工程学院 | 机械工程学院 | 自动化学院 | 计算机与通信工程学院 | 数理学院  | 化学与生物工程学院 | 经济管理学院 | 文法学院  | 马克思主义学院 | 外国语学院 | 国家材料服役安全科学中心 | 新金属材料国家重点实验室 | 工程技术研究院 | 钢铁共性技术协同创新中心 | 钢铁冶金新技术国家重点实验室 | 新材料技术研究院 | 科技史与文化遗产研究院 | 顺德研究生院 |
| ---------- | --------- | --------- | --------- | --------- | ------ | ----- | ---------- | ----- | --------- | ------ | ----- | ------- | ----- | ------------ | ------------ | ------- | ------------ | -------------- | -------- | ----------- | ------ |
| all        | cres      | seee      | metall    | mse       | me     | saee  | scce       | shuli | huasheng  | sem    | wenfa | marx    | sfs   | ncms         | skl          | iet     | cicst        | slam           | adma     | ihmm        | sd     |

</Route>

### 北京科技大学天津学院

<Route author="henbf" example="/ustb/tj/news/all" path="/ustb/tj/news/:type" :paramsDesc="['默认为 `all`']">

| 全部  | 学院新闻 | 学术活动  | 城市建设学院 | 信息工程学院 | 经济学院 | 管理学院 | 材料系 | 机械工程系 | 护理系 | 法律系 | 外语系 | 艺术系 |
| --- | ---- | ----- | ------ | ------ | ---- | ---- | --- | ----- | --- | --- | --- | --- |
| all | xyxw | xshhd | csjsxy | xxgcxy | jjx  | glxy | clx | jxgcx | hlx | flx | wyx | ysx |

</Route>

## 北京理工大学

### 教务处通知

<Route author="sinofp" example="/bit/jwc" path="/bit/jwc" />

### 计院通知

<Route author="sinofp" example="/bit/cs" path="/bit/cs" />

### 人才招聘

<Route author="nczitzk" example="/bit/rszhaopin" path="/bit/rszhaopin" />

## 北京林业大学

### 绿色新闻网

<Route author="markmingjie" example="/bjfu/news/lsyw" path="/bjfu/news/:type" :paramsDesc="['新闻栏目']">

| 绿色要闻 | 校园动态 | 教学科研 | 党建思政 | 一周排行 |
| ---- | ---- | ---- | ---- | ---- |
| lsyw | xydt | jxky | djsz | yzph |

</Route>

### 研究生院培养动态

<Route author="markmingjie" example="/bjfu/grs" path="/bjfu/grs" />

### 科技处通知公告

<Route author="markmingjie" example="/bjfu/kjc" path="/bjfu/kjc" />

### 教务处通知公告

<Route author="markmingjie" example="/bjfu/jwc/jwkx" path="/bjfu/jwc/:type" :paramsDesc="['通知类别']">

| 教务快讯 | 考试信息 | 课程信息 | 教改动态 | 图片新闻 |
| ---- | ---- | ---- | ---- | ---- |
| jwkx | ksxx | kcxx | jgdt | tpxw |

</Route>

## 北京师范大学

### 经济与工商管理学院

<Route author="nczitzk" example="/bnu/bs" path="/bnu/bs/:category?" :paramsDesc="['分类，见下表，默认为学院新闻']">

| 学院新闻 | 通知公告    | 学术成果 | 学术讲座 | 教师观点 | 人才招聘  |
| ---- | ------- | ---- | ---- | ---- | ----- |
| xw   | zytzyyg | xzcg | xzjz | xz   | bshzs |

</Route>

### 信息学院通知

<Route author="wzc-blog" example="/bjfu/it/xyxw" path="/bjfu/it/:type" :paramsDesc="['通知类别']">

| 学院新闻 | 科研动态 | 本科生培养 | 研究生培养 |
| ---- | ---- | ----- | ----- |
| xyxw | kydt | pydt  | pydt2 |

</Route>

## 北京物资学院

### 通知公告

<Route author="Muxq99" example="/bwu/news" path="/bwu/news" />

::: warning 注意
由于学校官网对非大陆 IP 的访问存在限制，需自行部署。
:::

## 北京邮电大学

### 硕士研究生招生通知

<Route author="ihewro" example="/bupt/yz/int" path="/bupt/yz/:type" :paramsDesc="['学院英文缩写']">

| 综合  | 信息与通信工程学院 | 电子工程学院 | 计算机学院 | 自动化学院 | 软件学院 | 数字媒体与设计艺术学院 | 网络空间安全学院 | 理学院 | 经济管理学院 | 人文学院 | 马克思主义学院 | 网络技术研究院 | 信息光子学与光通信研究院 |
| --- | --------- | ------ | ----- | ----- | ---- | ----------- | -------- | --- | ------ | ---- | ------- | ------- | ------------ |
| all | sice      | see    | scs   | sa    | sse  | sdmda       | scss     | sci | sem    | sh   | mtri    | int     | ipoc         |

</Route>

### 研究生院通知

<Route author="RicardoMing" example="/bupt/grs" path="/bupt/grs" />

### 信息门户

<Route author="RicardoMing wzekin" example="/bupt/portal" path="/bupt/portal" />

::: warning 注意

由于需要登陆 `https://webapp.bupt.edu.cn/wap/login.html?redirect=http://` 后的 Cookie 值，所以只能自建，详情见部署页面的配置模块

:::

### 校园新闻

<Route author="wzekin" example="/bupt/news" path="/bupt/news" />

::: warning 注意

由于需要登陆 `https://webapp.bupt.edu.cn/wap/login.html?redirect=http://` 后的 Cookie 值，所以只能自建，详情见部署页面的配置模块

:::

### BTBYR 趣味盒

<Route author="prnake" example="/bupt/funbox" path="/bupt/funbox" selfhost="1"/>
::: warning 注意

由于需要登陆 BTBYR 后的 Cookie 值，所以只能自建，并且部署和订阅端均需支持 IPV6 网络或使用镜像站点。

:::

### 人才招聘

<Route author="nczitzk" example="/bupt/rczp" path="/bupt/rczp" />

## 常州大学

### 教务处

<Route author="richardchien" example="/cczu/jwc/1425" path="/cczu/jwc/:category?" :paramsDesc="['可选，默认为 `all`']">

| 全部  | 通知公告 | 教务新闻 | 各类活动与系列讲座 | 本科教学工程 | 他山之石 | 信息快递 |
| --- | ---- | ---- | --------- | ------ | ---- | ---- |
| all | 1425 | 1437 | 1485      | 1487   | 1442 | 1445 |

</Route>

### 新闻网

<Route author="richardchien" example="/cczu/news/6620" path="/cczu/news/:category?" :paramsDesc="['可选，默认为 `all`']">

| 全部  | 常大要闻 | 校园快讯 | 媒体常大 | 时事热点 | 高教动态 | 网上橱窗 | 新媒常大 |
| --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| all | 6620 | 6621 | 6687 | 6628 | 6629 | 6640 | 6645 |

</Route>

## 成都信息工程大学

### 成信新闻网

<Route author="kimika" example="/cuit/cxxww/1" path="/cuit/cxxww/:type?" :paramsDesc="['默认为 `1`']">

| 综合新闻 | 信息公告 | 焦点新闻 | 学术动态 | 工作交流 | 媒体成信 | 更名专题 | 文化活动 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 5    | 7    | 9    | 10   |

</Route>

## 重庆大学

### 本科教学信息网通知公告

<Route author="El-Chiang Hagb" example="/cqu/jwc/" path="/cqu/jwc/:path*" :paramsDesc="['路径']">

| 分类                                                        | 路径                 |
| --------------------------------------------------------- | ------------------ |
| [通知公告](http://jwc.cqu.edu.cn/index/tzgg.htm)              | `index/tzgg` 或留空   |
| [通知公告 / 学籍管理](http://jwc.cqu.edu.cn/index/tzgg/xjgl.htm)  | `index/tzgg/xjgl`  |
| [通知公告 / 交流交换](http://jwc.cqu.edu.cn/index/tzgg/jljh1.htm) | `index/tzgg/jljh1` |
| [通知公告 / 教学运行](http://jwc.cqu.edu.cn/index/tzgg/jxyx.htm)  | `index/tzgg/jxyx`  |
| [通知公告 / 教学质量](http://jwc.cqu.edu.cn/index/tzgg/jxzl.htm)  | `index/tzgg/jxzl`  |
| [通知公告 / 教研教改](http://jwc.cqu.edu.cn/index/tzgg/jyjg.htm)  | `index/tzgg/jyjg`  |
| [通知公告 / 创新实践](http://jwc.cqu.edu.cn/index/tzgg/cxsj.htm)  | `index/tzgg/cxsj`  |
| [学籍管理 / 学籍处理](http://jwc.cqu.edu.cn/xjgl/xjcl.htm)        | `xjgl/xjcl`        |
| [学籍管理 / 交流交换](http://jwc.cqu.edu.cn/xjgl/jljh.htm)        | `xjgl/jljh`        |
| [学籍管理 / 学生推免](http://jwc.cqu.edu.cn/xjgl/xstm.htm)        | `xjgl/xstm`        |
| [学籍管理 / 转专业](http://jwc.cqu.edu.cn/xjgl/zzy.htm)          | `xjgl/zzy`         |
| [教学运行 / 学生选课](http://jwc.cqu.edu.cn/jxyx/xsxk.htm)        | `jxyx/xsxk`        |
| [教学运行 / 考试安排](http://jwc.cqu.edu.cn/jxyx/ksap.htm)        | `jxyx/ksap`        |
| [教学运行 / 助教管理](http://jwc.cqu.edu.cn/jxyx/zjgl.htm)        | `jxyx/zjgl`        |

</Route>

::: tip 提示
路径参数的值为相应通知列表页面的地址去除后缀名和域名后的路径。

例如 “通知公告” 列表页面地址为 <http://jwc.cqu.edu.cn/index/tzgg.htm>，相应参数为 `index/tgzz`。
:::

::: warning 注意
原重庆大学教务网网站变更为重庆大学本科教学信息网。该路由编写时（2021-07-29）它[正处于试运行阶段](http://jwc.cqu.edu.cn/info/1080/3482.htm)。

通知的分类比较迷，请小心甄别、使用（以免漏掉需要的通知）。
:::

### 新闻网讲座预告

<Route author="nicolaszf" example="/cqu/news/jzyg" path="/cqu/news/jzyg"/>

### 新闻网通知公告简报

<Route author="Hagb" example="/cqu/news/tz" path="/cqu/news/tz"/>

### 校团委

<Route author="Hagb" example="/cqu/youth/gzdt" path="/cqu/youth/:category" :paramsDesc="['分类名']">

| 工作动态 | 院系风采 | 通知公告（可能需内网） | 文件转载 |
| ---- | ---- | ----------- | ---- |
| gzdt | yxfc | tzgg        | wjzz |

</Route>

### 数学与统计学院

<Route author="Hagb" example="/cqu/sci/1053" path="/cqu/sci/:category" :paramsDesc="['分类名']">

| 学院新闻 | 学院公告 | 学院活动 | 学术活动 |
| ---- | ---- | ---- | ---- |
| 1053 | 1054 | 1055 | 1056 |

</Route>

### 信息化办公室

<Route author="Hagb" example="/cqu/net/tzgg" path="/cqu/net/:category" :paramsDesc="['分类名']">

| 通知公告 | 单位动态 | 语言文字 |
| ---- | ---- | ---- |
| tzgg | dwdt | yywz |

</Route>

## 重庆科技学院

### 教务处公告

<Route author="binarization" example="/cqust/jw/notify" path="/cqust/jw/:type?" :paramsDesc="['可选，默认为 `notify`']">

| 通知公告   | 教务快讯 |
| ------ | ---- |
| notify | news |

</Route>

### 图书馆公告

<Route author="binarization" example="/cqust/lib/news" path="/cqust/lib/:type?" :paramsDesc="['可选，默认为 `news`']">

| 本馆公告 |
| ---- |
| news |

</Route>

## 重庆理工大学

### 学校通知

<Route author="Colin-XKL" example="/cqut/news" path="/cqut/news" radar="1"/>

### 图书馆通知

<Route author="Colin-XKL" example="/cqut/libnews" path="/cqut/libnews" radar="1"/>

## 重庆文理学院

### 通知公告

<Route author="Fatpandac" example="/cqwu/news/academiceve" path="/cqwu/news/:type?" :paramsDesc="['可选，默认为 academiceve ']" radar="1">

| 通知公告   | 学术活动公告      |
| ------ | ----------- |
| notify | academiceve |

</Route>

## 大连大学

### 教务处信息

<Route author="SettingDust" example="/dlu/jiaowu/news" path="/dlu/jiaowu/news">
</Route>

## 大连工业大学

### 教务处新闻

<Route author="xu42" example="/dpu/jiaowu/news/2" path="/dpu/jiaowu/news/:type?" :paramsDesc="['默认为 `2`']">

| 新闻动态 | 通知公告 | 教务文件 |
| ---- | ---- | ---- |
| 2    | 3    | 4    |

</Route>

### 网络服务新闻

<Route author="xu42" example="/dpu/wlfw/news/2" path="/dpu/wlfw/news/:type?" :paramsDesc="['默认为 `1`']">

| 新闻动态 | 通知公告 |
| ---- | ---- |
| 1    | 2    |

</Route>

## 大连海事大学

### 新闻网

<Route author="arjenzhou" example="/dlmu/news/hdyw" path="/dlmu/news/:type" :paramsDesc="['默认为 `hdyw`']">

| 海大要闻 | 媒体海大 | 综合新闻 | 院系风采 | 海大校报 | 理论园地 | 海大讲坛 | 艺文荟萃 |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| hdyw | mthd | zhxw | yxfc | hdxb | llyd | hdjt | ywhc |

</Route>

### 研究生院

#### 招生工作

<Route author="nczitzk" example="/dlmu/grs/zsgz/ssyjs" path="/dlmu/grs/zsgz/:type" :paramsDesc="['招生类别']">

| 博士研究生 | 硕士研究生 | 同等学力攻读硕士学位 | 港澳台地区招生 |
| :---: | :---: | :--------: | :-----: |
| bsyjs | ssyjs | tdxlgdssxw | gatdqzs |

</Route>

## 大连理工大学

### 通用

<Route author="nczitzk" example="/dut" path="/dut/:site?/:category?" :paramsDesc="['站点，可在 URL 中找到，默认为 **新闻网**', '分类，可在 URL 中找到，默认为各站点默认分类栏目，如 **新闻网** 即为 **头条关注**']">

订阅 **单级** 栏目如 [大连理工大学新闻网](https://news.dlut.edu.cn) 的 [头条关注](https://news.dlut.edu.cn/ttgz.htm) 分类栏目，分为 3 步：

1.  将 URL <https://news.dlut.edu.cn/ttgz.htm> 中 `https://` 与 `.dlut.edu.cn/` 中间的 `news` 作为 `site` 参数填入；
2.  将 `https://news.dlut.edu.cn/` 与 `.htm` 间的 `ttgz` 作为 `category` 参数填入；
3.  最终可获得 [`/dut/news/ttgz`](https://rsshub.app/dut/news/tzgg)。

订阅 **多级** 栏目如 [大连理工大学新闻网](https://news.dlut.edu.cn) 的 [人才培养](https://news.dlut.edu.cn/xwjj01/rcpy.htm) 分类栏目，同样分为 3 步：

1.  将 URL <https://news.dlut.edu.cn/xwjj01/rcpy.htm> 中 `https://` 与 `.dlut.edu.cn/` 中间的 `news` 作为 `site` 参数填入；
2.  把 `https://news.dlut.edu.cn/` 与 `.htm` 间 `xwjj01/rcpy` 作为 `category` 参数填入；
3.  最终可获得 [`/dut/news/xwjj01/rcpy`](https://rsshub.app/dut/news/xwjj01/rcpy)。

::: tip 小提示

大连理工大学大部分站点支持上述通用规则进行订阅。下方的大连理工大学相关路由基本适用于该规则，在其对应的表格中没有提及的分类栏目，可以使用上方的方法自行扩展。

:::

::: tip 小小提示

你会发现 [大连理工大学新闻网](https://news.dlut.edu.cn) 的 [人才培养](https://news.dlut.edu.cn/xwjj01/rcpy.htm) 分类栏目在下方 [**新闻网**](#da-lian-li-gong-da-xue-xin-wen-wang) 参数表格中 `category` 参数为 `rcpy`，并非上面例子中给出的 `xwjj01/rcpy`。这意味着开发者对路由 `/dut/news/xwjj01/rcpy` 指定了快捷方式 `/dut/news/rcpy`。两者的效果是一致的。

:::

</Route>

### 新闻网

<Route author="nczitzk" example="/dut/news" path="/dut/news/:category?" :paramsDesc="['分类，见下表，默认为 [**头条关注**](https://news.dlut.edu.cn/ttgz.htm)']">

| 头条关注 | 新闻聚焦 | 人才培养 | 科学研究 | 交流合作 |
| ---- | ---- | ---- | ---- | ---- |
| ttgz | xwjj | rcpy | kxyj | jlhz |

| 一线风采 | 大工人物 | 图说大工 | 影像大工 | 媒体大工 |
| ---- | ---- | ---- | ---- | ---- |
| yxfc | dgrw | tsdg | yxdg | mtdg |

</Route>

### 人事处

<Route author="nczitzk" example="/dut/perdep" path="/dut/perdep/:category?" :paramsDesc="['分类，见下表，默认为 [**通知公告**](http://perdep.dlut.edu.cn/tzgg/tzgg.htm)']">

| 通知公告 | 工作动态 | 政策法规 |
| ---- | ---- | ---- |
| tzgg | gzdt | zcfg |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学人事处](http://perdep.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 教务处

<Route author="beautyyuyanli nczitzk" example="/dut/teach" path="/dut/teach/:category?" :paramsDesc="['分类，见下表，默认为 [**新闻快递**](http://teach.dlut.edu.cn/xwkd/xwkd.htm)']">

| 新闻快递 | 重要通告 | 办会公示 |
| ---- | ---- | ---- |
| xwkd | zytg | bhgs |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学教务处](http://teach.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 研究生院

<Route author="nczitzk" example="/dut/gs" path="/dut/gs/:category?" :paramsDesc="['分类，见下表，默认为 [**重要通知**](http://gs.dlut.edu.cn/zytz.htm)']">

| 重要通知 | 工作动态 | 政策法规 |
| ---- | ---- | ---- |
| zytz | gzdt | zcfg |

| 研究生招生 - 政策文件 | 研究生招生 - 工作动态    | 研究生招生 - 资料下载    |
| ------------ | --------------- | --------------- |
| yjszs/zcwj1  | yjszs/gzdt/gzdt | yjszs/zlxz/zlxz |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学研究生院](http://gs.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 软件学院

<Route author="nczitzk" example="/dut/ssdut" path="/dut/ssdut/:category?" :paramsDesc="['分类，见下表，默认为 [**焦点新闻**](http://ssdut.dlut.edu.cn/ywgg/xueyuanxinwen/jdxw.htm)']">

| 焦点新闻 | 综合新闻 | 学院通知 | 学术动态 | 本科生通知 | 研究生通知 |
| ---- | ---- | ---- | ---- | ----- | ----- |
| jdxw | zhxw | xytz | xsdt | bkstz | yjstz |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学软件学院](http://ssdut.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 开发区校区

<Route author="nczitzk" example="/dut/eda" path="/dut/eda/:category?" :paramsDesc="['分类，见下表，默认为 [**通知公告**](http://eda.dlut.edu.cn/tzgg/tzgg.htm)']">

| 通知公告 | 校区新闻 |
| ---- | ---- |
| tzgg | xqxw |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学开发区校区](http://eda.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 盘锦校区

<Route author="nczitzk" example="/dut/panjin" path="/dut/panjin/:category?" :paramsDesc="['分类，见下表，默认为 [**公告**](https://panjin.dlut.edu.cn/index/gg.htm)']">

| 校区新闻 | 校园文化 | 学员风采 | 学术动态 | 媒体报道 | 公告 |
| ---- | ---- | ---- | ---- | ---- | -- |
| xqxw | xywh | xyfc | xsdt | mtbd | gg |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学盘锦校区](https://panjin.dlut.edu.cn/index.htm)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 盘锦校区学生事务办公室

<Route author="nczitzk" example="/dut/xsgzb" path="/dut/xsgzb/:category?" :paramsDesc="['分类，见下表，默认为 [**通知公告**](http://xsgzb.dlut.edu.cn/index/zytz.htm)']">

| 通知公告 | 学工动态 | 公示公告      |
| ---- | ---- | --------- |
| zytz | xgdt | gsgonggao |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学盘锦校区学生事务办公室](http://xsgzb.dlut.edu.cn/index.htm)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 盘锦校区教务教学事务办公室

<Route author="nczitzk" example="/dut/pjteach" path="/dut/pjteach/:category?" :paramsDesc="['分类，见下表，默认为 [**新闻快递**](http://pjteach.dlut.edu.cn/index/xwkd.htm)']">

| 新闻快递 | 重要通知 | 教学文件 | 常见问题 | 选课与考试 |
| ---- | ---- | ---- | ---- | ----- |
| xwkd | zytz | jxwj | cjwt | xkyks |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学盘锦校区教务教学事务办公室](http://pjteach.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 盘锦校区总务部

<Route author="nczitzk" example="/dut/pjxqzwb" path="/dut/pjxqzwb/:category?" :paramsDesc="['分类，见下表，默认为 [**通知公告**](http://pjxqzwb.dlut.edu.cn/index/tzgg.htm)']">

| 通知公告 | 党政园地 | 总务快讯 | 法规制度 |
| ---- | ---- | ---- | ---- |
| tzgg | dzyd | zwkx | fgzd |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学盘锦校区总务部](http://pjxqzwb.dlut.edu.cn/index.htm)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 体育与健康学院盘锦分院

<Route author="nczitzk" example="/dut/tjpj" path="/dut/tjpj/:category?" :paramsDesc="['分类，见下表，默认为 [**学院新闻**](http://tjpj.dlut.edu.cn/index/xyxw.htm)']">

| 学院新闻 | 通知公告 |
| ---- | ---- |
| xyxw | zxgg |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学体育与健康学院盘锦分院](http://tjpj.dlut.edu.cn/index.htm)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 国际合作与交流处（港澳台办）

<Route author="beautyyuyanli nczitzk" example="/dut/dutdice" path="/dut/dutdice/:category?" :paramsDesc="['分类，见下表，默认为 [**新闻速递**](http://dutdice.dlut.edu.cn/xwsd/xxxw.htm)']">

| 教师通知 | 学生通知       | 新闻速递 |
| ---- | ---------- | ---- |
| jstz | xstong_zhi | xwsd |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学国际合作与交流处（港澳台办）](http://dutdice.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

### 体育场馆中心

<Route author="beautyyuyanli nczitzk" example="/dut/tycgzx" path="/dut/tycgzx/:category?" :paramsDesc="['分类，见下表，默认为 [**通知公告**](http://tycgzx.dlut.edu.cn/tzgg/tzgg.htm)']">

| 通知公告 | 活动日程 | 新闻动态 | 健康知识 |
| ---- | ---- | ---- | ---- |
| tzgg | hdrc | xwdt | jkzs |

::: tip 提示

表格仅呈现了部分分类栏目，更多分类栏目参见 [大连理工大学体育场馆中心](http://tycgzx.dlut.edu.cn)，并按照上方 [**通用**](#da-lian-li-gong-da-xue-tong-yong) 规则订阅。

:::

</Route>

## 电子科技大学

### 教务处

<Route author="achjqz" example="/uestc/jwc/student" path="/uestc/jwc/:type?" :paramsDesc="['默认为 `important`']">

| 重要公告      | 学生事务公告  | 教师事务公告  |
| --------- | ------- | ------- |
| important | student | teacher |

</Route>

### 新闻中心

<Route author="achjqz" example="/uestc/news/culture" path="/uestc/news/:type?" :paramsDesc="['默认为 `announcement`']">

| 学术      | 文化      | 公告           | 校内通知         |
| ------- | ------- | ------------ | ------------ |
| academy | culture | announcement | notification |

</Route>

### 计算机科学与工程学院

<Route author="talengu" example="/uestc/cs/ztlj*xskb" path="/uestc/cs/:type?" :paramsDesc="['默认为 `ztlj*xskb`']">

| 学院新闻      | 学生科      | 教务科      | 研管科      | 学术看板      |
| --------- | -------- | -------- | -------- | --------- |
| xwzx*xyxw | tzgg*xsk | tzgg*jwk | tzgg*ygk | ztlj*xskb |

注 1: xwzx\*xyxw 对应 <http://www.scse.uestc.edu.cn/xwzx/xyxw.htm> ;
tzgg\*xsk 对应 <http://www.scse.uestc.edu.cn/tzgg/xsk.htm>

可自定义设置

注 2; 用 + 号来叠加 学生科 + 教务科 `/uestc/cs/ztlj*xskb+tzgg*jwk`

</Route>

### 自动化工程学院

<Route author="talengu" example="/uestc/auto/tzgg1" path="/uestc/news/:type?" :paramsDesc="['默认为 `tzgg1`']">

| 通知公告  | 学术看板  | 焦点新闻 | 综合新闻  |
| ----- | ----- | ---- | ----- |
| tzgg1 | xskb1 | jdxw | zhxw1 |

注 1: tzgg1 对应 <http://www.auto.uestc.edu.cn/index/tzgg1.htm> ;
xskb1 对应 <http://www.auto.uestc.edu.cn/index/xskb1.htm>

可自定义设置

注 2: 用 + 号来叠加，通知公告 + 学术看板 `/uestc/auto/tzgg1+xskb1`

</Route>

### 文化素质教育中心

<Route author="truobel" example="/uestc/cqe/hdyg" path="/uestc/cqe/:type?" :paramsDesc="['默认为 `hdyg`']">

| 活动预告 | 通知 | 课程通知 | 立人班选拔 |
| ---- | -- | ---- | ----- |
| hdyg | tz | kctz | lrxb  |

</Route>

### 研究生院

<Route author="huyyi" example="/uestc/gr" path="/uestc/gr" />

### 信息与通信工程学院

<Route author="huyyi" example="/uestc/sice" path="/uestc/sice" puppeteer="1"/>

### 信息与软件工程学院

<Route author="Yadomin" example="/uestc/is/" path="/uestc/is/:type?" :paramsDesc="['默认为 `latest`']" />

| 最新     | 院办 | 组织 | 学生科 | 教务科 | 研管科 | 实验中心 | 企业技术服务中心 | 新工科中心 | 实习实训办公室 | 招聘 | 实习实训 |
| ------ | -- | -- | --- | --- | --- | ---- | -------- | ----- | ------- | -- | ---- |
| latest | yb | zx | xsk | jwk | ygk | syzx | qyjsfwzx | xgkzx | sxsxbgs | zp | sxsx |

注：可以使用 + 号来叠加，如 学生科 + 教务科 `/uestc/is/xsk+jwc`

## 东北大学

### 新闻网

<Route author="JeasonLau" example="/neu/news/ddyw" path="/neu/news/:type" :paramsDesc="['种类名，见下表']">

| 种类名  | 参数   |
| ---- | ---- |
| 东大要闻 | ddyw |
| 媒体东大 | mtdd |
| 通知公告 | tzgg |
| 新闻纵横 | xwzh |
| 人才培养 | rcpy |
| 学术科研 | xsky |
| 英文新闻 | 217  |
| 招生就业 | zsjy |
| 考研出国 | kycg |
| 校园文学 | xywx |
| 校友风采 | xyfc |
| 时事热点 | ssrd |
| 教育前沿 | jyqy |
| 文化体育 | whty |
| 最新科技 | zxkj |

</Route>

### 医学与生物信息工程学院

<Route author="TennousuAthena" example="/neu/bmie/news" path="/neu/bmie/:type" :paramsDesc="['分类 id 见下表']">

| Id                     | 名称    |
| ---------------------- | ----- |
| news                   | 学院新闻  |
| academic               | 学术科研  |
| talent_development     | 人才培养  |
| international_exchange | 国际交流  |
| announcement           | 通知公告  |
| undergraduate_dev      | 本科生培养 |
| postgraduate_dev       | 研究生培养 |
| undergraduate_recruit  | 本科生招募 |
| postgraduate_recruit   | 研究生招募 |
| CPC_build              | 党的建设  |
| CPC_work               | 党委工作  |
| union_work             | 工会工作  |
| CYL_work               | 共青团工作 |
| security_management    | 安全管理  |
| alumni_style           | 校友风采  |

</Route>

## 东莞理工学院

### 教务处通知

<Route author="AnyMoe" example="/dgut/jwc/" path="/dgut/jwc/:type?" :paramsDesc="['默认为 `2`']">

| 教务公告 | 教学信息 |
| ---- | ---- |
| 1    | 2    |

</Route>

### 学工部动态

<Route author="AnyMoe" example="/dgut/xsc/" path="/dgut/xsc/:type?" :paramsDesc="['默认为 `2`']">

| 学工动态 | 通知公告 | 网上公示 |
| ---- | ---- | ---- |
| 1    | 2    | 4    |

</Route>

## 东华大学

### 教务处通知

<Route author="KiraKiseki" example="/dhu/jiaowu/news/student" path="/dhu/jiaowu/news/:type?" :paramsDesc="['默认为 `student`']">

| 学生专栏    | 教师专栏    |
| ------- | ------- |
| student | teacher |

</Route>

### 最新信息公开

<Route author="KiraKiseki" example="/dhu/xxgk/news" path="/dhu/xxgk/news"/>

## 东南大学

### 信息科学与工程学院学术活动

<Route author="HenryQW" example="/seu/radio/academic" path="/seu/radio/academic"/>

### 研究生招生网通知公告

<Route author="Chingyat" example="/seu/yzb/1" path="/seu/yzb/:type" :paramsDesc="['1 为硕士招生，2 为博士招生，3 为港澳台及中外合作办学']"/>

### 东南大学计算机技术与工程学院

<Route author="LogicJake" example="/seu/cse/xyxw" path="/seu/cse/:type?" :paramsDesc="['分类名(默认为xyxw)']">

| 学院新闻 | 通知公告 | 教务信息 | 就业信息 | 学工事务 |
| ---- | ---- | ---- | ---- | ---- |
| xyxw | tzgg | jwxx | jyxx | xgsw |

</Route>

## 对外经济贸易大学

### 人力资源处

<Route author="nczitzk" example="/uibe/hr" path="/uibe/hr/:category?/:type?" :paramsDesc="['分类，可在对应页 URL 中找到，默认为通知公告', '类型，可在对应页 URL 中找到，默认为空']">

::: tip 提示

如 [通知公告](http://hr.uibe.edu.cn/tzgg) 的 URL 为 <http://hr.uibe.edu.cn/tzgg>，其路由为 [`/uibe/hr/tzgg`](https://rsshub.app/uibe/hr/tzgg)

如 [教师招聘](http://hr.uibe.edu.cn/jszp) 中的 [招聘信息](http://hr.uibe.edu.cn/jszp/zpxx) 的 URL 为 <http://hr.uibe.edu.cn/jszp/zpxx>，其路由为 [`/uibe/hr/jszp/zpxx`](https://rsshub.app/uibe/jszp/zpxx)

:::

</Route>

## 福州大学

### 教务处通知

<Route author="Lao-Liu233" example="/fzu/jxtz" path="/fzu/:type" :paramsDesc="['分类见下表']"/>

| 教学通知 | 专家讲座 |
| ---- | ---- |
| jxtz | zjjz |

### 教务处通知（无文章内容）

<Route author="Lao-Liu233" example="/fzu_min/jxtz" path="/fzu_min/:type" :paramsDesc="['分类见下表']"/>

| 教学通知 | 专家讲座 |
| ---- | ---- |
| jxtz | zjjz |

## 复旦大学继续教育学院

### 成人夜大通知公告

<Route author="mrbruce516" example="/fudan/cce" path="/fudan/cce" />

## 广东工业大学

### 通知公文网

<Route author="Jim Kirisame" example="/gdut/oa_news" path="/gdut/oa_news/:category" :paramsDesc="['分类名']">

| 校内简讯 | 校内通知   | 公示公告         | 招标公告          | 招标结果          |
| ---- | ------ | ------------ | ------------- | ------------- |
| news | notice | announcement | tender_invite | tender_result |

</Route>

## 广东海洋大学

### 广东海洋大学

<Route author="Xiaotouming" example="/gdoujwc" path="/gdoujwc"/>

## 广州大学

## 广州大学研招网通知公告

<Route author="sushengmao" example="/gzyjs" path="/gzyjs" />

## 广州航海学院

## 广州航海学院教务处通知公告

<Route author="skyedai910" example="/gzmtu/jwc" path="/gzmtu/jwc" />

## 广州航海学院图书馆通知公告

<Route author="skyedai910" example="/gzmtu/tsg" path="/gzmtu/tsg" />

## 桂林电子科技大学

### 新闻资讯

<Route author="cssxsh" example="/guet/xwzx/xykx" path="/guet/xwzx/:type" :paramsDesc="['资讯类型，如下表']">

| 桂电要闻 | 文明校园建设 | 桂电新闻 | 校园快讯 | 学院动态 | 媒体桂电 | 通知公告 | 招标公示 | 学术活动 |
| ---- | ------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| gdyw | wmxyjs | gdxw | xykx | xydt | mtgd | tzgg | zbgs | xshd |

注 1: 不要吐槽拼音缩写，缩写原本的 URL 构成就这样。

</Route>

## 桂林航天工业学院

### 新闻资讯

<Route author="wyml" example="/guat/news/ghyw" path="/guat/news/:type?" :paramsDesc="['资讯类型，如下表']">

| 桂航要闻 | 院部动态 | 通知公告 | 信息公开 | 桂航大讲堂 |
| ---- | ---- | ---- | ---- | ----- |
| gdyw | ybdt | tzgg | xxgk | ghdjt |

注 1: 不要吐槽拼音缩写，缩写原本的 URL 构成就这样。

</Route>

## 国防科技大学

### 研究生招生信息网

<Route author="nczitzk" example="/nudt/yjszs/16" path="/nudt/yjszs/:id?" :paramsDesc="['分类 id，默认为 `0` 即通知公告']">

| 通知公告 | 招生简章 | 学校政策 | 硕士招生 | 博士招生 | 院所发文 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 8    | 12   | 16   | 17   | 23   |

</Route>

## 哈尔滨工程大学

### 本科生院工作通知

<Route author="XYenon" example="/heu/ugs/news/jwc/jxap" path="/heu/ugs/news/:author?/:category?" :paramsDesc="['发布部门，默认为 `gztz`', '分类，默认为 `all`']">

author 列表：

| 教务处 | 实践教学与交流处  | 教育评估处 | 专业建设处 | 国家大学生文化素质基地 | 教师教学发展中心 | 综合办公室 | 工作通知 |
| --- | --------- | ----- | ----- | ----------- | -------- | ----- | ---- |
| jwc | sjjxyjlzx | jypgc | zyjsc | gjdxswhszjd | jsjxfzzx | zhbgs | gztz |

category 列表：

`all` 为全部

教务处：

| 教学安排 | 考试管理 | 学籍管理 | 外语统考 | 成绩管理 |
| ---- | ---- | ---- | ---- | ---- |
| jxap | ksgl | xjgl | wytk | cjgl |

实践教学与交流处：

| 实验教学 | 实验室建设 | 校外实习 | 学位论文 | 课程设计 | 创新创业 | 校际交流 |
| ---- | ----- | ---- | ---- | ---- | ---- | ---- |
| syjx | sysjs | xwsx | xwlw | kcsj | cxcy | xjjl |

教育评估处：

| 教学研究与教学成果 | 质量监控 |
| --------- | ---- |
| jxyjyjxcg | zljk |

专业建设处：

| 专业与教材建设 | 陈赓实验班 | 教学名师与优秀主讲教师 | 课程建设 | 双语教学 |
| ------- | ----- | ----------- | ---- | ---- |
| zyyjcjs | cgsyb | jxmsyyxzjjs | kcjs | syjx |

国家大学生文化素质基地：无

教师教学发展中心：

| 教师培训 |
| ---- |
| jspx |

综合办公室：

| 联系课程 |
| ---- |
| lxkc |

工作通知：无

</Route>

### 研究生院

<Route author="Derekmini XYenon" example="/heu/yjsy/list/2981" path="/heu/yjsy/list/:id" :paramsDesc="['栏目编号，由 `URL` 中获取。']" radar="1" rssbud="1">

| 通知公告 | 新闻动态 | 学籍注册 | 奖助学金 |  其他 |
| :--: | :--: | :--: | :--: | :-: |
| 2981 | 2980 | 3009 | 3011 | ... |

</Route>

### 就业服务平台

<Route author="Derekmini" example="/heu/job/list/tzgg" path="/heu/job/list/:id" :paramsDesc="['栏目，如下表']" radar="1" rssbud="1">

| 通知公告 | 热点新闻 |
| :--: | :--: |
| tzgg | rdxw |

</Route>

#### 大型招聘会

<Route author="Derekmini" example="/heu/job/bigemploy" path="/heu/job/bigemploy" radar="1" rssbud="1">

</Route>

#### 今日招聘会

<Route author="Derekmini" example="/heu/job/calendar" path="/heu/job/calendar" radar="1" rssbud="1">

</Route>

### 工学新闻

<Route author="Derekmini XYenon" example="/heu/gx/list/xw/yw" path="/heu/gx/:type/:column/:id?" :paramsDesc="['页面类型，如 `新闻 - 要闻` 页面为 `list` 类型，`新闻 - 专题策划` 页面为 `card` 类型，通过直接观察页面来判断；','主栏，如 `新闻：xw`，由 `URL` 中获取；','次栏，如 `要闻：yw`，如果次栏存在，则为必选，由 `URL` 中获取。']" radar="1" rssbud="1">

|    新闻    |   新闻 - 要闻   |   新闻 - 专题策划   |  其他 |
| :------: | :---------: | :-----------: | :-: |
| /card/xw | /list/xw/yw | /card/xw/ztch | ... |

</Route>

### 水声工程学院

<Route author="Derekmini" example="/heu/uae/list/3751" path="/heu/uae/list/:id" :paramsDesc="['栏目编号，由 `URL` 中获取。']" radar="1" rssbud="1">

| 新闻动态 | 通知公告 |  其他 |
| :--: | :--: | :-: |
| 3751 | 3752 | ... |

</Route>

## 哈尔滨工业大学

### 哈尔滨工业大学教务处通知公告

<Route author="lty96117" example="/hit/jwc" path="/hit/jwc"/>

### 今日哈工大

<Route author="ranpox" example="/hit/today/10" path="/hit/today/:category" :paramsDesc="['分类编号，`10`为公告公示，`11`为新闻快讯，同时支持详细分类，使用方法见下']"/>

::: tip 提示
今日哈工大的文章分为公告公示和新闻快讯，每个页面右侧列出了更详细的分类，其编号为每个 URL 路径的最后一个数字。
例如会议讲座的路径为`/taxonomy/term/10/25`，则可以通过`/hit/today/25`订阅该详细类别。
:::

::: warning 注意
部分文章需要经过统一身份认证后才能阅读全文。
:::

## 哈尔滨工业大学（深圳）

### 哈尔滨工业大学（深圳） - 新闻中心

<Route author="xandery-geek" example="/hitsz/article/id-74" path="/hitsz/article/:category?" :paramsDesc="['分类名，默认为通知公告']" >

| 校区要闻   | 媒体报道  | 通知公告  | 综合新闻  | 校园动态  | 讲座论坛  | 热点专题  |
| ------ | ----- | ----- | ----- | ----- | ----- | ----- |
| id-116 | id-80 | id-74 | id-75 | id-77 | id-78 | id-79 |

</Route>

## 哈尔滨工业大学（威海）

### 今日工大 - 通知公告

<Route author="raptazure" example="/hitwh/today" path="hitwh/today" />

## 海南大学

### 硕士研究生招生动态

<Route author="OdinZhang" example="/hainanu/ssszs" path="hainanu/ssszs"/>

## 杭州电子科技大学

### 计算机学院 - 通知公告

<Route author="legr4ndk" example="/hdu/cs" path="/hdu/cs" radar="1" rssbud="1"/>

### 计算机学院 - 研究生通知

<Route author="legr4ndk" example="/hdu/cs/pg" path="/hdu/cs/pg" radar="1" rssbud="1"/>

## 合肥工业大学

### 通知公告

<Route author="log-e" example="/hfut/tzgg" path="/hfut/tzgg"/>

## 河海大学

### 河海大学图书馆 - 新闻动态

<Route author="plusmultiply0" example="/hhu/libNews" path="/hhu/libNews"/>

### 常州校区图书馆 - 新闻动态

<Route author="plusmultiply0" example="/hhu/libNewsc" path="/hhu/libNewsc"/>

## 河南财政金融学院

### 河南财政金融学院

<Route author="WenPeiTung" example="/hafu/news/ggtz" path="/hafu/news/:type?" radar="1" rssbud="1" :paramsDesc="['分类，见下表（默认为 `ggtz`)']">

| 校内公告通知 | 教务处公告通知 | 招生就业处公告通知 |
| ------ | ------- | --------- |
| ggtz   | jwc     | zsjyc     |

</Route>

## 河南大学

### 河南大学

<Route author="CasterWx" example="/henu/xszl" path="/henu/:type" :paramsDesc="['分类，见下表']">

| 学生专栏 | 教师专栏 | 新闻公告 | 院部动态 | 高教前沿 |
| ---- | ---- | ---- | ---- | ---- |
| xszl | jszl | xwgg | ybdt | gjqy |

</Route>

## 湖北大学

### 新闻通知

<Route author="cijiugechu" example="/hubu/news/zhxw" path="/universities/hubu/news/:type?" :paramsDesc="['默认为 `zhxw`']">

| 综合新闻 | 湖大要闻 | 通知公告 | 学术学者学生 | 媒体湖大 |
| ---- | ---- | ---- | ------ | ---- |
| zhxw | hdyw | tzgg | xsxzxs | mthd |

</Route>

## 湖北工业大学

### 新闻中心

<Route author="Lava-Swimmer" example="/hbut/news/tzgg" path="/hbut/news/:type" radar="1" rssbud="1" :paramsDesc="['分类']">

| 通知公告 | 湖工要闻 | 学术活动 | 媒体湖工大 | 综合新闻 | 湖工故事 |
| ---- | ---- | ---- | ----- | ---- | ---- |
| tzgg | hgyw | xshd | mthgd | zhxw | hggs |

</Route>

### 计算机学院

<Route author="Lava-Swimmer" example="/hbut/cs/xwdt" path="/hbut/cs/:type" radar="1" rssbud="1" :paramsDesc="['分类']">

| 新闻动态 | 通知公告 | 教学信息 | 科研动态 | 党建活动 |
| ---- | ---- | ---- | ---- | ---- |
| xwdt | tzgg | jxxx | kydt | djhd |

</Route>

::: warning 注意
jsjxy.hbut.edu.cn 证书链不全，自建 RSSHub 可设置环境变量 NODE_TLS_REJECT_UNAUTHORIZED = 0
:::

## 湖南科技大学

### 教务处通知

<Route author="Pretty9" example="/hnust/jwc" path="/hnust/jwc"/>

### 计算机科学与工程学院通知

<Route author="Pretty9" example="/hnust/computer" path="/hnust/computer"/>

### 化学化工学院通知

<Route author="OrbitZore" example="/hnust/chem" path="/hnust/chem"/>

### 艺术学院通知

<Route author="Pretty9" example="/hnust/art" path="/hnust/art"/>

### 研究生院招生工作

<Route author="Pretty9" example="/hnust/graduate/sszs" path="/hnust/graduate/:type?" :paramsDesc="['默认为 `sszs`']">

| 硕士招生 | 博士招生 |
| ---- | ---- |
| sszs | bszs |

</Route>

## 华北电力大学

### 北京校区研究生院

<Route author="nilleo" example="/ncepu/master/tzgg" path="/ncepu/master/:type" :paramsDesc="['类型参数']">

| 类型 | 硕士招生信息 | 通知公告 | 研究生培养信息 |
| -- | ------ | ---- | ------- |
| 参数 | zsxx   | tzgg | pyxx    |

</Route>

## 华北水利水电大学

### 学校通知

<Route author="vuhe" example="/ncwu/notice" path="/ncwu/notice" radar="1" rssbud="1"/>

## 华东理工大学

### 华东理工大学研究生院通知公告

<Route author="sushengmao" example="/ecustyjs" path="/ecustyjs" />

### 华东理工继续教育学院新闻公告

<Route author="jialinghui" example="/ecust-jxjy/news" path="/news" rssbud="1" />

## 华东师范大学

### 华东师范大学研究生院

<Route author="sushengmao" example="/ecnuyjs" path="/ecnuyjs" />

## 华南理工大学

### 研究生院通知公告

<Route author="sushengmao" example="/scutyjs" path="/scutyjs" />

### 教务处通知公告

<Route author="KeNorizon" example="/scut/jwc/notice/all" path="/scut/jwc/notice/:category?" :paramsDesc="['通知分类，默认为 `all`']">

| 全部  | 选课     | 考试   | 实践       | 交流            | 教师      | 信息   |
| --- | ------ | ---- | -------- | ------------- | ------- | ---- |
| all | course | exam | practice | communication | teacher | info |

</Route>

### 教务处学院通知

<Route author="KeNorizon Rongronggg9" example="/scut/jwc/school/all" path="/scut/jwc/school/:category?" :paramsDesc="['通知分类，默认为 `all`']">

| 全部  | 选课     | 考试   | 信息   |
| --- | ------ | ---- | ---- |
| all | course | exam | info |

</Route>

### 教务处新闻动态

<Route author="KeNorizon" example="/scut/jwc/news" path="/scut/jwc/news" />

### 土木与交通学院 - 学工通知

<Route author="railzy" example="/scut/scet/notice" path="/scut/scet/notice" />

### 电子与信息学院 - 新闻速递

<Route author="auto-bot-ty" example="/scut/seie/news_center" path="/scut/seie/news_center" />

::: warning 注意
由于学院官网对非大陆 IP 的访问存在限制，需自行部署。
:::

## 华南师范大学

### 软件学院通知公告

<Route author="sushengmao" example="/scnucs" path="/scnucs" />

### 研究生院通知公告

<Route author="sushengmao" example="/scnuyjs" path="/scnuyjs" />

### 教务处通知

<Route author="fengkx" example="/scnu/jw" path="/scnu/jw"/>

### 图书馆通知

<Route author="fengkx" example="/scnu/library" path="/scnu/library"/>

### 计算机学院竞赛通知

<Route author="fengkx" example="/scnu/cs/match" path="/scnu/cs/match"/>

## 华中科技大学

### 华中科技大学研究生院通知公告

<Route author="sushengmao" example="/hustyjs" path="/hustyjs" />

### 人工智能和自动化学院通知

<Route author="RayHY" example="/hust/aia/notice/0" path="/hust/aia/notice/:type?" :paramsDesc="['分区 type，默认为最新通知 可在网页 HTML中找到']">

| 最新 | 行政 | 人事 | 科研 | 讲座 | 本科生 | 研究生 | 学工 |
| -- | -- | -- | -- | -- | --- | --- | -- |
| 0  | 1  | 2  | 3  | 4  | 5   | 6   | 7  |

</Route>

### 人工智能和自动化学院新闻

<Route author="RayHY" example="/hust/aia/news" path="/hust/aia/news" />

## 华中师范大学

### 华中师范大学研究生通知公告

<Route author="sushengmao" example="/ccnuyjs" path="/ccnuyjs" />

### 华中师范大学计算机学院

<Route author="sushengmao" example="/ccnucs" path="/ccnucs" />

### 华中师范大学伍论贡学院

<Route author="sushengmao" example="/ccnuwu" path="/ccnuwu" />

### 就业信息

<Route author="jackyu1996" example="/ccnu/career" path="/ccnu/career" />

## 吉林大学

### 校内通知

<Route author="276562578" example="/jlu/oa" path="/jlu" />

## 吉林工商学院

### 主页

<Route author="nczitzk" example="/jlbtc" path="/jlbtc/:category?" :paramDesc="['分类，见下表，默认为通知公告']">

| 学院新闻 | 通知公告 | 媒体工商 | 博学讲堂 | 师生风采 |
| ---- | ---- | ---- | ---- | ---- |
| xyxw | tzgg | mtgs | bxjt | ssfc |

</Route>

### 科研处

<Route author="nczitzk" example="/jlbtc/kyc" path="/jlbtc/kyc/:category?" :paramDesc="['分类，见下表，默认为通知公告']">

| 通知公告 | 新闻动态 |
| ---- | ---- |
| tzgg | xwdt |

</Route>

### 教务处

<Route author="nczitzk" example="/jlbtc/jwc" path="/jlbtc/jwc/:id?" :paramDesc="['分类，见下表，默认为通知公告']">

| 教务新闻 | 通知公告 | 教务工作 | 教师发展工作 | 学籍考务工作 | 教学基本建设 |
| ---- | ---- | ---- | ------ | ------ | ------ |
| 1888 | 1887 | 1947 | 1949   | 2011   | 1948   |

</Route>

## 暨南大学

## 暨南要闻

<Route author="hang333" example="/jnu/yw/tt" path="/jnu/yw/:type?" :paramDesc="['暨南要闻类型，默认为 `yw`']">

| 暨大头条 | 暨南要闻 |
| ---- | ---- |
| tt   | yw   |

</Route>

### 暨南大学校园时讯

<Route author="hang333" example="/jnu/xysx/yxsd" path="/jnu/xysx/:type" :paramDesc="['校园时讯类型']">

| 院系速递 | 部门快讯 |
| ---- | ---- |
| yxsd | bmkx |

</Route>

## 江南大学

### 教务处通知

<Route author="Chingyat" example="/ju/jwc/all" path="/ju/jwc/:type?" :paramsDesc="['默认为 `all`']">

| all | tzgg | ksap | wjgg | tmgz | djks | xjgl | bysj | syjs |
| --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 全部  | 通知公告 | 考试安排 | 违纪公告 | 推免工作 | 等级考试 | 学籍管理 | 毕业设计 | 实验教学 |

| sjcx | xkjs | yjszj | jxgg | zyjs | kcjs | jcjs | jxcg | xsbg |
| ---- | ---- | ----- | ---- | ---- | ---- | ---- | ---- | ---- |
| 实践创新 | 学科竞赛 | 研究生助教 | 教学改革 | 专业建设 | 课程建设 | 教材建设 | 教学成果 | 学术报告 |

</Route>

## 井冈山大学

### 教务处通知

<Route author="butten42" example="/jgsu/jwc" path="/jgsu/jwc" />

## 昆明理工大学

### 教务处

<Route author="geekrainy" example="/kmust/jwc/notify" path="/kmust/jwc/:type?" :paramsDesc="['默认为 `notify`']">

| 教务通知   | 教务新闻 |
| ------ | ---- |
| notify | news |

</Route>

### 宣讲会

<Route author="geekrainy" example="/kmust/job/careers/inner" path="/kmust/job/careers/:type?" :paramsDesc="['默认为 `inner`']">

| 校内宣讲会 | 校外宣讲会 |
| ----- | ----- |
| inner | outer |

</Route>

### 双选会

<Route author="geekrainy" example="/kmust/job/jobfairs" path="/kmust/job/jobfairs" />

## 辽宁工程技术大学

### 教务公告

<Route author="ikvarxt" example="/lntu/jwnews" path="/lntu/jwnews" />

## 临沂大学

### 新闻

<Route author="ueiu" example="/lyu/news/ldyw" path="/lyu/news/:type" :paramsDesc="['分类名']">

| 临大要闻 | 信息公告 |
| ---- | ---- |
| ldyw | xxgg |

</Route>
## 洛阳理工学院

### 教务处

<Route author="vhxubo" example="/lit/jwc" path="/lit/jwc" />

### 新闻中心

<Route author="vhxubo" example="/lit/xwzx" path="/lit/xwzx/:name?" :paramsDesc="['默认为 `all`']">

| 全部  | 公告通知 | 新闻快讯 | 学术信息 | 媒体新闻 |
| --- | ---- | ---- | ---- | ---- |
| all | ggtz | xwkx | xsxx | mtxw |

</Route>

### 团委

<Route author="vhxubo" example="/lit/tw" path="/lit/tw/:name?" :paramsDesc="['默认为 `all`']">

| 全部  | 团内通知 | 青年快讯 |
| --- | ---- | ---- |
| all | tntz | qnkx |

</Route>

## 马萨诸塞大学 阿默斯特分校 (UMASS Amherst)

### 电子与计算机工程系

#### 新闻

<Route author="gammapi" example="/umass/amherst/ecenews" path="/umass/amherst/ecenews" radar="1" rssbud="1"/>

#### 研讨会

<Route author="gammapi" example="/umass/amherst/eceseminar" path="/umass/amherst/eceseminar" radar="1" rssbud="1"/>

注：[源站](https://ece.umass.edu/seminar)在未公布研讨会计划时会清空页面导致 Rsshub 抓取不到内容，此属正常现象。

### 信息与计算机科学系新闻

<Route author="gammapi" example="/umass/amherst/csnews" path="/umass/amherst/csnews" radar="1" rssbud="1"/>

### 国际项目办公室

#### 活动

<Route author="gammapi" example="/umass/amherst/ipostories" path="/umass/amherst/ipostories" radar="1" rssbud="1"/>

#### 新闻

<Route author="gammapi" example="/umass/amherst/ipoevents" path="/umass/amherst/ipoevents" radar="1" rssbud="1"/>

## 南昌航空大学

### 教务处公告与新闻

<Route author="Sg4Dylan" example="/nchu/jwc/notice" path="/nchu/jwc/:type?" :paramsDesc="['默认为 `notice`']">

| 教务公告   | 教务新闻 |
| ------ | ---- |
| notice | news |

</Route>

## 南方科技大学

### 南方科技大学研究生网通知公告

<Route author="sushengmao" example="/sustyjs" path="/sustyjs" />

### 南方科技大学新闻网（中文）

<Route author="sparkcyf" example="/sustech/newshub-zh" path="/sustech/newshub-zh" />

### 南方科技大学采购与招标管理部

<Route author="sparkcyf" example="/sustech/bidding" path="/sustech/bidding" />

## 南京大学

### 本科生院

<Route author="ret-1" example="/nju/jw/ggtz" path="/nju/jw/:type" :paramsDesc="['分类名']">

| 公告通知 | 教学动态 |
| ---- | ---- |
| ggtz | jxdt |

</Route>

### 研究生院

<Route author="ret-1" example="/nju/gra" path="/nju/gra" />

### 人才招聘网

<Route author="ret-1" example="/nju/rczp/xxfb" path="/nju/rczp/:type" :paramsDesc="['分类名']">

| 信息发布 | 教研类岗位 | 管理岗位及其他 |
| ---- | ----- | ------- |
| xxfb | jylgw | gllgw   |

</Route>

### 科学技术处

<Route author="ret-1" example="/nju/scit/tzgg" path="/nju/scit/:type" :paramsDesc="['分类名']">

| 通知公告 | 科研动态 |
| ---- | ---- |
| tzgg | kydt |

</Route>

### 资产管理处

<Route author="ret-1" example="/nju/zcc" path="/nju/zcc" />

### 招标办公室

<Route author="ret-1" example="/nju/zbb/cgxx" path="/nju/zbb/:type" :paramsDesc="['分类名']">

| 采购信息 | 成交公示 | 政府采购意向公开 |
| ---- | ---- | -------- |
| cgxx | cjgs | zfcgyxgk |

</Route>

### 基建处

<Route author="ret-1" example="/nju/jjc" path="/nju/jjc" />

### 本科迎新

<Route author="ret-1" example="/nju/admission" path="/nju/admission" />

### 后勤集团

<Route author="ret-1" example="/nju/hqjt" path="/nju/hqjt" />

## 南京工程学院

### 南京工程学院通知公告

<Route author="zefengdaguo" example="/njit/tzgg" path="/njit/tzgg" />

### 南京工程学院教务处

<Route author="zefengdaguo" example="/njit/jwc/jx" path="/njit/jwc/:type?" :paramsDesc="['默认为 `jx`']" />

| 教学 | 考试 | 信息 | 实践 |
| -- | -- | -- | -- |
| jx | ks | xx | sj |

## 南京工业大学

### 南京工业大学教务处

<Route author="TrumanGu" example="/njtech/jwc" path="/njtech/jwc" />

## 南京航空航天大学

### 教务处

<Route author="arcosx Seiry qrzbing" example="/nuaa/jwc/tzgg" path="/nuaa/jwc/:type/:getDescription?" :paramsDesc="['分类名', '是否获取描述']" puppeteer="1">

| 通知公告 | 教学服务 | 教学建设 | 学生培养 | 教学资源 |
| ---- | ---- | ---- | ---- | ---- |
| tzgg | jxfw | jxjs | xspy | jxzy |

</Route>

### 计算机科学与技术学院

<Route author="LogicJake Seiry qrzbing" example="/nuaa/cs/jxdt" path="/nuaa/cs/:type/:getDescription?" :paramsDesc="['分类名', '是否获取描述']" puppeteer="1">

| 通知公告 | 热点新闻 | 学科科研 | 教学动态 | 本科生培养 | 研究生培养 | 学生工作 |
| ---- | ---- | ---- | ---- | ----- | ----- | ---- |
| tzgg | rdxw | xkky | jxdt | be    | me    | xsgz |

</Route>

### 研究生院

<Route author="junfengP Seiry" example="/nuaa/yjsy/latest" path="/nuaa/yjsy/:type?" :paramsDesc="['分类名']"/>

| 最近动态   | 研院新闻 | 上级文件 | 管理文件 | 信息服务 |
| ------ | ---- | ---- | ---- | ---- |
| latest | yyxw | sjwj | glwj | xxfw |

</Route>

## 南京理工大学

### 教务处

<Route author="MilkShakeYoung jasongzy" example="/njust/jwc/xstz" path="/njust/jwc/:type?" :paramsDesc="['分类名，见下表，默认为学生通知']" radar="1" rssbud="1" puppeteer="1">

| 教师通知 | 学生通知 | 新闻 | 学院动态 |
| ---- | ---- | -- | ---- |
| jstz | xstz | xw | xydt |

</Route>

### 财务处

<Route author="MilkShakeYoung jasongzy" example="/njust/cwc/tzgg" path="/njust/cwc/:type?" :paramsDesc="['分类名，见下表，默认为通知公告']" radar="1" rssbud="1" puppeteer="1">

| 通知公告 | 办事流程 |
| ---- | ---- |
| tzgg | bslc |

</Route>

### 研究生院

<Route author="MilkShakeYoung jasongzy" example="/njust/gs/sytzgg_4568" path="/njust/gs/:type?" :paramsDesc="['分类 ID，部分示例参数见下表，默认为首页通知公告，其他分类 ID 可以从网站 URL Path 中找到，如国际交流为 `gjjl`']" radar="1" rssbud="1" puppeteer="1">

| 首页通知公告      | 首页新闻动态 | 最新通知  | 招生信息  | 培养信息  | 学术活动    |
| ----------- | ------ | ----- | ----- | ----- | ------- |
| sytzgg_4568 | sytzgg | 14686 | 14687 | 14688 | xshdggl |

</Route>

### 电光学院

<Route author="jasongzy" example="/njust/eoe/tzgg" path="/njust/eoe/:type?" :paramsDesc="['分类名，见下表，默认为通知公告']" radar="1" rssbud="1" puppeteer="1">

| 通知公告 | 新闻动态 |
| ---- | ---- |
| tzgg | xwdt |

</Route>

### 电光学院研学网

<Route author="jasongzy" example="/njust/dgxg/gstz" path="/njust/dgxg/:type?" :paramsDesc="['分类名，见下表，默认为公示通知']" radar="1" rssbud="1" puppeteer="1">

| 公示通知 | 学术文化 | 就业指导 |
| ---- | ---- | ---- |
| gstz | xswh | jyzd |

</Route>

### 电光学院年级网站

<Route author="jasongzy" example="/njust/eo/17/tz" path="/njust/eo/:grade?/:type?" :paramsDesc="['年级，见下表，默认为本科 2017 级，未列出的年级所对应的参数可以从级网二级页面的 URL Path 中找到，例如：本科 2020 级为 `_t1316`', '类别，见下表，默认为年级通知（通知公告），未列出的类别所对应的参数可以从级网二级页面的 URL Path 中找到，例如：电光 20 的通知公告为 `tzgg_12969`']" radar="1" rssbud="1" puppeteer="1">

`grade` 列表：

| 本科 2016 级 | 本科 2017 级 | 本科 2018 级 | 本科 2019 级 |
| --------- | --------- | --------- | --------- |
| 16        | 17        | 18        | 19        |

`type` 列表：

| 年级通知（通知公告） | 每日动态（主任寄语） |
| ---------- | ---------- |
| tz         | dt         |

</Route>

## 南京林业大学

### 教务处

<Route author="kiusiudeng" example="/njfu/jwc/1798" path="/njfu/jwc/:category?" :paramsDesc="['省略则默认为tzgg']">

| 校级发文 | 通知公告 | 上级发文 | 下载专区 |
| ---- | ---- | ---- | ---- |
| xjfw | tzgg | sjfw | xzzq |

</Route>

## 南京师范大学

### 教务通知

<Route author="Shujakuinkuraudo" example="/njnu/jwc/xstz" path="/njnu/jwc/:type" :paramsDesc="['分类名']">

| 教师通知 | 新闻动态 | 学生通知 |
| ---- | ---- | ---- |
| jstz | xwdt | xstz |

</Route>

### 计算机与电子信息学院 - 人工智能学院

<Route author="Shujakuinkuraudo" example="/njnu/ceai/xszx" path="/njnu/ceai/:type" :paramsDesc="['分类名']">

| 学院公告 | 学院新闻 | 学生资讯 |
| ---- | ---- | ---- |
| xygg | xyxw | xszx |

</Route>

## 南京信息工程大学

::: tip 提示

路由地址全部按照 **学校官网域名和栏目编号** 设计

使用方法：

以[南信大信息公告栏](https://bulletin.nuist.edu.cn)为例，点开任意一个栏目

获得 URL 中的**分域名**和**栏目编号（可选）**：https\://`bulletin`.nuist.edu.cn/`791`/list.htm

将其替换到 RSS 路由地址中即可：

[https://rsshub.app/**nuist**/`bulletin`](https://rsshub.app/nuist/bulletin) 或 [https://rsshub.app/**nuist**/`bulletin`/`791`](https://rsshub.app/nuist/bulletin)

:::

### 南信大信息公告栏

<Route author="gylidian" example="/nuist/bulletin/791" path="/nuist/bulletin/:category?" :paramsDesc="['默认为 `791`']">

| 全部  | 文件公告 | 学术报告  | 招标信息 | 会议通知 | 党政事务 | 组织人事 |
| --- | ---- | ----- | ---- | ---- | ---- | ---- |
| 791 | 792  | xsbgw | 779  | 780  | 781  | 782  |

| 科研信息 | 招生就业 | 教学考试 | 专题讲座 | 校园活动 | 学院动态 | 其他 |
| ---- | ---- | ---- | ---- | ---- | ---- | -- |
| 783  | 784  | 785  | 786  | 788  | 789  | qt |

::: warning 注意

全文内容需使用 校园网或[VPN](http://vpn.nuist.edu.cn) 获取

:::

</Route>

### NUIST CS（南信大计软院）

<Route author="gylidian" example="/nuist/scs/2242" path="/nuist/scs/:category?" :paramsDesc="['默认为 `2242`']">

| 学院新闻 | 学生工作 | 通知公告 | 教务通知 | 科研动态 | 招生就业 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 2242 | 2237 | 2245 | 2246 | 2243 | 2244 |

</Route>

### 南信大本科教学信息网

<Route author="gylidian" example="/nuist/jwc/1" path="/nuist/jwc/:category?" :paramsDesc="['默认为 `1`']">

| 通知公告 | 教学新闻 | 规章制度 | 教学研究 | 教务管理 | 考试中心 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 4    | 5    | 6    | 7    |

| 教材建设 | 实践教学 | 三百工程 | 创新创业 | 规章制度 | 业务办理 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 8    | 9    | 56   | 60   | 62   | 43   |

</Route>

### 南信大研究生院学科建设处

<Route author="gylidian" example="/nuist/yjs/11" path="/nuist/yjs/:category?" :paramsDesc="['默认为 `11`']">

| 招生工作 | 培养工作 | 学位工作 | 学生工作 | 就业工作 | 国际合作 | 文件下载 | 工作动态 | 通知公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 3    | 4    | 5    | 6    | 7    | 8    | 9    | 10   | 11   |

</Route>

### 南信大学生工作处

<Route author="gylidian" example="/nuist/xgc" path="/nuist/xgc"/>

### NUIST ESE（南信大环科院）

<Route author="gylidian" example="/nuist/sese/11" path="/nuist/sese/:category?" :paramsDesc="['默认为 `11`']">

| 通知公告 | 新闻快讯 | 学术动态 | 学生工作 | 研究生教育 | 本科教育 |
| ---- | ---- | ---- | ---- | ----- | ---- |
| 11   | 10   | 12   | 6    | 4     | 3    |

</Route>

### NUIST AS（南信大大气科学学院）

<Route author="gylidian" example="/nuist/cas/12" path="/nuist/cas/:category?" :paramsDesc="['默认为 `12`']">

| 信息公告 | 新闻快讯 | 科学研究 | 网上公示 | 本科教育 | 研究生教育 |
| ---- | ---- | ---- | ---- | ---- | ----- |
| 12   | 11   | 3    | 110  | 4    | 5     |

</Route>

### 南京信息工程大学图书馆

<Route author="gylidian" example="/nuist/lib" path="/nuist/library/lib">

::: tip 提示

学校图书馆官网提供了[新书通报](http://lib2.nuist.edu.cn/newbook/newbook_cls_browse.php)的订阅

由于图书馆通知频率过低 (故只提供 3 条)，有待将其和 **网络信息中心**、**基建处**、**总务处** 等的通知整合起来

:::

</Route>

## 南京邮电大学

### 教务处通知与新闻

<Route author="shaoye" example="/njupt/jwc/notice" path="/njupt/jwc/:type?" :paramsDesc="['默认为 `notice`']">

| 通知公告   | 教务快讯 |
| ------ | ---- |
| notice | news |

</Route>

## 南开大学

### 南开大学教务处

<Route author="zhongweili" example="/nku/jwc/1" path="/nku/jwc/:type" :paramsDesc="['分区 type，可在网页 URL 中找到']">

| 通知公告 | 新闻动态 |
| ---- | ---- |
| 1    | 2    |

</Route>

## 清华大学

### 清华大学校内信息发布平台

<Route author="prnake" example="/thu/zhongyao" path="/thu/:type" :paramsDesc="['默认为重要公告']">

| 重要公告     | 教务公告   | 科研通知  | 办公通知    | 海报列表   |  疫情防控  |
| -------- | ------ | ----- | ------- | ------ | :----: |
| zhongyao | jiaowu | keyan | bangong | haibao | yiqing |

</Route>

::: warning 注意
由于学校通知仅允许校园网访问，需自行部署。
:::

### 清华大学招聘信息

<Route author="Halcao DylanXie123" example="/thu/career" path="/thu/career" />

## 厦门大学

### 航空航天学院

<Route author="jch12138" example="/xmu/aero/yjsjw" path="/xmu/aero/:type" :paramsDesc="['分类见下表']"/>

| 通知公告 | 本科生教务 | 研究生教务 |
| :--: | :---: | :---: |
| tzgg | bksjw | yjsjw |

</Route>

## 山东大学

### 软件学院通知

<Route author="Ji4n1ng" example="/sdu/sc/0" path="/sdu/sc/:type?" :paramsDesc="['默认为 `0`']" radar="1" rssbud="1">

| 通知公告 | 学术动态 | 本科教育 | 研究生教育 |
| ---- | ---- | ---- | ----- |
| 0    | 1    | 2    | 3     |

</Route>

### 材料科学与工程学院通知

<Route author="Ji4n1ng" example="/sdu/cmse/0" path="/sdu/cmse/:type?" :paramsDesc="['默认为 `0`']" radar="1" rssbud="1">

| 通知公告 | 学院新闻 | 本科生教育 | 研究生教育 | 学术动态 |
| ---- | ---- | ----- | ----- | ---- |
| 0    | 1    | 2     | 3     | 4    |

</Route>

### 机械工程学院通知

<Route author="Ji4n1ng" example="/sdu/mech/0" path="/sdu/mech/:type?" :paramsDesc="['默认为 `0`']" radar="1" rssbud="1">

| 通知公告 | 院所新闻 | 教学信息 | 学术动态 | 学院简报 |
| ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 2    | 3    | 4    |

</Route>

### 能源与动力工程学院通知

<Route author="Ji4n1ng" example="/sdu/epe/0" path="/sdu/epe/:type?" :paramsDesc="['默认为 `0`']" radar="1" rssbud="1">

| 学院动态 | 通知公告 | 学术论坛 |
| ---- | ---- | ---- |
| 0    | 1    | 2    |

</Route>

### 计算机科学与技术学院通知

<Route author="suxb201" example="/sdu/cs/0" path="/sdu/cs/:type?" :paramsDesc="['默认为 `0`']" radar="1" rssbud="1">

| 学院公告 | 学术报告 | 科技简讯 |
| ---- | ---- | ---- |
| 0    | 1    | 2    |

</Route>

## 山东大学（威海）

### 新闻网

<Route author="kxxt" example="/sdu/wh/news/xyyw" path="/sdu/wh/news/:column?" :paramsDesc="['专栏名称，默认为校园要闻（`xyyw`）']" radar="1" rssbud="1">

| 校园要闻 | 学生动态 | 综合新闻 | 山大视点 | 菁菁校园 | 校园简讯 | 玛珈之窗 | 热点专题 | 媒体视角 | 高教视野 | 理论学习 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| xyyw | xsdt | zhxw | sdsd | jjxy | xyjx | mjzc | rdzt | mtsj | gjsy | llxx |

</Route>

### 教务处

<Route author="kxxt" example="/sdu/wh/jwc/gztz" path="/sdu/wh/jwc/:column?" :paramsDesc="['专栏名称，默认为工作通知（`gztz`）']" radar="1" rssbud="1">

| 规章制度 | 专业建设 | 实践教学 | 支部风采 | 服务指南 | 教务要闻 | 工作通知 | 教务简报 | 常用下载 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| gzzd | zyjs | sjjx | zbfc | fwzn | jwyw | gztz | jwjb | cyxz |

</Route>

## 上海大学

### 上海大学官网信息

<Route author="lonelyion" example="/shu/news" path="/shu/:type?" :paramsDesc="['消息类型,默认为`news`']">

| 综合新闻 | 科研动态     | 通知公告   |
| ---- | -------- | ------ |
| news | research | notice |

</Route>

### 上海大学教务处通知公告

<Route author="tuxinghuan" example="/shu/jwc/notice" path="/shu/jwc/:type?" :paramsDesc="['消息类型,默认为`notice`']">

| 通知通告   | 新闻   |
| ------ | ---- |
| notice | news |

</Route>

## 上海电力大学

### 新闻网与学院通知

<Route author="小熊软糖" example="/shiep/news" path="/shiep/:type" :paramsDesc="['类型名称']">

| 新闻网  | 能源与机械工程学院 | 环境与化学工程学院 | 电气工程学院 | 自动化工程学院 | 计算机科学与技术学院 | 电子与信息学院 | 经济与管理学院 | 数理学院 | 外国语学院 | 国际交流学院 | 继续教育学院 | 马克思主义学院 | 体育部 | 艺术教育中心 |
| ---- | --------- | --------- | ------ | ------- | ---------- | ------- | ------- | ---- | ----- | ------ | ------ | ------- | --- | ------ |
| news | energy    | hhxy      | dqxy   | zdhxy   | jsjxy      | dxxy    | jgxy    | slxy | wgyxy | gjxy   | jjxy   | skb     | tyb | yjzx   |

</Route>

## 上海海事大学

### 官网信息

<Route author="simonsmh" example="/shmtu/www/events" path="/shmtu/www/:type" :paramsDesc="['类型名称']"/>

| 学术讲座   | 通知公告  |
| ------ | ----- |
| events | notes |

### 教务信息

<Route author="simonsmh" example="/shmtu/jwc/jwgg" path="/shmtu/jwc/:type" :paramsDesc="['类型名称']"/>

| 教务公告 | 教务新闻 |
| ---- | ---- |
| jwgg | jwxw |

## 上海海洋大学

### 官网信息

<Route author="Swung0x48" example="/shou/www/tzgg" path="/shou/www/:type" :paramsDesc="['消息类型']">

| 通知公告 | 招标信息 | 要闻 | 媒体聚焦 | 学术讲座 | 科技前沿 |
| ---- | ---- | -- | ---- | ---- | ---- |
| tzgg | zbxx | yw | mtjj | xsjz | xsqy |

</Route>

## 上海交通大学

### 电子信息与电气工程学院学术动态

<Route author="HenryQW" example="/sjtu/seiee/academic" path="/sjtu/seiee/academic"/>

### 电子信息与电气工程学院本科教务办

<Route author="Polynomia" example="/sjtu/seiee/bjwb/major_select" path="/sjtu/seiee/bjwb/:type" :paramsDesc="['无默认选项']">

| 分专业          | 转专业            | 直升研究生        | 交换交流   | 国际办学          |
| ------------ | -------------- | ------------ | ------ | ------------- |
| major_select | major_transfer | postgraduate | abroad | international |

</Route>

### 研究生通知公告

<Route author="mzr1996" example="/sjtu/gs/tzgg/pyxx" path="/sjtu/gs/tzgg/:type?" :paramsDesc="['默认列举所有通知公告']">

| 通知公告 | 工作信息 | 招生信息  | 培养信息 | 学位学科 | 国际交流 | 创新工程 |
| ---- | ---- | ----- | ---- | ---- | ---- | ---- |
| 空    | gzxx | xwxx1 | pyxx | xwxx | gjjl | cxgc |

</Route>

### 电子信息与电气工程学院学生工作办公室

<Route author="Polynomia xxchan" example="/sjtu/seiee/xsb/news" path="/sjtu/seiee/xsb/:type?" :paramsDesc="['默认列举所有通知公告']">

| 信息通告 | 奖学金         | 助学金          | 讲座活动    | 党团活动     | 新闻发布 | 本科生综合测评 |
| ---- | ----------- | ------------ | ------- | -------- | ---- | ------- |
| 空    | scholarship | financialAid | lecture | activity | news | zhcp    |

</Route>

### 教务处通知公告

<Route author="SeanChao" example="/sjtu/jwc/" path="/sjtu/jwc/:type?" :paramsDesc="['默认为 all ']">

| 新闻中心 | 通知通告   | 教学运行      | 注册学务    | 研究办 | 教改办 | 综合办 | 语言文字     | 工会与支部 | 通识教育 |
| ---- | ------ | --------- | ------- | --- | --- | --- | -------- | ----- | ---- |
| news | notice | operation | affairs | yjb | jgb | zhb | language | party | ge   |

</Route>

### 同去网最新活动

<Route author="SeanChao" example="/sjtu/tongqu/lecture" path="/sjtu/tongqu/:type?" :paramsDesc="['类型，默认为全部']">

| 全部  | 最新     | 招新          | 讲座      | 户外        | 招聘   | 游学         | 比赛           | 公益             | 主题党日     | 学生事务           | 广告  | 其他     |
| --- | ------ | ----------- | ------- | --------- | ---- | ---------- | ------------ | -------------- | -------- | -------------- | --- | ------ |
| all | newest | recruitment | lecture | outdoords | jobs | studyTours | competitions | publicWarefare | partyDay | studentAffairs | ads | others |

</Route>

### 研究生招生网招考信息

<Route author="richardchien" example="/sjtu/yzb/zkxx/sszs" path="/sjtu/yzb/zkxx/:type" :paramsDesc="['无默认选项']">

| 博士招生 | 硕士招生 | 港澳台招生 | 考点信息 | 院系动态 |
| ---- | ---- | ----- | ---- | ---- |
| bszs | sszs | gatzs | kdxx | yxdt |

</Route>

## 上海科技大学

### 活动通知

<Route author="nczitzk" example="/shanghaitech/activity" path="/shanghaitech/activity"/>

### 信息科技与技术学院活动

<Route author="HenryQW" example="/shanghaitech/sist/activity" path="/shanghaitech/sist/activity"/>

## 上海理工大学

### 教务处

<Route author="Diffumist" example="/usst/jwc" path="/usst/jwc"/>

## 上海立信会计金融学院

::: warning 注意

分区 ID 是`info/iList.jsp?cat_id=`后方数字

目前仅支持文章分区的识别

:::

### 官网

<Route author="NeverBehave" example="/slu/tzgg/12707" path="/slu/tzgg/:id" :paramsDesc="['类别ID']" />

### 教务处

<Route author="NeverBehave" example="/slu/jwc/13424" path="/slu/jwc/:id" :paramsDesc="['类别ID']" />

### 学生处

<Route author="NeverBehave" example="/slu/xsc/14751" path="/slu/xsc/:id" :paramsDesc="['类别ID']" />

### 会计学院

<Route author="NeverBehave" example="/slu/kjxy/13496" path="/slu/kjxy/:id" :paramsDesc="['类别ID']" />

### 财税与公共管理学院

<Route author="NeverBehave" example="/slu/csggxy/14751" path="/slu/csggxy/:id" :paramsDesc="['类别ID']" />

### 体育与健康学院

<Route author="NeverBehave" example="/slu/tyyjkxy/14754" path="/slu/tyyjkxy/:id" :paramsDesc="['类别ID']" />

## 深圳大学

### 深圳大学研究生招生网通知公告

<Route author="sushengmao" example="/szuyjs" path="/szuyjs" />

### 深圳大学研究生招生网

<Route author="NagaruZ" example="/szu/yz/1" path="/szu/yz/:type?" :paramsDesc="['默认为1']" >

| 研究生 | 博士生 |
| --- | --- |
| 1   | 2   |

</Route>

## 四川大学

### 教务处通知公告

<Route author="KXXH" example="/scu/jwc/notice" path="/scu/jwc/notice" />

### 学工部通知公告

<Route author="stevelee477" example="/scu/xg/notice" path="/scu/xg/notice" />

## 四川旅游学院

### 信息与工程学院动态公告列表

<Route author="talenHuang" example="/sctu/xgxy" path="/sctu/information-engineer-faculty/index"/>

### 信息与工程学院公告详情

<Route author="talenHuang" example="/sctu/xgxy/652" path="/sctu/information-engineer-faculty/context/:id" :paramsDesc="['文章id']"/>

### 教务处

<Route author="talenHuang" example="/sctu/jwc/13" path="/sctu/jwc/index:type?" :paramsDesc="['可选参数，默认为 `13`']">

| 教务通知 | 信息公告 |
| ---- | ---- |
| 13   | 14   |

</Route>

### 教务处通告详情

<Route author="talenHuang" example="/sctu/jwc/13/645" path="/sctu/jwc/context/:type/:id" :paramsDesc="['通知类型','文章id']"/>

## 四川农业大学

### 动物科技学院

<Route author="nczitzk" example="/sicau/dky/tzgg" path="/sicau/dky/:category?" :paramsDesc="['分类，见下表，默认为通知公告']">

| 通知公告 | 学院动态 | 教学管理 | 动科大讲堂 | 就业信息 |
| ---- | ---- | ---- | ----- | ---- |
| tzgg | xydt | jxgl | dkdjt | zpxx |

</Route>

### 研究生院

<Route author="nczitzk" example="/sicau/yan/xwgg" path="/sicau/yan/:category?" :paramsDesc="['分类，见下表，默认为新闻公告']">

| 新闻公告 | 学术报告 |
| ---- | ---- |
| xwgg | xsbg |

</Route>

### 招生就业

<Route author="nczitzk" example="/sicau/zsjy/bkszs" path="/sicau/zsjy/:category?" :paramsDesc="['分类，见下表，默认为本科生招生']">

| 本科生招生 | 研究生招生 | 毕业生选录指南 |
| ----- | ----- | ------- |
| bkszs | yjszs | bysxlzn |

</Route>

## 四川职业技术学院

### 学院公告

<Route author="nczitzk" example="/scvtc/xygg" path="/scvtc/xygg" />

## 苏州科技大学

### 教务处

<Route author="Fatpandac" example="/usts/jwch" path="/usts/jwch/:type?" :paramsDesc="['类型，默认为教务动态']" rssbud="1" radar="1">

| 类型 | 教务动态 | 公告在线 | 选课通知 |
| -- | ---- | ---- | ---- |
|    | jwdt | ggzx | xktz |

</Route>

## 太原师范学院

<Route author="2PoL" example="/tynu" path="/tynu" />

## 天津大学

### 新闻网

<Route author="SuperPung" example="/tju/news/focus" path="/tju/news/:type?" :paramsDesc="['默认为 `focus`']">

|  聚焦天大 |   综合新闻  |   校内新闻   |  媒体报道 |   图说天大  |
| :---: | :-----: | :------: | :---: | :-----: |
| focus | general | internal | media | picture |

</Route>

### 智能与计算学部

<Route author="SuperPung" example="/tju/cic/news" path="/tju/cic/:type?" :paramsDesc="['默认为 `news`']">

| 学部新闻 |     通知公告     | 北洋智算论坛 |
| :--: | :----------: | :----: |
| news | notification |  forum |

</Route>

### 教务处

<Route author="AmosChenYQ SuperPung" example="/tju/oaa/news" path="/tju/oaa/:type?" :paramsDesc="['默认为 `news`']">

| 新闻动态 |     通知公告     |
| :--: | :----------: |
| news | notification |

</Route>

### 研究生招生网

<Route author="SuperPung" example="/tju/yzb/notice" path="/tju/yzb/:type?" :paramsDesc="['默认为 `notice`']">

|  校级公告  |  统考硕士  |  统考博士  | 在职学位 |
| :----: | :----: | :----: | :--: |
| notice | master | doctor |  job |

</Route>

## 同济大学

### 同济大学研究生院通知公告

<Route author="sushengmao" example="/tjuyjs" path="/tjuyjs" />

### 同济大学软件学院通知

<Route author="sgqy" example="/tju/sse/xwdt" path="/tju/sse/:type?" :paramsDesc="['通知类型. 默认为 `xwdt`']">

| 本科生通知 | 研究生通知 | 教工通知 | 全体通知 | 学院通知 | 学院新闻 | 学院活动 |
| ----- | ----- | ---- | ---- | ---- | ---- | ---- |
| bkstz | yjstz | jgtz | qttz | xwdt | xyxw | xyhd |

注意: `qttz` 与 `xwdt` 在原网站等价.

 </Route>

## 潍坊学院

### 新闻

<Route author="cccht" example="/wfu/news/wyyw" path="/wfu/news/:type?" :paramsDesc="['分类，默认为 `wyyw`，具体参数见下表']">

| **内容** | **参数** |
| :----: | :----: |
|  潍院要闻  |  wyyw  |
|  综合新闻  |  zhxw  |
|  学术纵横  |  xszh  |

</Route>

### 教务处通知

<Route author="cccht" example="/wfu/jwc" path="/wfu/jwc" />

## 温州大学

### 新闻

<Route author="Chandler-Lu" example="/wzu/news/0" path="/wzu/news/:type" :paramsDesc="['分类，见下表 默认为`0`']" />

| 温大新闻 | 媒体温大 | 学术温大 | 通知公告 | 招标信息 | 学术公告 |
| :--: | :--: | :--: | :--: | :--: | :--: |
|   0  |   1  |   2  |   3  |   4  |   5  |

</Route>

## 温州商学院

### 温州商学院

<Route author="howel52" example="/wzbc/notice" path="/wzbc/:type" :paramsDesc="['分类，见下表']">

| 校园新闻 | 媒体商院  | 通知公告   | 人才招聘 | 行事历     | 招标公告   | 学术动态     |
| ---- | ----- | ------ | ---- | ------- | ------ | -------- |
| news | media | notice | jobs | workday | tender | activity |

</Route>

## 武昌首义学院

### 新闻中心

<Route author="Derekmini" example="/wsyu/news/xxyw" path="/wsyu/news/:type?" :paramsDesc="['分类，默认为 `xxyw`']">

| 学校要闻 | 综合新闻 | 媒体聚焦 |
| ---- | ---- | ---- |
| xxyw | zhxw | mtjj |

</Route>

## 武汉大学

### 计算机学院公告

<Route author="SweetDumpling" example="/whu/cs/2" path="/whu/cs/:type"
:paramsDesc="['公告类型，详见表格']">

| 公告类型 | 新闻动态 | 学术讲座 | 学院通知 | 公示公告 |
| ---- | ---- | ---- | ---- | ---- |
| 参数   | 0    | 1    | 2    | 3    |

</Route>

### 武汉大学新闻网

<Route author="SChen1024" example="/whu/news/wdyw" path="/whu/news/:type?" :paramsDesc="['分类，默认为 `wdyw`，具体参数见下表']">

注意：除了 `kydt` 代表学术动态，其余页面均是拼音首字母小写.

| **内容** | **参数** |
| :----: | :----: |
|  武大要闻  |  wdyw  |
|  媒体武大  |  mtwd  |
|  专题报道  |  ztbd  |
|  珞珈人物  |  ljrw  |
|  国际交流  |  gjjl  |
|  缤纷校园  |  bfxy  |
|  校友之声  |  xyzs  |
|  珞珈论坛  |  ljlt  |
|  新闻热线  |  xwrx  |
|  头条新闻  |  ttxw  |
|  综合新闻  |  zhxw  |
|  珞珈影像  |  ljyx  |
|  学术动态  |  kydt  |
|  珞珈副刊  |  ljfk  |
|  校史钩沉  |  xsgc  |
|  来稿选登  |  lgxd  |

</Route>

## 武汉纺织大学

### 信息门户公告

<Route author="Loyio" example="/wtu/2" path="/wtu/:type" :paramsDesc="['公告类型，详见表格']">

| 公告类型 | 通知公告 | 教务信息 | 科研动态 |
| ---- | ---- | ---- | ---- |
| 参数   | 1    | 2    | 3    |

</Route>

## 西安电子科技大学

### 教务处

<Route author="ShadowySpirits" example="/xidian/jwc/tzgg" path="/xidian/jwc/:category?" :paramsDesc="['通知类别，默认为通知公告']" radar="1" rssbud="1">

| 教学信息 | 教学研究 | 实践教学 | 质量监控 | 通知公告 |
| :--: | :--: | :--: | :--: | :--: |
| jxxx | jxyj | sjjx | zljk | tzgg |

</Route>

## 西安交通大学

### 教务处

<Route author="hoilc" example="/xjtu/dean/jxxx/xytz/ksap" path="/xjtu/dean/:subpath+" :paramsDesc="['栏目路径，支持多级，不包括末尾的`.htm`']" >

::: tip 提示

支持`http://dean.xjtu.edu.cn/`下所有**有文章列表**的栏目，

例如`http://dean.xjtu.edu.cn/gzlc.htm`，则`subpath`为`gzlc`

又例`http://dean.xjtu.edu.cn/jxxx/xytz.htm`，则`subpath`为`jxxx/xytz`

:::

</Route>

### 国际处通知

<Route author="guitaoliu" example="/xjtu/international/hzjl" path="/xjtu/international/:subpath+" :paramsDesc="['栏目路径，支持多级，不包括末尾的`.htm`']" />

### 研究生院通知公告

<Route author="nczitzk" example="/xjtu/gs/tzgg" path="/xjtu/gs/tzgg" />

### 就业创业中心

<Route author="DylanXie123" example="/xjtu/job/zxgg" path="/xjtu/job/:subpath?" :paramsDesc="['栏目类型，默认请求`zxgg`，详见下方表格']">

栏目类型

| 中心公告 | 选调生 | 重点单位 | 国际组织 | 创新创业 | 就业实习 |
| ---- | --- | ---- | ---- | ---- | ---- |
| zxgg | xds | zddw | gjzz | cxcy | jysx |

</Route>

### 电气学院

<Route author="DylanXie123" example="/xjtu/ee/1114" path="/xjtu/ee/:id?" :paramsDesc="['栏目id，默认请求`1124`，可在 URL 中找到']" />

### 科技在线

<Route author="nczitzk" example="/xjtu/std/zytz" path="/xjtu/std/:category?" :paramsDesc="['分类，见下表，默认为通知公告']">

| 通知公告 | 重要通知 | 项目申报 | 成果申报 | 信息快讯 |
| ---- | ---- | ---- | ---- | ---- |
|      | zytz | xmsb | cgsb | xxkx |

</Route>

### 第二附属医院新闻

<Route author="nczitzk" example="/xjtu/2yuan/news" path="/xjtu/2yuan/news/:id?" :paramsDesc="['编号，见下表，默认为通知公告']">

| 分类   | 编号  |
| ---- | --- |
| 通知公告 | 110 |
| 综合新闻 | 6   |
| 科室动态 | 8   |
| 教学动态 | 45  |
| 科研动态 | 51  |
| 护理动态 | 57  |
| 党群活动 | 63  |
| 外事活动 | 13  |
| 媒体二院 | 14  |
| 理论政策 | 16  |

</Route>

## 西安理工大学

### 学校主页

<Route author="mocusez" example="/xaut/index/tzgg" path="/xaut/index/:category?" :paramsDesc="['通知类别，默认为通知公告']" radar="1" rssbud="1" >

| 通知公告 | 校园要闻 | 媒体播报 | 学术活动 |
| :--: | :--: | :--: | :--: |
| tzgg | xyyw | mtbd | xshd |

</Route>

### 教务处

<Route author="mocusez" example="/xaut/jwc/tzgg" path="/xaut/jwc/:category?" :paramsDesc="['通知类别，默认为通知公告']" radar="1" rssbud="1">

::: warning 注意

有些内容需使用校园网或 VPN 访问知行网获取
:::

| 通知公告 | 新闻动态 | 规章制度 | 竞赛结果公示 | 竞赛获奖通知 | 竞赛信息 | 公开公示 |
| :--: | :--: | :--: | :----: | :----: | :--: | :--: |
| tzgg | xwdt | gzzd |  jggs  |  jsjg  | jsxx | gkgs |

</Route>

### 人事处

<Route author="light0926 mocusez" example="/xaut/rsc/tzgg" path="/xaut/rsc/:category?" :paramsDesc="['通知类别，默认为通知公告']" radar="1" rssbud="1">

::: warning 注意

有些内容指向外部链接，目前只提供这些链接，不提供具体内容，去除 jwc 和 index 的修改
:::

| 通知公告 | 工作动态 |
| :--: | :--: |
| tzgg | gzdt |

</Route>

## 西北工业大学

### 翱翔门户

<Route author="WhoIsSure" example="/nwpu/10000" path="/nwpu/:column" :paramsDesc="['栏目ID']">

栏目 ID

| 咨询中心  | 通知公告  | 校内新闻  | 校务公开  | 历史文件查询 | 教育教学  | 学术交流  | 学院动态  | 部门动态  |
| ----- | ----- | ----- | ----- | ------ | ----- | ----- | ----- | ----- |
| 10000 | 10001 | 10002 | 10003 | 10004  | 10005 | 10006 | 10007 | 10008 |

</Route>

## 西北农林科技大学

### 校园要闻

<Route author="dingyx99" example="/nwafu/news" path="/nwafu/news" />

### 教务公告

<Route author="dingyx99" example="/nwafu/jiaowu" path="/nwafu/jiaowu" />

### 后勤公告

<Route author="dingyx99" example="/nwafu/gs" path="/nwafu/gs" />

### 图书馆公告

<Route author="dingyx99" example="/nwafu/lib" path="/nwafu/lib" />

### 网教中心公告

<Route author="dingyx99" example="/nwafu/nic" path="/nwafu/nic" />

### 团委公告

<Route author="dingyx99" example="/nwafu/54youth" path="/nwafu/54youth" />

### 计财处公告

<Route author="dingyx99" example="/nwafu/jcc" path="/nwafu/jcc" />

### 研究生院公告

<Route author="dingyx99" example="/nwafu/yjshy" path="/nwafu/yjshy" />

### 信息工程学院公告

<Route author="dingyx99" example="/nwafu/cie" path="/nwafu/cie" />

## 西南财经大学

### 经济信息工程学院

<Route author="Hivol" example="/swufe/seie/tzgg" path="/swufe/seie/:type?" :paramsDesc="['分类名(默认为tzgg)']" >

| 学院新闻 | 通知公告 |
| ---- | ---- |
| xyxw | tzgg |

</Route>

## 西南交通大学

### 交通运输与物流学院

<Route author="zoenglinghou" example="/swjtu/tl/news" path="/swjtu/tl/news"/>

## 西南科技大学

### 教务处新闻

<Route author="lengthmin" example="/swust/jwc/news" path="/swust/jwc/news"/>

### 教务处通知

<Route author="lengthmin" example="/swust/jwc/notice/1" path="/swust/jwc/notice/:type?" :paramsDesc="['分区 type，缺省为 1，详见下方表格']">

| 创新创业教育 | 学生学业 | 建设与改革 | 教学质量保障 | 教学运行 | 教师教学 |
| ------ | ---- | ----- | ------ | ---- | ---- |
| 1      | 2    | 3     | 4      | 5    | 6    |

</Route>

### 计科学院通知

<Route author="lengthmin" example="/swust/cs/1" path="/swust/cs/:type?" :paramsDesc="['分区 type，缺省为 1，详见下方表格']">

| 新闻动态 | 学术动态 | 通知公告 | 教研动态 |
| ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    |

</Route>

## 西南石油大学

### 办公网

<Route author="CYTMWIA" example="/swpu/bgw/zytzgg" path="/swpu/bgw/:code" :paramsDesc="['栏目代码']">

| 栏目 | 重要通知公告 | 部门通知公告 | 本周活动 | 学术报告 |
| -- | ------ | ------ | ---- | ---- |
| 代码 | zytzgg | bmtzgg | bzhd | xsbg |

</Route>

### 教务处

<Route author="CYTMWIA" example="/swpu/dean/tzgg" path="/swpu/dean/:code" :paramsDesc="['栏目代码']">

| 栏目 | 通知公告 | 新闻报道 | 视点声音 |
| -- | ---- | ---- | ---- |
| 代码 | tzgg | xwbd | sdsy |

</Route>

### 计算机科学学院

<Route author="CYTMWIA" example="/swpu/scs/tzgg" path="/swpu/scs/:code" :paramsDesc="['栏目代码']">

| 栏目 | 通知公告 | 新闻速递 |
| -- | ---- | ---- |
| 代码 | tzgg | xwsd |

</Route>

### 电气信息学院

<Route author="CYTMWIA" example="/swpu/dxy/1156" path="/swpu/dxy/:code" :paramsDesc="['栏目代码']">

| 栏目 | 学院新闻 | 学院通知 |
| -- | ---- | ---- |
| 代码 | 1122 | 1156 |

</Route>

## 信阳师范学院

### 高等教育自学考试办公室

<Route author="VxRain" example="/xynu/zkb/zkzx" path="/xynu/zkb/:category" :paramsDesc="['分类ID']">

分类 ID（如果请求的分类 ID 在不存在下表中，默认请求`zkzx`）

| 主考专业 | 规章制度 | 实践课程 | 毕业论文 | 学士学位 | 自考毕业 | 自考教材 | 自考指南 | 联系我们 | 自考资讯 | 报名指南 | 日程安排 | 新生入门 | 转考免考 | 复习资料 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| zkzy | gzzd | sjkc | bylw | xsxw | zkby | zkjc | zkzn | lxwm | zkzx | bmzn | rcap | xsrm | zkmk | fxzl |

</Route>

## 扬州大学

### 官网消息

<Route author="LogicJake" example="/yzu/home/xxyw" path="/yzu/home/:type" :paramsDesc="['分类名']">

| 学校要闻 | 校园新闻 | 信息公告 | 学术活动 | 媒体扬大 |
| ---- | ---- | ---- | ---- | ---- |
| xxyw | xyxw | xxgg | xshd | mtyd |

</Route>

### 研究生招生

<Route author="LogicJake" example="/yzu/yjszs/tzgg" path="/yzu/yjszs/:type" :paramsDesc="['分类名']">

| 通知公告 | 博士招生 | 硕士招生 |
| ---- | ---- | ---- |
| tzgg | bszs | sszs |

</Route>

## 云南大学

### 官网消息通告

<Route author="hzcheney" example="/ynu/home" path="/ynu/home" >
</Route>

### 教务处主要通知

<Route author="hzcheney" example="/ynu/jwc/1" path="/ynu/jwc/:category" :paramsDesc="['教务处通知分类']">

| 教务科 | 学籍科 | 教学研究科 | 实践科学科 |
| --- | --- | ----- | ----- |
| 1   | 2   | 3     | 4     |

</Route>

### 研究生院重要通知（置顶消息）

<Route author="hzcheney" example="/ynu/grs/zytz" path="/ynu/grs/zytz" >
</Route>

### 研究生院其他通知

<Route author="hzcheney" example="/ynu/grs/qttz/2" path="/ynu/grs/qttz/:category" :paramsDesc="['研究生院通知分类']">

| 招生工作 | 研究生培养 | 质量管理 | 学位工作 | 综合办公室 | 相关下载 |
| ---- | ----- | ---- | ---- | ----- | ---- |
| 1    | 2     | 3    | 4    | 5     | 6    |

</Route>

## 云南师范大学

### 继续教育学院

#### 新闻

<Route author="SettingDust" example="/ynnu/edu/news" path="/ynnu/edu/news" >
</Route>

## 浙江大学

### 普通栏目 如学术 / 图片 / 新闻等

<Route author="Jeason0228" example="/zju/list/xs" path="/zju/list/:type" :paramsDesc="['`xs`为学术，`xw`为新闻，`5461`是图片新闻，`578`是浙大报道，具体参数参考左侧的菜单']"/>

### 研究生院

<Route author="Caicailiushui" example="/zju/grs/1" path="/zju/grs/:type" :paramsDesc="['分类，见下表']">

| 全部公告 | 教学管理 | 各类资助 | 学科建设 | 海外交流 |
| ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 5    |

</Route>

### 就业服务平台

<Route author="Caicailiushui" example="/zju/career/1" path="/zju/career/:type" :paramsDesc="['分类，见下表']">

| 新闻动态 | 活动通知 | 学院通知 | 告示通知 |
| ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    |

</Route>

### 物理学院

<Route author="Caicailiushui" example="/zju/physics/1" path="/zju/physics/:type" :paramsDesc="['分类，见下表']">

| 本院动态 | 科研进展 | 研究生教育最新消息 |
| ---- | ---- | --------- |
| 1    | 2    | 3         |

</Route>

### 软件学院

<Route author="yonvenne zwithz" example="/zju/cst/0" path="/zju/cst/:type" :paramsDesc="['分类，见下表']" radar="1" rssbud="1">

| 全部通知 | 招生信息 | 教务管理 | 论文管理 | 思政工作 | 评奖评优 | 实习就业 | 国际实习 | 国内合作科研 | 国际合作科研 | 校园服务 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ------ | ---- |
| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8      | 9      | 10   |

</Route>

#### 自定义聚合通知

<Route author="zwithz" example="/zju/cst/custom/36194+36241+36246" path="/zju/cst/custom/:id" :paramsDesc="['提取出通知页面中的 `ID`，如 `http://www.cst.zju.edu.cn/36246/list.htm` 中的 `36246`，可将你想获取通知的多个页面，通过 `+` 符号来聚合。']">

</Route>

## 浙江大学城市学院

### 新闻通知

<Route author="zhang-wangz" example="/zucc/news/latest" path="/zucc/news/latest">
</Route>

### 计算分院全站搜索

<Route author="zhang-wangz" example="/zucc/cssearch/latest/0/白卡" path="/zucc/cssearch/latest/:webVpn?/:key?" :paramsDesc="['见下表(默认为0)','关键词(默认为白卡)']">

| 0         | 1              |
| --------- | -------------- |
| 文章地址为正常地址 | 获取的是 webvpn 地址 |

</Route>

## 浙江工商大学

### 浙江工商大学

<Route author="nicolaszf" example="/zjgsu/tzgg" path="/zjgsu/:type" :paramsDesc="['分类，见下表']">

| 通知公告 | 学生专区 | 公示公告 |
| ---- | ---- | ---- |
| tzgg | xszq | gsgg |

</Route>

## 浙江工业大学

### 浙江工业大学

<Route author="junbaor" example="/zjut/1" path="/zjut/:type" :paramsDesc="['板块id']">

| 公告栏 | 每周会议 | 屏峰班车 | 新闻速递 | 学术动态 |
| --- | ---- | ---- | ---- | ---- |
| 1   | 2    | 3    | 10   | 25   |

</Route>

### 设计与建筑学院

<Route author="yikZero" example="/zjut/design/16" path="/zjut/design/:type" :paramsDesc="['板块id']">

| 学院新闻 | 公告通知 | 学术交流 |
| ---- | ---- | ---- |
| 16   | 18   | 20   |

</Route>

## 郑州大学

### 郑州大学新闻网

<Route author="niayyy-S" example="/zzu/news/zh" path="zzu/news/:type?"  :paramsDesc="['可选，默认为 `zh`']">

| 参数名称 | 综合新闻 | 学术动态 | 媒体郑大 | 院系风采 | 教学科研 | 学生信息 | 外事信息 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 参数   | zh   | xs   | mt   | yx   | ky   | stu  | ws   |

</Route>

### 软件学院

<Route author="niayyy-S" example="/zzu/soft/news/xyxw" path="zzu/soft/news/:type?"  :paramsDesc="['可选，默认为 `xyxw`']">

| 参数名称 | 学院新闻 | 学院公告 | 学生工作 |
| ---- | ---- | ---- | ---- |
| 参数   | xyxw | xygg | xsgz |

</Route>

## 郑州轻工业大学

### 智慧门户

<Route author="Fantasia1999" example="/zzuli/campus/0" path="/zzuli/campus/:type" :paramsDesc="['分类，见下表']" radar="1" rssbud="1">

| 参数名称 | 公告信息 | 学工信息 | 教学信息 | 信息快递 | 学术报告 | 科研信息 | 网络公告 | 班车查询 | 周会表 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| 参数   | 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8   |

</Route>

### 研究生处

<Route author="Fantasia1999" example="/zzuli/yjsc/0" path="/zzuli/yjsc/:type" :paramsDesc="['分类，见下表']" radar="1" rssbud="1">

| 参数名称 | 公告通知 | 招生工作 | 新闻资讯 | 培养工作 | 学位工作 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 参数   | 0    | 1    | 2    | 3    | 4    |

</Route>

## 中北大学

### 各种新闻通知

<Route author="Dreace" example="/nuc/zbxw" path="/nuc/:type?" :paramsDesc="['默认为 zbxw']">

| 中北新闻 | 通知公告 | 学术活动 | 教务通知 |
| ---- | ---- | ---- | ---- |
| zbxw | tzgg | xshd | jwtz |

</Route>

## 中国传媒大学

### 中国传媒大学研究生招生网

<Route author="YunYouJun" example="/cuc/yz" path="/cuc/yz" />

## 中国地质大学 (武汉)

### 今日文章 - 包含全校网站最新通知

<Route author="Dorad" example="/cug/news" path="/cug/news" />

### 研究生院综合通知公告

<Route author="sanmmm" example="/cug/graduate" path="/cug/graduate" />

### 中国地质大学通知公告

<Route author="chunibyo-wly" example="/cug/undergraduate" path="/cug/undergraduate" />

### 地理与信息工程学院综合通知公告

<Route author="chunibyo-wly" example="/cug/xgxy" path="/cug/xgxy" />

### 工程学院

<Route author="Dorad" example="/cug/gcxy/1" path="/cug/gcxy/:type" />

| 所有 | 学院新闻 | 通知公告 | 党建工作 | 学术动态 | 本科生教育 | 研究生教育 | 教工之家 |
| -- | ---- | ---- | ---- | ---- | ----- | ----- | ---- |
| 0  | 1    | 2    | 3    | 4    | 5     | 6     | 7    |

## 中国海洋大学

### 信息科学与工程学院

<Route author="Geo" example="/ouc/it/0" path="/ouc/it/:type?" :paramsDesc="['默认为 `0`']">

| 学院要闻 | 学院公告 | 学院活动 |
| ---- | ---- | ---- |
| 0    | 1    | 2    |

</Route>

### 中国海洋大学研究生院

<Route author="sushengmao" example="/outyjs" path="/outyjs" />

### 中国海洋大学信电学院通知公告

<Route author="sushengmao" example="/outele" path="/outele" />

## 中国科学技术大学

### 官网通知公告

<Route author="hang333 jasongzy" example="/ustc/news/gl" path="/ustc/news/:type?" :paramsDesc="['分类，默认为管理类']" radar="1" rssbud="1">

| 教学类 | 科研类 | 管理类 | 服务类 |
| --- | --- | --- | --- |
| jx  | ky  | gl  | fw  |

</Route>

### 教务处通知新闻

<Route author="hang333" example="/ustc/jwc/info" path="/ustc/jwc/:type?" :paramsDesc="['分类，默认显示所有种类']" radar="1" rssbud="1">

| 信息   | 教学       | 考试   | 交流       |
| ---- | -------- | ---- | -------- |
| info | teaching | exam | exchange |

</Route>

### 研究生院

<Route author="jasongzy" example="/ustc/gs/tzgg" path="/ustc/gs/:type?" :paramsDesc="['分类，见下表，默认为通知公告']" radar="1" rssbud="1">

| 通知公告 | 新闻动态 |
| ---- | ---- |
| tzgg | xwdt |

</Route>

### 信息科学技术学院

<Route author="jasongzy" example="/ustc/sist/tzgg" path="/ustc/sist/:type?" :paramsDesc="['分类，见下表，默认为通知公告']" radar="1" rssbud="1">

| 通知公告 | 招生工作 |
| ---- | ---- |
| tzgg | zsgz |

</Route>

### 电子工程与信息科学系

<Route author="jasongzy" example="/ustc/eeis/tzgg" path="/ustc/eeis/:type?" :paramsDesc="['分类，见下表，默认为通知公告']" radar="1" rssbud="1">

| 通知公告 | 新闻信息 |
| ---- | ---- |
| tzgg | xwxx |

</Route>

### 就业信息网

<Route author="nczitzk" example="/ustc/job" path="/ustc/job/:category?" :paramsDesc="['分类，见下表，默认为招聘公告']" radar="1" rssbud="1">

| 专场招聘会       | 校园双选会        | 空中宣讲      | 招聘公告     |
| ----------- | ------------ | --------- | -------- |
| RecruitList | Doublechoice | Broadcast | joblist2 |

</Route>

## 中国科学院

### 成果转化

<Route author="nczitzk" example="/cas/cg/cgzhld" path="/cas/cg/:caty?" :paramsDesc="['分类，见下表，默认为工作动态']">

| 工作动态 | 科技成果转移转化亮点工作 |
| ---- | ------------ |
| zh   | cgzhld       |

</Route>

### 上海微系统与信息技术研究所学术活动

<Route author="HenryQW" example="/cas/sim/academic" path="/cas/sim/academic"/>

### 中国科学院信息工程研究所 第二研究室 处理架构组 知识库

<Route author="renzhexigua" example="/cas/mesalab/kb" path="/cas/mesalab/kb"/>

### 中国科学院电工研究所 科研动态

<Route author="nczitzk" example="/cas/iee/kydt" path="/cas/iee/kydt"/>

## 中国科学院大学

### 招聘信息

<Route author="Fatpandac" example="/ucas/job" path="/ucas/job/:type?" :paramsDesc="['招聘类型，默认为博士后']">

| 招聘类型 | 博士后 | 课题项目聘用 | 管理支撑人才 | 教学科研人才 |
| :--: | :-: | :----: | :----: | :----: |
|  参数  | bsh | ktxmpy | glzcrc | jxkyrc |

</Route>

## 中国农业大学

### 中国农业大学研招网通知公告

<Route author="sushengmao" example="/cauyjs" path="/cauyjs" />

#### 中国农业大学信电学院

<Route author="sushengmao" example="/cauele" path="/cauele" />

## 中国人民大学

### 人事处

<Route author="nczitzk" example="/ruc/hr" path="/ruc/hr/:category?" :paramsDesc="['分类，见下方说明，默认为首页通知公告']">

::: tip 提示

分类字段处填写的是对应中国人民大学人事处分类页网址中介于 **<http://hr.ruc.edu.cn/>** 和 **/index.htm** 中间的一段，并将其中的 `/` 修改为 `-`。

如 [中国人民大学人事处 - 办事机构 - 教师事务办公室 - 教师通知公告](http://hr.ruc.edu.cn/bsjg/bsjsswbgs/jstzgg/index.htm) 的网址为 <http://hr.ruc.edu.cn/bsjg/bsjsswbgs/jstzgg/index.htm> 其中介于 **<http://hr.ruc.edu.cn/>** 和 **/index.htm** 中间的一段为 `bsjg/bsjsswbgs/jstzgg`。随后，并将其中的 `/` 修改为 `-`，可以得到 `bsjg-bsjsswbgs-jstzgg`。所以最终我们的路由为 [`/ruc/hr/bsjg-bsjsswbgs-jstzgg`](https://rsshub.app/ruc/hr/bsjg-bsjsswbgs-jstzgg)

:::

</Route>

## 中国石油大学（华东）

### 中国石油大学研究生院通知公告

<Route author="sushengmao" example="/upcyjs" path="/upcyjs" />

### 主页

<Route author="Veagau" example="/upc/main" path="/upc/main/:type" :paramsDesc="['分类，见下表']">

| 通知公告   | 学术动态    |
| ------ | ------- |
| notice | scholar |

</Route>

### 计算机科学与技术学院

<Route author="Veagau" example="/upc/jsj" path="/upc/jsj/:type" :paramsDesc="['分类，见下表']">

| 学院新闻 | 学术关注    | 学工动态   | 通知公告   |
| ---- | ------- | ------ | ------ |
| news | scholar | states | notice |

</Route>

## 中国药科大学

### 中国药科大学

<Route author="kba977" example="/cpu/home" path="/cpu/:type" :paramsDesc="['分类，见下表']">

| 首页   | 教务处 | 研究生院 |
| ---- | --- | ---- |
| home | jwc | yjsy |

</Route>

## 中科院

### 中科院自动化所

<Route author="sushengmao" example="/zkyyjs" path="/zkyyjs" />

### 中科院人工智能所

<Route author="sushengmao" example="/zkyai" path="/zkyai" />

## 中南财经政法大学

### 通知公告

<Route author="nczitzk" example="/zuel/notice" path="/zuel/notice"/>

## 中南大学

### 招聘信息

<Route author="csuhan" example="/csu/job" path="/csu/job/:type?" :paramsDesc="['招聘类型']">

| 招聘类型 | 本部招聘 | 湘雅招聘 | 铁道招聘 | 在线招聘 | 事业招考 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 参数   | 1    | 2    | 3    | 4    | 5    |

</Route>

### 计算机学院

<Route author="j1g5awi" example="/csu/cse" path="/csu/cse/:type?" :paramsDesc="['类型']">

| 类型 | 学院新闻 | 通知公告 | 学术信息 | 学工动态 | 科研动态 |
| -- | ---- | ---- | ---- | ---- | ---- |
| 参数 | xyxw | tzgg | xsxx | xgdt | kydt |

</Route>

### 校长信箱

<Route author="j1g5awi" example="/csu/mail" path="/csu/mail/:type?" :paramsDesc="['类型']">

| 类型 | 校长信箱 | 党委信箱 |
| -- | ---- | ---- |
| 参数 | 01   | 02   |

</Route>

## 中山大学

### 数据科学与计算机学院动态

<Route author="Neutrino3316 MegrezZhu nczitzk" example="/sysu/cse" path="/sysu/cse"/>
