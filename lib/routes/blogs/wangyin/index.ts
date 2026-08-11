import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.yinwang.org';
const apiUrl = `${rootUrl}/api/v1`;
const md = MarkdownIt({
    html: true,
    linkify: true,
});

interface PostSummary {
    id: string;
    slug: string;
    title: string;
    display_title: string | null;
    publish_date: string;
    updated_at: string | null;
    tags: string[];
}

interface PostDetail extends PostSummary {
    content: string;
}

interface PostsResponse {
    posts: PostSummary[];
}

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/blogs/wangyin',
    radar: [
        {
            source: ['yinwang.org/', 'yinwang.org/blog'],
        },
        {
            source: ['www.yinwang.org/', 'www.yinwang.org/blog'],
        },
    ],
    name: '全部文章',
    maintainers: ['DzmingLi'],
    handler,
    url: 'yinwang.org/blog',
};

async function handler(ctx) {
    const requestedLimit = Number(ctx.req.query('limit') ?? 20);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100) : 20;

    const response = await ofetch<PostsResponse>(`${apiUrl}/posts`, {
        query: {
            limit,
            sort: 'date_desc',
            lang: 'zh',
        },
    });

    const items: DataItem[] = await pMap(
        response.posts,
        async (post) => {
            const itemLink = `${rootUrl}/posts/${encodeURIComponent(post.slug)}`;
            const detailUrl = `${apiUrl}/posts/${encodeURIComponent(post.slug)}`;
            const detail = await cache.tryGet(detailUrl, () => ofetch<PostDetail>(detailUrl), undefined, false);

            return {
                title: post.display_title || post.title,
                link: itemLink,
                description: renderContent(detail.content, itemLink),
                pubDate: parseDate(post.publish_date, 'YYYY-MM-DD'),
                updated: post.updated_at ? parseDate(post.updated_at) : undefined,
                category: post.tags,
                author: '王垠',
            } satisfies DataItem;
        },
        { concurrency: 5 }
    );

    return {
        title: '当然我在扯淡',
        link: `${rootUrl}/blog`,
        description: '王垠的个人博客',
        language: 'zh-CN',
        author: '王垠',
        item: items,
    } satisfies Data;
}

function renderContent(content: string, baseUrl: string): string {
    const $ = load(md.render(content), null, false);

    for (const attribute of ['href', 'src']) {
        $(`[${attribute}]`).each((_, element) => {
            const value = $(element).attr(attribute);
            if (value) {
                $(element).attr(attribute, new URL(value, baseUrl).href);
            }
        });
    }

    return $.html();
}
