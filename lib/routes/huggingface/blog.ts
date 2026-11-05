import { load } from 'cheerio';
import pMap from 'p-map';

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
    authorsData?: AuthorData[];
    upvotes: number;
    thumbnail: string;
    tags: string[];
    url: string;
}

interface BlogApiResponse {
    allBlogs: BlogItem[];
}

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/huggingface/blog',
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
            source: ['huggingface.co/blog', 'huggingface.co/'],
        },
    ],
    name: '英文博客',
    maintainers: ['cesaryuan', 'zcf0508'],
    handler,
    url: 'huggingface.co/blog',
};

function getPublicationDate(publishedAt: string | undefined) {
    const date = publishedAt ? parseDate(publishedAt) : undefined;
    return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

async function handler() {
    const { allBlogs } = await ofetch<BlogApiResponse>('https://huggingface.co/api/blog');

    const lists = allBlogs.map((blog) => ({
        title: blog.title,
        link: `https://huggingface.co${blog.url}`,
        pubDate: getPublicationDate(blog.publishedAt),
        author: blog.authorsData?.map((author) => ({
            name: author.fullname || author.name,
        })),
        upvotes: blog.upvotes,
        image: blog.thumbnail ? new URL(blog.thumbnail, 'https://huggingface.co').href : undefined,
        category: blog.tags,
    }));

    const items: DataItem[] = await pMap(
        lists,
        async (item) => {
            const details = await cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const content = $('.blog-content > .relative.overflow-clip').first();
                if (!content.length) {
                    throw new Error(`HuggingFace article content was not found at ${item.link}`);
                }
                content.find('.absolute.not-prose').remove();
                return {
                    description: content.html(),
                };
            });
            return { ...item, description: details.description };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Huggingface 英文博客',
        link: 'https://huggingface.co/blog',
        item: items,
    };
}
