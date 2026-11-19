import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/hfut/tzgg',
    name: '通知公告',
    maintainers: ['logerrors'],
    handler,
};

async function handler() {
    const baseUrl = 'https://news.hfut.edu.cn/tzgg2.htm';
    const response = await ofetch(baseUrl);
    const $ = load(response);

    return {
        link: baseUrl,
        title: $('title').text(),
        item: $('#tzz li')
            .slice(0, 10)
            .toArray()
            .map((elem): DataItem => ({
                title: $('a', elem).attr('title')!,
                link: $('a', elem).attr('href'),
                pubDate: parseDate($('a > i', elem).text().replace('年', '-').replace('月', '-').replace('日', ''), 8),
            })),
    };
}
