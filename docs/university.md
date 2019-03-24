# 大学通知

## 上海海事大学

<Route name="学术讲座" author="simonsmh" example="/shmtu/events" path="/universities/shmtu/events"/>

<Route name="通知公告" author="simonsmh" example="/shmtu/notes" path="/universities/shmtu/notes"/>

<Route name="教务信息" author="simonsmh" example="/shmtu/jwc/1" path="/universities/shmtu/jwc/:type" :paramsDesc="['1 为教务新闻, 2 为教务公告']"/>

## 西南科技大学

<Route name="教务处新闻" author="lengthmin" example="/swust/jwc/news" path="/universities/swust/jwc/news"/>

<Route name="教务处通知" author="lengthmin" example="/swust/jwc/notice/1" path="/universities/swust/jwc/notice/:type?" :paramsDesc="['分区 type,缺省为 1, 详见下方表格']">

| 创新创业教育 | 学生学业 | 建设与改革 | 教学质量保障 | 教学运行 | 教师教学 |
| ------------ | -------- | ---------- | ------------ | -------- | -------- |
| 1            | 2        | 3          | 4            | 5        | 6        |

</Route>

<Route name="计科学院通知" author="lengthmin" example="/swust/cs/1" path="/universities/swust/cs/:type?" :paramsDesc="['分区 type, 缺省为 1, 详见下方表格']">

| 新闻动态 | 学术动态 | 通知公告 | 教研动态 |
| -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        |

</Route>

## 北京大学

<Route name="信科公告通知" author="Ir1d" example="/pku/eecs/0" path="/universities/pku/eecs/:type" :paramsDesc="['分区 type, 可在网页 URL 中找到']">

| 全部 | 学院通知 | 人事通知 | 教务通知 | 学工通知 | 科研通知 | 财务通知 | 工会通知 | 院友通知 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0    | 1        | 2        | 6        | 8        | 7        | 5        | 3        | 4        |

</Route>

## 华南师范大学

<Route name="教务处通知" author="fengkx" example="/scnu/jw" path="/universities/scnu/jw"/>

<Route name="图书馆通知" author="fengkx" example="/scnu/library" path="/universities/scnu/library"/>

<Route name="计算机学院竞赛通知" author="fengkx" example="/scnu/cs/match" path="/universities/scnu/cs/match"/>

## 江南大学

<Route name="教务处通知" author="Chingyat" example="/ju/jwc/all" path="/universities/ju/jwc/:type?" :paramsDesc="['默认为 `all`']">

| all  | tzgg     | ksap     | wjgg     | tmgz     | djks     | xjgl     | bysj     | syjs     |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 全部 | 通知公告 | 考试安排 | 违纪公告 | 推免工作 | 等级考试 | 学籍管理 | 毕业设计 | 实验教学 |

| sjcx     | xkjs     | yjszj      | jxgg     | zyjs     | kcjs     | jcjs     | jxcg     | xsbg     |
| -------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 实践创新 | 学科竞赛 | 研究生助教 | 教学改革 | 专业建设 | 课程建设 | 教材建设 | 教学成果 | 学术报告 |

</Route>

## 大连工业大学

<Route name="教务处新闻" author="xu42" example="/dpu/jiaowu/news/2" path="/universities/dpu/jiaowu/news/:type?" :paramsDesc="['默认为 `2`']">

| 新闻动态 | 通知公告 | 教务文件 |
| -------- | -------- | -------- |
| 2        | 3        | 4        |

</Route>

<Route name="网络服务新闻" author="xu42" example="/dpu/wlfw/news/2" path="/universities/dpu/wlfw/news/:type?" :paramsDesc="['默认为 `1`']">

| 新闻动态 | 通知公告 |
| -------- | -------- |
| 1        | 2        |

</Route>

## 东南大学

<Route name="信息科学与工程学院学术活动" author="HenryQW" example="/seu/radio/academic" path="/universities/seu/radio/academic"/>

<Route name="研究生招生网通知公告" author="Chingyat" example="/seu/yzb/1" path="/universities/seu/yzb/:type" :paramsDesc="['1 为硕士招生, 2 为博士招生, 3 为港澳台及中外合作办学']"/>

<Route name="东南大学计算机技术与工程学院" author="LogicJake" example="/seu/cse/xyxw" path="/universities/seu/cse/:type?" :paramsDesc="['分类名(默认为xyxw)']"/>

