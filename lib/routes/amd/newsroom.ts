import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

import { fetchArticle, fetchChineseNews } from './utils';

const rootUrl = 'https://newsroom.amd.com';

export const route: Route = {
    path: '/newsroom/:category?/:language?',
    name: 'Newsroom',
    url: 'newsroom.amd.com',
    example: '/amd/newsroom',
    categories: ['new-media'],
    maintainers: ['ljh12138164'],
    parameters: {
        category: 'Official category slug such as gaming, ai, or data-center. Omit or use all for all news. Chinese supports all only.',
        language: {
            description: 'Article language. Chinese uses the latest news and blogs on the regional homepage.',
            default: 'en',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh-CN', label: 'Simplified Chinese' },
            ],
        },
    },
    description: 'Use `/amd/newsroom/all/zh-CN` for the Chinese homepage news and blogs. Fetches complete articles and footnotes using the official RSS feed for discovery. For Radeon and gaming news, use `/amd/newsroom/gaming`.',
    zh: {
        name: '新闻中心',
        parameters: {
            category: '官网分类，如 gaming（游戏与显卡）、ai（人工智能）或 data-center（数据中心）。留空或填 all 订阅全部新闻；中文站仅支持 all',
            language: {
                description: '文章语言。中英文站的文章列表和发布时间可能不同',
                default: 'en',
                options: [
                    { value: 'en', label: '英语' },
                    { value: 'zh-CN', label: '简体中文' },
                ],
            },
        },
        description:
            '获取文章的完整正文和脚注。英文文章列表来自官方 RSS，使用 `/amd/newsroom/all/en` 订阅；Radeon 显卡和游戏资讯可使用 `/amd/newsroom/gaming`。中文内容来自地区官网首页的最新新闻和博客，使用 `/amd/newsroom/all/zh-CN` 订阅。中文站不支持按分类订阅。',
    },
    radar: [
        { source: ['newsroom.amd.com', 'newsroom.amd.com/news/:slug'], target: '/newsroom' },
        { source: ['newsroom.amd.com/category/:category'], target: '/newsroom/:category' },
        { source: ['www.amd.com/zh-cn/newsroom.html'], target: '/newsroom/all/zh-CN' },
    ],
    features: { requirePuppeteer: false, supportRadar: true },
    handler: async (ctx) => {
        const language = ctx.req.param('language') ?? 'en';
        const category = ctx.req.param('category') === 'all' ? undefined : ctx.req.param('category');
        if (language === 'zh-CN') {
            if (category) {
                throw new NotFoundError('The Chinese newsroom does not support categories. Use /amd/newsroom/all/zh-CN.');
            }
            const articles = await fetchChineseNews(getRouteLimit(ctx));
            return { title: 'AMD 新闻中心', link: 'https://www.amd.com/zh-cn/newsroom.html', language, item: articles.map((article) => ({ ...article, pubDate: article.pubDate ? parseDate(article.pubDate) : undefined })) };
        }
        if (language !== 'en') {
            throw new NotFoundError('Unsupported language. Use en or zh-CN.');
        }
        const response = await ofetch(`${rootUrl}/rss.xml`, { query: category ? { category } : undefined, responseType: 'text' });
        const feed = await parser.parseString(response);

        return {
            title: feed.title!,
            link: category ? `${rootUrl}/category/${encodeURIComponent(category)}/` : rootUrl,
            description: feed.description,
            language: 'en',
            item: await pMap(
                feed.items.slice(0, getRouteLimit(ctx)),
                async (item) => {
                    const article = await cache.tryGet(item.link!, () => fetchArticle(item.link!));
                    const pubDate = article.pubDate ?? item.pubDate;

                    return {
                        title: item.title!,
                        link: item.link,
                        description: article.description,
                        pubDate: pubDate ? parseDate(pubDate) : undefined,
                        author: article.author ?? item.creator,
                        category: [...new Set([...article.category, ...(item.categories ?? [])])],
                        image: article.image,
                    };
                },
                { concurrency: 3 }
            ),
        };
    },
};
