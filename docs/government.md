---
pageClass: routes
---

# 政务消息

## 联合国

### 安理会否决了决议

<Route author="HenryQW" example="/un/scveto" path="/un/scveto"/>

## 中国政府

### 最新政策

<Route author="SettingDust" example="/gov/zhengce/zuixin" path="/gov/zhengce/zuixin"/>

### 最新文件

<Route author="ciaranchen" example="/gov/zhengce/wenjian" path="/gov/zhengce/wenjian/:pcodeJiguan?" :paramsDesc="['文种分类。 国令; 国发; 国函; 国发明电; 国办发; 国办函; 国办发明电; 其他']" />

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

### 南京市人民政府

<Route author="ocleo1" example="/gov/city/nanjing/news" path="/gov/city/nanjing/:category" :paramsDesc="['分类名']">

| 南京信息 |  部门动态  | 各区动态 |  民生信息  |
| :------: | :--------: | :------: | :--------: |
|   news   | department | district | livelihood |

</Route>

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

## 中华人民共和国生态环境部

### 公示

<Route author="billyct" example="/gov/mee/gs" path="/gov/mee/gs"/>
