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

## 安徽农业大学

### 计算机学院

<Route author="SimonHu-HN" example="/ahau/cs_news/xxtg" path="/ahau/cs_news/:type" :paramsDesc="['类型名']">

| 信息通告 | 新闻动态 |
| -------- | -------- |
| xxtg     | xwddyn   |

</Route>

### 教务处

<Route author="SimonHu-HN" example="/ahau/jwc/jwyw" path="/ahau/jwc/:type" :paramsDesc="['类型名']">

| 教务要闻 | 通知公告 |
| -------- | -------- |
| jwyw     | tzgg     |

</Route>

### 安农大官网新闻

<Route author="SimonHu-HN" example="/ahau/main/xnyw" path="/ahau/main/:type" :paramsDesc="['类型名']">

| 校内要闻 | 学院动态 |
| -------- | -------- |
| xnyw     | xydt     |

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

<Route author="Ir1d" example="/pku/eecs/0" path="/pku/eecs/:type" :paramsDesc="['分区 type, 可在网页 URL 中找到']">

| 全部 | 学院通知 | 人事通知 | 教务通知 | 学工通知 | 科研通知 | 财务通知 | 工会通知 | 院友通知 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0    | 1        | 2        | 6        | 8        | 7        | 5        | 3        | 4        |

</Route>

### 每周一推 - 中国政治学研究中心

<Route author="vhxubo" example="/pku/rccp/mzyt" path="/pku/rccp/mzyt" />

### 生命科学学院近期讲座

<Route author="TPOB" example="/pku/cls/lecture" path="/pku/cls/lecture" />

### 北大未名 BBS 全站十大

<Route author="wooddance" example="/pku/bbs/hot" path="/pku/bbs/hot">

::: warning 注意

论坛部分帖子正文内容的获取需要用户登录后的 Cookie 值，详情见部署页面的配置模块。

:::

</Route>

## 北京航空航天大学

### 北京航空航天大学

<Route author="AlanDecode" example="/buaa/news/zonghe" path="/buaa/news/:type" :paramsDesc="['新闻版块']">

| 综合新闻 | 信息公告 | 学术文化     | 校园风采 | 科教在线 | 媒体北航 | 专题新闻 | 北航人物 |
| -------- | -------- | ------------ | -------- | -------- | -------- | -------- | -------- |
| zonghe   | gonggao  | xueshuwenhua | fengcai  | kejiao   | meiti    | zhuanti  | renwu    |

</Route>

## 北京交通大学

### 研究生院

<Route author="E1nzbern" example="/bjtu/gs/all" path="/bjtu/gs/:type" :paramsDesc="['文章类别']">

| 所有文章 | 通知公告 | 新闻动态 | 招生宣传 | 培养 | 学位 | 招生 | 硕士招生 | 博士招生 | 招生简章 | 招生政策法规 | 研工部通知公告 | 研工部新闻动态 |
| -------- | -------- | -------- | -------- | ---- | ---- | ---- | -------- | -------- | -------- | ------------ | -------------- | -------------- |
| all      | noti     | news     | zsxc     | py   | xw   | zs   | sszs     | bszs     | zsjz     | zcfg         | ygbtzgg        | ygbnews        |

</Route>

## 北京科技大学天津学院

### 北京科技大学天津学院

<Route author="henbf" example="/ustb/tj/news/all" path="/ustb/tj/news/:type" :paramsDesc="['默认为 `all`']">

| 全部 | 学院新闻 | 学术活动 | 城市建设学院 | 信息工程学院 | 经济学院 | 管理学院 | 材料系 | 机械工程系 | 护理系 | 法律系 | 外语系 | 艺术系 |
| ---- | -------- | -------- | ------------ | ------------ | -------- | -------- | ------ | ---------- | ------ | ------ | ------ | ------ |
| all  | xyxw     | xshhd    | csjsxy       | xxgcxy       | jjx      | glxy     | clx    | jxgcx      | hlx    | flx    | wyx    | ysx    |

</Route>

## 北京理工大学

### 教务处通知

<Route author="sinofp" example="/bit/jwc" path="/bit/jwc" />

### 计院通知

<Route author="sinofp" example="/bit/cs" path="/bit/cs" />

## 北京林业大学

### 绿色新闻网

<Route author="markmingjie" example="/bjfu/news/lsyw" path="/bjfu/news/:type" :paramsDesc="['新闻栏目']">

| 绿色要闻 | 校园动态 | 教学科研 | 党建思政 | 一周排行 |
| -------- | -------- | -------- | -------- | -------- |
| lsyw     | xydt     | jxky     | djsz     | yzph     |

</Route>

### 研究生院培养动态

<Route author="markmingjie" example="/bjfu/grs" path="/bjfu/grs" />

### 科技处通知公告

<Route author="markmingjie" example="/bjfu/kjc" path="/bjfu/kjc" />

### 教务处通知公告

<Route author="markmingjie" example="/bjfu/jwc/jwkx" path="/bjfu/jwc/:type" :paramsDesc="['通知类别']">

| 教务快讯 | 考试信息 | 课程信息 | 教改动态 | 图片新闻 |
| -------- | -------- | -------- | -------- | -------- |
| jwkx     | ksxx     | kcxx     | jgdt     | tpxw     |

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

| 综合 | 信息与通信工程学院 | 电子工程学院 | 计算机学院 | 自动化学院 | 软件学院 | 数字媒体与设计艺术学院 | 网络空间安全学院 | 理学院 | 经济管理学院 | 人文学院 | 马克思主义学院 | 网络技术研究院 | 信息光子学与光通信研究院 |
| ---- | ------------------ | ------------ | ---------- | ---------- | -------- | ---------------------- | ---------------- | ------ | ------------ | -------- | -------------- | -------------- | ------------------------ |
| all  | sice               | see          | scs        | sa         | sse      | sdmda                  | scss             | sci    | sem          | sh       | mtri           | int            | ipoc                     |

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

## 常州大学

### 教务处

<Route author="richardchien" example="/cczu/jwc/1425" path="/cczu/jwc/:category?" :paramsDesc="['可选, 默认为 `all`']">

| 全部 | 通知公告 | 教务新闻 | 各类活动与系列讲座 | 本科教学工程 | 他山之石 | 信息快递 |
| ---- | -------- | -------- | ------------------ | ------------ | -------- | -------- |
| all  | 1425     | 1437     | 1485               | 1487         | 1442     | 1445     |

</Route>

### 新闻网

<Route author="richardchien" example="/cczu/news/6620" path="/cczu/news/:category?" :paramsDesc="['可选, 默认为 `all`']">

| 全部 | 常大要闻 | 校园快讯 | 媒体常大 | 时事热点 | 高教动态 | 网上橱窗 | 新媒常大 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| all  | 6620     | 6621     | 6687     | 6628     | 6629     | 6640     | 6645     |

</Route>

## 成都信息工程大学

### 成信新闻网

<Route author="kimika" example="/cuit/cxxww/1" path="/cuit/cxxww/:type?" :paramsDesc="['默认为 `1`']">

| 综合新闻 | 信息公告 | 焦点新闻 | 学术动态 | 工作交流 | 媒体成信 | 更名专题 | 文化活动 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        | 7        | 9        | 10       |

</Route>

## 重庆大学

### 教务网通知公告

<Route author="El-Chiang" example="/cqu/jwc/announcement" path="/cqu/jwc/announcement"/>

### 新闻网讲座预告

<Route author="nicolaszf" example="/cqu/news/jzyg" path="/cqu/news/jzyg"/>

### 新闻网通知公告简报

<Route author="Hagb" example="/cqu/news/tz" path="/cqu/news/tz"/>

### 校团委

<Route author="Hagb" example="/cqu/youth/gzdt" path="/cqu/youth/:category" :paramsDesc="['分类名']">

| 工作动态 | 院系风采 | 通知公告（可能需内网） | 文件转载 |
| -------- | -------- | ---------------------- | -------- |
| gzdt     | yxfc     | tzgg                   | wjzz     |

</Route>

### 数学与统计学院

<Route author="Hagb" example="/cqu/sci/1053" path="/cqu/sci/:category" :paramsDesc="['分类名']">

| 学院新闻 | 学院公告 | 学院活动 | 学术活动 |
| -------- | -------- | -------- | -------- |
| 1053     | 1054     | 1055     | 1056     |

</Route>

### 信息化办公室

