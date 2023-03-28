# Date Handling

When you visit a website, the website usually provides you with a date or timestamp. This tutorial will show you how to properly handle them in your code.

## The Standard

### No Date

-   **Do not** add a date when a website does not provide one. Leave the `pubDate` field undefined.
-   Parse only the date and **do not add a time** to the `pubDate` field when a website provides a date but not an accurate time.

The `pubDate` field must be a:

1.  [Date Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
2.  **Not recommended. Only use for compatibility**: Strings that can be parsed correctly because their behavior can be inconsistent across deployment environments. Use `Date.parse()` with caution.

The `pubDate` passed from the route script should correspond to the time zone/time used by the server. For more details, see the following:

## Use utilities class

We recommend using [day.js](https://github.com/iamkun/dayjs) for date processing and time zone adjustment. There are two related utility classes:

### Date and Time

The RSSHub utility class includes a wrapper for [day.js](https://github.com/iamkun/dayjs) that allows you to easily parse date strings and obtain a [Date Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) in most cases.

```js
const { parseDate } = require('@/utils/parse-date');

const pubDate = parseDate('2020/12/30');
// OR
const pubDate = parseDate('2020/12/30', 'YYYY/MM/DD');
```

:::tip Tips
You can refer to the [day.js documentation](https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens) for all available date formats.
:::

If you need to parse a relative date, use `parseRelativeDate`.

```js
const { parseRelativeDate } = require('@/utils/parse-date');

const pubDate = parseRelativeDate('2 days ago');
const pubDate = parseRelativeDate('day before yesterday 15:36');
```

### Timezone

When parsing dates from websites, it's important to consider time zones. Some websites may not convert the time zone according to the visitor's location, resulting in a date that doesn't accurately reflect the user's local time. To avoid this issue, you can manually specify the time zone.

To manually specify the time zone in your code, use the following code:

```js
const timezone = require('@/utils/timezone');

const pubDate = timezone(parseDate('2020/12/30 13:00'), +1);
```

The timezone function takes two parameters: the first is the original [Date Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date), and the second is the time zone offset. The offset is specified in hours, so in this example, a time zone of UTC+1 is used.

By doing this, the time will be converted to server time and it will facilitate middleware processing.
