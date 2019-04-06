# 小说·文学·阅读

## 观止（每日一文）

<Route name="观止" author="Andiedie" example="/guanzhi" path="/guanzhi"/>

## 笔趣阁

<Route name="小说更新" author="jjeejj" example="/novel/biquge/52_52542" path="/novel/biquge/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']">

::: tip 提示

由于笔趣阁网站有多个, 各站点小说对应的小说 id 不同. 此 feed 只对应在[`www.biquge5200.com`](https://www.biquge5200.com/)中的小说 id.

:::

</Route>

## UU 看书

<Route name="小说更新" author="jacky2001114" example="/novel/uukanshu/49621>" path="/novel/uukanshu/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 文学迷

<Route name="小说更新" author="lengthmin" example="/novel/wenxuemi/6/6144" path="/novel/wenxuemi/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `6`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `6144`']">

举例网址：https://www.wenxuemi.com/files/article/html/6/6144/

</Route>

## 起点

<Route name="章节" author="Chingyat" example="/qidian/chapter/1010400217" path="/qidian/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

<Route name="讨论区" author="Chingyat" example="/qidian/forum/1010400217" path="/qidian/forum/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 纵横

<Route name="章节" author="georeth" example="/zongheng/chapter/672340" path="/zongheng/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 刺猬猫

<Route name="章节" author="Netrvin" example="/ciweimao/chapter/100045750" path="/ciweimao/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 快眼看书

<Route name="小说更新" author="squkw" example="/novel/booksky/98619" path="/novel/booksky/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到, 例如 `98619`']">

举例网址：http://booksky.so/BookDetail.aspx?Level=1&bid=98619

</Route>

## 青空文庫

<Route name="青空文庫新着リスト" author="sgqy" example="/aozora/newbook/10" path="/aozora/newbook/:count?" :paramsDesc="['更新数量. 设置每次下载列表大小. 范围是 1 到 50.']">

书籍网站每日一更. 信息更新时间为书籍最初出版时间, 排序可能不符合网络发表时间, 请认准未读消息.

</Route>

## All Poetry

<Route name="Poems" author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['排序方式, `best` 或 `newest`, 缺省 `best`']"/>

## 轻小说文库

<Route name="章节" author="zsakvo" example="/wenku8/chapter/74" path="/wenku8/chapter/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

## 爱思想

<Route name="栏目" author="HenryQW" example="/aisixiang/column/722" path="/aisixiang/column/:id" :paramsDesc="['栏目 ID, 可在对应栏目 URL 中找到']"/>

<Route name="排行榜" author="HenryQW" example="/aisixiang/ranking/1/7" path="/aisixiang/ranking/:type?/:range?" :paramsDesc="['排行榜类型', '排行榜范围, 仅适用于点击排行榜, 可选日(1)，周(7)，月(30)']">

| 文章点击排行 | 文章推荐排行 | 最近更新文章 |
| ------------ | ------------ | ------------ |
| 1            | 10           | 11           |

</Route>
