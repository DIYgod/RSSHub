import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderPostDescription } from './templates/description';
import type { FeedItemWrapper, PostEntry } from './utils';
import { buildPostUrl, DETAIL_CONCURRENCY, extractMediaImage, fetchSherwoodNextData, fetchSherwoodPageData, hasUnresolvedLinks, SITE_ORIGIN } from './utils';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const unwrapPost = (raw: FeedItemWrapper | PostEntry): PostEntry | undefined => {
    if ('entry' in raw) {
        return raw.entry?.sys?.contentType?.sys?.id === 'post' ? raw.entry : undefined;
    }
    if ('sys' in raw && raw.sys?.contentType?.sys?.id === 'post') {
        return raw;
    }
    return undefined;
};

const extractPostTimestamp = (entry: PostEntry): number => {
    const raw = entry.fields?.displayDate || entry.sys?.createdAt;
    if (!raw) {
        return 0;
    }
    return parseDate(raw)?.epochMilliseconds ?? 0;
};

const buildCategories = (entry: PostEntry): string[] => {
    const cats = new Set<string>();
    const prim = entry.fields?.primaryCategory?.fields?.title?.trim() || entry.fields?.vertical?.fields?.title?.trim();
    if (prim) {
        cats.add(prim);
    }
    const tags = entry.metadata?.tags ?? [];
    for (const tag of tags) {
        const id = tag.sys?.id?.trim();
        if (id && id !== 'hideFromFeed') {
            cats.add(id);
        }
    }
    return [...cats];
};

const mapPostToItem = (entry: PostEntry, link: string): DataItem | undefined => {
    const title = entry.fields?.hed;
    if (!title) {
        return undefined;
    }
    const rawDate = entry.fields?.displayDate || entry.sys?.createdAt;
    const authors = (entry.fields?.authors ?? []).map((author) => author.fields?.name?.trim()).filter((name): name is string => Boolean(name));
    const category = buildCategories(entry);
    const articleFields = entry.fields?.article?.fields;
    const image = extractMediaImage(articleFields?.image ?? articleFields?.assetMedia)?.src;

    const item: DataItem = {
        title,
        link,
        guid: link,
        description: renderPostDescription(entry),
    };
    if (rawDate) {
        item.pubDate = parseDate(rawDate);
    }
    if (entry.sys?.updatedAt) {
        item.updated = parseDate(entry.sys.updatedAt);
    }
    if (authors.length) {
        item.author = authors.join(', ');
    }
    if (category.length) {
        item.category = category;
    }
    if (image) {
        item.image = image;
    }
    return item;
};

const resolvePostEntry = async (entry: PostEntry, link: string, buildId?: string): Promise<PostEntry> => {
    const articleFields = entry.fields?.article?.fields;
    const aboveTheFold = articleFields?.bodyContentAboveTheFold;
    const body = articleFields?.bodyContent ?? entry.fields?.bodyContent;
    const belowTheFold = articleFields?.bodyContentBelowTheFold;
    if (body && !hasUnresolvedLinks(body) && !hasUnresolvedLinks(aboveTheFold) && !hasUnresolvedLinks(belowTheFold)) {
        return entry;
    }
    try {
        const cached = await cache.tryGet<PostEntry | undefined>(`sherwood:post:${link}:${entry.sys?.updatedAt ?? ''}`, async () => {
            const pageProps = await fetchSherwoodNextData(link, buildId);
            return pageProps.post;
        });
        return cached ?? entry;
    } catch {
        return entry;
    }
};

async function handler(ctx): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const { buildId, pageProps } = await fetchSherwoodPageData(SITE_ORIGIN);

    const rawEntries = [...(pageProps.mostRecent ?? []), ...(pageProps.feedResponse?.feedItems ?? [])];
    const deduped = new Map<string, PostEntry>();

    for (const raw of rawEntries) {
        const entry = unwrapPost(raw);
        if (!entry) {
            continue;
        }
        const link = buildPostUrl(entry);
        if (link && !deduped.has(link)) {
            deduped.set(link, entry);
        }
    }

    const sorted = [...deduped].toSorted(([, a], [, b]) => extractPostTimestamp(b) - extractPostTimestamp(a)).slice(0, limit);

    const items = await pMap(
        sorted,
        async ([link, entry]) => {
            const resolved = await resolvePostEntry(entry, link, buildId);
            return mapPostToItem(resolved, link);
        },
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: 'Sherwood News',
        description: 'Latest full-text stories from Sherwood News across markets, business, power, and culture.',
        link: SITE_ORIGIN,
        language: 'en',
        item: items.filter((item): item is DataItem => Boolean(item)),
    };
}

export const route: Route = {
    path: '/news',
    name: 'News',
    url: 'sherwood.news',
    example: '/sherwood/news',
    categories: ['finance'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description: 'Latest full-text stories from Sherwood News (`sherwood.news`), preserving embedded charts, images, and stock ticker references.',
    zh: {
        name: '资讯',
        description: '获取 Sherwood News 最新全文资讯文章（`sherwood.news`），完整还原内嵌图表、图片与股票代码标识。',
    },
    radar: [
        {
            source: ['sherwood.news', 'sherwood.news/:category', 'sherwood.news/:category/:slug'],
            target: '/news',
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
