import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/gmu/news/gyyw',
    parameters: {
        type: {
            description: '新闻类型，见下表，默认为 gyyw',
            options: [
                { value: 'gyyw', label: '赣医要闻' },
                { value: 'ybdt', label: '院部动态' },
                { value: 'mtgy', label: '媒体赣医' },
                { value: 'xsjz', label: '学术讲座' },
            ],
            default: 'gyyw',
        },
    },
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
            source: ['gmu.cn/xwzx/gyyw.htm', 'gmu.cn/'],
            target: '/news/gyyw',
        },
        {
            source: ['gmu.cn/xwzx/ybdt.htm'],
            target: '/news/ybdt',
        },
        {
            source: ['gmu.cn/xwzx/mtgy.htm'],
            target: '/news/mtgy',
        },
        {
            source: ['gmu.cn/xwzx/xsjz.htm'],
            target: '/news/xsjz',
        },
    ],
    name: '新闻中心',
    maintainers: ['FrankFahey'],
    url: 'gmu.cn/xwzx/gyyw.htm',
    handler,
};

export async function handler(ctx: Context) {
    const type = (ctx.req.param?.('type') as string) || 'gyyw';
    const newsType = {
        gyyw: { title: '赣医要闻', url: '/xwzx/gyyw.htm' },
        ybdt: { title: '院部动态', url: '/xwzx/ybdt.htm' },
        mtgy: { title: '媒体赣医', url: '/xwzx/mtgy.htm' },
        xsjz: { title: '学术讲座', url: '/xwzx/xsjz.htm' },
    }[type] || { title: '赣医要闻', url: '/xwzx/gyyw.htm' };

    const baseUrl = 'https://gmu.cn';
    const link = `${baseUrl}${newsType.url}`;

    const response = await got(link);

    const $ = load(response.data);
    const list = $('.list ul li');

    const items = await Promise.all(
        list.toArray().map(async (item) => {
            const element = $(item);
            const a = element.find('a');
            const dateText = element.find('i').text();
            const href = a.attr('href');
            const title = a.text().trim();

            if (!href || !title) {
                return null;
            }

            const pubDate = parseDate(dateText);
            if (!pubDate) {
                return null;
            }

            const fullLink = new URL(href, link).href;

            // Use cache.tryGet to cache the article content
            return await cache.tryGet(`gmu:news:${fullLink}`, async () => {
                try {
                    const contentResponse = await got(fullLink);
                    const content = load(contentResponse.data);

                    // 获取新闻内容
                    const articleContent = content('.v_news_content').html() || '暂无详细内容';

                    return {
                        title,
                        link: fullLink,
                        pubDate,
                        description: articleContent,
                    };
                } catch {
                    // 如果获取文章内容失败，返回基本信息
                    return {
                        title,
                        link: fullLink,
                        pubDate,
                        description: '暂无详细内容',
                    };
                }
            });
        })
    );

    const result = items.filter((item): item is { title: string; link: string; pubDate: Date; description: string } => item !== null);

    return {
        title: `赣南医科大学 - ${newsType.title}`,
        link,
        description: `赣南医科大学${newsType.title}`,
        item: result,
    };
}
