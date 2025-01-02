import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjsy',
    categories: ['university'],
    example: '/scau/yjsy',
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
            source: ['yjsy.scau.edu.cn/208/list.htm', 'yjsy.scau.edu.cn/'],
        },
    ],
    name: '研究生院通知',
    maintainers: ['Chunssu'],
    handler,
    url: 'yjsy.scau.edu.cn/208/list.htm',
};

async function handler() {
    const link = 'https://yjsy.scau.edu.cn/208/list1.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w25 tr td tr');

    return {
        title: '华南农业大学研究生院',
        link,
        description: '通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a').last();
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    pubDate: parseDate(item.find('td').eq(2).text(), 'YYYY/MM/DD'),
                };
            }),
    };
}
