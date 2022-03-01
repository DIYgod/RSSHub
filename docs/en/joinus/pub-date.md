# Date Handling

When crawling a web page, the web page usually provides a date. This tutorial will illustrate how a script should properly handle that situation

## No Date

**Do not add a date** when a website does not provide one. The `pubDate` option should be left empty.

## Standard

`pubDate` must be a

1. [Date Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
2. **Not recommended, only use for compatible** strings that can be parsed correctly because its behavior may be inconsistent across environments, [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse). Please avoid using it

Also, the `pubDate` passed in from the script should correspond to the time zone/time used by the **server**. For more details, see the following:

## Use utilities class

We recommend using [Day.js](https://github.com/iamkun/dayjs) for date processing and time zone adjustment as of now. There are two related tool classes:

### Parse Date

This is a utility class for using [Day.js](https://github.com/iamkun/dayjs). In most cases, it is possible to use it directly to get the correct `Date Object`

Please refer to Day.js GitHub description for specific parsing parameters

```javascript
const { parseDate } = require('@/utils/parse-date');

const pubDate = parseDate('2020/12/30', 'YYYY/MM/DD');
```

If you need to parse a relative date, use `parseRelativeDate`.

::: warning Warning
Only works for relative date in Chinese for now
:::

```javascript
const { parseRelativeDate } = require('@/utils/parse-date');

const pubDate = parseRelativeDate('2天前');
const pubDate = parseRelativeDate('前天 15:36');
```

### Timezone

Some websites will not convert the time zone according to the location of a visitor. The time obtained will be the local time of the website, which may not be suitable for all RSS subscribers. In this case, you should specify the time zone manually:

::: warning Warning
Now, the time will be converted to server time, which facilitates middleware processing.
:::

```javascript
const timezone = require('@/utils/timezone');

const pubDate = timezone(new Date(), +8);
```
