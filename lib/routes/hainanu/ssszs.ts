import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ssszs',
    categories: ['university'],
    example: '/hainanu/ssszs',
    name: '硕士研究生招生动态',
    maintainers: ['OdinZhang'],
    handler,
};

async function handler() {
    const url = 'https://gs.hainanu.edu.cn/yjszs/ssszs.htm';
    const response = await ofetch(url);
    const $ = load(response);

    return {
        title: '海南大学研究生招生',
        link: url,
        description: '海南大学研究生招生公告',
        item: $('.m_new13>ul>li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('a').text(),
                    link: new URL($item.find('a').attr('href')!, url).href,
                    pubDate: parseDate($item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    };
}
