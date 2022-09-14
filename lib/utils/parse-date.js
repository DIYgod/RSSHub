const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/customParseFormat'));
dayjs.extend(require('dayjs/plugin/duration'));
dayjs.extend(require('dayjs/plugin/isSameOrBefore'));
dayjs.extend(require('dayjs/plugin/weekday'));

const words = [
    {
        startAt: dayjs(),
        regExp: /^(?:今(?:天|日)|t(?:o)?da(?:y)?)(.*)/,
    },
    {
        startAt: dayjs().subtract(1, 'days'),
        regExp: /^(?:昨(?:天|日)|y(?:ester)?da(?:y)?)(.*)/,
    },
    {
        startAt: dayjs().subtract(2, 'days'),
        regExp: /^(?:前天|(?:the)?d(?:ay)?b(?:eforeyesterda)?y)(.*)/,
    },
    {
        startAt: dayjs().isSameOrBefore(dayjs().weekday(1)) ? dayjs().weekday(1).subtract(1, 'week') : dayjs().weekday(1),
        regExp: /^(?:周|星期)一(.*)/,
    },
    {
        startAt: dayjs().isSameOrBefore(dayjs().weekday(2)) ? dayjs().weekday(2).subtract(1, 'week') : dayjs().weekday(2),
        regExp: /^(?:周|星期)二(.*)/,
    },
    {
        startAt: dayjs().isSameOrBefore(dayjs().weekday(3)) ? dayjs().weekday(3).subtract(1, 'week') : dayjs().weekday(3),
        regExp: /^(?:周|星期)三(.*)/,
    },
    {
        startAt: dayjs().isSameOrBefore(dayjs().weekday(4)) ? dayjs().weekday(4).subtract(1, 'week') : dayjs().weekday(4),
        regExp: /^(?:周|星期)四(.*)/,
    },
    {
        startAt: dayjs().isSameOrBefore(dayjs().weekday(5)) ? dayjs().weekday(5).subtract(1, 'week') : dayjs().weekday(5),
        regExp: /^(?:周|星期)五(.*)/,
    },
    {
        startAt: dayjs().isSameOrBefore(dayjs().weekday(6)) ? dayjs().weekday(6).subtract(1, 'week') : dayjs().weekday(6),
        regExp: /^(?:周|星期)六(.*)/,
    },
    {
        startAt: dayjs().isSameOrBefore(dayjs().weekday(7)) ? dayjs().weekday(7).subtract(1, 'week') : dayjs().weekday(7),
        regExp: /^(?:周|星期)(?:日|天)(.*)/,
    },
    {
        startAt: dayjs().add(1, 'days'),
        regExp: /^(?:明(?:天|日)|y(?:ester)?da(?:y)?)(.*)/,
    },
    {
        startAt: dayjs().add(2, 'days'),
        regExp: /^(?:(?:后|後)(?:天|日)|(?:the)?d(?:ay)?a(?:fter)?t(?:omrrow)?)(.*)/,
    },
];

const patterns = [
    {
        unit: 'years',
        regExp: /(\d+)(?:年|y(?:ea)?r(?:s)?)/,
    },
    {
        unit: 'months',
        regExp: /(\d+)(?:(?:个|個)?月|month(?:s)?)/,
    },
    {
        unit: 'weeks',
        regExp: /(\d+)(?:周|(?:个|個)?星期|week(?:s)?)/,
    },
    {
        unit: 'days',
        regExp: /(\d+)(?:天|日|d(?:ay)?(?:s)?)/,
    },
    {
        unit: 'hours',
        regExp: /(\d+)(?:(?:个|個)?(?:(?:小)?时|時|点|點)|h(?:(?:ou)?r)?(?:s)?)/,
    },
    {
        unit: 'minutes',
        regExp: /(\d+)(?:分(?:钟|鐘)?|m(?:in(?:ute)?)?(?:s)?)/,
    },
    {
        unit: 'seconds',
        regExp: /(\d+)(?:秒(?:钟|鐘)?|s(?:ec(?:ond)?)?(?:s)?)/,
    },
];

