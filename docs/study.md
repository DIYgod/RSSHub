---
pageClass: routes
---

# 学习

## gradCafe

### gradCafe result

<Route author="liecn" example="/gradcafe/result" path="/gradcafe/result" />

### gradCafe result by key words

<Route author="liecn" example="/gradcafe/result/computer" path="/gradcafe/result/:type" :paramsDesc="['按关键词进行搜索，如 computer']"/>

## X-MOL 平台

### 新闻

<Route author="cssxsh" example="/x-mol/news/3" path="/x-mol/news/:tag?" :paramsDesc="['数字编号，可从新闻列表URL得到。为空时从新闻主页获取新闻。']" />

## 领研

### 论文

<Route author="yech1990" example="/linkresearcher/category=theses&subject=生物" path="/linkresearcher/theses/:param" :paramsDesc="['参数，如 subject=生物']"/>

| `:param` | 举例            | 定义                                 |
| -------- | --------------- | ------------------------------------ |
| category | category=thesis | **必填**，theses/information/careers |
| subject  | subject=生物    | 可置空                               |
| columns  | columns=健康    | 可置空                               |
| query    | query=病毒      | 可置空                               |

## 码农周刊

### issues

<Route author="tonghs" example="/manong-weekly" path="/manong-weekly" />

## 扇贝

### 用户打卡

<Route author="DIYgod" example="/shanbay/checkin/ddwej" path="/shanbay/checkin/:id" :paramsDesc="['用户 id']" />

### 精选文章

<Route author="qiwihui" example="/shanbay/footprints" path="/shanbay/footprints/:category?" :paramsDesc="['分类 id']">

| 用户故事 | 地道表达法 | 实用口语 | 语法教室 | 读新闻学英语 | 单词鸡汤 | 扇贝理念 | 英语知识 | 原汁英文 |
| -------- | ---------- | -------- | -------- | ------------ | -------- | -------- | -------- | -------- |
| 1        | 31         | 46       | 34       | 40           | 43       | 16       | 7        | 10       |

| 学习方法 | 影视剧讲义 | 产品更新 | 精读文章 | 他山之石 | Quora 翻译 | TED 推荐 | 大耳狐小课堂 | 互动话题 |
| -------- | ---------- | -------- | -------- | -------- | ---------- | -------- | ------------ | -------- |
| 13       | 22         | 28       | 4        | 19       | 25         | 37       | 49           | 52       |

</Route>

## 网易公开课

### 精品课程

<Route author="hoilc" example="/open163/vip" path="/open163/vip" radar="1" />

### 最新课程

<Route author="hoilc" example="/open163/latest" path="/open163/latest" radar="1" />

## 下厨房

### 用户作品

<Route author="xyqfer" example="/xiachufang/user/cooked/103309404" path="/xiachufang/user/cooked/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 用户菜谱

<Route author="xyqfer" example="/xiachufang/user/created/103309404" path="/xiachufang/user/created/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 作品动态

<Route author="xyqfer" example="/xiachufang/popular/hot" path="/xiachufang/popular/:timeframe?" :paramsDesc="['默认最新上传']">

| 正在流行 | 24 小时最佳 | 本周最受欢迎 | 新秀菜谱 | 月度最佳   |
| -------- | ----------- | ------------ | -------- | ---------- |
| hot      | pop         | week         | rising   | monthhonor |

</Route>

## 学堂在线

### 课程信息

<Route author="sanmmm" example="/xuetangx/course/course-v1:TsinghuaX+20240103X+2019_T1/status" path="/xuetangx/course/:cid/:type" :paramsDesc="['课程id, 从课程页URL中可得到', '课程信息类型']">

课程信息类型

| 课程开始时间 | 课程结束时间 | 课程进度 |
| ------------ | ------------ | -------- |
| start        | end          | status   |

</Route>

### 课程列表

<Route author="sanmmm" example="/xuetangx/course/list/0/1/0" path="/xuetangx/course/list/:mode/:status/:credential/:type?" :paramsDesc="['课程模式', '课程状态', '课程认证类型', '学科分类 默认为`全部`']">

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

| 全部 | 计算机 | 经管·会计 | 创业 | 电子 | 工程 | 环境·地球 | 医学·健康 | 生命科学 | 数学 | 物理 | 化学 | 社科·法律 | 文学 | 历史 | 哲学 | 艺术·设计 | 外语 | 教育 | 其他 | 大学先修课 | 公共管理 | 建筑 | 职场 | 全球胜任力 |
| ---- | ------ | --------- | ---- | ---- | ---- | --------- | --------- | -------- | ---- | ---- | ---- | --------- | ---- | ---- | ---- | --------- | ---- | ---- | ---- | ---------- | -------- | ---- | ---- | ---------- |
| -1   | 117    | 118       | 119  | 120  | 121  | 122       | 123       | 124      | 125  | 126  | 127  | 128       | 129  | 130  | 131  | 132       | 133  | 134  | 135  | 201        | 2550     | 2783 | 2952 | 6200       |

</Route>

## 英中协会

### 奖学金

<Route author="HenryQW" example="/gbcc/trust" path="/gbcc/trust" />

## 语雀

### 知识库

<Route author="aha2mao" example="/yuque/doc/75258" path="/yuque/doc/:repo_id" :paramsDesc="['仓库id，可在对应知识库主页的`/api/books/${repo_id}/docs`请求里找到']">

| Node.js 专栏 | 阮一峰每周分享 | 语雀使用手册 |
| ------------ | -------------- | ------------ |
| 75258        | 102804         | 75257        |

</Route>

## 知識分子

### 新聞

<Route author="yech1990" example="/zhishifenzi/news/ai" path="/zhishifenzi/news/:type" :paramsDesc="['类别，如 ai']"/>

| `:type`   | 类别名称 |
| --------- | -------- |
| biology   | 生物     |
| medicine  | 医药     |
| ai        | 人工智能 |
| physics   | 物理     |
| chymistry | 化学     |
| astronomy | 天文     |
| others    | 其他     |

> 参数置空（`/zhishifenzi/news`）获取所有类别

### 深度

<Route author="yech1990" example="/zhishifenzi/depth" path="/zhishifenzi/depth" />

### 创新

<Route author="yech1990" example="/zhishifenzi/innovation/company" path="/zhishifenzi/innovation/:type" :paramsDesc="['类别，如 company']"/>

| `:type`       | 类别名称 |
| ------------- | -------- |
| ~~multiple~~  | ~~综合~~ |
| company       | 公司     |
| product       | 产品     |
| technology    | 技术     |
| ~~character~~ | ~~人物~~ |
| policy        | 政策     |

> 参数置空（`/zhishifenzi/innovation`）获取所有类别

## 中国大学 MOOC(慕课)

### 最新

<Route author="xyqfer" example="/icourse163/newest" path="/icourse163/newest" />
