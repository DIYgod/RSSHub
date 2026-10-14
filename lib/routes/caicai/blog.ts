import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['blog'],
    example: '/caicai/blog',
    parameters: {
        lang: {
            description: 'Language',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh', label: '中文' },
            ],
            default: 'en',
        },
    },
    radar: [
        {
            source: ['www.caicai.me/blogs'],
        },
        {
            source: ['www.caicai.me/zh/blogs'],
            target: '/blog/zh',
        },
    ],
    name: 'Blog',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.caicai.me/blogs',
};

const baseUrl = 'https://www.caicai.me';

async function handler(ctx: Context) {
    const { lang = 'en' } = ctx.req.param();
    const prefix = lang === 'en' ? '' : `/${lang}`;
    const link = `${baseUrl}${prefix}/blogs`;
    const response = await ofetch<string>(`${baseUrl}${prefix}/rss.xml`);
    const feed = await parser.parseString(response);
    const posts = feed.items;
    const items = await Promise.all(
        posts.map((post) =>
            cache.tryGet(post.link!, async () => {
                const response = await ofetch<string>(post.link!);
                const $ = load(response);
                const article = $('article').first();
                article.find('script, style').remove();
                const metadata = JSON.parse($('script[type="application/ld+json"]').first().text() || '{}');
                return {
                    title: post.title ?? '',
                    link: post.link,
                    description: article.html() || post.content,
                    pubDate: post.isoDate ? parseDate(post.isoDate) : undefined,
                    author: post.creator,
                    category: post.categories,
                    image: metadata.image?.[0],
                };
            })
        )
    );

    return {
        title: feed.title ?? (lang === 'en' ? "CaiCai's Blog" : '蔡蔡的博客'),
        description: feed.description,
        link,
        language: lang === 'en' ? ('en' as const) : ('zh-CN' as const),
        image: feed.image?.url ?? `${baseUrl}/favicon.ico`,
        item: items,
    };
}
