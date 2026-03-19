import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { generateHeaders, PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://epaper.ynet.com';
const calendarUrl = 'https://cal.ynet.com/showCalendar2.php';
const calendarMonthOffsets = [0, -1, -2];
const browserHeaders = {
    ...generateHeaders(PRESETS.MODERN_WINDOWS_CHROME),
    Referer: rootUrl,
};

type Page = {
    title: string;
    link: string;
};

type Article = {
    title: string;
    link: string;
    category: string[];
    issueDateText: string;
};

type Issue = {
    issueDateText: string;
    issueUrl: string;
};

const swapProtocol = (url: string) => {
    const urlObject = new URL(url);
    urlObject.protocol = urlObject.protocol === 'https:' ? 'http:' : 'https:';

    return urlObject.href;
};

const fetchPage = async (url: string) => {
    const request = (targetUrl: string) =>
        ofetch<string, 'text'>(targetUrl, {
            responseType: 'text',
            headers: browserHeaders,
        });

    try {
        return await request(url);
    } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        const urlObject = new URL(url);

        if (status !== 403 || urlObject.hostname !== 'epaper.ynet.com') {
            throw error;
        }

        return request(swapProtocol(url));
    }
};

const resolveRelativeUrl = (url: string, baseUrl: string) => {
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
        return url;
    }

    return new URL(url, baseUrl).href;
};

const extractFounderField = (html: string, field: string) => {
    const match = html.match(new RegExp(`<founder-${field}>\\s*([\\s\\S]*?)\\s*<\\/founder-${field}>`, 'i'));
    const value = match?.[1]?.replaceAll(/\s+/g, ' ').trim();

    return value || undefined;
};

const getCalendarMonthKey = (date: Date) => `${date.getFullYear()}${date.getMonth() + 1}`;

const getCalendarMonthDate = (offset: number) => {
    const chinaNow = timezone(new Date(), +8);

    return new Date(chinaNow.getFullYear(), chinaNow.getMonth() + offset, 1);
};

const normalizeIssueUrl = (url: string) => {
    const urlObject = new URL(url, rootUrl);

    if (urlObject.hostname === 'epaper.ynet.com') {
        urlObject.protocol = 'https:';
    }

    return urlObject.href;
};

const extractIssueDateText = (issuePath: string) => {
    const match = issuePath.match(/html\/(\d{4}-\d{2})\/(\d{2})\//);

    if (!match) {
        throw new Error('无法从电子报首页识别最新刊期日期，请稍后重试。');
    }

    return `${match[1]}-${match[2]}`;
};

const parseCalendarIssues = ($: ReturnType<typeof load>): Issue[] => {
    const seenLinks = new Set<string>();

    return $('a[href*="node_1331.htm"]')
        .toArray()
        .map((element) => {
            const href = $(element).attr('href');

            if (!href) {
                return null;
            }

            const issueUrl = normalizeIssueUrl(href);

            if (seenLinks.has(issueUrl)) {
                return null;
            }

            seenLinks.add(issueUrl);

            return {
                issueDateText: extractIssueDateText(issueUrl),
                issueUrl,
            };
        })
        .filter((issue): issue is Issue => issue !== null);
};

const getLatestIssue = async () => {
    const issues = (
        await pMap(
            calendarMonthOffsets.map((offset) => getCalendarMonthDate(offset)),
            async (monthDate) => {
                const monthKey = getCalendarMonthKey(monthDate);
                const calendarHtml = await cache.tryGet(`ynet:epaper:calendar:${monthKey}`, () => fetchPage(`${calendarUrl}?ym=${monthKey}`));
                const $ = load(calendarHtml);

                return parseCalendarIssues($);
            },
            { concurrency: calendarMonthOffsets.length }
        )
    )
        .flat()
        .toSorted((a, b) => a.issueDateText.localeCompare(b.issueDateText));

    const latestIssue = issues.at(-1);

    if (!latestIssue) {
        throw new Error('无法从电子报月历中识别最新刊期，请稍后重试。');
    }

    return latestIssue;
};

const parsePageList = ($: ReturnType<typeof load>, baseUrl: string): Page[] => {
    const seenLinks = new Set<string>();

    return $('#artcile_list_wapper a[href*="node_"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = item.text().replaceAll(/\s+/g, ' ').trim();

            if (!href || !title) {
                return null;
            }

            const link = new URL(href, baseUrl).href;

            if (seenLinks.has(link)) {
                return null;
            }

            seenLinks.add(link);

            return {
                title,
                link,
            };
        })
        .filter((page): page is Page => page !== null);
};

