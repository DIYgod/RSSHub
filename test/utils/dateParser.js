const dateParser = require('../../lib/utils/dateParser');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const MockDate = require('mockdate');
dayjs.extend(utc);

describe('dateParser', () => {
    MockDate.set('2019-01-01');
    const now = new Date();
    const serverOffset = now.getTimezoneOffset() / 60;
    require('dayjs/locale/zh-cn');
    require('dayjs/locale/zh-hk');

    // ['en', 'zh-cn', 'zh-hant'].forEach((lang0) => {
    //     const lang = dateParser.i8nconv(lang0);
    //     dayjs.locale(lang);

    // Test of input as a string of UTC Time
    test(`UTCString`, () => {
        expect(dateParser(dayjs.utc(now.toUTCString()).locale('en').format('YYYY-MM-DD HH:mm:ss'))).toBe(now.toUTCString());
    });

    // Test of input as a string of local time with timezone in ISO 8601
    test(`ISO 8601`, () => {
        expect(dateParser(dayjs(now.toUTCString()).locale('en').format('YYYY-MM-DDTHH:mm:ssZ'))).toBe(now.toUTCString());
    });

    // Test of input as a string of local time with timezone set by htmlOffset
    test(`htmlOffset`, () => {
        expect(dateParser(dayjs(now.toUTCString()).locale('en').format('YYYY-MM-DDTHH:mm:ss'), null, 'en', serverOffset)).toBe(now.toUTCString());
    });

    // Test of input as a string of UTC Time with week
    test(`en UTCString with week`, () => {
        expect(dateParser(dayjs.utc(now.toUTCString()).locale('en').format('dddd, DD MMMM YYYY HH:mm:ss'), 'DD MMMM YYYY HH:mm:ss')).toBe(now.toUTCString());
    });

    test(`zh-cn UTCString with week`, () => {
        expect(dateParser(dayjs.utc(now.toUTCString()).locale('zh-cn').format('dddd, DD MMMM YYYY HH:mm:ss'), 'DD MMMM YYYY HH:mm:ss', 'zh-cn')).toBe(now.toUTCString());
    });

    test(`zh-hant UTCString with week`, () => {
        expect(dateParser(dayjs.utc(now.toUTCString()).locale(dateParser.i8nconv('zh-hant')).format('dddd, DD MMMM YYYY HH:mm:ss'), 'DD MMMM YYYY HH:mm:ss', 'zh-hant')).toBe(now.toUTCString());
    });

    // fallback
    test('fallback', () => {
        expect(+new Date(dateParser('10分钟前'))).toBe(+now - 10 * 60 * 1000);
    });

    // error handling
    test('error handling', () => {
        expect(+new Date(dateParser('10分钟前', null, 'Klingon'))).toBe(+now - 10 * 60 * 1000);
    });
});
