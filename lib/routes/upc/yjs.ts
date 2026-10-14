import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/upc/yjs',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['yz.upc.edu.cn/sszs/list.htm', 'yz.upc.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yz.upc.edu.cn/sszs/list.htm',
};

async function handler() {
    const baseUrl = 'https://yz.upc.edu.cn';
    const link = `${baseUrl}/sszs/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.news_list li.news2').length ? $('.news_list li.news2') : $('.list tr');

    return {
        title: '中国石油大学研究生院',
        link,
        description: '中国石油大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                const $item = $(item);
                const a = $item.find('a');
                return {
                    title: a.attr('title') ?? a.text(),
                    link: new URL(a.attr('href')!, baseUrl).href,
                    pubDate: $item.find('.news_meta, div[style]').text() ? timezone(parseDate($item.find('.news_meta, div[style]').text(), 'YYYY-MM-DD'), 8) : undefined,
                };
            }),
    };
}
