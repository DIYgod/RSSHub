import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

import { fetchArticle, fetchScreen, removeDuplicateByKey } from './utils';

const HOME_PAGE = 'https://apnews.com';

const getArticleLink = (href?: string) => {
    if (!href) {
        return;
    }
    const url = URL.parse(href, HOME_PAGE);
    if (url?.origin === HOME_PAGE && !url.username && !url.password && /^\/(?:article|live|video|photo-gallery)\//.test(url.pathname)) {
        return url.href;
    }
};

async function fetchSection(category: string): Promise<Data> {
    const path = category === 'index' ? '/' : `/${category}`;
    const screen = await fetchScreen(path);
    const modules = (screen.main ?? []).flatMap((module) => (module.__typename === 'ColumnContainer' ? (module.columns ?? []) : [module]));
    const items = modules
        .filter((module) => module?.__typename === 'PageListModule')
        .flatMap((module) => module.items ?? [])
        .flatMap((entry): DataItem[] => {
            if (entry.__typename !== 'PagePromo' || !entry.title || (category !== 'index' && (!screen.category || entry.category !== screen.category))) {
                return [];
            }
            const link = getArticleLink(entry.url);
            return link
                ? [
                      {
                          title: entry.title,
                          link,
                          description: entry.description,
                          category: entry.category ?? undefined,
                          pubDate: entry.publishDateStamp ? parseDate(entry.publishDateStamp) : undefined,
                      },
                  ]
                : [];
        });

    return {
        title: screen.title,
        link: HOME_PAGE + path,
        description: screen.description,
        language: screen.language as Language,
        item: removeDuplicateByKey(items, 'link') as DataItem[],
    };
}

async function fetchFeed(category: string): Promise<Data> {
    const feed = await parser.parseURL(`${HOME_PAGE}/${category}.rss`);
    const item = feed.items.flatMap((entry) => {
        const link = getArticleLink(entry.link);
        if (!entry.title || !link) {
            return [];
        }
        return {
            title: entry.title,
            link,
            guid: typeof entry.guid === 'string' ? entry.guid : undefined,
            description: entry['content:encoded'] ?? entry.content ?? entry.contentSnippet,
            pubDate: entry.pubDate ? parseDate(entry.pubDate) : undefined,
            author: entry.creator ?? entry.author,
            category: entry.categories,
        };
    });
    return {
        title: feed.title ?? 'AP News',
        link: feed.link,
        description: feed.description,
        language: feed.language,
        image: feed.image?.url,
        item,
    };
}

export const route: Route = {
    path: '/rss/:category?',
    categories: ['traditional-media'],
    example: '/apnews/rss/business',
    view: ViewType.Articles,
    parameters: {
        category: {
            description: 'Category from the first segment of the corresponding site, or `index` for the front page.',
            default: 'index',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['apnews.com/:category'],
            target: '/rss/:category',
        },
    ],
    name: 'News',
    maintainers: ['zoenglinghou', 'mjysci', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const { category = 'index' } = ctx.req.param();
    if (!/^[\da-z-]+$/i.test(category)) {
        throw new InvalidParameterError('Use the first path segment of an AP News section, for example business.');
    }
    let official: Data | undefined;
    try {
        official = await fetchFeed(category);
    } catch {
        // Some AP sections only expose listings via the official mobile interface.
    }
    const feed = official?.item?.length ? official : await fetchSection(category);

    if (ctx.req.query('fulltext') !== 'true' || !feed.item?.length) {
        return feed;
    }
    const limit = getRouteLimit(ctx, 20);
    const ordered = ctx.req.query('sorted') === 'false' ? feed.item : feed.item.toSorted((first, second) => +new Date(second.pubDate ?? 0) - +new Date(first.pubDate ?? 0));
    const results = await pMap(
        ordered.slice(0, limit),
        async (item) => {
            try {
                const details = await fetchArticle({ title: item.title, link: item.link });
                if (details.description && details.description !== item.description) {
                    return { item: { ...item, ...details, guid: item.guid ?? details.guid }, fulltext: true };
                }
            } catch {
                // Preserve a summary if just one article is unavailable.
            }
            return { item, fulltext: false };
        },
        { concurrency: 3 }
    );
    if (results.every((result) => !result.fulltext)) {
        throw new Error('AP News article content is unavailable. Remove fulltext=true to subscribe to the official section summaries.');
    }
    return { ...feed, item: results.map((result) => result.item) };
}
