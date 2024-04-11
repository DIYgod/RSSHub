import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/ccnu/yjs',
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
            source: ['gs.ccnu.edu.cn/zsgz/ssyjs.htm', 'gs.ccnu.edu.cn/'],
        },
    ],
    name: '研究生通知公告',
    maintainers: ['shengmaosu'],
    handler,
    url: 'gs.ccnu.edu.cn/zsgz/ssyjs.htm',
};

async function handler() {
    const link = 'http://gs.ccnu.edu.cn/zsgz/ssyjs.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.main-zyrx li');

    return {
        title: '华中师范大学研究生院',
        link,
        description: '华中师范大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('small').text(), 'YYYY-MM-DD'),
                };
            }),
    };
}