| 学院新闻 | 通知公告 | 教务信息 | 就业信息 | 学工事务 |
| -------- | -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | jwxx     | jyxx     | xgsw     |

## 南京航空航天大学

<Route name="教务通知" author="arcosx" example="/nuaa/jwc/all" path="/universities/nuaa/jwc/:type" :paramsDesc="['分类名']">

| 全部 | 教学服务 | 教学建设 | 学生培养 | 教学资源 |
| ---- | -------- | -------- | -------- | -------- |
| all  | jxfw     | jxjs     | xspy     | jxzy     |

</Route>

<Route name="计算机科学与技术学院" author="LogicJake" example="/nuaa/cs/kydt" path="/universities/nuaa/cs/:type?" :paramsDesc="['分类名']"/>

| 通知公告 | 新闻动态 | 科研动态 | 教学动态 | 学生工作 | 招生信息 | 就业信息 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| tzgg     | xwdt     | kydt     | jxdt     | xsgz     | zsxx     | jyxx     |

<Route name="研究生院" author="junfengP" example="/nuaa/yjsy/latest" path="/universities/nuaa/yjsy/:type?" :paramsDesc="['分类名']"/>

| 最近动态 | 研院新闻 | 上级文件 | 管理文件 | 信息服务 |
| -------- | -------- | -------- | -------- | -------- |
| latest   | yyxw     | sjwj     | glwj     | xxfw     |

## 哈尔滨工业大学

<Route name="哈尔滨工业大学教务处通知公告" author="lty96117" example="/hit/jwc" path="/universities/hit/jwc"/>

<Route name="今日哈工大" author="ranpox" example="/hit/today/10" path="/universities/hit/today/:category" :paramsDesc="['分类编号，`10`为公告公示，`11`为新闻快讯，同时支持详细分类，使用方法见下']"/>

::: tip 提示
今日哈工大的文章分为公告公示和新闻快讯，每个页面右侧列出了更详细的分类，其编号为每个 URL 路径的最后一个数字。
例如会议讲座的路径为`/taxonomy/term/10/25`，则可以通过`/hit/today/25`订阅该详细类别。
:::

::: warning 注意
部分文章需要经过统一身份认证后才能阅读全文。
:::

## 上海科技大学

<Route name="信息科技与技术学院活动" author="HenryQW" example="/shanghaitech/sist/activity" path="/universities/shanghaitech/sist/activity"/>

## 上海交通大学

<Route name="电子信息与电气工程学院学术动态" author="HenryQW" example="/sjtu/seiee/academic" path="/universities/sjtu/seiee/academic"/>

<Route name="电子信息与电气工程学院本科教务办 -- 分专业" author="SkyZH" example="/sjtu/seiee/bjwb/major_select" path="/universities/sjtu/seiee/bjwb/major_select"/>

<Route name="电子信息与电气工程学院本科教务办 -- 转专业" author="SkyZH" example="/sjtu/seiee/bjwb/major_transfer" path="/universities/sjtu/seiee/bjwb/major_transfer"/>

<Route name="电子信息与电气工程学院本科教务办 -- 交换交流" author="SkyZH" example="/sjtu/seiee/bjwb/abroad" path="/universities/sjtu/seiee/bjwb/abroad"/>

<Route name="电子信息与电气工程学院本科教务办 -- 直升研究生" author="SkyZH" example="/sjtu/seiee/bjwb/postgraduate" path="/universities/sjtu/seiee/bjwb/postgraduate"/>

<Route name="电子信息与电气工程学院本科教务办 -- 国际办学" author="SkyZH" example="/sjtu/seiee/bjwb/international" path="/universities/sjtu/seiee/bjwb/international"/>

<Route name="研究生通知公告" author="mzr1996" example="/sjtu/gs/tzgg/pyxx" path="/universities/sjtu/gs/tzgg/:type?" :paramsDesc="['默认列举所有通知公告']">

| 通知公告 | 工作信息 | 招生信息 | 培养信息 | 学位学科 | 国际交流 | 创新工程 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 空       | gzxx     | xwxx1    | pyxx     | xwxx     | gjjl     | cxgc     |

</Route>

<Route name="电子信息与电气工程学院学生工作办公室" author="Polynomia" example="/sjtu/seiee/xsb/news" path="/universities/sjtu/seiee/xsb/:type?" :paramsDesc="['默认列举所有通知公告']">