const parseArticleList = ($: ReturnType<typeof load>, baseUrl: string, category: string[], issueDateText: string): Article[] => {
    const seenLinks = new Set<string>();

    return $('ul.jcul a[href*="content_"][href*="div=-1"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = item.text().replaceAll(/\s+/g, ' ').trim();

            if (!href || !title) {
                return null;
            }

            const link = new URL(href, baseUrl).href;

            if (seenLinks.has(link)) {
                return null;
            }

            seenLinks.add(link);

            return {
                title,
                link,
                category,
                issueDateText,
            };
        })
        .filter((article): article is Article => article !== null);
};

const extractDetail = (html: string, baseUrl: string, fallbackTitle: string, fallbackIssueDateText: string, category: string[]) => {
    const $ = load(html);
    const title = $('h1').first().text().replaceAll(/\s+/g, ' ').trim() || fallbackTitle;
    const content = $('.contnt').first();

    content.find('input[name="titlecheckbox"], script, style').remove();

    content.find('img').each((_, element) => {
        const item = $(element);
        const src = item.attr('src');

        if (src) {
            item.attr('src', resolveRelativeUrl(src, baseUrl));
        }
    });

    content.find('a').each((_, element) => {
        const item = $(element);
        const href = item.attr('href');

        if (href) {
            item.attr('href', resolveRelativeUrl(href, baseUrl));
        }
    });

    const description = content.html()?.trim() || undefined;
    const issueDateText = extractFounderField(html, 'date') ?? fallbackIssueDateText;
    const author = extractFounderField(html, 'author');

    return {
        title,
        ...(description ? { description } : {}),
        ...(issueDateText ? { pubDate: timezone(parseDate(issueDateText, 'YYYY-MM-DD'), +8) } : {}),
        ...(author ? { author } : {}),
        category,
    };
};

async function handler(ctx) {
    const { issueDateText, issueUrl } = await getLatestIssue();
    const issueHtml = await cache.tryGet(issueUrl, () => fetchPage(issueUrl));
    const issuePage = load(issueHtml);
    const pages = parsePageList(issuePage, issueUrl);

    if (!pages.length) {
        throw new Error(`未找到 ${issueDateText} 刊的版面列表，请稍后重试。`);
    }

    const pageArticles = await pMap(
        pages,
        async (page) => {
            const pageHtml = page.link === issueUrl ? issueHtml : await cache.tryGet(page.link, () => fetchPage(page.link));
            const $ = load(pageHtml);

            return parseArticleList($, page.link, [page.title], issueDateText);
        },
        { concurrency: 4 }
    );

    const seenLinks = new Set<string>();
    const uniqueArticles = pageArticles.flat().filter((article) => {
        if (seenLinks.has(article.link)) {
            return false;
        }

        seenLinks.add(article.link);
        return true;
    });

    const limit = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const articlesToFetch = Number.isNaN(limit) ? uniqueArticles : uniqueArticles.slice(0, limit);
    const items = await pMap(
        articlesToFetch,
        (article) =>
            cache.tryGet(article.link, async () => {
                const detailHtml = await fetchPage(article.link);

                return {
                    link: article.link,
                    ...extractDetail(detailHtml, article.link, article.title, article.issueDateText, article.category),
                };
            }),
        { concurrency: 4 }
    );

    return {
        title: `北京青年报电子版 - ${issueDateText}`,
        link: issueUrl,
        description: '北京青年报电子版最新一期全部版面文章',
        item: items,
    };
}

export const route: Route = {
    path: '/epaper',
    categories: ['traditional-media'],
    example: '/ynet/epaper',
    radar: [
        {
            source: ['epaper.ynet.com/'],
            target: '/ynet/epaper',
        },
    ],
    name: '北京青年报电子版',
    maintainers: ['ZHA30'],
    handler,
    url: 'epaper.ynet.com',
    description: '抓取北京青年报电子版最新一期全部版面文章。',
};
