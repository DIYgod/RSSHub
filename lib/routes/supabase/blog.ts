import pMap from 'p-map';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderArticleDescription } from './templates/description';
import type { SupabaseArticleContent, SupabaseFeedCandidate } from './utils';
import { BLOG_URL, DETAIL_CONCURRENCY, extractFeedCandidates, fetchOptionalMarkdown, fetchText, parseArticleDetail, RSS_URL } from './utils';

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 100;

const collectCandidates = async (limit: number): Promise<SupabaseFeedCandidate[]> => {
    const xml = await fetchText(RSS_URL);
    const collected = new Map<string, SupabaseFeedCandidate>();

    for (const candidate of extractFeedCandidates(xml)) {
        if (!collected.has(candidate.link)) {
            collected.set(candidate.link, candidate);
        }
    }

    return collected.values().toArray().slice(0, limit);
};

const toFallbackItem = (candidate: SupabaseFeedCandidate): DataItem | undefined => {
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
    return item;
};

const toArticleDataItem = (detail: SupabaseArticleContent, link: string): DataItem | undefined => {
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

const fetchArticleItem = async (candidate: SupabaseFeedCandidate): Promise<DataItem | undefined> => {
    try {
        const detail = await cache.tryGet<SupabaseArticleContent>(
            `supabase:blog:${candidate.link}`,
            async () => {
                const [html, markdown] = await Promise.all([fetchText(candidate.link), fetchOptionalMarkdown(candidate.link)]);
                const parsed = parseArticleDetail(html, candidate, markdown);
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
        title: 'Supabase Blog',
        description: 'The latest news, engineering deep dives, and product announcements from Supabase.',
        link: BLOG_URL,
        language: 'en',
        item: items.filter((item): item is DataItem => Boolean(item)),
    };
}

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'supabase.com/blog',
    example: '/supabase/blog',
    categories: ['programming'],
    view: ViewType.Articles,
    maintainers: ['ljh12138164'],
    description: 'Latest full-text articles from the official Supabase Blog (`supabase.com/blog`), enriching the excerpt-only official RSS feed with complete article content, normalized code blocks, categories, authors, and media.',
    zh: {
        name: '博客',
        description: '获取 Supabase 官方博客（`supabase.com/blog`）最新全文文章，在官方摘要 RSS 基础上补全完整正文、格式化代码块、分类标签、作者与媒体内容。',
    },
    radar: [
        {
            source: ['supabase.com/blog', 'supabase.com/blog/*'],
            target: '/blog',
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