<Route author="Hagb" example="/cqu/net/tzgg" path="/cqu/net/:category" :paramsDesc="['分类名']">

| 通知公告 | 单位动态 | 语言文字 |
| -------- | -------- | -------- |
| tzgg     | dwdt     | yywz     |

</Route>

## 重庆科技学院

### 教务处公告

<Route author="binarization" example="/cqust/jw/notify" path="/cqust/jw/:type?" :paramsDesc="['可选, 默认为 `notify`']">

| 通知公告 | 教务快讯 |
| -------- | -------- |
| notify   | news     |

</Route>

### 图书馆公告

<Route author="binarization" example="/cqust/lib/news" path="/cqust/lib/:type?" :paramsDesc="['可选, 默认为 `news`']">

| 本馆公告 |
| -------- |
| news     |

</Route>

## 重庆理工大学

### 学校通知

<Route author="Colin-XKL" example="/cqut/news" path="/cqut/news" radar="1"/>

### 图书馆通知

<Route author="Colin-XKL" example="/cqut/libnews" path="/cqut/libnews" radar="1"/>

## 重庆文理学院

### 通知公告

<Route author="Fatpandac" example="/cqwu/news/academiceve" path="/cqwu/news/:type?" :paramsDesc="['可选，默认为 academiceve ']" radar="1">

| 通知公告 | 学术活动公告 |
| -------- | ------------ |
| notify   | academiceve  |

</Route>

## 大连大学

### 教务处信息

<Route author="SettingDust" example="/dlu/jiaowu/news" path="/dlu/jiaowu/news">
</Route>

## 大连工业大学

### 教务处新闻

<Route author="xu42" example="/dpu/jiaowu/news/2" path="/dpu/jiaowu/news/:type?" :paramsDesc="['默认为 `2`']">

| 新闻动态 | 通知公告 | 教务文件 |
| -------- | -------- | -------- |
| 2        | 3        | 4        |

</Route>

### 网络服务新闻

<Route author="xu42" example="/dpu/wlfw/news/2" path="/dpu/wlfw/news/:type?" :paramsDesc="['默认为 `1`']">

| 新闻动态 | 通知公告 |
| -------- | -------- |
| 1        | 2        |

</Route>

## 大连海事大学

### 新闻网

<Route author="arjenzhou" example="/dlmu/news/hdyw" path="/dlmu/news/:type" :paramsDesc="['默认为 `hdyw`']">

| 海大要闻 | 媒体海大 | 综合新闻 | 院系风采 | 海大校报 | 理论园地 | 海大讲坛 | 艺文荟萃 |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
|   hdyw   |   mthd   |   zhxw   |   yxfc   |   hdxb   |   llyd   |   hdjt   |   ywhc   |

</Route>

### 研究生院

#### 招生工作

<Route author="nczitzk" example="/dlmu/grs/zsgz/ssyjs" path="/dlmu/grs/zsgz/:type" :paramsDesc="['招生类别']">

| 博士研究生 | 硕士研究生 | 同等学力攻读硕士学位 | 港澳台地区招生 |
| :--------: | :--------: | :------------------: | :------------: |
|    bsyjs   |    ssyjs   |      tdxlgdssxw      |     gatdqzs    |

</Route>

## 大连理工大学

### 教务处

<Route author="beautyyuyanli" example="/dut/teach/zytg" path="/dut/teach/:type" :paramsDesc="['通知类型']">

| 重要通告 | 新闻快递 | 教学文件       | 其他文件    |
| -------- | -------- | -------------- | ----------- |
| zytg     | xwkd     | jiaoxuewenjian | qitawenjian |

</Route>

### 体育场馆中心

<Route author="beautyyuyanli" example="/dut/tycgzx/hdrc" path="/dut/tycgzx/:type" :paramsDesc="['通知类型']">

| 通知公告 | 活动日程 | 新闻动态 |
| -------- | -------- | -------- |
| tzgg     | hdrc     | xwdt     |

</Route>

### 国际处及港澳台办

<Route author="beautyyuyanli" example="/dut/dutdice/xwsd" path="/dut/dutdice/:type" :paramsDesc="['通知类型']">

| 学生通知   | 教师通知 | 新闻速递 |
| ---------- | -------- | -------- |
| xstong_zhi | jstz     | xwsd     |

</Route>

## 电子科技大学

### 教务处

<Route author="achjqz" example="/uestc/jwc/student" path="/uestc/jwc/:type?" :paramsDesc="['默认为 `important`']">

| 重要公告  | 学生事务公告 | 教师事务公告 |
| --------- | ------------ | ------------ |
| important | student      | teacher      |

</Route>

### 新闻中心

<Route author="achjqz" example="/uestc/news/culture" path="/uestc/news/:type?" :paramsDesc="['默认为 `announcement`']">

| 学术    | 文化    | 公告         | 校内通知     |
| ------- | ------- | ------------ | ------------ |
| academy | culture | announcement | notification |

</Route>

### 计算机科学与工程学院

<Route author="talengu" example="/uestc/cs/ztlj*xskb" path="/uestc/cs/:type?" :paramsDesc="['默认为 `ztlj*xskb`']">

| 学院新闻   | 学生科    | 教务科    | 研管科    | 学术看板   |
| ---------- | --------- | --------- | --------- | ---------- |
| xwzx\*xyxw | tzgg\*xsk | tzgg\*jwk | tzgg\*ygk | ztlj\*xskb |

注 1: xwzx\*xyxw 对应 <http://www.scse.uestc.edu.cn/xwzx/xyxw.htm> ;
tzgg\*xsk 对应 <http://www.scse.uestc.edu.cn/tzgg/xsk.htm>

可自定义设置

注 2; 用 + 号来叠加 学生科 + 教务科 `/uestc/cs/ztlj*xskb+tzgg*jwk`

</Route>

### 自动化工程学院

<Route author="talengu" example="/uestc/auto/tzgg1" path="/uestc/news/:type?" :paramsDesc="['默认为 `tzgg1`']">

| 通知公告 | 学术看板 | 焦点新闻 | 综合新闻 |
| -------- | -------- | -------- | -------- |
| tzgg1    | xskb1    | jdxw     | zhxw1    |

注 1: tzgg1 对应 <http://www.auto.uestc.edu.cn/index/tzgg1.htm> ;
xskb1 对应 <http://www.auto.uestc.edu.cn/index/xskb1.htm>

可自定义设置

注 2: 用 + 号来叠加，通知公告 + 学术看板 `/uestc/auto/tzgg1+xskb1`

</Route>

### 文化素质教育中心

<Route author="truobel" example="/uestc/cqe/hdyg" path="/uestc/cqe/:type?" :paramsDesc="['默认为 `hdyg`']">

| 活动预告 | 通知 | 课程通知 | 立人班选拔 |
| -------- | ---- | -------- | ---------- |
| hdyg     | tz   | kctz     | lrxb       |

</Route>

### 研究生院

<Route author="huyyi" example="/uestc/gr" path="/uestc/gr" />

### 信息与通信工程学院

<Route author="huyyi" example="/uestc/sice" path="/uestc/sice" />

### 信息与软件工程学院

<Route author="Yadomin" example="/uestc/is/" path="/uestc/is/:type?" :paramsDesc="['默认为 `latest`']" />

| 最新   | 院办 | 组织 | 学生科 | 教务科 | 研管科 | 实验中心 | 企业技术服务中心 | 新工科中心 | 实习实训办公室 | 招聘 | 实习实训 |
| ------ | ---- | ---- | ------ | ------ | ------ | -------- | ---------------- | ---------- | -------------- | ---- | -------- |
| latest | yb   | zx   | xsk    | jwk    | ygk    | syzx     | qyjsfwzx         | xgkzx      | sxsxbgs        | zp   | sxsx     |

注：可以使用 + 号来叠加，如 学生科 + 教务科 `/uestc/is/xsk+jwc`

## 东北大学

### 东北大学新闻网

<Route author="JeasonLau" example="/neu/news/ddyw" path="/neu/news/:type" :paramsDesc="['种类名']">

| 东大要闻 | 媒体东大 | 通知公告 | 新闻纵横 | 人才培养 | 学术科研 | 英文新闻 | 招生就业 | 考研出国 | 校园文学 | 校友风采 | 时事热点 | 教育前沿 | 文化体育 | 最新科技 |
| -------- | -------- | -------- | -------- | -------: | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| ddyw     | mtdd     | tzgg     | xwzh     |     rcpy | xsky     | 217      | zsjy     | kycg     | xywx     | xyfc     | ssrd     | jyqy     | whty     | zxkj     |

