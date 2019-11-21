---
pageClass: routes
---

# 政务消息

## 联合国

### 安理会否决了决议

<Route author="HenryQW" example="/un/scveto" path="/un/scveto"/>

## 中国工业和信息化部

### 政策解读

<Route author="Yoge-Code" example="/gov/miit/zcjd" path="/gov/miit/zcjd"/>

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

## 中国政府

### 最新政策

<Route author="SettingDust" example="/gov/zhengce/zuixin" path="/gov/zhengce/zuixin"/>

### 最新文件

<Route author="ciaranchen" example="/gov/zhengce/wenjian" path="/gov/zhengce/wenjian/:pcodeJiguan?" :paramsDesc="['文种分类。 国令; 国发; 国函; 国发明电; 国办发; 国办函; 国办发明电; 其他']" />

### 信息稿件

<Route author="ciaranchen" example="/gov/zhengce/govall/orpro=555&notpro=2&search_field=title" path="/gov/zhengce/govall/:advance?" :paramsDesc="['高级搜索选项，将作为请求参数直接添加到url后。目前已知的选项及其意义如下。' ]" >

|              选项               |                       意义                       |              备注              |
| :-----------------------------: | :----------------------------------------------: | :----------------------------: |
|              orpro              |             包含以下任意一个关键词。             |          用空格分隔。          |
|             allpro              |                包含以下全部关键词                |                                |
|             notpro              |                 不包含以下关键词                 |                                |
|              inpro              |                完整不拆分的关键词                |                                |
|           searchfield           | title: 搜索词在标题中; content: 搜索词在正文中。 |  默认为空，即网页的任意位置。  |
| pubmintimeYear, pubmintimeMonth |                    从某年某月                    | 单独使用月份参数无法只筛选月份 |
| pubmaxtimeYear, pubmaxtimeMonth |                    到某年某月                    | 单独使用月份参数无法只筛选月份 |
|              colid              |                       栏目                       |      比较复杂，不建议使用      |

</Route>

### 政府新闻

<Route author="EsuRt" example="/gov/news/:uid" path="/gov/news" :paramsDesc="['分类名']">

| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 |
| :------: | :------: | :------: | :--------: |
|    bm    |    gd    |    yw    |    gwy     |

</Route>

### 吹风会

<Route author="EsuRt" example="/gov/statecouncil/briefing" path="/gov/statecouncil/briefing"/>

### 河北省退役军人事务厅

<Route author="SunShinenny" example="/gov/veterans/hebei/sxxx" path="/gov/veterans/hebei/:type" :paramsDesc="['分类名']">

| 省内信息 | 厅内信息 | 市县信息 |
| :------: | :------: | :------: |
|   ywgz   |   tnxx   |   sxxx   |

</Route>

### 湖南省政府采购网-公告

<Route author="Jeason0228" example="/gov/hunan/notice/all" path="/gov/hunan/notice/:type"  :paramsDesc="['all=全部，cg=采购公告,zb=中标公告,fb=废标公告,ht=合同公告,gz=更正公告,zz=终止公告,qt=其他公告']" />

### 江苏省人民政府

<Route author="ocleo1" example="/gov/province/jiangsu/important-news" path="/gov/province/jiangsu/:category" :paramsDesc="['分类名']">

|  省政府常务会议   |    要闻关注    |  部门资讯  |  市县动态   |       政策解读        |
| :---------------: | :------------: | :--------: | :---------: | :-------------------: |
| executive-meeting | important-news | department | city-county | policy-interpretation |

| 政府信息公开年度报告 |   政府信息公开制度    | 省政府及办公厅文件 |     规范性文件     |
| :------------------: | :-------------------: | :----------------: | :----------------: |
|    annual-report     | information-publicity |   documentation    | normative-document |

|          立法意见征集          |      意见征集      |
| :----------------------------: | :----------------: |
| legislative-opinion-collection | opinion-collection |

</Route>

### 山西省人民政府

#### 山西省人社厅

<Route author="wolfyu1991" example="/gov/shanxi/rst/rsks-tzgg" path="/gov/shanxi/rst/:category" :paramsDesc="['分类名']">

| 通知公告  | 公务员考试 | 事业单位考试 | 专业技术人员资格考试 | 其他考试  |
| :-------: | :--------: | :----------: | :------------------: | :-------: |
| rsks-tzgg | rsks-gwyks | rsks-sydwks  |   rsks-zyjsryzgks    | rsks-qtks |

</Route>

### 南京市人民政府

<Route author="ocleo1" example="/gov/city/nanjing/news" path="/gov/city/nanjing/:category" :paramsDesc="['分类名']">

| 南京信息 |  部门动态  | 各区动态 |  民生信息  |
| :------: | :--------: | :------: | :--------: |
|   news   | department | district | livelihood |

</Route>

### 苏州市人民政府

#### 政府新闻

<Route author="EsuRt" example="/gov/suzhou/news/:uid" path="/gov/suzhou/news" :paramsDesc="['分类名']">

| 政务要闻 | 区县快讯 |
| :------: | :------: |
|   news   | district |

</Route>

