import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraNaverBlog } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildCacheKey } from './utils';

const NAVER_BLOG_RSS_BASE = 'https://rss.blog.naver.com';

interface NaverBlogRssChannel {
    title?: string;
    link?: string;
    item?: NaverBlogRssItem | NaverBlogRssItem[];
}

interface NaverBlogRssItem {
    title?: string;
    link?: string;
    description?: string;
    pubDate?: string;
    'dc:creator'?: string;
    guid?: string | { '#text'?: string };
}

interface NaverBlogRssFeed {
    rss?: { channel?: NaverBlogRssChannel };
}

function normalizeItems(channel: NaverBlogRssChannel): NaverBlogRssItem[] {
    const raw = channel.item;
    if (!raw) {
        return [];
    }
    return Array.isArray(raw) ? raw : [raw];
}

function itemGuid(item: NaverBlogRssItem): string {
    const g = item.guid;
    if (typeof g === 'string') {
        return g;
    }
    return g?.['#text'] ?? item.link ?? '';
}

function postIdFromLink(link: string): string {
    try {
        const url = new URL(link);
        return url.searchParams.get('logNo') ?? url.pathname.split('/').findLast(Boolean) ?? link;
    } catch {
        return link;
    }
}

export const route: Route = {
    path: '/naver/blog/:blogId',
    categories: ['blog'],
    example: '/spec/naver/blog/webhackyo',
    parameters: {
        blogId: 'Naver blog ID (username). Found in the URL: blog.naver.com/:blogId',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'blog.naver.com',
    name: 'Blog Posts',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['blog.naver.com/:blogId', 'blog.naver.com/:blogId/*'],
            target: '/spec/naver/blog/:blogId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const blogId = ctx.req.param('blogId');

    if (!blogId || !/^[\w-]+$/.test(blogId)) {
        throw new InvalidParameterError('Invalid Naver blog ID. Use the username from blog.naver.com/:blogId.');
    }

    const rssUrl = `${NAVER_BLOG_RSS_BASE}/${blogId}.xml`;

    const feedXml = await cache.tryGet(
        buildCacheKey('naver-blog', blogId),
        () =>
            ofetch<string>(rssUrl, {
                parseResponse: (txt) => txt,
            }),
        30 * 60
    );

    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '$',
    });
    const parsed = parser.parse(feedXml as string) as NaverBlogRssFeed;

    const channel = parsed.rss?.channel;
    if (!channel) {
        throw new InvalidParameterError(`Naver Blog returned no RSS channel for blog ID "${blogId}". Verify the blog exists and is public.`);
    }

    const channelTitle = String(channel.title ?? `Naver Blog ${blogId}`);
    const rawItems = normalizeItems(channel);

    const items: DataItem[] = rawItems.map((item) => {
        const link = String(item.link ?? '');
        const pubDate = parseDate(item.pubDate ?? '');
        const author = String(item['dc:creator'] ?? blogId);
        const postId = postIdFromLink(link);

        const extra: SpecExtraNaverBlog = {
            type: 'naver/blog/post',
            platform: 'naver-blog',
            sourceUrl: link,
            externalId: postId,
            seriesExternalId: blogId,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            blogId,
            authorId: blogId,
        };

        return {
            title: String(item.title ?? postId),
            link,
            guid: itemGuid(item) || `spec-naver-blog-${blogId}-${postId}`,
            pubDate,
            author,
            description: String(item.description ?? ''),
            _extra: extra,
        };
    });

    return {
        title: `${channelTitle} — Naver Blog`,
        link: `https://blog.naver.com/${blogId}`,
        item: items,
        language: 'ko',
    };
}