</Route>

## 东莞理工学院

### 教务处通知

<Route author="AnyMoe" example="/dgut/jwc/" path="/dgut/jwc/:type?" :paramsDesc="['默认为 `2`']">

| 教务公告 | 教学信息 |
| -------- | -------- |
| 1        | 2        |

</Route>

### 学工部动态

<Route author="AnyMoe" example="/dgut/xsc/" path="/dgut/xsc/:type?" :paramsDesc="['默认为 `2`']">

| 学工动态 | 通知公告 | 网上公示 |
| -------- | -------- | -------- |
| 1        | 2        | 4        |

</Route>

## 东南大学

### 信息科学与工程学院学术活动

<Route author="HenryQW" example="/seu/radio/academic" path="/seu/radio/academic"/>

### 研究生招生网通知公告

<Route author="Chingyat" example="/seu/yzb/1" path="/seu/yzb/:type" :paramsDesc="['1 为硕士招生, 2 为博士招生, 3 为港澳台及中外合作办学']"/>

### 东南大学计算机技术与工程学院

<Route author="LogicJake" example="/seu/cse/xyxw" path="/seu/cse/:type?" :paramsDesc="['分类名(默认为xyxw)']">

| 学院新闻 | 通知公告 | 教务信息 | 就业信息 | 学工事务 |
| -------- | -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | jwxx     | jyxx     | xgsw     |

</Route>

## 福州大学

### 教务处通知

<Route author="Lao-Liu233" example="/fzu/jxtz" path="/fzu/:type" :paramsDesc="['分类见下表']"/>

| 教学通知 | 专家讲座 |
| -------- | -------- |
| jxtz     | zjjz     |

## 复旦大学继续教育学院

### 成人夜大通知公告

<Route author="mrbruce516" example="/fudan/cce" path="/fudan/cce" />

## 广东工业大学

### 校内新闻网

<Route author="Jiangming1399" example="/gdut/news" path="/gdut/news"/>

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
| -------- | ------------ | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| gdyw     | wmxyjs       | gdxw     | xykx     | xydt     | mtgd     | tzgg     | zbgs     | xshd     |

注 1: 不要吐槽拼音缩写，缩写原本的 URL 构成就这样。

</Route>

## 桂林航天工业学院

### 新闻资讯

<Route author="wyml" example="/guat/news/ghyw" path="/guat/news/:type?" :paramsDesc="['资讯类型，如下表']">

| 桂航要闻 | 院部动态 | 通知公告 | 信息公开 | 桂航大讲堂 |
| -------- | -------- | -------- | -------- | ---------- |
| gdyw     | ybdt     | tzgg     | xxgk     | ghdjt      |

注 1: 不要吐槽拼音缩写，缩写原本的 URL 构成就这样。

</Route>

## 国防科技大学

### 研究生招生信息网

<Route author="nczitzk" example="/nudt/yjszs/16" path="/nudt/yjszs/:id?" :paramsDesc="['分类 id，默认为 `0` 即通知公告']">

| 通知公告 | 招生简章 | 学校政策 | 硕士招生 | 博士招生 | 院所发文 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 0        | 8        | 12       | 16       | 17       | 23       |

</Route>

## 哈尔滨工程大学

### 本科生院工作通知

<Route author="XYenon" example="/heu/ugs/news/jwc/jxap" path="/heu/ugs/news/:author?/:category?" :paramsDesc="['发布部门, 默认为 `gztz`', '分类, 默认为 `all`']">

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

### 研究生院

<Route author="XYenon Derekmini" example="/heu/yjsy/announcement" path="/heu/yjsy/:type?" :paramsDesc="['栏目, 默认为 `announcement`']" radar="1" rssbud="1">

| 通知公告     | 新闻动态 | 国家公派项目 | 国际合作与交流项目 |
| ------------ | -------- | ------------ | ------------------ |
| announcement | news     | gjgp         | gjhz               |

</Route>

### 就业服务平台

<Route author="Derekmini" example="/heu/job/tzgg" path="/heu/job/:type?" :paramsDesc="['栏目, 默认为 `tzgg`']" radar="1" rssbud="1">

| 通知公告 |
| -------- |
| tzgg     |

</Route>

### 工学新闻

<Route author="Derekmini XYenon" example="/heu/news/yw" path="/heu/news/:type?" :paramsDesc="['栏目, 默认为 `yw`']" radar="1" rssbud="1">

| 要闻 | 时讯 |
| ---- | ---- |
| yw   | sx   |

</Route>

### 水声工程学院通知

<Route author="Derekmini" example="/heu/uae/xwdt" path="/heu/uae/:type?" :paramsDesc="['栏目, 默认为 `xwdt`']" radar="1" rssbud="1">

| 新闻动态 | 通知公告 |
| -------- | -------- |
| xwdt     | tzgg     |

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

<Route author="yx1302317313" example="/hitsz/article/id-74" path="/hitsz/article/:category?" :paramsDesc="['分类名，默认为通知公告']" >

| 校区要闻 | 媒体报道 | 通知公告 | 综合新闻 | 校园动态 | 讲座论坛 | 热点专题 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| id-116   | id-80    | id-74    | id-75    | id-77    | id-78    | id-79    |

</Route>

## 哈尔滨工业大学（威海）

### 今日工大 - 通知公告

<Route author="raptazure" example="/hitwh/today" path="hitwh/today" />

## 海南大学

### 硕士研究生招生动态

<Route author="OdinZhang" example="/hainanu/ssszs" path="hainanu/ssszs"/>

## 合肥工业大学

### 通知公告

<Route author="log-e" example="/hfut/tzgg" path="/hfut/tzgg"/>

## 河海大学

### 河海大学图书馆 - 新闻动态

<Route author="plusmultiply0" example="/hhu/libNews" path="/hhu/libNews"/>

### 常州校区图书馆 - 新闻动态

<Route author="plusmultiply0" example="/hhu/libNewsc" path="/hhu/libNewsc"/>

## 河南大学

### 河南大学

<Route author="CasterWx" example="/henu/xszl" path="/henu/:type" :paramsDesc="['分类, 见下表']">

| 学生专栏 | 教师专栏 | 新闻公告 | 院部动态 | 高教前沿 |
| -------- | -------- | -------- | -------- | -------- |
| xszl     | jszl     | xwgg     | ybdt     | gjqy     |

</Route>

## 湖北大学

### 新闻通知

<Route author="cijiugechu" example="/hubu/news/zhxw" path="/universities/hubu/news/:type?" :paramsDesc="['默认为 `zhxw`']">

| 综合新闻 | 湖大要闻 | 通知公告 | 学术学者学生 | 媒体湖大 |
| -------- | -------- | -------- | ------------ | -------- |
| zhxw     | hdyw     | tzgg     | xsxzxs       | mthd     |

</Route>

## 湖北工业大学

### 新闻中心

<Route author="Lava-Swimmer" example="/hbut/news/tzgg" path="/hbut/news/:type" radar="1" rssbud="1" :paramsDesc="['分类']">

| 通知公告 | 湖工要闻 | 学术活动 | 媒体湖工大 | 综合新闻 | 湖工故事 |
| -------- | -------- | -------- | ---------- | -------- | -------- |
| tzgg     | hgyw     | xshd     | mthgd      | zhxw     | hggs     |

</Route>

### 计算机学院

<Route author="Lava-Swimmer" example="/hbut/cs/xwdt" path="/hbut/cs/:type" radar="1" rssbud="1" :paramsDesc="['分类']">

| 新闻动态 | 通知公告 | 教学信息 | 科研动态 | 党建活动 |
| -------- | -------- | -------- | -------- | -------- |
| xwdt     | tzgg     | jxxx     | kydt     | djhd     |

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
| -------- | -------- |
| sszs     | bszs     |

</Route>

## 华北水利水电大学

### 学校通知

<Route author="vuhe" example="/ncwu/notice" path="/ncwu/notice"/>

## 华东理工大学

### 华东理工大学研究生院通知公告

<Route author="sushengmao" example="/ecustyjs" path="/ecustyjs" />

## 华东师范大学

### 华东师范大学研究生院

<Route author="sushengmao" example="/ecnuyjs" path="/ecnuyjs" />