#### 政府信息公开文件

<Route author="EsuRt" example="/gov/suzhou/doc" path="/gov/suzhou/doc"/>

## 中国证券监督管理委员会

### 发审委公告

<Route author="chinobing" example="/csrc/fashenwei" path="/csrc/fashenwei"/>

### 证监会消息

<Route author="chinobing LogicJake" example="/csrc/news/zjhxwfb-xwfbh" path="/csrc/news/:suffix?" :paramsDesc="['支持形如`http://www.csrc.gov.cn/pub/newsite/*/*`的网站，将 newsite 后面的两段网址后缀以 - 连接']" />

### 申请事项进度

<Route author="hillerliao" example="/csrc/auditstatus/:apply_id" path="/csrc/auditstatus" :paramsDesc="['事项类别id， `https://neris.csrc.gov.cn/alappl/home/xkDetail` 列表中各地址的 appMatrCde 参数']"/>

## 中国驻外使领馆

### 大使馆重要通知

<Route author="HenryQW" example="/embassy/us" path="/embassy/:country" :paramsDesc="['国家短代码, 见[支持国家列表](#支持国家列表)', '城市, 对应国家列表下的`领事馆城市列表`']" />

### 领事馆重要通知

<Route author="HenryQW" example="/embassy/us/chicago" path="/embassy/:country/:city" :paramsDesc="['国家短代码, 见[支持国家列表](#支持国家列表)', '城市, 对应国家列表下的`领事馆城市列表`']" />

### 支持国家列表

#### 德国 `DE`

-   大使馆: `/embassy/de`

-   领事馆城市列表:

| 城市   | 路由                 |
| ------ | -------------------- |
| 慕尼黑 | `/embassy/de/munich` |

---

#### 法国 `FR`

-   大使馆: `/embassy/fr`

-   领事馆城市列表:

| 城市       | 路由                     |
| ---------- | ------------------------ |
| 马赛       | `/embassy/fr/marseille`  |
| 斯特拉斯堡 | `/embassy/fr/strasbourg` |
| 里昂       | `/embassy/fr/lyon`       |

---

#### 日本 `JP`

-   大使馆: `/embassy/jp`

-   领事馆城市列表:

| 城市   | 路由                   |
| ------ | ---------------------- |
| 长崎   | `/embassy/jp/nagasaki` |
| 大阪   | `/embassy/jp/osaka`    |
| 福冈   | `/embassy/jp/fukuoka`  |
| 名古屋 | `/embassy/jp/nagoya`   |
| 札幌   | `/embassy/jp/sapporo`  |
| 新潟   | `/embassy/jp/niigata`  |

---

#### 韩国 `KR`

-   大使馆: `/embassy/kr`

-   领事馆城市列表:

| 城市 | 路由                  |
| ---- | --------------------- |
| 釜山 | `/embassy/kr/busan`   |
| 济州 | `/embassy/kr/jeju`    |
| 光州 | `/embassy/kr/gwangju` |

---

#### 新加坡 `SG`

-   大使馆: `/embassy/sg`

---

#### 美国 `US`

-   大使馆: `/embassy/us`

-   领事馆城市列表:

| 城市   | 路由                       |
| ------ | -------------------------- |
| 纽约   | `/embassy/us/newyork`      |
| 芝加哥 | `/embassy/us/chicago`      |
| 旧金山 | `/embassy/us/sanfrancisco` |

---

#### 英国 `UK`

-   大使馆: `/embassy/uk`

-   领事馆城市列表:

| 城市       | 路由                     |
| ---------- | ------------------------ |
| 爱丁堡     | `/embassy/uk/edinburgh`  |
| 贝尔法斯特 | `/embassy/uk/belfast`    |
| 曼彻斯特   | `/embassy/uk/manchester` |

## 中华人民共和国海关总署

### 拍卖信息/海关法规

<Route author="Jeason0228" example="/gov/customs/list/paimai" path="/gov/customs/list/:gchannel"  :paramsDesc="['支持paimai,fagui等2个频道']" />

## 中华人民共和国商务部

### 政务公开

<Route author="LogicJake" example="/mofcom/article/b" path="/mofcom/article/:suffix" :paramsDesc="['支持形如`http://www.mofcom.gov.cn/article/*`的网站，传入 article 之后的后缀']" />

## 中华人民共和国生态环境部

### 公示

<Route author="billyct" example="/gov/mee/gs" path="/gov/mee/gs"/>

## 中华人民共和国退役军人事务部

### 中华人民共和国退役军人事务部

<Route author="SunShinenny" example="/gov/veterans/bnxx" path="/gov/veterans/:type" :paramsDesc="['分类名']">

| 部内信息 | 政策解读 | 首页信息 |
| :------: | :------: | :------: |
|   bnxx   |   zcjd   |  index   |

</Route>

## 中华人民共和国外交部

### 发言人表态

<Route author="nicolaszf" example="/gov/fmprc/fyrbt" path="/gov/fmprc/fyrbt"/>

## 中央纪委国家监委

### 审查调查

<Route author="LogicJake" example="/ccdi/scdc" path="/ccdi/scdc"/>
