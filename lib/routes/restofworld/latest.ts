import pMap from 'p-map';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderArticleDescription } from './templates/description';
import type { RestOfWorldArticleContent, RestOfWorldCandidate } from './utils';
import { DETAIL_CONCURRENCY, extractFeedCandidates, fetchText, LATEST_FEED_URL, LATEST_URL, parseArticleDetail } from './utils';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const collectCandidates = async (limit: number): Promise<RestOfWorldCandidate[]> => {
    const feedXml = await fetchText(LATEST_FEED_URL);
    const collected = new Map<string, RestOfWorldCandidate>();

    for (const candidate of extractFeedCandidates(feedXml)) {
        if (!collected.has(candidate.link)) {
            collected.set(candidate.link, candidate);
        }
    }

    return collected.values().toArray().slice(0, limit);
};

const toFallbackItem = (candidate: RestOfWorldCandidate): DataItem | undefined => {
    if (!candidate.title) {
        return undefined;
    }
    const item: DataItem = {
        title: candidate.title,
        link: candidate.link,
        guid: candidate.link,
        description: candidate.description ?? '',
    };
    if (candidate.rawPubDate) {
        item.pubDate = parseDate(candidate.rawPubDate);
    }
    if (candidate.author) {
        item.author = candidate.author;
    }
    if (candidate.image) {
        item.image = candidate.image;
    }
    return item;
};

const toArticleDataItem = (detail: RestOfWorldArticleContent, link: string): DataItem | undefined => {
    if (!detail.title) {
        return undefined;
    }
    const item: DataItem = {
        title: detail.title,
        link,
        guid: link,
        description: renderArticleDescription(detail),
    };
    if (detail.rawPubDate) {
        item.pubDate = parseDate(detail.rawPubDate);
    }
    if (detail.rawUpdatedAt) {
        item.updated = parseDate(detail.rawUpdatedAt);
    }
    if (detail.author) {
        item.author = detail.author;
    }
    if (detail.categories.length) {
        item.category = detail.categories;
    }
    if (detail.heroImageUrl) {
        item.image = detail.heroImageUrl;
    }
    return item;
};

const fetchArticleItem = async (candidate: RestOfWorldCandidate): Promise<DataItem | undefined> => {
    try {
        const detail = await cache.tryGet<RestOfWorldArticleContent>(
            `restofworld:article:${candidate.link}`,
            async () => {
                const html = await fetchText(candidate.link);
                const parsed = parseArticleDetail(html, candidate);
                if (!parsed.bodyHtml.trim()) {
                    throw new Error('Missing article body');
                }
                return parsed;
            },
            config.cache.contentExpire,
            false
        );
        return detail ? toArticleDataItem(detail, candidate.link) : toFallbackItem(candidate);
    } catch {
        return toFallbackItem(candidate);
    }
};

async function handler(ctx): Promise<Data> {
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);
    const candidates = await collectCandidates(limit);
    const items = await pMap(candidates, fetchArticleItem, { concurrency: DETAIL_CONCURRENCY });

    return {
        title: 'Rest of World - Latest',
        description: 'Latest full-text stories from Rest of World covering global technology outside the West.',
        link: LATEST_URL,
        language: 'en',
        item: items.filter((item): item is DataItem => Boolean(item)),
    };
}

export const route: Route = {
    path: '/latest',
    name: 'Latest',
    url: 'restofworld.org/latest',
    example: '/restofworld/latest',
    categories: ['new-media'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description: 'Latest full-text articles from Rest of World (`restofworld.org/latest/`), enriching the excerpt-only official RSS feed with complete story bodies, Datawrapper chart embeds, and image credits.',
    zh: {
        name: '最新资讯',
        description: '获取 Rest of World 最新全文报道（`restofworld.org/latest/`），在官方仅含摘要的 RSS 基础上补全完整文章正文、Datawrapper 图表与图片来源署名。',
    },
    radar: [
        {
            source: ['restofworld.org', 'restofworld.org/latest', 'restofworld.org/latest/*'],
            target: '/latest',
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
