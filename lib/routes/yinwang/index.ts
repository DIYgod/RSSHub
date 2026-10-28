import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({ html: true });

interface ArticleDetail {
    content_html?: string;
    content?: string;
}

interface Article {
    slug: string;
    title: string;
    tags: string[];
    publish_date?: string | null;
}

function getPubDate(date: Article['publish_date']) {
    if (!date) {
        return;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // The API supplies a calendar day, not a publication time or timezone.
        const pubDate = parseDate(`${date}T00:00:00Z`);
        return !Number.isNaN(pubDate.getTime()) && pubDate.toISOString().startsWith(`${date}T`) ? pubDate : undefined;
    }
    const pubDate = parseDate(date);
    return Number.isNaN(pubDate.getTime()) ? undefined : pubDate;
}

function getDescription(detail: ArticleDetail, link: string) {
    if (typeof detail.content_html === 'string') {
        return detail.content_html;
    }
    if (typeof detail.content === 'string') {
        return md.render(detail.content);
    }
    throw new Error(`Article content is unavailable for ${link}`);
}

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/yinwang',
    name: '文章',
    maintainers: ['junbaor', 'SkiTiSu'],
    handler,
};

async function handler() {
    const url = 'https://www.yinwang.org';
    const { posts } = await ofetch<{ posts: Article[] }>(`${url}/api/v1/posts`);

    const result = await pMap(
        posts,
        async (post) => {
            const link = `${url}/posts/${post.slug}`;
            const detail = await cache.tryGet(link, async () => {
                const detail = await ofetch<ArticleDetail>(`${url}/api/v1/posts/${post.slug}`);
                return {
                    description: getDescription(detail, link),
                };
            });
            return {
                title: post.title,
                description: detail.description,
                link,
                author: '王垠',
                category: post.tags,
                pubDate: getPubDate(post.publish_date),
            };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: '王垠的博客 - 当然我在扯淡',
        link: url,
        item: result,
    };
}
