import { load } from 'cheerio';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';

import { createBrowserClient } from './browser';
import { getSignedHeaders } from './sign';

export const header = {
    'x-api-version': '3.0.91',
};

export const processImage = (content: string) => {
    const $ = load(content, null, false);

    $('noscript, a[data-draft-type="mcn-link-card"]').remove();

    $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (!href?.startsWith('http://link.zhihu.com/?target=') && !href?.startsWith('https://link.zhihu.com/?target=')) {
            return;
        }

        const url = new URL(href);
        const target = url.searchParams.get('target') || '';
        try {
            $(elem).attr('href', decodeURIComponent(target));
        } catch {
            // sometimes the target is not a valid url
        }
    });

    $('img.content_image, img.origin_image, img.content-image, img.data-actualsrc, figure>img').each((i, e) => {
        if (e.attribs['data-actualsrc']) {
            $(e).attr({
                src: e.attribs['data-actualsrc'],
                width: null,
                height: null,
            });
            $(e).removeAttr('data-actualsrc');
        } else if (e.attribs['data-original']) {
            $(e).attr({
                src: e.attribs['data-original'],
                width: null,
                height: null,
            });
            $(e).removeAttr('data-original');
        } else {
            $(e).attr({
                src: e.attribs.src,
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

export type ZhihuClient = {
    get<T = any>(apiPath: string): Promise<T>;
    getPage(): Promise<string>;
};

export const withZhihuClient = async <T>(pageUrl: string, callback: (client: ZhihuClient) => Promise<T>): Promise<T> => {
    const configured = config.zhihu.cookies || '';
    const dc0 = getCookieValueFrom(configured, 'd_c0');
    const hasConfiguredSession = !!dc0 && !!getCookieValueFrom(configured, '__zse_ck');

    let browserPromise: ReturnType<typeof createBrowserClient> | undefined;
    // Column APIs can initialize directly; other routes need their page session.
    const getBrowser = (apiPath?: string) => (browserPromise ??= createBrowserClient(pageUrl, dc0 ? configured : '', apiPath?.startsWith('/api/v4/columns/') ? apiPath : undefined));

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
