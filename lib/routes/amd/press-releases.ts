import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

import { fetchArticle, fetchChineseNews } from './utils';

const rootUrl = 'https://ir.amd.com/news-events/press-releases';

export const route: Route = {
    path: '/press-releases/:language?',
    name: 'Press Releases',
    url: 'ir.amd.com/news-events/press-releases',
    example: '/amd/press-releases',
    categories: ['finance'],
    maintainers: ['ljh12138164'],
    parameters: {
        language: {
            description: 'Article language. English uses the investor relations feed; Chinese uses the regional newsroom homepage. Lists and publication dates differ.',
            default: 'en',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh-CN', label: 'Simplified Chinese' },
            ],
        },
    },
    description: 'Use `/amd/press-releases/zh-CN` for Chinese press releases. Full press releases from the investor relations website. The official RSS feed provides titles and links without article bodies.',
    zh: {
        name: '新闻稿',
        parameters: {
            language: {
                description: '文章语言。中英文新闻稿的来源、文章列表和发布时间不同',
                default: 'en',
                options: [
                    { value: 'en', label: '英语' },
                    { value: 'zh-CN', label: '简体中文' },
                ],
            },
        },
        description: '英文新闻稿来自投资者关系网站，官方 RSS 只有标题和链接，本路由会补全正文。使用 `/amd/press-releases/en` 订阅英文，或使用 `/amd/press-releases/zh-CN` 订阅地区新闻中心首页的中文新闻稿。',
    },
    radar: [
        { source: ['ir.amd.com/news-events/press-releases', 'ir.amd.com/news-events/press-releases/detail/:id/:slug'], target: '/press-releases/en' },
        { source: ['www.amd.com/zh-cn/newsroom/press-releases/:slug'], target: '/press-releases/zh-CN' },
    ],
    features: { requirePuppeteer: false, supportRadar: true },
    handler: async (ctx) => {
        const language = ctx.req.param('language') ?? 'en';
        if (language === 'zh-CN') {
            const articles = await fetchChineseNews(getRouteLimit(ctx), true);
            return { title: 'AMD 新闻稿', link: 'https://www.amd.com/zh-cn/newsroom.html', language, item: articles.map((article) => ({ ...article, pubDate: article.pubDate ? parseDate(article.pubDate) : undefined })) };
        }
        if (language !== 'en') {
            throw new NotFoundError('Unsupported language. Use en or zh-CN.');
        }
        const response = await ofetch(`${rootUrl}/rss`, { responseType: 'text' });
        const feed = await parser.parseString(response);

        return {
            title: 'AMD Investor Relations Press Releases',
            link: rootUrl,
            description: feed.description,
            language: 'en',
            item: await pMap(
                feed.items.slice(0, getRouteLimit(ctx)),
                async (item) => ({
                    title: item.title!,
                    link: item.link,
                    description: (await cache.tryGet(item.link!, () => fetchArticle(item.link!))).description,
                    pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                    category: item.categories,
                }),
                { concurrency: 3 }
            ),
        };
    },
};
