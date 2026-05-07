import { load } from 'cheerio';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const buildBlogItem = (item: any, base: string): DataItem => {
    const $ = load(item.content || item.introduction || '');
    const content = $('.post-content').html() ?? (item.introduction || '');

    return {
        title: item.title,
        image: item.extra?.cover_small,
        pubDate: item.extra?.date,
        author: item.extra?.author,
        link: `${base}/blog?id=${item.path}`,
        description: content,
        category: item.extra?.tags,
    };
};

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['blog', 'programming'],
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
        const { lang = 'zh-CN', type = 'qwen_ai' } = ctx.req.param(); // type default to qwen_ai

        const blogUrl = `${base}/api/v2/article/retrieval?language=${lang}&type=${type}`;

        const response = await ofetch(blogUrl, {
            headers: {
                'user-agent': config.trueUA,
                referer: base,
            },
        });

        if (response.success === false) {
            return null as any;
        }

        const articles = response.data?.articles;

        return {
            title: 'Qwen Blog',
            link: `${base}/research`,
            item: articles.map((item: any) => buildBlogItem(item, base)),
        };
    },
};
