---
pageClass: routes
---

# 小说·文学·阅读

## All Poetry

### Poems

<Route author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['排序方式, `best` 或 `newest`, 缺省 `best`']"/>

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

## 爱下电子书

### 最新章节

<Route author="JeasonLau" example="/axdzs/191/191976" path="/axdzs/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到', '小说网站链接最后的数字, 可在对应小说页 URL 中找到']"  />

## 笔趣阁

### 小说更新

<Route author="jjeejj" example="/novel/biquge/52_52542" path="/novel/biquge/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']" anticrawler="1">

::: tip 提示

由于笔趣阁网站有多个, 各站点小说对应的小说 id 不同. 此 feed 只对应在[`www.biquge5200.com`](https://www.biquge5200.com/)中的小说 id.

:::

</Route>

## 吹牛部落

### 栏目

<Route author="LogicJake" example="/chuiniu/column/0b1c4cf6e7f24e8da11e37882de73704" path="/chuiniu/column/:id" :paramsDesc="['栏目 id, 可在对应栏目页 URL 中找到']">

::: warning 注意

正文内容需要用户登录后的 x-member 值，详情见部署页面的配置模块。若无相关配置或 x-member 失效，则只显示文章摘要。
:::
</Route>

## 刺猬猫

### 章节

<Route author="Netrvin" example="/ciweimao/chapter/100045750" path="/ciweimao/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 单向空间

### 单读

<Route author="KeNorizon" example="/owspace/read/0" path="/owspace/read/:type?" :paramsDesc="['栏目分类，不填则默认为首页']">

| 首页 | 文字 | 影像 | 声音 | 单向历 | 谈论 |
| ---- | ---- | ---- | ---- | ------ | ---- |
| 0    | 1    | 2    | 3    | 4      | 6    |

</Route>

## 稻草人书屋

### 章节更新

<Route author="JeasonLau" example="/dcrsw/zhongjidouluo/2" path="/dcrsw/:name/:count?" :paramsDesc="['小说名，可在对应小说页URL中找到', '显示的章节数，缺省为`3`']">

::: warning 注意

count 的取值范围为 1-12，为防止请求次数过多，推荐设置为 5 以下。
:::

</Route>

## 飞地

### 分类

<Route author="LogicJake" example="/enclavebooks/category/1" path="/enclavebooks/category/:id" :paramsDesc="['类别 id，可在[分类api](https://app.enclavebooks.cn/v2/discovery)返回数据中的category查看']"/>

### 用户创作

<Route author="junbaor" example="/enclavebooks/user/103702" path="/enclavebooks/user/:uid" :paramsDesc="['用户ID, 自行抓包寻找']"/>

### 用户收藏

<Route author="junbaor" example="/enclavebooks/collection/103702" path="/enclavebooks/collection/:uid" :paramsDesc="['用户ID, 自行抓包寻找']"/>

## 观止（每日一文）

### 观止

<Route author="Andiedie" example="/guanzhi" path="/guanzhi"/>

## 快眼看书

### 小说更新

<Route author="squkw" example="/novel/booksky/98619" path="/novel/booksky/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到, 例如 `98619`']">

举例网址：http://booksky.so/BookDetail.aspx?Level=1&bid=98619

</Route>

## 飘天文学

### 章节

<Route author="LJason77" example="/novel/ptwxz/10/10272" path="/novel/ptwxz/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `10`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `10272`']" >

举例网址：https://www.ptwxz.com/bookinfo/10/10272.html

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

## 书趣阁

### 小说更新

<Route author="ActonGen" example="/novel/shuquge/8659" path="/novel/shuquge/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到, 例如 `8659`']">

举例网址：http://www.shuquge.com/txt/8659/index.html

</Route>

## 文学迷

### 小说更新

<Route author="lengthmin" example="/novel/wenxuemi/6/6144" path="/novel/wenxuemi/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `6`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `6144`']">

举例网址：https://www.wenxuemi.com/files/article/html/6/6144/

</Route>

## 虛詞

### 版块

<Route author="LogicJake" example="/p-articles/section/critics-art" path="/p-articles/section/:section" :paramsDesc="['版块链接, 可在对应版块 URL 中找到, 子版块链接用`-`连接']"/>

### 作者

<Route author="LogicJake" example="/p-articles/contributors/朗天" path="/p-articles/contributors/:author" :paramsDesc="['作者 id, 可在作者页面 URL 找到']"/>

## 纵横

### 章节

<Route author="georeth" example="/zongheng/chapter/672340" path="/zongheng/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 左岸读书

### 主页

<Route author="kt286" example="/zreading" path="/zreading" />
