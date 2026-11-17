import type { BrowserContext } from 'patchright';
import { afterEach, describe, expect, it, vi } from 'vitest';

import playwright from '@/utils/playwright';
import { constructCookieArray, getCookies, limitContentLength, limitNavigation, parseCookieArray, setCookies } from '@/utils/playwright-utils';

let context: BrowserContext | null = null;

afterEach(async () => {
    if (context) {
        await context.close();
        context = null;
    }

    vi.resetModules();
});

describe('browser cookie utils', () => {
    const cookieArrayExampleCom = [
        { name: 'foobar', value: '', domain: 'example.com', path: '/' },
        { name: 'foo', value: 'bar', domain: 'example.com', path: '/' },
        { name: 'baz', value: 'qux', domain: 'example.com', path: '/' },
    ];
    const cookieArraySubExampleCom = [
        { name: 'barfoo', value: '', domain: 'sub.example.com', path: '/' },
        { name: 'bar', value: 'foo', domain: 'sub.example.com', path: '/' },
        { name: 'qux', value: 'baz', domain: 'sub.example.com', path: '/' },
    ];
    const cookieArrayRsshubTest = [
        { name: '', value: 'rsshub', domain: 'rsshub.test', path: '/' },
        { name: 'rsshub', value: '', domain: 'rsshub.test', path: '/' },
        { name: 'test', value: 'rsshub', domain: 'rsshub.test', path: '/' },
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
        context = await playwright();
        const page = await context.newPage();
        await page.goto('https://httpbingo.org/cookies/set?foo=bar&baz=qux', {
            waitUntil: 'domcontentloaded',
        });
        expect((await getCookies(page, 'httpbingo.org')).split('; ').toSorted((a, b) => a.localeCompare(b))).toEqual(['foo=bar', 'baz=qux'].toSorted((a, b) => a.localeCompare(b)));
    }, 45000);

    it('setCookies httpbingo', async () => {
        context = await playwright();
        const page = await context.newPage();
        // httpbingo.org cannot recognize cookies with empty name properly, so we cannot use cookieStrAll here
        await setCookies(page, cookieStrExampleCom, 'httpbingo.org');
        await page.goto('https://httpbingo.org/cookies', {
            waitUntil: 'domcontentloaded',
        });
        const data = await page.evaluate(() => JSON.parse(document.body.textContent || ''));
        expect(data.cookies).toEqual(Object.fromEntries(cookieArrayExampleCom.map(({ name, value }) => [name, value])));
    }, 45000);

    it('setCookies & getCookies example.org', async () => {
        context = await playwright();
        const page = await context.newPage();
        // we can use cookieStrAll here!
        await setCookies(page, cookieStrAll, 'example.org');
        await page.goto('https://example.org', {
            waitUntil: 'domcontentloaded',
        });
        expect((await getCookies(page, 'example.org')).split('; ').toSorted((a, b) => a.localeCompare(b))).toEqual(cookieStrAll.split('; ').toSorted((a, b) => a.localeCompare(b)));
    }, 45000);
});

describe('limitContentLength', () => {
    it.each([
        ['returns a document at the limit', 4 * 1024 * 1024, true],
        ['rejects a document over the limit', 4 * 1024 * 1024 + 1, false],
    ])('%s', async (_, length, accepted) => {
        const html = 'x'.repeat(length);
        const page = { content: vi.fn(() => Promise.resolve(html)), url: () => 'https://rsshub.test/' };
        limitContentLength(page);

        await (accepted ? expect(page.content()).resolves.toBe(html) : expect(page.content()).rejects.toThrow(`https://rsshub.test/ rendered to ${length} characters`));
    });
});

describe('limitNavigation', () => {
    it.each(['https://rsshub.test/a', 'http://rsshub.test/a', 'about:blank'])('opens %s', async (url) => {
        const goto = vi.fn((_url: string, _options?: object) => Promise.resolve(null));
        const page = { goto };
        limitNavigation(page);

        await page.goto(url, { waitUntil: 'domcontentloaded' });
        expect(goto).toHaveBeenCalledWith(url, { waitUntil: 'domcontentloaded' });
    });

    it.each(['file:///etc/hostname', 'FILE:///etc/hostname', 'chrome://version', 'view-source:https://rsshub.test/', 'data:text/html,a'])('refuses %s', async (url) => {
        const goto = vi.fn((_url: string, _options?: object) => Promise.resolve(null));
        const page = { goto };
        limitNavigation(page);

        await expect(page.goto(url)).rejects.toThrow('only web pages are opened');
        expect(goto).not.toHaveBeenCalled();
    });

    it('is applied to pages of the browser context', async () => {
        context = await playwright();
        const page = await context.newPage();

        await expect(page.goto('file:///etc/hostname')).rejects.toThrow('only web pages are opened');
        await page.goto('about:blank');
    }, 45000);
});
