---
pageClass: routes
---

# 小说·文学·阅读

## All Poetry

### Poems

<Route author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['排序方式, `best` 或 `newest`, 缺省 `best`']"/>

## Nautilus

### 话题

<Route author="emdoe" example=“/nautilus/topic/Art” path="/nautilus/topic/:tid" :paramsDesc=“[‘话题 id, 可在页面上方 TOPICS 栏目处找到']"/>

## UU 看书

### 小说更新

<Route author="jacky2001114" example="/novel/uukanshu/49621>" path="/novel/uukanshu/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 爱思想

### 栏目

<Route author="HenryQW" example="/aisixiang/column/722" path="/aisixiang/column/:id" :paramsDesc="['栏目 ID, 可在对应栏目 URL 中找到']"/>

### 排行榜

<Route author="HenryQW" example="/aisixiang/ranking/1/7" path="/aisixiang/ranking/:type?/:range?" :paramsDesc="['排行榜类型', '排行榜范围, 仅适用于点击排行榜, 可选日(1)，周(7)，月(30)']">

| 文章点击排行 | 最近更新文章 | 文章推荐排行 |
| ------------ | ------------ | ------------ |
| 1            | 10           | 11           |

</Route>

## 笔趣阁

### 小说更新

<Route author="jjeejj" example="/novel/biquge/52_52542" path="/novel/biquge/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']">

::: tip 提示

由于笔趣阁网站有多个, 各站点小说对应的小说 id 不同. 此 feed 只对应在[`www.biquge5200.com`](https://www.biquge5200.com/)中的小说 id.

:::

</Route>

## 刺猬猫

### 章节

<Route author="Netrvin" example="/ciweimao/chapter/100045750" path="/ciweimao/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 观止（每日一文）

### 观止

<Route author="Andiedie" example="/guanzhi" path="/guanzhi"/>

## 快眼看书

### 小说更新

<Route author="squkw" example="/novel/booksky/98619" path="/novel/booksky/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到, 例如 `98619`']">

举例网址：http://booksky.so/BookDetail.aspx?Level=1&bid=98619

</Route>

## 起点

### 章节

<Route author="Chingyat" example="/qidian/chapter/1010400217" path="/qidian/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 讨论区

<Route author="Chingyat" example="/qidian/forum/1010400217" path="/qidian/forum/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 限时免费

<Route author="LogicJake" example="/qidian/free" path="/qidian/free/:type?" :paramsDesc="['默认不填为起点中文网，填 mm 为起点女生网']"/>

### 限时免费下期预告

<Route author="LogicJake" example="/qidian/free-next" path="/qidian/free-next/:type?" :paramsDesc="['默认不填为起点中文网，填 mm 为起点女生网']"/>

## 青空文庫

### 青空文庫新着リスト

<Route author="sgqy" example="/aozora/newbook/10" path="/aozora/newbook/:count?" :paramsDesc="['更新数量. 设置每次下载列表大小. 范围是 1 到 50.']">

书籍网站每日一更. 信息更新时间为书籍最初出版时间, 排序可能不符合网络发表时间, 请认准未读消息.

</Route>

## 轻小说文库

### 章节

<Route author="zsakvo" example="/wenku8/chapter/74" path="/wenku8/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 文学迷

### 小说更新

<Route author="lengthmin" example="/novel/wenxuemi/6/6144" path="/novel/wenxuemi/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `6`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `6144`']">

举例网址：https://www.wenxuemi.com/files/article/html/6/6144/

</Route>

## 纵横

### 章节

<Route author="georeth" example="/zongheng/chapter/672340" path="/zongheng/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 左岸读书

### 主页

<Route author="kt286" example="/zreading" path="/zreading" />
