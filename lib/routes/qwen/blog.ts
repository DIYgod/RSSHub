import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['blog'],
    example: '/qwen/blog/zh-cn',
    parameters: {
        lang: '语言，例如 `zh-cn`, `en`',
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
    handler: async (ctx) => {
        const base = 'https://qwen.ai';
        const { lang = 'zh-cn' } = ctx.req.param();
        const blogUrl = `${base}/api/page_config?code=research.research-list&language=${lang}`;

        const response = await ofetch(blogUrl, {
            headers: {
                'user-agent': config.trueUA,
                referer: base,
            },
        });

        const articles = response.map((item: any) => ({
            title: item.title,
            image: item.cover_small, // or item.cover
            pubDate: item.date,
            author: item.author,
            link: `${base}/blog?id=${item.id}`,
            description: item.introduction,
            category: item.tags,
        }));

        // get blog content
        const items = await Promise.all(
            articles.map((item: any) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    item.content = $('.post-content').first().html();
                    return item;
                })
            )
        );

        return {
            title: 'Qwen Blog',
            link: `${base}/research`,
            item: items,
        };
    },
};
