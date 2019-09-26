---
pageClass: routes
---

# 学习

## 谷歌学术

### 谷歌学术关键词更新

<Route author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" :paramsDesc="['查询语句, 支持「简单」和「高级」两种模式:']" anticrawler="1">

1. 简单模式, 例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2. 高级模式, 前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn&as_sdt=0,5), 点击左上角, 选择高级搜索并提交查询. 此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数. 例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

</Route>

### 谷歌学术作者引用更新

<Route author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" anticrawler="1">

路由中的参数 id，即用户谷歌学术引用页面 url 中的 id，如 https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ 中 user= 后的 mlmE4JMAAAAJ。

</Route>

## 扇贝

### 用户打卡

<Route author="DIYgod" example="/shanbay/checkin/ddwej" path="/shanbay/checkin/:id" :paramsDesc="['用户 id']" />

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

## 语雀

### 知识库

<Route author="aha2mao" example="/yuque/doc/75258" path="/yuque/doc/:repo_id" :paramsDesc="['仓库id，可在对应知识库主页的`/api/books/${repo_id}/docs`请求里找到']">

| Node.js 专栏 | 阮一峰每周分享 | 语雀使用手册 |
| ------------ | -------------- | ------------ |
| 75258        | 102804         | 75257        |

</Route>

## 中国大学 MOOC(慕课)

### 最新

<Route author="xyqfer" example="/icourse163/newest" path="/icourse163/newest" />
