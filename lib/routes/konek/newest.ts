import MarkdownIt from 'markdown-it';

import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://konek.hn.plus';
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });

interface Post {
    id: number;
    title: string;
    slug: string | null;
    description: string | null;
    published_at: string | null;
    username: string | null;
    category: string | null;
    tags: Array<{ tag: string }> | null;
}

export const route: Route = {
    path: '/newest',
    categories: ['new-media'],
    example: '/konek/newest',
    name: 'Newest posts',
    maintainers: ['TungHaHuy'],
    radar: [{ source: ['konek.hn.plus/newest'], target: '/newest' }],
    url: 'konek.hn.plus/newest',
    handler,
};

async function handler(): Promise<Data> {
    const { data: posts }: { data: Post[] } = await got(`${baseUrl}/contents`, {
        searchParams: {
            siteId: 330,
            contentType: 'newest',
            username: 'all',
            categoryId: 'all',
            tagId: 'all',
            flagType: 'active',
            fromDate: 'all',
            toDate: 'all',
            limit: 100,
            offset: 0,
        },
        headers: { accept: 'application/json' },
    });

    if (!Array.isArray(posts)) {
        throw new TypeError('Konek /contents returned an unexpected response');
    }

    return {
        title: 'Deep Web Konek - Newest',
        link: `${baseUrl}/newest`,
        language: 'en',
        item: posts
            .filter((post) => post.published_at)
            .map((post) => ({
                title: post.title,
                link: `${baseUrl}/item/${post.id}${post.slug ? `/${post.slug}` : ''}`,
                guid: `${baseUrl}/item/${post.id}`,
                description: markdown.render(post.description ?? ''),
                author: post.username ?? undefined,
                // HN+ formats these timestamps with dayjs.utc() in its frontend.
                pubDate: parseDate(`${post.published_at!.replace(' ', 'T')}Z`),
                category: [...new Set([post.category, ...(post.tags ?? []).map((tag) => tag.tag)].filter((value): value is string => Boolean(value)))],
            })),
    };
}
