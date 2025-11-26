import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import { config } from '@/config';

export const route: Route = {
    path: '/blog/:lang?/:tag?',
    categories: ['blog'],
    example: '/qwen/blog/zh-cn',
    parameters: { lang: 'Blog language' },
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
            source: ['qwen.ai/research/'],
            target: '/qwen/blog/:lang',
        },
    ],
    name: 'Blog',
    maintainers: ['Kjasn'],
    handler: async (ctx) => {
        const base = 'https://qwen.ai';
        const { lang = 'zh-cn', tag = '' } = ctx.req.param();
        const blogUrl = `${base}/api/page_config?code=research.research-list&language=${lang}`;

        const response = await ofetch(blogUrl, {
            headers: {
                'user-agent': config.trueUA,
                referer: base,
            },
        });

        const articles = response
            .filter((item: any) => !tag || item.tags?.includes(tag)) // filter by tag
            .map((item: any) => ({
                title: item.title,
                image: item.cover_small, // or item.cover
                pubDate: item.date,
                author: item.author,
                link: `${base}/blog?id=${item.id}`,
                description: item.introduction,
                tags: item.tags,
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
            link: blogUrl,
            item: items,
        };
    },
};
