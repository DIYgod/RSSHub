import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const newsTypes = {
    gyyw: { title: '赣医要闻', url: '/index/gyyw.htm' },
    ybdt: { title: '院部动态', url: '/index/ybdt.htm' },
    mtgy: { title: '媒体赣医', url: '/index/mtgy.htm' },
    xsjz: { title: '学术讲座', url: '/index/xsjz.htm' },
};

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
            source: ['gmu.cn/index/gyyw.htm', 'gmu.cn/'],
            target: '/news/gyyw',
        },
        {
            source: ['gmu.cn/index/ybdt.htm'],
            target: '/news/ybdt',
        },
        {
            source: ['gmu.cn/index/mtgy.htm'],
            target: '/news/mtgy',
        },
        {
            source: ['gmu.cn/index/xsjz.htm'],
            target: '/news/xsjz',
        },
    ],
    name: '新闻中心',
    maintainers: ['FrankFahey'],
    url: 'gmu.cn/index/gyyw.htm',
    handler,
};

export async function handler(ctx: Context) {
    const type = ctx.req.param?.('type') || 'gyyw';
    if (!Object.hasOwn(newsTypes, type)) {
        throw new InvalidParameterError(`Unknown news type "${type}". Available types: ${Object.keys(newsTypes).join(', ')}.`);
    }
    const newsType = newsTypes[type];

    const baseUrl = 'https://gmu.cn';
    const link = `${baseUrl}${newsType.url}`;

    const response = await got(link);

    const $ = load(response.data);
    const list = $('.list_ttlb li, .list_wzlb li');

    const items = await Promise.all(
        list.toArray().map(async (item) => {
            const element = $(item);
            const a = element.find('a');
            const dateText = element.find('.sj .p2').length ? `${element.find('.sj .p2').text()}-${element.find('.sj .p1').text()}` : element.find('.sj').text();
            const href = a.attr('href');
            const title = a.attr('title') || a.find('.bt, .p_bt').text();

            if (!href || !title) {
                return null;
            }

            const publicationDate = dateText ? parseDate(dateText) : undefined;
            const pubDate = publicationDate && !Number.isNaN(publicationDate.getTime()) ? timezone(publicationDate, 8) : undefined;

            const fullLink = new URL(href, link).href;

            const detail = await cache.tryGet(`gmu:news:${fullLink}:content`, async () => {
                const contentResponse = await got(fullLink);
                const content = load(contentResponse.data);
                return { description: content('.v_news_content').html() ?? undefined };
            });

            return {
                title,
                link: fullLink,
                pubDate,
                ...detail,
            };
        })
    );

    const result = items.filter((item): item is { title: string; link: string; pubDate: Date | undefined; description: string | undefined } => item !== null);

    return {
        title: `赣南医科大学 - ${newsType.title}`,
        link,
        description: `赣南医科大学${newsType.title}`,
        item: result,
    };
}
