import { load } from 'cheerio';

import { config } from '@/config';
import { isWorker } from '@/utils/is-worker';
import ofetch from '@/utils/ofetch';

import type { createBrowserClient } from './browser';
import { getSignedHeaders } from './sign';

export const header = {
    'x-api-version': '3.0.91',
};

const fixImageUrl = (url: string) => url.split('?', 1)[0].replace('_b.jpg', '.jpg').replace('_r.jpg', '.jpg').replace('_720w.jpg', '.jpg');

export const processImage = (content: string) => {
    const $ = load(content, null, false);

    $('noscript, a[data-draft-type="mcn-link-card"]').remove();

    $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href?.startsWith('http://link.zhihu.com/?target=') || href?.startsWith('https://link.zhihu.com/?target=')) {
            const url = new URL(href);
            const target = url.searchParams.get('target') || '';
            try {
                $(elem).attr('href', decodeURIComponent(target));
            } catch {
                // sometimes the target is not a valid url
            }
        }
    });

    $('img.content_image, img.origin_image, img.content-image, img.data-actualsrc, figure>img').each((i, e) => {
        if (e.attribs['data-actualsrc']) {
            $(e).attr({
                src: fixImageUrl(e.attribs['data-actualsrc']),
                width: null,
                height: null,
            });
            $(e).removeAttr('data-actualsrc');
        } else if (e.attribs['data-original']) {
            $(e).attr({
                src: fixImageUrl(e.attribs['data-original']),
                width: null,
                height: null,
            });
            $(e).removeAttr('data-original');
        } else {
            $(e).attr({
                src: fixImageUrl(e.attribs.src),
                width: null,
                height: null,
            });
        }
    });

    return $.html();
};

const getCookieValueFrom = (cookieStr: string | undefined, key: string) =>
    cookieStr
        ?.split(';')
        .map((e) => e.trim())
        .find((e) => e.startsWith(key + '='))
        ?.slice(key.length + 1) || '';

export const getCookieValueByKey = (key: string) => getCookieValueFrom(config.zhihu.cookies, key);

export type ZhihuClient = {
    get<T = any>(apiPath: string): Promise<T>;
    getPage(): Promise<string>;
};

export const withZhihuClient = async <T>(pageUrl: string, callback: (client: ZhihuClient) => Promise<T>): Promise<T> => {
    const configured = config.zhihu.cookies || '';
    const dc0 = getCookieValueFrom(configured, 'd_c0');
    const hasConfiguredSession = !!dc0 && !!getCookieValueFrom(configured, '__zse_ck');
    if (!isWorker && !hasConfiguredSession) {
        const { createJSDOMClient } = await import('./jsdom');
        return callback(createJSDOMClient(pageUrl, configured, dc0));
    }

    let browserPromise: ReturnType<typeof createBrowserClient> | undefined;
    const startBrowser = async (apiPath?: string) => {
        const { createBrowserClient } = await import('./browser');
        // Column APIs can initialize directly; other routes need their page session.
        return createBrowserClient(pageUrl, dc0 ? configured : '', apiPath?.startsWith('/api/v4/columns/') ? apiPath : undefined);
    };
    const getBrowser = (apiPath?: string) => (browserPromise ??= startBrowser(apiPath));

    try {
        return await callback({
            get: async <Result = any>(apiPath: string): Promise<Result> => {
                if (!apiPath.startsWith('/api/')) {
                    throw new Error('zhihu: expected an API path');
                }
                if (hasConfiguredSession) {
                    return ofetch<Result>(`https://www.zhihu.com${apiPath}`, {
                        headers: { ...getSignedHeaders(apiPath, dc0), cookie: configured, Referer: pageUrl },
                    });
                }
                return (await getBrowser(apiPath)).get<Result>(apiPath);
            },
            getPage: async () => (hasConfiguredSession ? ofetch<string>(pageUrl, { headers: { cookie: configured, Referer: pageUrl }, parseResponse: (text) => text }) : (await getBrowser()).getPage()),
        });
    } finally {
        let browser: Awaited<ReturnType<typeof createBrowserClient>> | undefined;
        try {
            browser = await browserPromise;
        } catch {
            // Failed initialization already closes its browser before rejecting.
        }
        await browser?.close();
    }
};
