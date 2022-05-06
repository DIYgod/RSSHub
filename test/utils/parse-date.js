const { parseRelativeDate } = require('@/utils/parse-date');
const MockDate = require('mockdate');

describe('parseRelativeDate', () => {
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    const weekday = (d) => +new Date(date.getFullYear(), date.getMonth(), date.getDate() + d - (date.getDay() > d ? date.getDay() : date.getDay() + 7));

    const date = new Date();

    MockDate.set(date);

    it('s秒钟前', () => {
        expect(+new Date(parseRelativeDate('10秒前'))).toBe(+date - 10 * second);
    });

    it('m分钟前', () => {
        expect(+new Date(parseRelativeDate('10分钟前'))).toBe(+date - 10 * minute);
    });

    it('m分鐘前', () => {
        expect(+new Date(parseRelativeDate('10分鐘前'))).toBe(+date - 10 * minute);
    });

    it('m分钟后', () => {
        expect(+new Date(parseRelativeDate('10分钟后'))).toBe(+date + 10 * minute);
    });

    it('a minute ago', () => {
        expect(+new Date(parseRelativeDate('a minute ago'))).toBe(+date - 1 * minute);
    });

    it('s minutes ago', () => {
        expect(+new Date(parseRelativeDate('10 minutes ago'))).toBe(+date - 10 * minute);
    });

    it('s mins ago', () => {
        expect(+new Date(parseRelativeDate('10 mins ago'))).toBe(+date - 10 * minute);
    });

    it('in s minutes', () => {
        expect(+new Date(parseRelativeDate('in 10 minutes'))).toBe(+date + 10 * minute);
    });

    it('in an hour', () => {
        expect(+new Date(parseRelativeDate('in an hour'))).toBe(+date + 1 * hour);
    });

    it('H小时前', () => {
        expect(+new Date(parseRelativeDate('10小时前'))).toBe(+date - 10 * hour);
    });

    it('H个小时前', () => {
        expect(+new Date(parseRelativeDate('10个小时前'))).toBe(+date - 10 * hour);
    });

    it('D天前', () => {
        expect(+new Date(parseRelativeDate('10天前'))).toBe(+date - 10 * day);
    });

    it('W周前', () => {
        expect(+new Date(parseRelativeDate('10周前'))).toBe(+date - 10 * week);
    });

    it('W星期前', () => {
        expect(+new Date(parseRelativeDate('10星期前'))).toBe(+date - 10 * week);
    });

    it('W个星期前', () => {
        expect(+new Date(parseRelativeDate('10个星期前'))).toBe(+date - 10 * week);
    });

    it('M月前', () => {
        expect(+new Date(parseRelativeDate('1月前'))).toBe(+date - 1 * month);
    });

    it('M个月前', () => {
        expect(+new Date(parseRelativeDate('1个月前'))).toBe(+date - 1 * month);
    });

    it('Y年前', () => {
        expect(+new Date(parseRelativeDate('1年前'))).toBe(+date - 1 * year);
    });

    it('Y年M个月前', () => {
        expect(+new Date(parseRelativeDate('1年1个月前'))).toBe(+date - 1 * year - 1 * month);
    });

    it('D天H小时前', () => {
        expect(+new Date(parseRelativeDate('1天1小时前'))).toBe(+date - 1 * day - 1 * hour);
    });

    it('H小时m分钟s秒钟前', () => {
        expect(+new Date(parseRelativeDate('1小时1分钟1秒钟前'))).toBe(+date - 1 * hour - 1 * minute - 1 * second);
    });

    it('H小时m分钟s秒钟后', () => {
        expect(+new Date(parseRelativeDate('1小时1分钟1秒钟后'))).toBe(+date + 1 * hour + 1 * minute + 1 * second);
    });

    it('今天', () => {
        expect(+new Date(parseRelativeDate('今天'))).toBe(+date.setHours(0, 0, 0, 0));
    });

    it('Today H:m', () => {
        expect(+new Date(parseRelativeDate('Today 08:00'))).toBe(+date + 8 * hour);
    });

    it('TDA H:m:s', () => {
        expect(+new Date(parseRelativeDate('TDA 08:00:00'))).toBe(+date + 8 * hour);
    });

    it('今天 H:m', () => {
        expect(+new Date(parseRelativeDate('今天 08:00'))).toBe(+date + 8 * hour);
    });

    it('今天H点m分', () => {
        expect(+new Date(parseRelativeDate('今天8点0分'))).toBe(+date + 8 * hour);
    });

    it('昨日H点m分s秒', () => {
        expect(+new Date(parseRelativeDate('昨日20时0分0秒'))).toBe(+date - 4 * hour);
    });

    it('前天 H:m', () => {
        expect(+new Date(parseRelativeDate('前天 20:00'))).toBe(+date - 1 * day - 4 * hour);
    });

    it('明天 H:m', () => {
        expect(+new Date(parseRelativeDate('明天 20:00'))).toBe(+date + 1 * day + 20 * hour);
    });

    it('星期几 h:m', () => {
        expect(+new Date(parseRelativeDate('星期一 8:00'))).toBe(weekday(1) + 8 * hour);
    });

    it('周几 h:m', () => {
        expect(+new Date(parseRelativeDate('周二 8:00'))).toBe(weekday(2) + 8 * hour);
    });

    it('星期天 h:m', () => {
        expect(+new Date(parseRelativeDate('星期天 8:00'))).toBe(weekday(7) + 8 * hour);
    });

    it('Invalid', () => {
        expect(parseRelativeDate('RSSHub')).toBe('RSSHub');
    });
});
