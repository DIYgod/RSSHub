import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/recall/:type?',
    categories: ['other'],
    example: '/qiche365/recall',
    parameters: {
        type: {
            description: '分类',
            default: '1',
            options: [
                { label: '国内召回新闻', value: '1' },
                { label: '国内召回公告', value: '2' },
                { label: '国外召回新闻', value: '3' },
                { label: '国外召回公告', value: '4' },
            ],
        },
    },
    radar: [
        {
            source: ['www.qiche365.org.cn/index/recall/index.html'],
        },
    ],
    name: '汽车召回',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.qiche365.org.cn/index/recall/index.html',
};

async function handler(ctx) {
    const { type = '1' } = ctx.req.param();
    const baseUrl = 'https://www.qiche365.org.cn';
    const link = `${baseUrl}/index/recall/index/item/${type}.html`;

    const response = await ofetch(link, {
        query: {
            loadmore: 1,
        },
    });
    const $ = cheerio.load(response);
    const links = $('li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('h1').text(),
                description: $item.find('p').text(),
                category: $item.find('h3 span').text(),
                pubDate: timezone(parseDate($item.find('h2').text(), 'YYYY-MM-DD'), 8),
                link: `${baseUrl}${$item.find('a').attr('href')}`,
            };
        });

    const items = await Promise.all(
        links.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);
                item.description = $('.main .txt').html() || item.description;
                return item;
            })
        )
    );

    return {
        title: '汽车召回网',
        link: baseUrl,
        item: items,
    };
}
