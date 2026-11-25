import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderNewsletterDescription } from './templates/description';
import type { NewsletterEntry } from './utils';
import { buildNewsletterUrl, DETAIL_CONCURRENCY, extractMediaImage, fetchSherwoodNextData, fetchSherwoodPageData, hasUnresolvedNewsletterLinks, SNACKS_URL } from './utils';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const mapNewsletterToItem = (entry: NewsletterEntry): DataItem | undefined => {
    const title = entry.fields?.title;
    const slug = entry.fields?.slug?.trim();
    if (!title || !slug) {
        return undefined;
    }
    const link = buildNewsletterUrl(slug);
    const rawDate = entry.fields?.publishedAt || entry.sys?.createdAt;
    const tags = (entry.metadata?.tags ?? []).map((tag) => tag.sys?.id?.trim()).filter((tag): tag is string => Boolean(tag) && tag !== 'hideFromFeed');
    const image = extractMediaImage(entry.fields?.openingAssetMedia)?.src;

    const item: DataItem = {
        title,
        link,
        guid: link,
        description: renderNewsletterDescription(entry),
    };
    if (rawDate) {
        item.pubDate = parseDate(rawDate);
    }
    if (entry.sys?.updatedAt) {
        item.updated = parseDate(entry.sys.updatedAt);
    }
    if (image) {
        item.image = image;
    }
    if (tags.length) {
        item.category = tags;
    }
    return item;
};

const resolveNewsletterEntry = async (entry: NewsletterEntry, slug: string, buildId?: string): Promise<NewsletterEntry> => {
    if (!hasUnresolvedNewsletterLinks(entry)) {
        return entry;
    }
    const detailUrl = buildNewsletterUrl(slug);
    try {
        const cached = await cache.tryGet<NewsletterEntry | undefined>(`sherwood:snacks:${slug}:${entry.sys?.updatedAt ?? ''}`, async () => {
            const pageProps = await fetchSherwoodNextData(detailUrl, buildId);
            return pageProps.newsletter;
        });
        return cached ?? entry;
    } catch {
        return entry;
    }
};

async function handler(ctx): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const { buildId, pageProps } = await fetchSherwoodPageData(SNACKS_URL);
    const latestNewsletters = pageProps.newsletters ?? [];

    const candidates: Array<{ slug: string; entry: NewsletterEntry }> = [];
    const seenSlugs = new Set<string>();

    for (const entry of latestNewsletters) {
        const slug = entry.fields?.slug?.trim();
        if (!slug || !entry.fields?.title || seenSlugs.has(slug)) {
            continue;
        }
        seenSlugs.add(slug);
        candidates.push({ slug, entry });
        if (candidates.length >= limit) {
            break;
        }
    }

    const items = await pMap(
        candidates,
        async ({ slug, entry }) => {
            const resolved = await resolveNewsletterEntry(entry, slug, buildId);
            return mapNewsletterToItem(resolved);
        },
        { concurrency: DETAIL_CONCURRENCY }
    );

    return {
        title: 'Sherwood Snacks',
        description: 'Daily markets, business, and financial culture newsletter from Sherwood News.',
        link: SNACKS_URL,
        language: 'en',
        item: items.filter((item): item is DataItem => Boolean(item)),
    };
}

export const route: Route = {
    path: '/snacks',
    name: 'Snacks',
    url: 'sherwood.news/snacks',
    example: '/sherwood/snacks',
    categories: ['finance'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description: 'Full-text editions of the daily Sherwood Snacks markets and business newsletter (`sherwood.news/snacks`).',
    zh: {
        name: 'Snacks 早报',
        description: '获取 Sherwood News 旗下每日财经与商业早报 Sherwood Snacks 全文内容（`sherwood.news/snacks`）。',
    },
    radar: [
        {
            source: ['sherwood.news/snacks', 'sherwood.news/snacks/newsletters', 'sherwood.news/snacks/newsletters/*'],
            target: '/snacks',
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
