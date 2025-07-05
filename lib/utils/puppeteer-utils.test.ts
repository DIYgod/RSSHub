import { describe, expect, it, vi, afterEach } from 'vitest';
import { parseCookieArray, constructCookieArray, setCookies, getCookies } from '@/utils/puppeteer-utils';
import puppeteer from '@/utils/puppeteer';
import type { Browser } from 'rebrowser-puppeteer';

let browser: Browser | null = null;

afterEach(async () => {
    if (browser) {
        await browser.close();
        browser = null;
    }

    vi.resetModules();
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
    const cookieArrayAll = [...cookieArrayExampleCom, ...cookieArraySubExampleCom, ...cookieArrayRsshubTest];

    const cookieStrExampleCom = 'foobar=; foo=bar; baz=qux';
    const cookieStrSubExampleCom = 'barfoo=; bar=foo; qux=baz';
    const cookieStrRsshubTest = 'rsshub; rsshub=; test=rsshub';
    const cookieStrAll = [cookieStrExampleCom, cookieStrSubExampleCom, cookieStrRsshubTest].join('; ');

    it('parseCookieArray', () => {
        for (const [cookieArray, cookieStr] of [
            [cookieArrayExampleCom, cookieStrExampleCom],
            [cookieArraySubExampleCom, cookieStrSubExampleCom],
            [cookieArrayRsshubTest, cookieStrRsshubTest],
            [cookieArrayAll, cookieStrAll],
        ]) {
            expect(parseCookieArray(cookieArray)).toEqual(cookieStr);
        }
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
        for (const [cookieArray, cookieStr] of [
            [cookieArrayExampleCom, cookieStrExampleCom],
            [cookieArraySubExampleCom, cookieStrSubExampleCom],
            [cookieArrayRsshubTest, cookieStrRsshubTest],
        ] as const) {
            expect(constructCookieArray(cookieStr, cookieArray[0].domain)).toEqual(cookieArray);
        }
    });

    it('getCookies httpbingo', async () => {
        browser = await puppeteer();
        const page = await browser.newPage();
        await page.goto('https://httpbingo.org/cookies/set?foo=bar&baz=qux', {
            waitUntil: 'domcontentloaded',
        });
        expect((await getCookies(page, 'httpbingo.org')).split('; ').sort()).toEqual(['foo=bar', 'baz=qux'].sort());
    }, 20000);

    it('setCookies httpbingo', async () => {
        browser = await puppeteer();
        const page = await browser.newPage();
        // httpbingo.org cannot recognize cookies with empty name properly, so we cannot use cookieStrAll here
        await setCookies(page, cookieStrExampleCom, 'httpbingo.org');
        await page.goto('https://httpbingo.org/cookies', {
            waitUntil: 'domcontentloaded',
        });
        const data = await page.evaluate(() => JSON.parse(document.body.textContent || ''));
        expect(data).toEqual(Object.fromEntries(cookieArrayExampleCom.map(({ name, value }) => [name, value])));
    }, 20000);

    it('setCookies & getCookies example.org', async () => {
        browser = await puppeteer();
        const page = await browser.newPage();
        // we can use cookieStrAll here!
        await setCookies(page, cookieStrAll, 'example.org');
        await page.goto('https://example.org', {
            waitUntil: 'domcontentloaded',
        });
        expect((await getCookies(page, 'example.org')).split('; ').sort()).toEqual(cookieStrAll.split('; ').sort());
    }, 20000);
});
