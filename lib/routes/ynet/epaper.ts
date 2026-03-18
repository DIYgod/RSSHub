import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://epaper.ynet.com';
const rootPageUrl = `${rootUrl}/paperindex.htm`;

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

const fetchPage = (url: string) =>
    ofetch<string, 'text'>(url, {
        responseType: 'text',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

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

const extractIssuePath = (html: string) => {
    const $ = load(html);
    const refreshContent = $('meta[http-equiv="REFRESH"], meta[http-equiv="refresh"]').attr('content');
    const issuePath = refreshContent?.match(/URL=(.+)$/i)?.[1]?.trim() ?? html.match(/URL=([^"' >]+)/i)?.[1]?.trim();

    if (!issuePath) {
        throw new Error('无法从电子报首页识别最新刊期，请稍后重试。');
    }

    return issuePath;
};

const extractIssueDateText = (issuePath: string) => {
    const match = issuePath.match(/html\/(\d{4}-\d{2})\/(\d{2})\//);

    if (!match) {
        throw new Error('无法从电子报首页识别最新刊期日期，请稍后重试。');
    }

    return `${match[1]}-${match[2]}`;
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
    const rootHtml = await fetchPage(rootPageUrl);
    const issuePath = extractIssuePath(rootHtml);
    const issueDateText = extractIssueDateText(issuePath);
    const issueUrl = new URL(issuePath, rootPageUrl).href;
    const issueHtml = await fetchPage(issueUrl);
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
            target: '/epaper',
        },
    ],
    name: '北京青年报电子版',
    maintainers: ['ZHA30'],
    handler,
    url: 'epaper.ynet.com',
    description: '抓取北京青年报电子版最新一期全部版面文章。',
};