| 信息通告 | 奖学金      | 助学金       | 讲座活动 | 党团活动 | 新闻发布 |
| -------- | ----------- | ------------ | -------- | -------- | -------- |
| 空       | scholarship | financialAid | lecture  | activity | news     |

</Route>

## 中国科学院

<Route name="上海微系统与信息技术研究所学术活动" author="HenryQW" example="/cas/sim/academic" path="/universities/cas/sim/academic"/>

## 南京邮电大学

<Route name="教务处通知与新闻" author="shaoye" example="/njupt/jwc/notice" path="/universities/njupt/jwc/:type?" :paramsDesc="['默认为 `notice`']">

| 通知公告 | 教务快讯 |
| -------- | -------- |
| notice   | news     |

</Route>

## 南昌航空大学

<Route name="教务处公告与新闻" author="Sg4Dylan" example="/nchu/jwc/notice" path="/universities/nchu/jwc/:type?" :paramsDesc="['默认为 `notice`']">

| 教务公告 | 教务新闻 |
| -------- | -------- |
| notice   | news     |

</Route>

## 哈尔滨工程大学

<Route name="本科生院工作通知" author="XYenon" example="/heu/ugs/news/jwc/jxap" path="/universities/heu/ugs/news/:author?/:category?" :paramsDesc="['发布部门, 默认为 `gztz`', '分类, 默认为 `all`']">

author 列表：

| 教务处 | 实践教学与交流处 | 教育评估处 | 专业建设处 | 国家大学生文化素质基地 | 教师教学发展中心 | 综合办公室 | 工作通知 |
| ------ | ---------------- | ---------- | ---------- | ---------------------- | ---------------- | ---------- | -------- |
| jwc    | sjjxyjlzx        | jypgc      | zyjsc      | gjdxswhszjd            | jsjxfzzx         | zhbgs      | gztz     |

category 列表：

`all` 为全部

教务处：

| 教学安排 | 考试管理 | 学籍管理 | 外语统考 | 成绩管理 |
| -------- | -------- | -------- | -------- | -------- |
| jxap     | ksgl     | xjgl     | wytk     | cjgl     |

实践教学与交流处：

| 实验教学 | 实验室建设 | 校外实习 | 学位论文 | 课程设计 | 创新创业 | 校际交流 |
| -------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| syjx     | sysjs      | xwsx     | xwlw     | kcsj     | cxcy     | xjjl     |

教育评估处：

| 教学研究与教学成果 | 质量监控 |
| ------------------ | -------- |
| jxyjyjxcg          | zljk     |

专业建设处：

| 专业与教材建设 | 陈赓实验班 | 教学名师与优秀主讲教师 | 课程建设 | 双语教学 |
| -------------- | ---------- | ---------------------- | -------- | -------- |
| zyyjcjs        | cgsyb      | jxmsyyxzjjs            | kcjs     | syjx     |

国家大学生文化素质基地：无

教师教学发展中心：

| 教师培训 |
| -------- |
| jspx     |

综合办公室：

| 联系课程 |
| -------- |
| lxkc     |

工作通知：无

</Route>

## 重庆大学

<Route name="教务网通知公告" author="El-Chiang" example="/cqu/jwc/announcement" path="/universities/cqu/jwc/announcement"/>

## 南京信息工程大学

::: tip 提示

路由地址全部按照 **学校官网域名和栏目编号** 设计

使用方法：

