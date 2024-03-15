import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/bit/yjs',
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
            source: ['grd.bit.edu.cn/zsgz/zsxx/index.htm', 'grd.bit.edu.cn/'],
        },
    ],
    name: '研究生院招生信息',
    maintainers: ['shengmaosu'],
    handler,
    url: 'grd.bit.edu.cn/zsgz/zsxx/index.htm',
};

async function handler() {
    const link = 'https://grd.bit.edu.cn/zsgz/zsxx/index.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.tongzhigonggao li');

    return {
        title: '北京理工大学研究生院',
        link,
        description: '北京理工大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    };
}
