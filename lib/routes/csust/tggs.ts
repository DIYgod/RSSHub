import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getNoticeContent } from './utils';

const baseUrl = 'https://www.csust.edu.cn';
const listPath = '/tggs.htm';

async function handler(): Promise<Data> {
    const response = await got(`${baseUrl}${listPath}`);
    const $ = load(response.body);

    const items: Array<DataItem & { link: string }> = $('.list ul li')
        .toArray()
        .map((li) => {
            const $li = $(li);

            return {
                title: $li.find('.newTitle').text().trim(),
                link: new URL($li.find('a').attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($li.find('.data1').text().trim(), '发布时间 : YYYY-MM-DD'), 8),
            };
        });

    const enrichedItems = await Promise.all(items.map((item) => cache.tryGet(item.link, () => getNoticeContent(item))));

    return {
        title: '长沙理工大学 - 通告公示',
        link: `${baseUrl}${listPath}`,
        description: '长沙理工大学通告公示',
        item: enrichedItems,
    };
}

export const route: Route = {
    path: '/tggs',
    categories: ['university'],
    example: '/csust/tggs',
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.csust.edu.cn/tggs.htm', 'www.csust.edu.cn/'],
        },
    ],
    name: '通告公示',
    maintainers: ['powerfullz'],
    handler,
    url: 'www.csust.edu.cn/tggs.htm',
};
