import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yzb',
    categories: ['university'],
    example: '/scau/yzb',
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
            source: ['yzb.scau.edu.cn/2136/list1.htm', 'yzb.scau.edu.cn/'],
        },
    ],
    name: '华农研讯',
    maintainers: ['shengmaosu'],
    handler,
    url: 'yzb.scau.edu.cn/2136/list1.htm',
};

async function handler() {
    const link = 'https://yzb.scau.edu.cn/2136/list1.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w25 tr');

    return {
        title: '华南农业大学研招办',
        link,
        description: '华农研讯',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    pubDate: parseDate(item.find('td').eq(3).text(), 'YYYY/MM/DD'),
                };
            }),
    };
}
