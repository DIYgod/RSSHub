import type { Cheerio, CheerioAPI, Element } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { getCookies } from '@/utils/puppeteer-utils';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.globalpeople.com.cn';
const defaultLimit = 10;
const requestUserAgent = 'curl/8.7.1';
const detailConcurrency = 1;
const cookieCacheAge = 8 * 60;
const cookieDomain = 'www.globalpeople.com.cn';
const listReadySelector = '.lists_jiaodian_lists';

type SectionConfig = {
    name: string;
    listPath: string;
};

export const supportedSections: Record<string, SectionConfig> = {
    '305917': {
        name: '国内',
        listPath: '/305917/index.html',
    },
    '305916': {
        name: '国际',
        listPath: '/305916/index.html',
    },
};

type ListItem = {
    title: string;
    link: string;
    pubDate?: Date;
};

type SessionState = {
    cookie: string;
};

const getCookieCacheKey = (url: string) => `globalpeople:cookie:${new URL(url).pathname}`;

const getFreshCookie = async (url: string) => {
    const browser = await puppeteer();
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });

    try {
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });
        await page.waitForSelector(listReadySelector);

        const cookie = await getCookies(page, cookieDomain);

        if (!cookie) {
            throw new Error(`Failed to get anti-bot cookie for ${url}`);
        }

        return cookie;
    } finally {
        await page.close();
        await browser.close();
    }
};

const getCookie = async (url: string, forceRefresh = false) => {
    const cacheKey = getCookieCacheKey(url);

    if (forceRefresh) {
        const cookie = await getFreshCookie(url);
        cache.set(cacheKey, cookie, cookieCacheAge);
        return cookie;
    }

    return cache.tryGet(cacheKey, () => getFreshCookie(url), cookieCacheAge, false);
};

const is403Error = (error: unknown) =>
    typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null && 'status' in error.response
        ? error.response.status === 403
        : String(error).includes('403 Forbidden');

const requestPage = (url: string, referer: string, cookie: string) =>
    ofetch<string, 'text'>(url, {
        responseType: 'text',
        headers: {
            'User-Agent': requestUserAgent,
            Referer: referer,
            Cookie: cookie,
        },
    });

const fetchPage = async (url: string, referer: string, session: SessionState, cookieSourceUrl: string) => {
    try {
        return await requestPage(url, referer, session.cookie);
    } catch (error) {
        if (!is403Error(error)) {
            throw error;
        }

        session.cookie = await getCookie(cookieSourceUrl, true);
        return requestPage(url, referer, session.cookie);
    }
};

const normalizeText = (text?: string) => text?.replaceAll(/\s+/g, ' ').trim() ?? '';

const parsePubDate = (value?: string) => {
    const text = normalizeText(value);

    if (!text) {
        return;
    }

    return timezone(parseDate(text, ['YYYY-MM-DD HH:mm', 'YYYY年MM月DD日 HH:mm', 'YYYY年MM月DD日HH:mm']), +8);
};

const resolveRelativeUrl = (value: string, baseUrl: string) => {
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('javascript:') || value.startsWith('#')) {
        return value;
    }

    return new URL(value, baseUrl).href;
};

const resolveRelativeLinks = ($: CheerioAPI, content: Cheerio<Element>, baseUrl: string) => {
    content.find('img').each((_, element) => {
        const item = $(element);
        const src = item.attr('src') ?? item.attr('data-src') ?? item.attr('data-original');

        if (src) {
            item.attr('src', resolveRelativeUrl(src, baseUrl));
        }
    });

    content.find('video').each((_, element) => {
        const item = $(element);
        const poster = item.attr('poster');

        if (poster) {
            item.attr('poster', resolveRelativeUrl(poster, baseUrl));
        }
    });

    content.find('a').each((_, element) => {
        const item = $(element);
        const href = item.attr('href');

        if (href) {
            item.attr('href', resolveRelativeUrl(href, baseUrl));
        }
    });
};

const parseKeywords = ($: CheerioAPI) =>
    normalizeText($('#keyword_bot').text())
        .split(/[，,]/)
        .map((keyword) => normalizeText(keyword))
        .filter(Boolean);

const parseAuthor = ($: CheerioAPI) => {
    const meta = $('.show_msg_l span')
        .toArray()
        .map((element) => normalizeText($(element).text()));
    const source = meta
        .find((text) => text.startsWith('来源：'))
        ?.replace(/^来源：/, '')
        .trim();
    const author = meta
        .find((text) => text.startsWith('作者：'))
        ?.replace(/^作者：/, '')
        .trim();

    return author || source || undefined;
};

const getListItems = ($: CheerioAPI, currentUrl: string, limit: number) =>
    $('.lists_jiaodian_lists > a.lists_item')
        .toArray()
        .slice(0, limit)
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = normalizeText(item.find('.lists_item_title').text());

            if (!href || !title) {
                return null;
            }

            return {
                title,
                link: new URL(href, currentUrl).href,
                pubDate: parsePubDate(item.find('.lists_item_time').text()),
            };
        })
        .filter((item): item is ListItem => item !== null);

export async function handleSection(ctx: Context, id: string) {
    const section = supportedSections[id];
    const currentUrl = new URL(section.listPath, rootUrl).href;
    const limitQuery = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const limit = Number.isNaN(limitQuery) || limitQuery <= 0 ? defaultLimit : limitQuery;
    const session: SessionState = {
        cookie: await getCookie(currentUrl),
    };

    const response = await fetchPage(currentUrl, rootUrl, session, currentUrl);
    const $: CheerioAPI = load(response);

    let items = getListItems($, currentUrl, limit);

    items = await pMap(
        items,
        async (item) => {
            try {
                return await cache.tryGet(item.link, async () => {
                    const detailResponse = await fetchPage(item.link, currentUrl, session, currentUrl);
                    const detailPage: CheerioAPI = load(detailResponse);
                    const content = detailPage('.show_content').first().clone();

                    content.find('script, style, center:empty').remove();
                    resolveRelativeLinks(detailPage, content, item.link);

                    const description = content.html()?.trim();
                    const pubDate = parsePubDate(detailPage('.show_msg_l span').first().text()) ?? item.pubDate;
                    const author = parseAuthor(detailPage);
                    const category = parseKeywords(detailPage);

                    return {
                        ...item,
                        ...(description ? { description } : {}),
                        ...(pubDate ? { pubDate } : {}),
                        ...(author ? { author } : {}),
                        ...(category.length > 0 ? { category } : {}),
                    };
                });
            } catch {
                return item;
            }
        },
        { concurrency: detailConcurrency }
    );

    const description = normalizeText($('meta[name="description"]').attr('content'));

    return {
        title: `${section.name} - 环球人物网`,
        link: currentUrl,
        ...(description ? { description } : {}),
        language: 'zh-CN',
        item: items,
    };
}
