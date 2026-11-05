import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';

import got, { parseCampusDate } from '../utils';

const baseTitle = '南京信息工程大学图书馆通知';
const baseUrl = 'https://lib.nuist.edu.cn';

export const route: Route = {
    path: '/lib',
    categories: ['university'],
    example: '/nuist/lib',
    radar: [
        {
            source: ['lib.nuist.edu.cn/', 'lib.nuist.edu.cn/index/tzgg.htm'],
        },
    ],
    name: '图书馆',
    maintainers: ['gylidian'],
    handler,
    url: 'lib.nuist.edu.cn/',
};

async function handler() {
    const link = baseUrl + '/index/tzgg.htm';

    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list2 li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            return {
                title: $item.find('a').attr('title')!,
                category: '通知',
                link: new URL($item.find('a').attr('href')!, link).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link + ':content', async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                return { description: $('[id^="vsb_content"]').first().html(), pubDate: parseCampusDate($('.date').find('span').eq(0).text()) };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: baseTitle,
        link,
        item: items,
    };
}