const patternSize = Object.keys(patterns).length;

/**
 * 预处理日期字符串
 * @param {String} date 原始日期字符串
 */
const toDate = (date) =>
    date
        .toLowerCase()
        .replace(/(^a(?:n)?\s)|(\sa(?:n)?\s)/g, '1') // 替换 `a` 和 `an` 为 `1`
        .replace(/几|幾/g, '3') // 如 `几秒钟前` 视作 `3秒钟前`
        .replace(/[\s,]/g, ''); // 移除所有空格

/**
 * 将 `['\d+时', ..., '\d+秒']` 转换为 `{ hours: \d+, ..., seconds: \d+ }`
 * 用于描述时间长度
 * @param {Array.<String>} matches 所有匹配结果
 */
const toDurations = (matches) => {
    const durations = {};

    let p = 0;
    for (const m of matches) {
        for (; p <= patternSize; p++) {
            const match = patterns[p].regExp.exec(m);
            if (match) {
                durations[patterns[p].unit] = match[1];
                break;
            }
        }
    }
    return durations;
};

module.exports = {
    parseDate: (date, ...options) => dayjs(date, ...options).toDate(),
    parseRelativeDate: (date) => {
        // 预处理日期字符串 date

        const theDate = toDate(date);

        // 将 `\d+年\d+月...\d+秒前` 分割成 `['\d+年', ..., '\d+秒前']`

        const matches = theDate.match(/(?:\D+)?\d+(?!:|-|\/|(a|p)m)\D+/g);

        if (matches) {
            // 获得最后的时间单元，如 `\d+秒前`

            const lastMatch = matches.pop();

            // 若最后的时间单元含有 `前`、`以前`、`之前` 等标识字段，减去相应的时间长度
            // 如 `1分10秒前`

            const beforeMatches = /(.*)(?:(?:之|以)?前|ago)$/.exec(lastMatch);
            if (beforeMatches) {
                matches.push(beforeMatches[1]);
                return dayjs()
                    .subtract(dayjs.duration(toDurations(matches)))
                    .toDate();
            }

            // 若最后的时间单元含有 `后`、`以后`、`之后` 等标识字段，加上相应的时间长度
            // 如 `1分10秒后`

            const afterMatches = /(?:^in(.*)|(.*)(?:之|以)?(?:后|後))$/.exec(lastMatch);
            if (afterMatches) {
                matches.push(afterMatches[1] ?? afterMatches[2]);
                return dayjs()
                    .add(dayjs.duration(toDurations(matches)))
                    .toDate();
            }

            // 以下处理日期字符串 date 含有特殊词的情形
            // 如 `今天1点10分`

            matches.push(lastMatch);
            const firstMatch = matches.shift();

            for (const w of words) {
                const wordMatches = w.regExp.exec(firstMatch);
                if (wordMatches) {
                    matches.unshift(wordMatches[1]);

                    // 取特殊词对应日零时为起点，加上相应的时间长度

                    return w.startAt
                        .set('hour', 0)
                        .set('minute', 0)
                        .set('second', 0)
                        .set('millisecond', 0)
                        .add(dayjs.duration(toDurations(matches)))
                        .toDate();
                }
            }
        } else {
            // 若日期字符串 date 不匹配 patterns 中所有模式，则默认为 `特殊词 + 标准时间格式` 的情形，此时直接将特殊词替换为对应日期
            // 如今天为 `2022-03-22`，则 `今天 20:00` => `2022-03-22 20:00`

            for (const w of words) {
                const wordMatches = w.regExp.exec(theDate);
                if (wordMatches) {
                    // The default parser of dayjs() can parse '8:00 pm' but not '8:00pm'
                    // so we need to insert a space in between
                    return dayjs(`${w.startAt.format('YYYY-MM-DD')} ${/a|pm$/.test(wordMatches[1]) ? wordMatches[1].replace(/a|pm/, ' $&') : wordMatches[1]}`).toDate();
                }
            }
        }

        return date;
    },
};