以[南信大信息公告栏](https://bulletin.nuist.edu.cn)为例，点开任意一个栏目

获得 URL 中的**分域名**和**栏目编号（可选）**：https://`bulletin`.nuist.edu.cn/`791`/list.htm

将其替换到 RSS 路由地址中即可：

https://rsshub.app/**nuist**/`bulletin` 或 https://rsshub.app/**nuist**/`bulletin`/`791`

:::

<Route name="南信大信息公告栏" author="gylidian" example="/nuist/bulletin/791" path="/universities/nuist/bulletin/:category?" :paramsDesc="['默认为 `791`']">

| 全部 | 文件公告 | 学术报告 | 招标信息 | 会议通知 | 党政事务 | 组织人事 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- |
| 791  | 792      | xsbgw    | 779      | 780      | 781      | 782      |

| 科研信息 | 招生就业 | 教学考试 | 专题讲座 | 校园活动 | 学院动态 | 其他 |
| -------- | -------- | -------- | -------- | -------- | -------- | ---- |
| 783      | 784      | 785      | 786      | 788      | 789      | qt   |

::: warning 注意

全文内容需使用 校园网或[VPN](http://vpn.nuist.edu.cn) 获取

:::

</Route>

<Route name="NUIST CS（南信大计软院）" author="gylidian" example="/nuist/scs/2242" path="/universities/nuist/scs/:category?" :paramsDesc="['默认为 `2242`']">

| 学院新闻 | 学生工作 | 通知公告 | 教务通知 | 科研动态 | 招生就业 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 2242     | 2237     | 2245     | 2246     | 2243     | 2244     |

</Route>

<Route name="南信大本科教学信息网" author="gylidian" example="/nuist/jwc/1" path="/universities/nuist/jwc/:category?" :paramsDesc="['默认为 `1`']">

| 通知公告 | 教学新闻 | 规章制度 | 教学研究 | 教务管理 | 考试中心 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 4        | 5        | 6        | 7        |

| 教材建设 | 实践教学 | 三百工程 | 创新创业 | 规章制度 | 业务办理 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 8        | 9        | 56       | 60       | 62       | 43       |

</Route>

<Route name="南信大研究生院学科建设处" author="gylidian" example="/nuist/yjs/11" path="/universities/nuist/yjs/:category?" :paramsDesc="['默认为 `11`']">

| 招生工作 | 培养工作 | 学位工作 | 学生工作 | 就业工作 | 国际合作 | 文件下载 | 工作动态 | 通知公告 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 3        | 4        | 5        | 6        | 7        | 8        | 9        | 10       | 11       |

</Route>

<Route name="南信大学生工作处" author="gylidian" example="/nuist/xgc" path="/universities/nuist/xgc"/>

<Route name="NUIST ESE（南信大环科院）" author="gylidian" example="/nuist/sese/11" path="/universities/nuist/sese/:category?" :paramsDesc="['默认为 `11`']">

| 通知公告 | 新闻快讯 | 学术动态 | 学生工作 | 研究生教育 | 本科教育 |
| -------- | -------- | -------- | -------- | ---------- | -------- |
| 11       | 10       | 12       | 6        | 4          | 3        |

</Route>

<Route name="NUIST AS（南信大大气科学学院）" author="gylidian" example="/nuist/cas/12" path="/universities/nuist/cas/:category?" :paramsDesc="['默认为 `12`']">

| 信息公告 | 新闻快讯 | 科学研究 | 网上公示 | 本科教育 | 研究生教育 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| 12       | 11       | 3        | 110      | 4        | 5          |

</Route>

<Route name="南京信息工程大学图书馆" author="gylidian" example="/nuist/lib" path="/universities/nuist/library/lib">

::: tip 提示

学校图书馆官网提供了[新书通报](http://lib2.nuist.edu.cn/newbook/newbook_cls_browse.php)的订阅

由于图书馆通知频率过低(故只提供 3 条)，有待将其和 **网络信息中心**、**基建处**、**总务处** 等的通知整合起来

:::

</Route>

## 成都信息工程大学

<Route name="成信新闻网" author="kimika" example="/cuit/cxxww/1" path="/universities/cuit/cxxww/:type?" :paramsDesc="['默认为 `1`']">

| 综合新闻 | 信息公告 | 焦点新闻 | 学术动态 | 工作交流 | 媒体成信 | 更名专题 | 文化活动 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        | 7        | 9        | 10       |

</Route>

## 重庆科技学院

<Route name="教务处公告" author="binarization" example="/cqust/jw/notify" path="/universities/cqust/jw/:type?" :paramsDesc="['可选, 默认为 `notify`']">

| 通知公告 | 教务快讯 |
| -------- | -------- |
| notify   | news     |

</Route>

<Route name="图书馆公告" author="binarization" example="/cqust/lib/news" path="/universities/cqust/lib/:type?" :paramsDesc="['可选, 默认为 `news`']">

| 本馆公告 |
| -------- |
| news     |

</Route>

## 常州大学

<Route name="教务处" author="richardchien" example="/cczu/jwc/1425" path="/universities/cczu/jwc/:category?" :paramsDesc="['可选, 默认为 `all`']">

| 全部 | 通知公告 | 教务新闻 | 各类活动与系列讲座 | 本科教学工程 | 他山之石 | 信息快递 |
| ---- | -------- | -------- | ------------------ | ------------ | -------- | -------- |
| all  | 1425     | 1437     | 1485               | 1487         | 1442     | 1445     |

</Route>

<Route name="新闻网" author="richardchien" example="/cczu/news/6620" path="/universities/cczu/news/:category?" :paramsDesc="['可选, 默认为 `all`']">

| 全部 | 常大要闻 | 校园快讯 | 媒体常大 | 时事热点 | 高教动态 | 网上橱窗 | 新媒常大 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| all  | 6620     | 6621     | 6687     | 6628     | 6629     | 6640     | 6645     |

</Route>

## 南京理工大学

<Route name="南京理工大学教务处" author="MilkShakeYoung" example="/njust/jwc/1" path="/universities/njust/jwc/:type" :paramsDesc="['1 为教师通知, 2 为学生通知, 3 为新闻，4 为学院动态']">

| 教师通知 | 学生通知 | 新闻 | 学院动态 |
| -------- | -------- | ---- | -------- |
| 1        | 2        | 3    | 4        |

</Route>

<Route name="南京理工大学财务处" author="MilkShakeYoung" example="/njust/cwc/1" path="/universities/njust/cwc/:type" :paramsDesc="['1 为新闻及通知, 2 为办事指南']">

| 新闻及通知 | 办事指南 |
| ---------- | -------- |
| 1          | 2        |

</Route>

<Route name="南京理工大学研究生院" author="MilkShakeYoung" example="/njust/gs/1" path="/universities/njust/gs/:type" :paramsDesc="['1 为通知公告, 2 为学术公告']">

| 通知公告 | 学术公告 |
| -------- | -------- |
| 1        | 2        |

</Route>

## 四川旅游学院

<Route name="信息与工程学院动态公告列表" author="talenHuang" example="/sctu/xgxy" path="/universities/sctu/information-engineer-faculty/index">

</Route>

<Route name="信息与工程学院公告详情" author="talenHuang" example="/sctu/xgxy/652" path="/universities/sctu/information-engineer-faculty/context/:id" :paramsDesc="['文章id']">

</Route>

<Route name="教务处" author="talenHuang" example="/sctu/jwc/13" path="/universities/sctu/jwc/index:type?" :paramsDesc="['可选参数, 默认为 `13`']">

| 教务通知 | 信息公告 |
| -------- | -------- |
| 13       | 14       |

</Route>

<Route name="教务处通告详情" author="talenHuang" example="/sctu/jwc/13/645" path="/universities/sctu/jwc/context/:type/:id" :paramsDesc="['通知类型','文章id']">

</Route>

## 电子科技大学

<Route name="教务处" author="achjqz" example="/uestc/jwc/student" path="/universities/uestc/jwc/:type?" :paramsDesc="['默认为 `important`']">

| 重要公告  | 学生事务公告 | 教师事务公告 |
| --------- | ------------ | ------------ |
| important | student      | teacher      |

</Route>

<Route name="新闻中心" author="achjqz" example="/uestc/news/culture" path="/universities/uestc/news/:type?" :paramsDesc="['默认为 `announcement`']">

| 学术    | 文化    | 公告         | 校内通知     |
| ------- | ------- | ------------ | ------------ |
| academy | culture | announcement | notification |

</Route>

## 昆明理工大学

<Route name="教务处" author="geekrainy" example="/kmust/jwc/notify" path="/universities/kmust/jwc/:type?" :paramsDesc="['默认为 `notify`']">

| 教务通知 | 教务新闻 |
| -------- | -------- |
| notify   | news     |

</Route>

<Route name="宣讲会" author="geekrainy" example="/kmust/job/careers/inner" path="/universities/kmust/job/careers/:type?" :paramsDesc="['默认为 `inner`']">

| 校内宣讲会 | 校外宣讲会 |
| ---------- | ---------- |
| inner      | outer      |

</Route>

<Route name="双选会" author="geekrainy" example="/kmust/job/jobfairs" path="/universities/kmust/job/jobfairs" />

## 华中科技大学

<Route name="人工智能和自动化学院通知" author="RayHY" example="/hust/aia/notice/0" path="/universities/hust/aia/notice/:type?" :paramsDesc="['分区 type, 默认为最新通知 可在网页 HTML中找到']">

| 最新 | 行政 | 人事 | 科研 | 讲座 | 本科生 | 研究生 | 学工 |
| ---- | ---- | ---- | ---- | ---- | ------ | ------ | ---- |
| 0    | 1    | 2    | 3    | 4    | 5      | 6      | 7    |

</Route>

<Route name="人工智能和自动化学院新闻" author="RayHY" example="/hust/aia/news" path="/universities/hust/aia/news" />

## 山东大学

<Route name="研究生院学术活动" author="Ji4n1ng" example="/sdu/grad/academic" path="/universities/sdu/grad/academic" />

<Route name="软件学院通知" author="Ji4n1ng" example="/sdu/sc/0" path="/universities/sdu/sc/:type?" :paramsDesc="['默认为 `0`']">

| 学院公告 | 学术报告 | 新闻动态 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |

</Route>

<Route name="材料科学与工程学院通知" author="Ji4n1ng" example="/sdu/cmse/0" path="/universities/sdu/cmse/:type?" :paramsDesc="['默认为 `0`']">

| 通知公告 | 学院新闻 | 本科生教育 | 研究生教育 | 学术动态 |
| -------- | -------- | ---------- | ---------- | -------- |
| 0        | 1        | 2          | 3          | 4        |

</Route>

<Route name="机械工程学院通知" author="Ji4n1ng" example="/sdu/mech/0" path="/universities/sdu/mech/:type?" :paramsDesc="['默认为 `0`']">

| 通知公告 | 院所新闻 | 教学信息 | 学术动态 | 学院简报 |
| -------- | -------- | -------- | -------- | -------- |
| 0        | 1        | 2        | 3        | 4        |

</Route>

<Route name="能源与动力工程学院通知" author="Ji4n1ng" example="/sdu/epe/0" path="/universities/sdu/epe/:type?" :paramsDesc="['默认为 `0`']">

| 学院动态 | 通知公告 | 学术论坛 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |

</Route>

## 大连大学

<Route name="教务处信息" author="SettingDust" example="/dlu/jiaowu/news" path="/universities/dlu/jiaowu/news">
</Route>

## 西安电子科技大学

<Route name="教务处" author="ShadowySpirits" example="/xidian/jwc/xxfb" path="/xidian/jwc/:category?" :paramsDesc="['通知类别,默认为全部']">

::: warning 注意

全文内容需使用校园网或 VPN 获取
:::

| 全部 | 信息发布 | 通知公告 | 教务信息 | 教学研究 | 教学实践 | 招生信息 | 质量监控 |
| :--: | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
| all  |   xxfb   |   tzgg   |   jwxx   |   jxyj   |   jxsj   |   zsxx   |   zljk   |

</Route>

## 东莞理工学院

<Route name="教务处通知" author="AnyMoe" example="/dgut/jwc/" path="/universities/dgut/jwc/:type?" :paramsDesc="['默认为 `2`']">

| 教务公告 | 教学信息 |
| -------- | -------- |
| 1        | 2        |

</Route>

<Route name="学工部动态" author="AnyMoe" example="/dgut/xsc/" path="/universities/dgut/xsc/:type?" :paramsDesc="['默认为 `2`']">

| 学工动态 | 通知公告 | 网上公示 |
| -------- | -------- | -------- |
| 1        | 2        | 4        |

</Route>

## 上海大学

<Route name="上海大学教务处通知公告" author="tuxinghuan" example="/shu/jwc/notice" path="/university/shu/jwc/:type?" :paramsDesc="['消息类型,默认为`notice`']">

| 通知通告 | 新闻 |
| -------- | ---- |
| notice   | news |

</Route>

## 同济大学

 <Route name="同济大学软件学院通知" author="sgqy" example="/tju/sse/xwdt" path="/tju/sse/:type?" :paramsDesc="['通知类型. 默认为 `xwdt`']">

| 本科生通知 | 研究生通知 | 教工通知 | 全体通知 | 学院通知 | 学院新闻 | 学院活动 |
| ---------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| bkstz      | yjstz      | jgtz     | qttz     | xwdt     | xyxw     | xyhd     |

注意: `qttz` 与 `xwdt` 在原网站等价.

 </Route>

## 华南理工大学

<Route name="教务处新闻动态" author="KeNorizon" example="/scut/jwc/1" path="/scut/jwc/:category?" :paramsDesc="['新闻动态分类, 可选, 默认为 `1`']">

| 教务通知 | 交流交换 | 新闻动态 | 媒体关注 | 学院通知 |
| -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        |

</Route>

## 中山大学

<Route name="数据科学与计算机学院动态" author="MegrezZhu" example="/sysu/sdcs" path="/sysu/sdcs" />

## 中国药科大学

<Route name="中国药科大学" author="kba977" example="/cpu/home" path="/cpu/:type" :paramsDesc="['分类, 见下表']">

| 首页 | 教务处 | 研究生院 |
| ---- | ------ | -------- |
| home | jwc    | yjsy     |

</Route>

## 温州商学院

<Route name="温州商学院" author="howel52" example="/wzbc/notice" path="/wzbc/:type" :paramsDesc="['分类, 见下表']">

| 校园新闻 | 媒体商院 | 通知公告 | 人才招聘 | 行事历  | 招标公告 | 学术动态 |
| -------- | -------- | -------- | -------- | ------- | -------- | -------- |
| news     | media    | notice   | jobs     | workday | tender   | activity |

</Route>

## 河南大学

<Route name="河南大学" author="CasterWx" example="/henu/xszl" path="/henu/:type" :paramsDesc="['分类, 见下表']">

| 学生专栏 | 教师专栏 | 新闻公告 | 院部动态 | 高教前沿 |
| -------- | -------- | -------- | -------- | -------- |
| xszl     | jszl     | xwgg     | ybdt     | gjqy     |

</Route>

## 南开大学

<Route name="南开大学教务处" author="zhongweili" example="/nku/jwc/1" path="/universities/nku/jwc/:type" :paramsDesc="['分区 type, 可在网页 URL 中找到']">

| 通知公告 | 新闻动态 |
| -------- | -------- |
| 1        | 2        |

</Route>

## 北京航空航天大学

<Route name="北京航空航天大学" author="AlanDecode" example="/buaa/news/zonghe" path="/buaa/news/:type" :paramsDesc="['新闻版块']">

| 综合新闻 | 信息公告 | 学术文化     | 校园风采 | 科教在线 | 媒体北航 | 专题新闻 | 北航人物 |
| -------- | -------- | ------------ | -------- | -------- | -------- | -------- | -------- |
| zonghe   | gonggao  | xueshuwenhua | fengcai  | kejiao   | meiti    | zhuanti  | renwu    |

</Route>

## 浙江工商大学

<Route name="浙江工商大学" author="nicolaszf" example="/zjgsu/tzgg" path="/zjgsu/:type" :paramsDesc="['分类, 见下表']">

| 通知公告 | 学生专区 | 公示公告 |
| -------- | -------- | -------- |
| tzgg     | xszq     | gsgg     |

</Route>

## 浙江大学

<Route name="浙大研究生院" author="Caicailiushui" example="/zju/grs/1" path="/universities/zju/grs/:type" :paramsDesc="['1 为 全部公告, 2 为教学管理, 3 为各类资助,4 为学科建设, 5 为海外交流']">

| 全部公告 | 教学管理 | 各类资助 | 学科建设 | 海外交流 |
| -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        |

</Route>

<Route name="浙大就业服务平台" author="Caicailiushui" example="/zju/career/1" path="/universities/zju/career/:type" :paramsDesc="['1 为新闻动态, 2 为活动通知, 3 为学院通知, 4 为告示通知 ']">

| 新闻动态 | 活动通知 | 学院通知 | 告示通知 |
| -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        |

</Route>

<Route name="浙大物理系" author="Caicailiushui" example="/zju/physics/1" path="/universities/zju/physics/:type" :paramsDesc="['1 为本系动态, 2 为科研通知, 3 为研究生教育最新消息, 4 为学生思政最新消息, 5 为研究生思政消息公告, 6 为研究生奖助学金, 7 为研究生思政就业信息,8 为本科生思政消息公告,9 为本科生奖助学金, 10 为本科生就业信息, 11 为学术报告']">

| 本系动态 | 科研通知 | 研究生教育最新消息 | 学生思政最新消息 | 研究生思政消息公告 | 研究生奖助学金 | 研究生思政就业信息 | 本科生思政消息公告 | 本科生奖助学金 | 本科生就业信息 | 学术报告 |
| -------- | -------- | ------------------ | ---------------- | ------------------ | -------------- | ------------------ | ------------------ | -------------- | -------------- | -------- |
| 1        | 2        | 3                  | 4                | 5                  | 6              | 7                  | 8                  | 9              | 10             | 11       |

</Route>