## 华南理工大学

### 研究生院通知公告

<Route author="sushengmao" example="/scutyjs" path="/scutyjs" />

### 教务处通知公告

<Route author="KeNorizon" example="/scut/jwc/notice/all" path="/scut/jwc/notice/:category?" :paramsDesc="['通知分类, 默认为 `all`']">

| 全部 | 选课   | 考试 | 实践     | 交流          | 教师    | 信息 |
| ---- | ------ | ---- | -------- | ------------- | ------- | ---- |
| all  | course | exam | practice | communication | teacher | info |

</Route>

### 教务处新闻动态

<Route author="KeNorizon" example="/scut/jwc/news" path="/scut/jwc/news" />

### 土木与交通学院 - 学工通知

<Route author="railzy" example="/scut/scet/notice" path="/scut/scet/notice" />

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

<Route author="RayHY" example="/hust/aia/notice/0" path="/hust/aia/notice/:type?" :paramsDesc="['分区 type, 默认为最新通知 可在网页 HTML中找到']">

| 最新 | 行政 | 人事 | 科研 | 讲座 | 本科生 | 研究生 | 学工 |
| ---- | ---- | ---- | ---- | ---- | ------ | ------ | ---- |
| 0    | 1    | 2    | 3    | 4    | 5      | 6      | 7    |

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
| -------- | -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | mtgs     | bxjt     | ssfc     |

</Route>

### 科研处

<Route author="nczitzk" example="/jlbtc/kyc" path="/jlbtc/kyc/:category?" :paramDesc="['分类，见下表，默认为通知公告']">

| 通知公告 | 新闻动态 |
| -------- | -------- |
| tzgg     | xwdt     |

</Route>

### 教务处

<Route author="nczitzk" example="/jlbtc/jwc" path="/jlbtc/jwc/:id?" :paramDesc="['分类，见下表，默认为通知公告']">

| 教务新闻 | 通知公告 | 教务工作 | 教师发展工作 | 学籍考务工作 | 教学基本建设 |
| -------- | -------- | -------- | ------------ | ------------ | ------------ |
| 1888     | 1887     | 1947     | 1949         | 2011         | 1948         |

</Route>

## 暨南大学

## 暨南要闻

<Route author="hang333" example="/jnu/yw/tt" path="/jnu/yw/:type?" :paramDesc="['暨南要闻类型，默认为 `yw`']">

| 暨大头条 | 暨南要闻 |
| -------- | -------- |
| tt       | yw       |

</Route>

### 暨南大学校园时讯

<Route author="hang333" example="/jnu/xysx/yxsd" path="/jnu/xysx/:type" :paramDesc="['校园时讯类型']">

| 院系速递 | 部门快讯 |
| -------- | -------- |
| yxsd     | bmkx     |

</Route>

## 江南大学

### 教务处通知

<Route author="Chingyat" example="/ju/jwc/all" path="/ju/jwc/:type?" :paramsDesc="['默认为 `all`']">

| all  | tzgg     | ksap     | wjgg     | tmgz     | djks     | xjgl     | bysj     | syjs     |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 全部 | 通知公告 | 考试安排 | 违纪公告 | 推免工作 | 等级考试 | 学籍管理 | 毕业设计 | 实验教学 |

| sjcx     | xkjs     | yjszj      | jxgg     | zyjs     | kcjs     | jcjs     | jxcg     | xsbg     |
| -------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 实践创新 | 学科竞赛 | 研究生助教 | 教学改革 | 专业建设 | 课程建设 | 教材建设 | 教学成果 | 学术报告 |

</Route>

## 井冈山大学

### 教务处通知

<Route author="butten42" example="/jgsu/jwc" path="/jgsu/jwc" />

## 昆明理工大学

### 教务处

<Route author="geekrainy" example="/kmust/jwc/notify" path="/kmust/jwc/:type?" :paramsDesc="['默认为 `notify`']">

| 教务通知 | 教务新闻 |
| -------- | -------- |
| notify   | news     |

</Route>

### 宣讲会

<Route author="geekrainy" example="/kmust/job/careers/inner" path="/kmust/job/careers/:type?" :paramsDesc="['默认为 `inner`']">

| 校内宣讲会 | 校外宣讲会 |
| ---------- | ---------- |
| inner      | outer      |

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
| -------- | -------- |
| ldyw     | xxgg     |

</Route>
## 洛阳理工学院

### 教务处

<Route author="vhxubo" example="/lit/jwc" path="/lit/jwc" />

### 新闻中心

<Route author="vhxubo" example="/lit/xwzx" path="/lit/xwzx/:name?" :paramsDesc="['默认为 `all`']">

| 全部 | 公告通知 | 新闻快讯 | 学术信息 | 媒体新闻 |
| ---- | -------- | -------- | -------- | -------- |
| all  | ggtz     | xwkx     | xsxx     | mtxw     |

</Route>

### 团委

<Route author="vhxubo" example="/lit/tw" path="/lit/tw/:name?" :paramsDesc="['默认为 `all`']">

| 全部 | 团内通知 | 青年快讯 |
| ---- | -------- | -------- |
| all  | tntz     | qnkx     |

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

| 教务公告 | 教务新闻 |
| -------- | -------- |
| notice   | news     |

</Route>

## 南方科技大学

### 南方科技大学研究生网通知公告

<Route author="sushengmao" example="/sustyjs" path="/sustyjs" />

### 南方科技大学新闻网（中文）

<Route author="sparkcyf" example="/sustech/newshub-zh" path="/sustech/newshub-zh" />

### 南方科技大学采购与招标管理部

<Route author="sparkcyf" example="/sustech/bidding" path="/sustech/bidding" />

## 南京工业大学

### 南京工业大学教务处

<Route author="TrumanGu" example="/njtech/jwc" path="/njtech/jwc" />

## 南京航空航天大学

### 教务通知

<Route author="arcosx Seiry" example="/nuaa/jwc/default" path="/nuaa/jwc/:type" :paramsDesc="['分类名']">

| 教学服务      | 教学建设 | 学生培养 | 教学资源 |
| ------------- | -------- | -------- | -------- |
| jxfw(default) | jxjs     | xspy     | jxzy     |

</Route>

### 计算机科学与技术学院

<Route author="LogicJake Seiry" example="/nuaa/cs/kydt" path="/nuaa/cs/:type?" :paramsDesc="['分类名']"/>

| 通知公告 | 新闻动态 | 科研动态 | 教学动态 | 学生工作 | 招生信息 | 就业信息 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| tzgg     | xwdt     | kydt     | jxdt     | xsgz     | zsxx     | jyxx     |

</Route>

### 研究生院

<Route author="junfengP Seiry" example="/nuaa/yjsy/latest" path="/nuaa/yjsy/:type?" :paramsDesc="['分类名']"/>

| 最近动态 | 研院新闻 | 上级文件 | 管理文件 | 信息服务 |
| -------- | -------- | -------- | -------- | -------- |
| latest   | yyxw     | sjwj     | glwj     | xxfw     |

</Route>

## 南京理工大学

### 南京理工大学教务处

<Route author="MilkShakeYoung" example="/njust/jwc/1" path="/njust/jwc/:type" :paramsDesc="['1 为教师通知, 2 为学生通知, 3 为新闻，4 为学院动态']">

| 教师通知 | 学生通知 | 新闻 | 学院动态 |
| -------- | -------- | ---- | -------- |
| 1        | 2        | 3    | 4        |

</Route>

### 南京理工大学财务处

<Route author="MilkShakeYoung" example="/njust/cwc/1" path="/njust/cwc/:type" :paramsDesc="['1 为新闻及通知, 2 为办事指南']">

| 新闻及通知 | 办事指南 |
| ---------- | -------- |
| 1          | 2        |

</Route>

### 南京理工大学研究生院

<Route author="MilkShakeYoung" example="/njust/gs/1" path="/njust/gs/:type" :paramsDesc="['1 为通知公告, 2 为学术公告']">

| 通知公告 | 学术公告 |
| -------- | -------- |
| 1        | 2        |

</Route>

### 南京理工大学电光学院

<Route author="jasongzy" example="/njust/eo/17/tz" path="/njust/eo/:grade?/:type?" :paramsDesc="['年级默认为 `17`', '类别默认为 `tz`']">

grade 列表：

| 本科 2016 级 | 本科 2017 级 | 本科 2018 级 | 本科 2019 级 |
| ------------ | ------------ | ------------ | ------------ |
| 16           | 17           | 18           | 19           |

