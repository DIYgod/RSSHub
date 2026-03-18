import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://paper.studytimes.cn';
const rootPageUrl = `${rootUrl}/cntheory/`;

type Edition = {
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
    const passthroughPrefixes = ['http://', 'https://', 'data:', 'mailto:', 'javascript:', '#'];

    if (passthroughPrefixes.some((prefix) => url.startsWith(prefix))) {
        return url;
    }

    return new URL(url, baseUrl).href;
};

const extractIssuePath = (html: string) => {
    const issuePath = html.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();

    if (!issuePath) {
        throw new Error('无法从学习时报数字报首页识别最新刊期，请稍后重试。');
    }

    return issuePath;
};

const extractIssueDateText = (issuePath: string) => {
    const match = issuePath.match(/(\d{4}-\d{2})\/(\d{2})\/node_1\.html$/);

    if (!match) {
        throw new Error('无法从学习时报数字报最新刊期链接识别日期，请稍后重试。');
    }

    return `${match[1]}-${match[2]}`;
};

const parseEditionList = ($: ReturnType<typeof load>, baseUrl: string): Edition[] => {
    const seenLinks = new Set<string>();

    return $('.layout-catalogue-item > a[href*="node_"]')
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
        .filter((item): item is Edition => item !== null);
};

const parseArticleList = ($: ReturnType<typeof load>, baseUrl: string, category: string[], issueDateText: string): Article[] => {
    const seenLinks = new Set<string>();

    return $('.news-list a[href*="content_"], area.paperarea[href*="content_"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = item.attr('title')?.trim() || item.text().replaceAll(/\s+/g, ' ').trim();

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
        .filter((item): item is Article => item !== null);
};

const extractAuthor = ($: ReturnType<typeof load>) => {
    const authorLine = $('p.datesource')
        .first()
        .text()
        .replaceAll(/\s+/g, ' ')
        .replace(/\s*字数[:：].*$/, '')
        .trim();

    return authorLine && !authorLine.startsWith('《') ? authorLine : undefined;
};

const extractDetail = (html: string, baseUrl: string, fallbackTitle: string, issueDateText: string, category: string[]) => {
    const $ = load(html);
    const title = $('.main-content h1').first().text().replaceAll(/\s+/g, ' ').trim() || fallbackTitle;
    const content = $('cms-content#content').first();

    content.find('script, style').remove();

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
    const author = extractAuthor($);

    return {
        title,
        ...(description ? { description } : {}),
        pubDate: timezone(parseDate(issueDateText, 'YYYY-MM-DD'), +8),
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
    const issueDateDisplay = issuePage('#cur_dates').first().text().replaceAll(/\s+/g, '').trim() || issueDateText;
    const editions = parseEditionList(issuePage, issueUrl);

    if (!editions.length) {
        throw new Error(`未找到 ${issueDateDisplay} 刊的版面列表，请稍后重试。`);
    }

    const editionResults = await pMap(
        editions,
        async (edition) => {
            const editionHtml = edition.link === issueUrl ? issueHtml : await cache.tryGet(edition.link, () => fetchPage(edition.link));
            const $ = load(editionHtml);

            return parseArticleList($, edition.link, [edition.title], issueDateText);
        },
        { concurrency: 4 }
    );

    const seenLinks = new Set<string>();
    const uniqueArticles = editionResults.flat().filter((item) => {
        if (seenLinks.has(item.link)) {
            return false;
        }

        seenLinks.add(item.link);
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
        title: `学习时报数字报 - ${issueDateDisplay}`,
        link: issueUrl,
        description: '学习时报数字报最新一期全部版面文章',
        language: 'zh-CN',
        item: items,
    };
}

export const route: Route = {
    path: '/newspaper',
    categories: ['traditional-media'],
    example: '/studytimes/newspaper',
    radar: [
        {
            source: ['paper.studytimes.cn/cntheory/'],
            target: '/newspaper',
        },
    ],
    name: '数字报',
    maintainers: ['ZHA30'],
    handler,
    url: 'paper.studytimes.cn',
    description: '抓取学习时报数字报最新一期全部版面文章。',
};
