import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const buildBlogItem = (item: any, base: string): DataItem => {
    const $ = load(item.content || item.extra.introduction || '');
    const content = $('.post-content').html() ?? (item.extra.introduction || '');

    return {
        title: item.title,
        image: item.extra.cover_small,
        pubDate: parseDate(item.extra.date),
        author: item.extra.author,
        link: `${base}/blog?id=${item.path}`,
        description: content,
        category: item.extra.tags,
    };
};

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['programming'],
    example: '/qwen/blog',
    parameters: {
        lang: '语言，`zh-CN`, `en-US`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Blog',
    maintainers: ['Kjasn'],
    handler: async (ctx): Promise<Data> => {
        const base = 'https://qwen.ai';
        const { lang = 'zh-CN' } = ctx.req.param();

        const blogUrl = `${base}/api/v2/article/retrieval?language=${lang}&type=qwen_ai`;

        const response = await ofetch(blogUrl);
        const articles = response.data?.articles;

        return {
            title: 'Qwen Blog',
            link: `${base}/research`,
            item: (articles || []).map((item: any) => buildBlogItem(item, base)),
        };
    },
};
