import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface AuthorData {
    fullname?: string;
    name: string;
}

interface BlogItem {
    slug: string;
    title: string;
    publishedAt: string;
    authorsData: AuthorData[];
    upvotes: number;
    thumbnail?: string;
    tags: string[];
}

interface BlogApiResponse {
    allBlogs: BlogItem[];
}

export const route: Route = {
    path: '/blog-zh',
    categories: ['programming'],
    example: '/huggingface/blog-zh',
    parameters: {},
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
            source: ['huggingface.co/blog/zh', 'huggingface.co/'],
        },
    ],
    name: '中文博客',
    maintainers: ['zcf0508'],
    handler,
    url: 'huggingface.co/blog/zh',
};

async function handler() {
    const response = await ofetch<BlogApiResponse>('https://huggingface.co/api/blog/zh');

    const { allBlogs } = response;

    const lists = allBlogs.map((blog) => ({
        title: blog.title,
        link: `https://huggingface.co/blog/zh/${blog.slug}`,
        pubDate: parseDate(blog.publishedAt),
        author: blog.authorsData.map((author) => ({
            name: author.fullname || author.name,
        })),
        upvotes: blog.upvotes,
        image: blog.thumbnail ? new URL(blog.thumbnail, 'https://huggingface.co').toString() : undefined,
        category: blog.tags,
    }));

    const items: DataItem[] = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                $('.mb-4, .mb-6, .not-prose, h1').remove();
                return {
                    ...item,
                    description: $('.blog-content').html() ?? undefined,
                };
            })
        )
    );

    return {
        title: 'Huggingface 中文博客',
        link: 'https://huggingface.co/blog/zh',
        item: items,
    };
}
