import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://gigazine.net';
const LIST_URL = `${ROOT_URL}/gsc_news/en/`;
const DEFAULT_LIMIT = 10;
const DETAIL_FETCH_DELAY = 3000;
const MAX_CONSECUTIVE_DETAIL_FAILURES = 3;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getRequestOptions = (referer: string) => ({
    headers: {
        Referer: referer,
        'User-Agent': config.trueUA,
    },
});
const getAbsoluteUrl = (path: string | undefined) => (path ? new URL(path, ROOT_URL).href : undefined);
const getArticleAuthor = ($: ReturnType<typeof load>) =>
    $('#article .items p')
        .first()
        .text()
        .match(/Posted by\s+(.+)$/)?.[1]
        ?.trim();
const getArticleCategories = ($: ReturnType<typeof load>) => [
    ...new Set(
        $('#article .items p a[href^="/gsc_news/en/C"]')
            .toArray()
            .map((element) => $(element).text().trim())
            .filter(Boolean)
    ),
];
const getErrorStatus = (error: unknown) => {
    if (!error || typeof error !== 'object') {
        return;
    }

    if ('status' in error && typeof error.status === 'number') {
        return error.status;
    }

    if ('statusCode' in error && typeof error.statusCode === 'number') {
        return error.statusCode;
    }

    if ('response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && typeof error.response.status === 'number') {
        return error.response.status;
    }
};

const fetchDescription = async (item: DataItem) => {
    const articleHtml = await ofetch(item.link!, getRequestOptions(LIST_URL));
    const $ = load(articleHtml);
    const content = $('#article .cntimage');

    content.find('script, .sbn, noscript').remove();
    content.find('h1.title, time.yeartime').remove();

    content.find('img').each((_, img) => {
        const src = $(img).attr('src') ?? $(img).attr('data-src');
        if (src) {
            $(img).attr('src', getAbsoluteUrl(src));
        }
        $(img).removeAttr('data-src');
    });

    content.find('a[href]').each((_, anchor) => {
        const href = $(anchor).attr('href');
        if (href) {
            $(anchor).attr('href', getAbsoluteUrl(href));
        }
    });

    item.description = content.html()?.trim() ?? '';
    item.image = getAbsoluteUrl($('meta[property="og:image"]').attr('content')) ?? item.image;
    item.author = getArticleAuthor($) ?? item.author;
    const categories = getArticleCategories($);
    item.category = categories.length > 0 ? categories : item.category;

    return item;
};

export const route: Route = {
    path: '/en',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/gigazine/en',
    name: 'English News',
    url: 'gigazine.net/gsc_news/en/',
    maintainers: ['chansantheman'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gigazine.net/gsc_news/en/', 'gigazine.net/gsc_news/en'],
            target: '/en',
        },
    ],
    handler,
    description: 'Full-text English articles from GIGAZINE. Detail pages are cached, and the common `limit` parameter controls how many recent entries are fetched.',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '', 10) || DEFAULT_LIMIT;

    const html = await ofetch(LIST_URL, getRequestOptions(ROOT_URL));
    const $ = load(html);

    const list: DataItem[] = $('.card')
        .toArray()
        .map((el) => {
            const card = $(el);
            const anchor = card.find('h2 a');
            const path = anchor.attr('href');
            const link = path ? new URL(path, ROOT_URL).href : undefined;
            const title = anchor.find('span').text();
            const pubDate = parseDate(card.find('time').attr('datetime') ?? '');
            const category = card.find('.catab').text().trim();
            const imagePath = card.find('.thumb img').attr('src') ?? card.find('.thumb img').attr('data-src');

            return {
                title,
                link,
                pubDate,
                category: category ? [category] : undefined,
                image: imagePath ? new URL(imagePath, ROOT_URL).href : undefined,
            };
        })
        .filter((item) => item.title && item.link)
        .slice(0, limit);

    let detailRequestCount = 0;
    let consecutiveDetailFailures = 0;
    let shouldSkipRemainingDetails = false;

    const items = await pMap(
        list,
        async (item) => {
            if (shouldSkipRemainingDetails || consecutiveDetailFailures >= MAX_CONSECUTIVE_DETAIL_FAILURES) {
                return item;
            }

            try {
                const detailedItem = await cache.tryGet(item.link!, async () => {
                    if (detailRequestCount > 0) {
                        await delay(DETAIL_FETCH_DELAY);
                    }
                    detailRequestCount++;

                    return fetchDescription(item);
                });

                consecutiveDetailFailures = 0;

                return detailedItem;
            } catch (error) {
                const status = getErrorStatus(error);
                consecutiveDetailFailures++;
                shouldSkipRemainingDetails = status === 403 || status === 429;
                return item;
            }
        },
        { concurrency: 1 }
    );

    return {
        title: 'GIGAZINE - English News',
        link: LIST_URL,
        language: 'en',
        item: items,
    };
}
