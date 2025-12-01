import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
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
    thumbnail: string;
    tags: string[];
}

interface ArticlesData {
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

async function handler() {
    const { body: response } = await got('https://huggingface.co/blog');
    const $ = load(response);

    const data = $('div[data-target="Articles"]').data('props') as ArticlesData;
    const { allBlogs } = data;

    const papers = allBlogs.map((blog) => ({
        blog,
        link: `/blog/${blog.slug}`,
    }));

    const lists = papers.map((item) => ({
        title: item.blog.title,
        link: `https://huggingface.co${item.link}`,
        pubDate: parseDate(item.blog.publishedAt),
        author: item.blog.authorsData.map((author) => ({
            name: author.fullname || author.name,
        })),
        upvotes: item.blog.upvotes,
        image: new URL(item.blog.thumbnail, 'https://huggingface.co').toString(),
        category: item.blog.tags,
    }));

    const items: DataItem[] = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const { body: response } = await got(item.link);
                const $ = load(response);
                // Remove navigation elements and non-content elements
                $('.mb-4, .mb-6, .not-prose').remove();
                return {
                    ...item,
                    description: $('.blog-content').html() ?? undefined,
                };
            })
        )
    );

    return {
        title: 'Huggingface 英文博客',
        link: 'https://huggingface.co/blog',
        item: items,
    };
}
