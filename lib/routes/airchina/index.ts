import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://webresource.airchina.com.cn';

export const route: Route = {
    path: '/announcement',
    categories: ['travel'],
    example: '/airchina/announcement',
    parameters: {},
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
            source: ['www.airchina.com.cn/'],
        },
    ],
    name: '服务公告',
    maintainers: ['LandonLi'],
    handler,
    url: 'www.airchina.com.cn/',
};

async function handler() {
    const link = `${baseUrl}/zh-CN/content/about_us/service_announcement/`;
    const response = await got(link);
    const $ = load(response.data);
    const items = $('.ui-list-li')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.find('a.ui-list-link').attr('href');
            const date = item.find('.ui-add-data').text();
            return {
                title: item.find('a.ui-list-link').text(),
                link: href ? new URL(href, baseUrl).href : undefined,
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
                guid: href ? Buffer.from(href).toString('base64') : undefined,
            };
        })
        .filter((item) => item.link);

    const data = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await got(item.link!);
                const $ = load(response.data);
                return {
                    ...item,
                    title: $('.article_main .catalog-title').text() || item.title,
                    description: $('.article_main .txt').html(),
                };
            })
        )
    );

    return {
        title: '国航服务公告',
        description: '中国国际航空公司服务公告',
        link,
        item: data,
    };
}
