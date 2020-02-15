---
pageClass: routes
---

# 设计

## Dribbble

### 流行

<Route author="DIYgod" example="/dribbble/popular/week" path="/dribbble/popular/:timeframe?" :paramsDesc="['时间维度, 支持 week month year ever']"/>

### 用户（团队）

<Route author="DIYgod" example="/dribbble/user/google" path="/dribbble/user/:name" :paramsDesc="['用户名, 可在该用户主页 URL 中找到']"/>

### 关键词

<Route author="DIYgod" example="/dribbble/keyword/player" path="/dribbble/keyword/:keyword" :paramsDesc="['想要订阅的关键词']"/>

## Inside Design

### Recent Stories

<Route author="miaoyafeng" example="/invisionapp/inside-design" path="/invisionapp/inside-design">
</Route>

## UI 中国

### 推荐文章

<Route author="WenryXu" example="/ui-cn/article" path="/ui-cn/article"/>

### 个人作品

<Route author="WenryXu" example="/ui-cn/user/85974" path="/ui-cn/user/:id" :paramsDesc="['用户id']"/>

## 站酷

### 推荐

<Route author="junbaor" example="/zcool/recommend/all" path="/zcool/recommend/:type" :paramsDesc="['推荐类型,详见下面的表格']">

推荐类型

| all      | home     | edit     |
| -------- | -------- | -------- |
| 全部推荐 | 首页推荐 | 编辑推荐 |

</Route>

### 作品总榜单

<Route author="junbaor" example="/zcool/top" path="/zcool/top"/>

### 用户作品

<Route author="junbaor" example="/zcool/user/baiyong" path="/zcool/user/:uid" :paramsDesc="['个性域名前缀或者用户ID']">

例如:

站酷的个人主页 `https://baiyong.zcool.com.cn` 对应 rss 路径 `/zcool/user/baiyong`

站酷的个人主页 `https://www.zcool.com.cn/u/568339` 对应 rss 路径 `/zcool/user/568339`

</Route>