type 列表：

| 年级通知（通知公告） | 每日动态（主任寄语） |
| -------------------- | -------------------- |
| tz                   | dt                   |

</Route>

## 南京林业大学

### 教务处

<Route author="kiusiudeng" example="/njfu/jwc/1798" path="/njfu/jwc/:category?" :paramsDesc="['省略则默认为tzgg']">

| 校级发文 | 通知公告 | 上级发文 | 下载专区 |
| -------- | -------- | -------- | -------- |
| xjfw     | tzgg     | sjfw     | xzzq     |

</Route>

## 南京信息工程大学

::: tip 提示

路由地址全部按照 **学校官网域名和栏目编号** 设计

使用方法：

以[南信大信息公告栏](https://bulletin.nuist.edu.cn)为例，点开任意一个栏目

获得 URL 中的**分域名**和**栏目编号（可选）**：https&#x3A;//`bulletin`.nuist.edu.cn/`791`/list.htm

将其替换到 RSS 路由地址中即可：

<https://rsshub.app/**nuist**/`bulletin`> 或 <https://rsshub.app/**nuist**/`bulletin`/`791`>

:::

### 南信大信息公告栏

<Route author="gylidian" example="/nuist/bulletin/791" path="/nuist/bulletin/:category?" :paramsDesc="['默认为 `791`']">

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

### NUIST CS（南信大计软院）

<Route author="gylidian" example="/nuist/scs/2242" path="/nuist/scs/:category?" :paramsDesc="['默认为 `2242`']">

| 学院新闻 | 学生工作 | 通知公告 | 教务通知 | 科研动态 | 招生就业 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 2242     | 2237     | 2245     | 2246     | 2243     | 2244     |

</Route>

### 南信大本科教学信息网

<Route author="gylidian" example="/nuist/jwc/1" path="/nuist/jwc/:category?" :paramsDesc="['默认为 `1`']">

| 通知公告 | 教学新闻 | 规章制度 | 教学研究 | 教务管理 | 考试中心 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 4        | 5        | 6        | 7        |

| 教材建设 | 实践教学 | 三百工程 | 创新创业 | 规章制度 | 业务办理 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 8        | 9        | 56       | 60       | 62       | 43       |

</Route>

### 南信大研究生院学科建设处

<Route author="gylidian" example="/nuist/yjs/11" path="/nuist/yjs/:category?" :paramsDesc="['默认为 `11`']">

| 招生工作 | 培养工作 | 学位工作 | 学生工作 | 就业工作 | 国际合作 | 文件下载 | 工作动态 | 通知公告 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 3        | 4        | 5        | 6        | 7        | 8        | 9        | 10       | 11       |

</Route>

### 南信大学生工作处

<Route author="gylidian" example="/nuist/xgc" path="/nuist/xgc"/>

### NUIST ESE（南信大环科院）

<Route author="gylidian" example="/nuist/sese/11" path="/nuist/sese/:category?" :paramsDesc="['默认为 `11`']">

| 通知公告 | 新闻快讯 | 学术动态 | 学生工作 | 研究生教育 | 本科教育 |
| -------- | -------- | -------- | -------- | ---------- | -------- |
| 11       | 10       | 12       | 6        | 4          | 3        |

</Route>

### NUIST AS（南信大大气科学学院）

<Route author="gylidian" example="/nuist/cas/12" path="/nuist/cas/:category?" :paramsDesc="['默认为 `12`']">

| 信息公告 | 新闻快讯 | 科学研究 | 网上公示 | 本科教育 | 研究生教育 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| 12       | 11       | 3        | 110      | 4        | 5          |

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

| 通知公告 | 教务快讯 |
| -------- | -------- |
| notice   | news     |

</Route>

## 南开大学

### 南开大学教务处

<Route author="zhongweili" example="/nku/jwc/1" path="/nku/jwc/:type" :paramsDesc="['分区 type, 可在网页 URL 中找到']">

| 通知公告 | 新闻动态 |
| -------- | -------- |
| 1        | 2        |

</Route>

## 清华大学

### 清华大学校内信息发布平台

<Route author="prnake" example="/thu/zhongyao" path="/thu/:type" :paramsDesc="['默认为重要公告']">

| 重要公告 | 教务公告 | 科研通知 | 办公通知 | 海报列表 | 疫情防控 |
| -------- | -------- | -------- | -------- | -------- | :------: |
| zhongyao | jiaowu   | keyan    | bangong  | haibao   |  yiqing  |

</Route>

### 清华大学招聘信息

<Route author="Halcao" example="/thu/career" path="/thu/career" />

## 山东大学

### 软件学院通知

<Route author="Ji4n1ng" example="/sdu/sc/0" path="/sdu/sc/:type?" :paramsDesc="['默认为 `0`']">

| 通知公告 | 学术动态 | 本科教育 | 研究生教育 |
| -------- | -------- | -------- | ---------- |
| 0        | 1        | 2        | 3          |

</Route>

### 材料科学与工程学院通知

<Route author="Ji4n1ng" example="/sdu/cmse/0" path="/sdu/cmse/:type?" :paramsDesc="['默认为 `0`']">

| 通知公告 | 学院新闻 | 本科生教育 | 研究生教育 | 学术动态 |
| -------- | -------- | ---------- | ---------- | -------- |
| 0        | 1        | 2          | 3          | 4        |

</Route>

### 机械工程学院通知

<Route author="Ji4n1ng" example="/sdu/mech/0" path="/sdu/mech/:type?" :paramsDesc="['默认为 `0`']">

| 通知公告 | 院所新闻 | 教学信息 | 学术动态 | 学院简报 |
| -------- | -------- | -------- | -------- | -------- |
| 0        | 1        | 2        | 3        | 4        |

</Route>

### 能源与动力工程学院通知

<Route author="Ji4n1ng" example="/sdu/epe/0" path="/sdu/epe/:type?" :paramsDesc="['默认为 `0`']">

| 学院动态 | 通知公告 | 学术论坛 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |

</Route>

### 计算机科学与技术学院通知

<Route author="suxb201" example="/sdu/cs/0" path="/sdu/cs/:type?" :paramsDesc="['默认为 `0`']">

| 学院公告 | 学术报告 | 新闻动态 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |

</Route>

## 上海大学

### 上海大学官网信息

<Route author="lonelyion" example="/shu/news" path="/shu/:type?" :paramsDesc="['消息类型,默认为`news`']">

| 综合新闻 | 科研动态 | 通知公告 |
| -------- | -------- | -------- |
| news     | research | notice   |

</Route>

### 上海大学教务处通知公告

<Route author="tuxinghuan" example="/shu/jwc/notice" path="/shu/jwc/:type?" :paramsDesc="['消息类型,默认为`notice`']">

| 通知通告 | 新闻 |
| -------- | ---- |
| notice   | news |

</Route>

## 上海电力大学

### 新闻网与学院通知

<Route author="小熊软糖" example="/shiep/news" path="/shiep/:type" :paramsDesc="['类型名称']">

| 新闻网 | 能源与机械工程学院 | 环境与化学工程学院 | 电气工程学院 | 自动化工程学院 | 计算机科学与技术学院 | 电子与信息学院 | 经济与管理学院 | 数理学院 | 外国语学院 | 国际交流学院 | 继续教育学院 | 马克思主义学院 | 体育部 | 艺术教育中心 |
| ------ | ------------------ | ------------------ | ------------ | -------------- | -------------------- | -------------- | -------------- | -------- | ---------- | ------------ | ------------ | -------------- | ------ | ------------ |
| news   | energy             | hhxy               | dqxy         | zdhxy          | jsjxy                | dxxy           | jgxy           | slxy     | wgyxy      | gjxy         | jjxy         | skb            | tyb    | yjzx         |

</Route>

## 上海海事大学

### 官网信息

<Route author="simonsmh" example="/shmtu/www/events" path="/shmtu/www/:type" :paramsDesc="['events 为学术讲座, notes 为通知公告']"/>

### 教务信息

<Route author="simonsmh" example="/shmtu/jwc/jiaowugonggao" path="/shmtu/jwc/:type" :paramsDesc="['jiaowuxinwen 为教务新闻, jiaowugonggao 为教务公告']"/>

## 上海海洋大学

### 官网信息

<Route author="Swung0x48" example="/shou/www/tzgg" path="/shou/www/:type" :paramsDesc="['消息类型']">

| 通知公告 | 招标信息 | 要闻 | 媒体聚焦 | 学术讲座 | 科技前沿 |
| -------- | -------- | ---- | -------- | -------- | -------- |
| tzgg     | zbxx     | yw   | mtjj     | xsjz     | xsqy     |

</Route>

## 上海交通大学

### 电子信息与电气工程学院学术动态

<Route author="HenryQW" example="/sjtu/seiee/academic" path="/sjtu/seiee/academic"/>

### 电子信息与电气工程学院本科教务办

<Route author="Polynomia" example="/sjtu/seiee/bjwb/major_select" path="/sjtu/seiee/bjwb/:type" :paramsDesc="['无默认选项']">

| 分专业       | 转专业         | 直升研究生   | 交换交流 | 国际办学      |
| ------------ | -------------- | ------------ | -------- | ------------- |
| major_select | major_transfer | postgraduate | abroad   | international |

</Route>

### 研究生通知公告

<Route author="mzr1996" example="/sjtu/gs/tzgg/pyxx" path="/sjtu/gs/tzgg/:type?" :paramsDesc="['默认列举所有通知公告']">

| 通知公告 | 工作信息 | 招生信息 | 培养信息 | 学位学科 | 国际交流 | 创新工程 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 空       | gzxx     | xwxx1    | pyxx     | xwxx     | gjjl     | cxgc     |

</Route>

### 电子信息与电气工程学院学生工作办公室

<Route author="Polynomia xxchan" example="/sjtu/seiee/xsb/news" path="/sjtu/seiee/xsb/:type?" :paramsDesc="['默认列举所有通知公告']">

| 信息通告 | 奖学金      | 助学金       | 讲座活动 | 党团活动 | 新闻发布 | 本科生综合测评 |
| -------- | ----------- | ------------ | -------- | -------- | -------- | -------------- |
| 空       | scholarship | financialAid | lecture  | activity | news     | zhcp           |

</Route>

### 教务处通知公告（全文输出）

<Route author="SeanChao" example="/sjtu/jwc/students" path="/sjtu/jwc/:type?" :paramsDesc="['默认为 students ']">

| 面向学生的通知 | 新闻中心 | 通知通告 | 教学运行  | 注册学务 | 研究办 | 教改办 | 综合办 | 工会与支部 |
| -------------- | -------- | -------- | --------- | -------- | ------ | ------ | ------ | ---------- |
| students       | news     | notice   | operation | affairs  | yjb    | jgb    | zhb    | party      |

</Route>

### 同去网最新活动

<Route author="SeanChao" example="/sjtu/tongqu/lecture" path="/sjtu/tongqu/:type?" :paramsDesc="['类型，默认为全部']">

| 全部 | 最新   | 招新        | 讲座    | 户外      | 招聘 | 游学       | 比赛         | 公益           | 主题党日 | 学生事务       | 广告 | 其他   |
| ---- | ------ | ----------- | ------- | --------- | ---- | ---------- | ------------ | -------------- | -------- | -------------- | ---- | ------ |
| all  | newest | recruitment | lecture | outdoords | jobs | studyTours | competitions | publicWarefare | partyDay | studentAffairs | ads  | others |

</Route>

### 研究生招生网招考信息

<Route author="richardchien" example="/sjtu/yzb/zkxx/sszs" path="/sjtu/yzb/zkxx/:type" :paramsDesc="['无默认选项']">

| 博士招生 | 硕士招生 | 港澳台招生 | 考点信息 | 院系动态 |
| -------- | -------- | ---------- | -------- | -------- |
| bszs     | sszs     | gatzs      | kdxx     | yxdt     |

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

#### 深圳大学研究生招生网通知公告

<Route author="sushengmao" example="/szuyjs" path="/szuyjs" />

### 深圳大学研究生招生网

<Route author="NagaruZ" example="/szu/yz/1" path="/szu/yz/:type?" :paramsDesc="['默认为1']" >

| 研究生 | 博士生 |
| ------ | ------ |
| 1      | 2      |

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

<Route author="talenHuang" example="/sctu/jwc/13" path="/sctu/jwc/index:type?" :paramsDesc="['可选参数, 默认为 `13`']">

| 教务通知 | 信息公告 |
| -------- | -------- |
| 13       | 14       |

</Route>

### 教务处通告详情

<Route author="talenHuang" example="/sctu/jwc/13/645" path="/sctu/jwc/context/:type/:id" :paramsDesc="['通知类型','文章id']"/>

## 四川职业技术学院

### 学院公告

<Route author="nczitzk" example="/scvtc/xygg" path="/scvtc/xygg" />

## 太原师范学院

<Route author="2PoL" example="/tynu" path="/tynu" />

## 天津大学

### 天津大学教务处

<Route author="AmosChenYQ" example="/tjpyu/ooa/news" path="/tjpyu/ooa/:type" :paramsDesc="['默认为`news`']">

| 新闻动态 | 通知公告     |
| -------- | ------------ |
| news     | notification |

</Route>

## 同济大学

### 同济大学研究生院通知公告

<Route author="sushengmao" example="/tjuyjs" path="/tjuyjs" />

### 同济大学软件学院通知

<Route author="sgqy" example="/tju/sse/xwdt" path="/tju/sse/:type?" :paramsDesc="['通知类型. 默认为 `xwdt`']">

| 本科生通知 | 研究生通知 | 教工通知 | 全体通知 | 学院通知 | 学院新闻 | 学院活动 |
| ---------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| bkstz      | yjstz      | jgtz     | qttz     | xwdt     | xyxw     | xyhd     |

注意: `qttz` 与 `xwdt` 在原网站等价.

 </Route>

## 温州商学院

### 温州商学院

<Route author="howel52" example="/wzbc/notice" path="/wzbc/:type" :paramsDesc="['分类, 见下表']">

| 校园新闻 | 媒体商院 | 通知公告 | 人才招聘 | 行事历  | 招标公告 | 学术动态 |
| -------- | -------- | -------- | -------- | ------- | -------- | -------- |
| news     | media    | notice   | jobs     | workday | tender   | activity |

</Route>

## 武昌首义学院

### 新闻中心

<Route author="Derekmini" example="/wsyu/news/xxyw" path="/wsyu/news/:type?" :paramsDesc="['分类, 默认为 `xxyw`']">

| 学校要闻 | 综合新闻 | 媒体聚焦 |
| -------- | -------- | -------- |
| xxyw     | zhxw     | mtjj     |

</Route>

## 武汉大学

### 计算机学院公告

<Route author="SweetDumpling" example="/whu/cs/2" path="/whu/cs/:type"
:paramsDesc="['公告类型, 详见表格']">

| 公告类型 | 新闻动态 | 学术讲座 | 学院通知 | 公示公告 |
| -------- | -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        | 3        |

</Route>

### 武汉大学新闻网

<Route author="SChen1024" example="/whu/news/wdyw" path="/whu/news/:type?" :paramsDesc="['分类, 默认为 `wdyw`, 具体参数见下表']">

注意：除了 `kydt` 代表学术动态，其余页面均是拼音首字母小写.

| **内容** | **参数** |
| :------: | :------: |
| 武大要闻 |   wdyw   |
| 媒体武大 |   mtwd   |
| 专题报道 |   ztbd   |
| 珞珈人物 |   ljrw   |
| 国际交流 |   gjjl   |
| 缤纷校园 |   bfxy   |
| 校友之声 |   xyzs   |
| 珞珈论坛 |   ljlt   |
| 新闻热线 |   xwrx   |
| 头条新闻 |   ttxw   |
| 综合新闻 |   zhxw   |
| 珞珈影像 |   ljyx   |
| 学术动态 |   kydt   |
| 珞珈副刊 |   ljfk   |
| 校史钩沉 |   xsgc   |
| 来稿选登 |   lgxd   |

</Route>

## 武汉纺织大学

### 信息门户公告

<Route author="Loyio" example="/wtu/2" path="/wtu/:type"
:paramsDesc="['公告类型, 详见表格']">

| 公告类型 | 通知公告 | 教务信息 | 科研动态 |
| -------- | -------- | -------- | -------- |
| 参数     | 1        | 2        | 3        |

</Route>

## 西安电子科技大学

### 教务处

<Route author="ShadowySpirits" example="/xidian/jwc/xxfb" path="/xidian/jwc/:category?" :paramsDesc="['通知类别,默认为全部']">

::: warning 注意

全文内容需使用校园网或 VPN 获取
:::

| 全部 | 教学信息 | 教学研究 | 实践教学 | 质量监控 | 通知公告 |
| :--: | :------: | :------: | :------: | :------: | :------: |
|  all |   jxxx   |   jxyj   |   sjjx   |   zljk   |   tzgg   |

</Route>

## 西安交通大学

### 教务处

<Route author="hoilc" example="/xjtu/dean/jxxx/xytz/ksap" path="/xjtu/dean/:subpath+" :paramsDesc="['栏目路径, 支持多级, 不包括末尾的`.htm`']" >

::: tip 提示

支持`http://dean.xjtu.edu.cn/`下所有**有文章列表**的栏目，

例如`http://dean.xjtu.edu.cn/gzlc.htm`, 则`subpath`为`gzlc`

又例`http://dean.xjtu.edu.cn/jxxx/xytz.htm`, 则`subpath`为`jxxx/xytz`

:::

</Route>

### 国际处通知

<Route author="guitaoliu" example="/xjtu/international/hzjl" path="/xjtu/international/:subpath+" :paramsDesc="['栏目路径, 支持多级, 不包括末尾的`.htm`']" />

### 研究生院通知公告

<Route author="nczitzk" example="/xjtu/gs/tzgg" path="/xjtu/gs/tzgg" />

### 就业创业中心

<Route author="DylanXie123" example="/xjtu/job/xdsgwy" path="/xjtu/job/:subpath?" :paramsDesc="['栏目类型，默认请求`zxtg`，详见下方表格']"  />

栏目类型

| 中心通告 | 选调生及公务员 | 国际组织实习 | 新闻资讯 | 活动与讲座 |
| -------- | -------------- | ------------ | -------- | ---------- |
| zxtg     | xdsgwy         | gjzzsx       | xwzx     | hdyjz      |

## 西北工业大学

### 翱翔门户

<Route author="WhoIsSure" example="/nwpu/10000" path="/nwpu/:column" :paramsDesc="['栏目ID']">

栏目 ID

| 咨询中心 | 通知公告 | 校内新闻 | 校务公开 | 历史文件查询 | 教育教学 | 学术交流 | 学院动态 | 部门动态 |
| -------- | -------- | -------- | -------- | ------------ | -------- | -------- | -------- | -------- |
| 10000    | 10001    | 10002    | 10003    | 10004        | 10005    | 10006    | 10007    | 10008    |

</Route>

## 西南财经大学

### 经济信息工程学院

<Route author="Hivol" example="/swufe/seie/tzgg" path="/swufe/seie/:type?" :paramsDesc="['分类名(默认为tzgg)']" >

| 学院新闻 | 通知公告 |
| -------- | -------- |
| xyxw     | tzgg     |

</Route>

## 西南交通大学

### 交通运输与物流学院

<Route author="zoenglinghou" example="/swjtu/tl/news" path="/swjtu/tl/news"/>

## 西南科技大学

### 教务处新闻

<Route author="lengthmin" example="/swust/jwc/news" path="/swust/jwc/news"/>

### 教务处通知

<Route author="lengthmin" example="/swust/jwc/notice/1" path="/swust/jwc/notice/:type?" :paramsDesc="['分区 type,缺省为 1, 详见下方表格']">

| 创新创业教育 | 学生学业 | 建设与改革 | 教学质量保障 | 教学运行 | 教师教学 |
| ------------ | -------- | ---------- | ------------ | -------- | -------- |
| 1            | 2        | 3          | 4            | 5        | 6        |

</Route>

### 计科学院通知

<Route author="lengthmin" example="/swust/cs/1" path="/swust/cs/:type?" :paramsDesc="['分区 type, 缺省为 1, 详见下方表格']">

| 新闻动态 | 学术动态 | 通知公告 | 教研动态 |
| -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        |

</Route>

## 信阳师范学院

### 高等教育自学考试办公室

<Route author="VxRain" example="/xynu/zkb/zkzx" path="/xynu/zkb/:category" :paramsDesc="['分类ID']">

分类 ID（如果请求的分类 ID 在不存在下表中，默认请求`zkzx`）

| 主考专业 | 规章制度 | 实践课程 | 毕业论文 | 学士学位 | 自考毕业 | 自考教材 | 自考指南 | 联系我们 | 自考资讯 | 报名指南 | 日程安排 | 新生入门 | 转考免考 | 复习资料 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| zkzy     | gzzd     | sjkc     | bylw     | xsxw     | zkby     | zkjc     | zkzn     | lxwm     | zkzx     | bmzn     | rcap     | xsrm     | zkmk     | fxzl     |

</Route>

## 扬州大学

### 官网消息

<Route author="LogicJake" example="/yzu/home/xxyw" path="/yzu/home/:type" :paramsDesc="['分类名']">

| 学校要闻 | 校园新闻 | 信息公告 | 学术活动 | 媒体扬大 |
| -------- | -------- | -------- | -------- | -------- |
| xxyw     | xyxw     | xxgg     | xshd     | mtyd     |

</Route>

### 研究生招生

<Route author="LogicJake" example="/yzu/yjszs/tzgg" path="/yzu/yjszs/:type" :paramsDesc="['分类名']">

| 通知公告 | 博士招生 | 硕士招生 |
| -------- | -------- | -------- |
| tzgg     | bszs     | sszs     |

</Route>

## 云南大学

### 官网消息通告

<Route author="hzcheney" example="/ynu/home" path="/ynu/home" >
</Route>

### 教务处主要通知

<Route author="hzcheney" example="/ynu/jwc/1" path="/ynu/jwc/:category" :paramsDesc="['教务处通知分类']">

| 教务科 | 学籍科 | 教学研究科 | 实践科学科 |
| ------ | ------ | ---------- | ---------- |
| 1      | 2      | 3          | 4          |

</Route>

### 研究生院重要通知（置顶消息）

<Route author="hzcheney" example="/ynu/grs/zytz" path="/ynu/grs/zytz" >
</Route>

### 研究生院其他通知

<Route author="hzcheney" example="/ynu/grs/qttz/2" path="/ynu/grs/qttz/:category" :paramsDesc="['研究生院通知分类']">

| 招生工作 | 研究生培养 | 质量管理 | 学位工作 | 综合办公室 | 相关下载 |
| -------- | ---------- | -------- | -------- | ---------- | -------- |
| 1        | 2          | 3        | 4        | 5          | 6        |

</Route>

## 浙江大学

### 普通栏目 如学术 / 图片 / 新闻等

<Route author="Jeason0228" example="/zju/list/xs" path="/zju/list/:type" :paramsDesc="['xs为学术,xw为新闻,5461是图片新闻,578是浙大报道,具体参数参考左侧的菜单']"/>

### 浙大研究生院

<Route author="Caicailiushui" example="/zju/grs/1" path="/zju/grs/:type" :paramsDesc="['1 为 全部公告, 2 为教学管理, 3 为各类资助,4 为学科建设, 5 为海外交流']">

| 全部公告 | 教学管理 | 各类资助 | 学科建设 | 海外交流 |
| -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        |

</Route>

### 浙大就业服务平台

<Route author="Caicailiushui" example="/zju/career/1" path="/zju/career/:type" :paramsDesc="['1 为新闻动态, 2 为活动通知, 3 为学院通知, 4 为告示通知 ']">

| 新闻动态 | 活动通知 | 学院通知 | 告示通知 |
| -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        |

</Route>

### 浙大物理系

<Route author="Caicailiushui" example="/zju/physics/1" path="/zju/physics/:type" :paramsDesc="['1 为本系动态, 2 为科研通知, 3 为研究生教育最新消息, 4 为学生思政最新消息, 5 为研究生思政消息公告, 6 为研究生奖助学金, 7 为研究生思政就业信息,8 为本科生思政消息公告,9 为本科生奖助学金, 10 为本科生就业信息, 11 为学术报告']">

| 本系动态 | 科研通知 | 研究生教育最新消息 | 学生思政最新消息 | 研究生思政消息公告 | 研究生奖助学金 | 研究生思政就业信息 | 本科生思政消息公告 | 本科生奖助学金 | 本科生就业信息 | 学术报告 |
| -------- | -------- | ------------------ | ---------------- | ------------------ | -------------- | ------------------ | ------------------ | -------------- | -------------- | -------- |
| 1        | 2        | 3                  | 4                | 5                  | 6              | 7                  | 8                  | 9              | 10             | 11       |

</Route>

### 浙大软件学院

<Route author="yonvenne zwithz" example="/zju/cst/0" path="/zju/cst/:type" :paramsDesc="['分类, 见下表']" radar="1" rssbud="1">

| 全部通知 | 招生信息 | 教务管理 | 论文管理 | 思政工作 | 评奖评优 | 实习就业 | 国际实习 | 国内合作科研 | 国际合作科研 | 校园服务 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ------------ | ------------ | -------- |
| 0        | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8            | 9            | 10       |

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

| 0                  | 1                    |
| ------------------ | -------------------- |
| 文章地址为正常地址 | 获取的是 webvpn 地址 |

</Route>

## 浙江工商大学

### 浙江工商大学

<Route author="nicolaszf" example="/zjgsu/tzgg" path="/zjgsu/:type" :paramsDesc="['分类, 见下表']">

| 通知公告 | 学生专区 | 公示公告 |
| -------- | -------- | -------- |
| tzgg     | xszq     | gsgg     |

</Route>

## 浙江工业大学

### 浙江工业大学

<Route author="junbaor" example="/zjut/1" path="/zjut/:type" :paramsDesc="['板块id']">

| 公告栏 | 每周会议 | 屏峰班车 | 新闻速递 | 学术动态 |
| ------ | -------- | -------- | -------- | -------- |
| 1      | 2        | 3        | 10       | 25       |

</Route>

### 设计与建筑学院

<Route author="yikZero" example="/zjut/design/16" path="/zjut/design/:type" :paramsDesc="['板块id']">

| 学院新闻 | 公告通知 | 学术交流 |
| -------- | -------- | -------- |
| 16       | 18       | 20       |

</Route>

## 郑州大学

### 郑州大学新闻网

<Route author="niayyy-S" example="/zzu/news/zh" path="zzu/news/:type?"  :paramsDesc="['可选, 默认为 `zh`']">

| 参数名称 | 综合新闻 | 学术动态 | 媒体郑大 | 院系风采 | 教学科研 | 学生信息 | 外事信息 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 参数     | zh       | xs       | mt       | yx       | ky       | stu      | ws       |

</Route>

### 软件学院

<Route author="niayyy-S" example="/zzu/soft/news/xyxw" path="zzu/soft/news/:type?"  :paramsDesc="['可选, 默认为 `xyxw`']">

| 参数名称 | 学院新闻 | 学院公告 | 学生工作 |
| -------- | -------- | -------- | -------- |
| 参数     | xyxw     | xygg     | xsgz     |

</Route>

## 郑州轻工业大学

### 智慧门户

<Route author="Fantasia1999" example="/zzuli/campus/0" path="/zzuli/campus/:type" :paramsDesc="['分类, 见下表']" radar="1" rssbud="1">

| 参数名称 | 公告信息 | 学工信息 | 教学信息 | 信息快递 | 学术报告 | 科研信息 | 网络公告 | 班车查询 | 周会表 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ------ |
| 参数     | 0        | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8      |

</Route>

### 研究生处

<Route author="Fantasia1999" example="/zzuli/yjsc/0" path="/zzuli/yjsc/:type" :paramsDesc="['分类, 见下表']" radar="1" rssbud="1">

| 参数名称 | 公告通知 | 招生工作 | 新闻资讯 | 培养工作 | 学位工作 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        | 3        | 4        |

</Route>

## 中北大学

### 各种新闻通知

<Route author="Dreace" example="/nuc/zbxw" path="/nuc/:type?" :paramsDesc="['默认为 zbxw']">

| 中北新闻 | 通知公告 | 学术活动 | 教务通知 |
| -------- | -------- | -------- | -------- |
| zbxw     | tzgg     | xshd     | jwtz     |

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
| ---- | -------- | -------- | -------- | -------- | ---------- | ---------- | -------- |
| 0    | 1        | 2        | 3        | 4        | 5          | 6          | 7        |

## 中国海洋大学

### 信息科学与工程学院

<Route author="Geo" example="/ouc/it/0" path="/ouc/it/:type?" :paramsDesc="['默认为 `0`']">

| 学院要闻 | 学院公告 | 学院活动 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |

</Route>

### 中国海洋大学研究生院

<Route author="sushengmao" example="/outyjs" path="/outyjs" />

### 中国海洋大学信电学院通知公告

<Route author="sushengmao" example="/outele" path="/outele" />

## 中国科学技术大学

### 官网通知公告

<Route author="hang333" example="/ustc/news/gl" path="/ustc/news/:type?" :paramsDesc="['可选，默认为 gl']">

| 教学类 | 科研类 | 管理类 | 服务类 |
| ------ | ------ | ------ | ------ |
| jx     | ky     | gl     | fw     |

</Route>

### 教务处通知新闻

<Route author="hang333" example="/ustc/jwc/info" path="/ustc/jwc/:type?" :paramsDesc="['可选，默认显示所有种类']">

| 信息 | 教学     | 考试 | 交流     |
| ---- | -------- | ---- | -------- |
| info | teaching | exam | exchange |

</Route>

### 中国科学技术大学就业信息网

<Route author="nczitzk" example="/ustc/job" path="/ustc/job/:category?" :paramsDesc="['分类，见下表，默认为招聘公告']">

| 专场招聘会  | 校园双选会   | 空中宣讲  | 招聘公告 |
| ----------- | ------------ | --------- | -------- |
| RecruitList | Doublechoice | Broadcast | joblist2 |

</Route>

## 中国科学院

### 成果转化

<Route author="nczitzk" example="/cas/cg/cgzhld" path="/cas/cg/:caty?" :paramsDesc="['分类，见下表，默认为工作动态']">

| 工作动态 | 科技成果转移转化亮点工作 |
| -------- | ------------------------ |
| zh       | cgzhld                   |

</Route>

### 上海微系统与信息技术研究所学术活动

<Route author="HenryQW" example="/cas/sim/academic" path="/cas/sim/academic"/>

### 中国科学院信息工程研究所 第二研究室 处理架构组 知识库

<Route author="renzhexigua" example="/cas/mesalab/kb" path="/cas/mesalab/kb"/>

### 中国科学院电工研究所 科研动态

<Route author="nczitzk" example="/cas/iee/kydt" path="/cas/iee/kydt"/>

## 中国农业大学

### 中国农业大学研招网通知公告

<Route author="sushengmao" example="/cauyjs" path="/cauyjs" />

#### 中国农业大学信电学院

<Route author="sushengmao" example="/cauele" path="/cauele" />

## 中国石油大学（华东）

### 中国石油大学研究生院通知公告

<Route author="sushengmao" example="/upcyjs" path="/upcyjs" />

### 主页

<Route author="Veagau" example="/upc/main" path="/upc/main/:type" :paramsDesc="['分类, 见下表']">

| 通知公告 | 学术动态 |
| -------- | -------- |
| notice   | scholar  |

</Route>

### 计算机科学与技术学院

<Route author="Veagau" example="/upc/jsj" path="/upc/jsj/:type" :paramsDesc="['分类, 见下表']">

| 学院新闻 | 学术关注 | 学工动态 | 通知公告 |
| -------- | -------- | -------- | -------- |
| news     | scholar  | states   | notice   |

</Route>

## 中国药科大学

### 中国药科大学

<Route author="kba977" example="/cpu/home" path="/cpu/:type" :paramsDesc="['分类, 见下表']">

| 首页 | 教务处 | 研究生院 |
| ---- | ------ | -------- |
| home | jwc    | yjsy     |

</Route>

## 中科院

### 中科院自动化所

<Route author="sushengmao" example="/zkyyjs" path="/zkyyjs" />

### 中科院人工智能所

<Route author="sushengmao" example="/zkyai" path="/zkyai" />

## 中南大学

### 招聘信息

<Route author="csuhan" example="/csu/job" path="/csu/job/:type?" :paramsDesc="['招聘类型']">

| 招聘类型 | 本部招聘 | 湘雅招聘 | 铁道招聘 | 在线招聘 | 事业招考 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 参数     | 1        | 2        | 3        | 4        | 5        |

</Route>

## 中山大学

### 数据科学与计算机学院动态

<Route author="Neutrino3316 MegrezZhu" example="/sysu/sdcs" path="/sysu/sdcs" />
