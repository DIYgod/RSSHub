import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ROOT_URL = 'https://epaper.bjnews.com.cn';

type EpaperCalendar = Record<string, Record<string, string[]>>;

type EpaperArticle = {
    articleAuthor: string;
    articleContent: string;
    articleHref: string;
    articleIssueDate: string;
    mainTitle: string;
};

type EpaperPage = {
    issueDate: string;
    onePageArticleList: EpaperArticle[];
    pageHref: string;
    pageName: string;
    pageNo: string;
};

type EpaperListItem = {
    author?: string;
    category?: string[];
    issueDate?: string;
    link: string;
    title: string;
    fallbackContent?: string;
};

export const route: Route = {
    path: '/epaper',
    categories: ['traditional-media'],
    example: '/bjnews/epaper',
    features: {},
    radar: [
        {
            source: ['epaper.bjnews.com.cn/'],
            target: '/epaper',
        },
    ],
    name: '电子报',
    maintainers: ['dzx-dzx'],
    handler,
    url: 'epaper.bjnews.com.cn',
};

function normalizeIssueDate(date: string) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function buildCategory(pageNo?: string, pageName?: string) {
    if (!pageNo) {
        return;
    }
    const trimmedName = pageName?.trim();
    return [trimmedName ? `第${pageNo}版：${trimmedName}` : `第${pageNo}版`];
}

function fetchArticleDetail(item: EpaperListItem) {
    return cache.tryGet(item.link, async () => {
        const response = await ofetch<string, 'text'>(item.link, {
            responseType: 'text',
            headers: {
                'User-Agent': config.trueUA,
            },
        });
        const $ = load(response);
        const content = $('.article-detail .content').first();
        const description = content.length ? content.html() : item.fallbackContent;

        return {
            title: item.title,
            link: item.link,
            ...(description ? { description } : {}),
            ...(item.issueDate ? { pubDate: timezone(parseDate(item.issueDate, 'YYYY-MM-DD'), +8) } : {}),
            ...(item.author ? { author: item.author } : {}),
            ...(item.category ? { category: item.category } : {}),
        };
    });
}

async function getLatestIssueDate() {
    const cached = await cache.tryGet('bjnews:epaper:latest-date', async () => {
        const calendar = await ofetch<EpaperCalendar>(`${ROOT_URL}/period/yearMonthDay.json`, {
            headers: {
                'User-Agent': config.trueUA,
            },
        });

        let latest = '';

        for (const year of Object.values(calendar)) {
            for (const month of Object.values(year)) {
                for (const date of month) {
                    if (date > latest) {
                        latest = date;
                    }
                }
            }
        }

        if (!latest) {
            throw new Error('无法从年历数据中获取最新刊期，请稍后重试。');
        }

        return latest;
    });

    const latestText = typeof cached === 'string' ? cached : typeof cached === 'number' ? String(cached) : '';

    if (!/^\d{8}$/.test(latestText)) {
        throw new Error('无法从年历数据中获取最新刊期，请稍后重试。');
    }

    return latestText;
}

async function handler(ctx) {
    const issueDate = await getLatestIssueDate();
    const issueYear = issueDate.slice(0, 4);
    const issueDateText = normalizeIssueDate(issueDate);
    const dataUrl = `${ROOT_URL}/html/${issueYear}/${issueDate}/data.json`;

    let pages: EpaperPage[];

    try {
        pages = await cache.tryGet(`bjnews:epaper:data:${issueDate}`, () =>
            ofetch<EpaperPage[]>(dataUrl, {
                headers: {
                    'User-Agent': config.trueUA,
                },
            })
        );
    } catch {
        throw new Error(`无法获取最新刊期（${issueDateText}）的版面数据，请稍后重试。`);
    }

    if (!pages.length) {
        throw new Error(`未找到最新刊期（${issueDateText}）的版面数据，请稍后重试。`);
    }

    const items = pages.flatMap((page) => {
        const category = buildCategory(page.pageNo, page.pageName);
        const pageDir = `${issueDate}_${page.pageNo}`;
        const pageBaseUrl = `${ROOT_URL}/html/${issueYear}/${issueDate}/${pageDir}/`;

        return (page.onePageArticleList ?? []).flatMap((article) => {
            if (!article.articleHref || !article.mainTitle) {
                return [];
            }

            const link = new URL(article.articleHref, pageBaseUrl).href;
            const author = article.articleAuthor?.trim() || undefined;
            const issueDate = article.articleIssueDate?.trim() || undefined;
            const item: EpaperListItem = {
                title: article.mainTitle,
                link,
                issueDate,
                author,
                category,
                fallbackContent: article.articleContent,
            };

            return [item];
        });
    });

    const limitParam = ctx.req.query('limit');
    const limit = limitParam ? Number.parseInt(limitParam) : undefined;
    const filteredItems = limit ? items.slice(0, limit) : items;
    const detailItems = await pMap(filteredItems, (item) => fetchArticleDetail(item), { concurrency: 4 });

    const firstPage = pages[0];
    const firstPageDir = `${issueDate}_${firstPage.pageNo}`;
    const firstPageUrl = new URL(firstPage.pageHref, `${ROOT_URL}/html/${issueYear}/${issueDate}/${firstPageDir}/`).href;

    return {
        title: `新京报 - 电子报 - ${issueDateText}`,
        link: firstPageUrl,
        item: detailItems,
    };
}
