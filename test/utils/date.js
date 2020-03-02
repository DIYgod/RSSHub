const parseDate = require('../../lib/utils/date');
const MockDate = require('mockdate');

describe('date', () => {
    MockDate.set(new Date('2019-01-01'));

    const date = new Date();

    it('m分钟前', async () => {
        expect(+new Date(parseDate('10分钟前'))).toBe(+date - 10 * 60 * 1000);
    });

    it('H小时前', async () => {
        expect(+new Date(parseDate('10小时前'))).toBe(+date - 10 * 60 * 60 * 1000);
    });

    it('D天前', async () => {
        expect(+new Date(parseDate('10天前'))).toBe(+date - 10 * 24 * 60 * 60 * 1000);
    });

    it('M月前', async () => {
        expect(+new Date(parseDate('1月前'))).toBe(+date - 1 * 31 * 24 * 60 * 60 * 1000);
    });

    it('Y年前', async () => {
        expect(+new Date(parseDate('1年前'))).toBe(+date - 1 * 365 * 24 * 60 * 60 * 1000);
    });

    it('今天 H:m', async () => {
        expect(+new Date(parseDate('今天 08:00'))).toBe(+new Date('2019-1-1 08:00'));
    });

    it('昨天 H:m', async () => {
        expect(+new Date(parseDate('昨天 20:00'))).toBe(+new Date('2018-12-31 20:00'));
    });

    it('前天 H:m', async () => {
        expect(+new Date(parseDate('前天 20:00'))).toBe(+new Date('2018-12-30 20:00'));
    });

    it('Y年M月D日H时', async () => {
        expect(+new Date(parseDate('2018年4月2日1时'))).toBe(+new Date('2018-4-2 01:00'));
    });

    it('Y年M月D日', async () => {
        expect(+new Date(parseDate('2018年4月2日'))).toBe(+new Date('2018-4-2 00:00'));
    });

    it('Y-M-D H:m', async () => {
        expect(+new Date(parseDate('2018-4-2 02:03'))).toBe(+new Date('2018-4-2 02:03'));
    });

    it('M-D H:m', async () => {
        expect(+new Date(parseDate('2-3 02:03'))).toBe(+new Date('2019-2-3 02:03'));
    });

    it('Y/M/D H:m:s', async () => {
        expect(+new Date(parseDate('2018/4/2 02:03:04'))).toBe(+new Date('2018-4-2 02:03:04'));
    });

    it('Y/M/D H:m', async () => {
        expect(+new Date(parseDate('2018/4/2 02:03'))).toBe(+new Date('2018-4-2 02:03'));
    });

    it('M/D H:m', async () => {
        expect(+new Date(parseDate('2/3 02:03'))).toBe(+new Date('2019-2-3 02:03'));
    });

    it('M月D日 H:m', async () => {
        expect(+new Date(parseDate('2月3日 02:03'))).toBe(+new Date('2019-2-3 02:03'));
    });

    it('M月D日', async () => {
        expect(+new Date(parseDate('2月3日'))).toBe(+new Date('2019-2-3 00:00'));
    });

    it('M/D', async () => {
        expect(+new Date(parseDate('2/3'))).toBe(+new Date('2019-2-3 00:00'));
    });

    it('Y-M-D', async () => {
        expect(+new Date(parseDate('2018-4-2'))).toBe(+new Date('2018-4-2'));
    });

    it('M-D', async () => {
        expect(+new Date(parseDate('4-2'))).toBe(+new Date('2019-4-2'));
    });

    it('H:m', async () => {
        expect(+new Date(parseDate('4:2'))).toBe(+new Date('2019-1-1 04:02'));
    });

    it('刚刚', async () => {
        const result = +new Date(parseDate('刚刚'));
        const now = +new Date();
        expect(result - now).toBeLessThan(10);
        expect(result - now).toBeGreaterThanOrEqual(0);
    });

    it('Invalid', async () => {
        expect(parseDate('RSSHub')).toBe('RSSHub');
    });
});
