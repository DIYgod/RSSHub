let puppeteer;
const { parseCookieArray, constructCookieArray, setCookies, getCookies } = require('../../lib/utils/puppeteer-utils');

let browser = null;

afterEach(() => {
    if (browser) {
        browser.close();
        browser = null;
    }

    jest.resetModules();
});

describe('puppeteer-utils', () => {
    const cookieArrayExampleCom = [
        { name: 'foobar', value: '', domain: 'example.com' },
        { name: 'foo', value: 'bar', domain: 'example.com' },
        { name: 'baz', value: 'qux', domain: 'example.com' },
    ];
    const cookieArraySubExampleCom = [
        { name: 'barfoo', value: '', domain: 'sub.example.com' },
        { name: 'bar', value: 'foo', domain: 'sub.example.com' },
        { name: 'qux', value: 'baz', domain: 'sub.example.com' },
    ];
    const cookieArrayRsshubTest = [
        { name: '', value: 'rsshub', domain: 'rsshub.test' },
        { name: 'rsshub', value: '', domain: 'rsshub.test' },
        { name: 'test', value: 'rsshub', domain: 'rsshub.test' },
    ];
    const cookieArrayAll = cookieArrayExampleCom.concat(cookieArraySubExampleCom).concat(cookieArrayRsshubTest);

    const cookieStrExampleCom = 'foobar=; foo=bar; baz=qux';
    const cookieStrSubExampleCom = 'barfoo=; bar=foo; qux=baz';
    const cookieStrRsshubTest = 'rsshub; rsshub=; test=rsshub';
    const cookieStrAll = [cookieStrExampleCom, cookieStrSubExampleCom, cookieStrRsshubTest].join('; ');

    it('parseCookieArray', () => {
        [
            [cookieArrayExampleCom, cookieStrExampleCom],
            [cookieArraySubExampleCom, cookieStrSubExampleCom],
            [cookieArrayRsshubTest, cookieStrRsshubTest],
            [cookieArrayAll, cookieStrAll],
        ].forEach(([cookieArray, cookieStr]) => {
            expect(parseCookieArray(cookieArray)).toEqual(cookieStr);
        });
        expect(parseCookieArray(cookieArrayAll, 'example.com')).toEqual(`${cookieStrExampleCom}; ${cookieStrSubExampleCom}`);
        expect(parseCookieArray(cookieArrayAll, 'sub.example.com')).toEqual(cookieStrSubExampleCom);
        expect(parseCookieArray(cookieArrayExampleCom, 'sub.example.com')).toEqual('');
        expect(parseCookieArray(cookieArrayRsshubTest, 'example.com')).toEqual('');
        expect(parseCookieArray(cookieArraySubExampleCom, 'example.com')).toEqual(cookieStrSubExampleCom);
        expect(parseCookieArray(cookieArrayAll, 'rsshub.test')).toEqual(cookieStrRsshubTest);
        expect(parseCookieArray(cookieArrayAll, /^example\.com$/)).toEqual(cookieStrExampleCom);
        expect(parseCookieArray(cookieArrayAll, /^sub\.example\.com|rsshub\.test$/)).toEqual(`${cookieStrSubExampleCom}; ${cookieStrRsshubTest}`);
        expect(parseCookieArray(cookieArrayAll, /^.*$/)).toEqual(cookieStrAll);
    });

    it('constructCookieArray', () => {
        [
            [cookieArrayExampleCom, cookieStrExampleCom],
            [cookieArraySubExampleCom, cookieStrSubExampleCom],
            [cookieArrayRsshubTest, cookieStrRsshubTest],
        ].forEach(([cookieArray, cookieStr]) => {
            expect(constructCookieArray(cookieStr, cookieArray[0].domain)).toEqual(cookieArray);
        });
    });

    it('getCookies httpbin', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();
        const page = await browser.newPage();
        await page.goto('https://httpbin.org/cookies/set?foo=bar&baz=qux', {
            waitUntil: 'domcontentloaded',
        });
        expect((await getCookies(page, 'httpbin.org')).split('; ').sort()).toEqual(['foo=bar', 'baz=qux'].sort());
    }, 10000);

    it('setCookies httpbin', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();
        const page = await browser.newPage();
        // httpbin.org cannot recognize cookies with empty name properly, so we cannot use cookieStrAll here
        await setCookies(page, cookieStrExampleCom, 'httpbin.org');
        await page.goto('https://httpbin.org/cookies', {
            waitUntil: 'domcontentloaded',
        });
        const data = await page.evaluate(() => JSON.parse(document.body.innerText));
        expect(data.cookies).toEqual(Object.fromEntries(cookieArrayExampleCom.map(({ name, value }) => [name, value])));
    }, 10000);

    it('setCookies & getCookies example.org', async () => {
        puppeteer = require('../../lib/utils/puppeteer');
        browser = await puppeteer();
        const page = await browser.newPage();
        // we can use cookieStrAll here!
        await setCookies(page, cookieStrAll, 'example.org');
        await page.goto('https://example.org', {
            waitUntil: 'domcontentloaded',
        });
        expect((await getCookies(page, 'example.org')).split('; ').sort()).toEqual(cookieStrAll.split('; ').sort());
    }, 10000);
});
