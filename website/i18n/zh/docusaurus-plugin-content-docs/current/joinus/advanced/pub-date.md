---
sidebar_position: 4
---

# 日期处理

当你访问网站时，网站通常会提供一个日期或时间戳。本指南将展示如何在代码中正确处理它们。

## 规范

### 没有日期

-   当网站没有提供日期时，**请勿**添加日期，`pubDate` 应当被留空。
-   当网站提供一个日期但没有准确的时间时，只需要解析日期并**不要添加时间**到 `pubDate` 中。

`pubDate` 必须是：

1.  [Date 对象](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
2.  **不推荐**: 使用字符串时，要确保可正确解析，因为它们的行为可能会在部署环境中发生不一致。请尽量避免 `Date.parse()`。

从路由传入的 `pubDate` 应该对应于**服务器使用的时区 / 时间**。有关更多详细信息，请参见下方工具类：

## 使用工具类

我们推荐使用 [day.js](https://github.com/iamkun/dayjs) 进行日期处理和时区调整。有两个相关的工具类：

### 日期时间

RSSHub 工具类包括了一个 [day.js](https://github.com/iamkun/dayjs) 的包装函数，它允许你直接解析日期字符串并在大多数情况下获得一个 [Date 对象](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)。

```js
import { parseDate } from '@/utils/parse-date';

const pubDate = parseDate('2020/12/30');
// 或
const pubDate = parseDate('2020/12/30', 'YYYY/MM/DD');
```

:::tip

你可以参考 [day.js 文档](https://day.js.org/docs/zh-CN/parse/string-format#支持的解析占位符列表) 查看所有可用日期格式。

:::

如果你需要解析相对日期，请使用 `parseRelativeDate`。

```js
import { parseRelativeDate } from '@/utils/parse-date';

const pubDate = parseRelativeDate('2天前');
const pubDate = parseRelativeDate('前天 15:36');
```

### 时区

从网站解析日期时，考虑时区非常重要。有些网站可能不会根据访问者的位置转换时区，导致日期不准确地反映用户的本地时间。为避免此问题，你可以手动指定时区。

要在代码中手动指定时区，可以使用以下代码：

```js
import timezone from '@/utils/timezone';

const pubDate = timezone(parseDate('2020/12/30 13:00'), +1);
```

`timezone` 函数接受两个参数：第一个是 [日期对象](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)，第二个是时区偏移量。偏移量以小时为单位指定，在此示例中使用了 UTC+1 的时区。

这样做将时间转换为服务器时间，方便后续中间件进行处理。
