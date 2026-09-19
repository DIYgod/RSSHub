import { getPlaywrightPage } from '@/utils/playwright';

import { getSignedHeaders } from './sign';
import type { ZhihuClient } from './utils';

const origin = 'https://www.zhihu.com';
const allowedResources = new Set(['document', 'script', 'xhr', 'fetch']);

const parseApiResponse = <T>(body: string): T => {
    try {
        return JSON.parse(body) as T;
    } catch {
        throw new Error('zhihu: browser API request did not return JSON');
    }
};

export const createBrowserClient = async (url: string, configuredCookies: string, initialApiPath?: string): Promise<ZhihuClient & { close(): Promise<void> }> => {
    const { page, context, destroy } = await getPlaywrightPage(url, { noGoto: true, closeTimeout: 0 });
    let phase = 'cookie setup';
    try {
        const cookies = configuredCookies
            .split(';')
            .map((pair) => pair.trim())
            .filter((pair) => pair.indexOf('=') > 0)
            .map((pair) => {
                const separator = pair.indexOf('=');
                return { name: pair.slice(0, separator), value: pair.slice(separator + 1), domain: '.zhihu.com', path: '/' };
            });
        if (cookies.length) {
            await context.addCookies(cookies);
        }
        await page.route('**/*', (route) => (allowedResources.has(route.request().resourceType()) ? route.continue() : route.abort()));

        if (cookies.every((cookie) => cookie.name !== 'd_c0' || !cookie.value)) {
            // Content pages may not issue the guest identity cookie themselves.
            phase = 'guest cookie initialization';
            await page.goto(`${origin}/explore`, { waitUntil: 'domcontentloaded' });
            const guestCookies = await context.cookies(origin);
            if (guestCookies.every((cookie) => cookie.name !== 'd_c0' || !cookie.value)) {
                throw new Error('The browser did not receive a guest d_c0 cookie');
            }
        }

        phase = 'page navigation';
        const response = await page.goto(initialApiPath ? `${origin}${initialApiPath}` : url, { waitUntil: 'domcontentloaded' });
        // Some APIs return JSON without issuing __zse_ck. Only HTML responses
        // need the browser's page scripts to finish initializing that cookie.
        const isJson = response?.headers()['content-type']?.includes('application/json');
        if (!isJson) {
            phase = 'session cookie wait';
            await page.waitForFunction(() => document.cookie.split(';').some((pair) => pair.trimStart().startsWith('__zse_ck=')), undefined, { timeout: 10000 });
        }

        phase = 'session cookie validation';
        const browserCookies = await context.cookies(origin);
        const requiredCookies = isJson ? ['d_c0'] : ['d_c0', '__zse_ck'];
        if (requiredCookies.some((name) => browserCookies.every((cookie) => cookie.name !== name || !cookie.value))) {
            throw new Error('The browser did not receive the required cookies');
        }
        let initialResponse = initialApiPath && isJson && response && response.status() >= 200 && response.status() < 300 ? { apiPath: initialApiPath, body: await response.text() } : undefined;

        return {
            get: async <T = any>(apiPath: string): Promise<T> => {
                if (initialResponse?.apiPath === apiPath) {
                    const { body } = initialResponse;
                    initialResponse = undefined;
                    return parseApiResponse<T>(body);
                }
                // Keep API requests in Chrome so they use the same network,
                // cookies and user-agent as the session that created them.
                if (new URL(page.url()).origin !== origin) {
                    await page.goto(`${origin}/explore`, { waitUntil: 'domcontentloaded' });
                }
                const currentCookies = await context.cookies(origin);
                const dc0 = currentCookies.find((cookie) => cookie.name === 'd_c0')?.value;
                if (!dc0) {
                    throw new Error('zhihu: the browser session lost its d_c0 cookie');
                }
                const result = await page.evaluate(
                    async ({ apiUrl, headers }) => {
                        const response = await fetch(apiUrl, { headers, credentials: 'include', signal: window.AbortSignal.timeout(30000) });
                        return { status: response.status, body: await response.text() };
                    },
                    { apiUrl: `${origin}${apiPath}`, headers: getSignedHeaders(apiPath, dc0) }
                );
                if (result.status < 200 || result.status >= 300) {
                    throw new Error(`zhihu: browser API request failed with HTTP ${result.status}`);
                }
                return parseApiResponse<T>(result.body);
            },
            getPage: async () => {
                await page.goto(url, { waitUntil: 'domcontentloaded' });
                return page.content();
            },
            close: destroy,
        };
    } catch {
        await destroy();
        throw new Error(`zhihu: browser session failed during ${phase}. Configure ZHIHU_COOKIES with an accessible session containing d_c0 and __zse_ck.`);
    }
};
