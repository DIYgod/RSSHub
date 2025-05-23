import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';
import type { Route } from '@/types';

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/gmu/news/gyyw',
    parameters: {
        type: 'News type, optional values: gyyw (赣医要闻), ybdt (院部动态), mtgy (媒体赣医), xsjz (学术讲座), default to gyyw',
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

    const response = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);
    const list = $('.list ul li');

    const items = await Promise.all(
        list
            .toArray()
            .map(async (item) => {
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

                // 获取新闻内容
                const contentResponse = await got(fullLink, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = load(contentResponse.data);

                // 获取新闻标题
                const articleTitle = content('.article h1').text().trim();

                // 获取新闻来源和时间
                const articleInfo = content('.article .info').text().trim();

                // 获取新闻内容
                const articleContent = content('.v_news_content').html() || '暂无详细内容';

                const description = `
                    <h1>${articleTitle}</h1>
                    <div class="article-info">${articleInfo}</div>
                    <div class="article-content">
                        ${articleContent}
                    </div>
                `;

                return {
                    title,
                    link: fullLink,
                    pubDate,
                    description,
                };
            })
            .filter((item): item is Promise<{ title: string; link: string; pubDate: Date; description: string } | null> => item !== null)
    );

    const validItems = items.filter((item): item is { title: string; link: string; pubDate: Date; description: string } => item !== null);

    if (validItems.length === 0) {
        throw new Error('No valid items found');
    }

    return {
        title: `赣南医科大学 - ${newsType.title}`,
        link,
        description: `赣南医科大学${newsType.title}`,
        item: validItems,
    };
}
