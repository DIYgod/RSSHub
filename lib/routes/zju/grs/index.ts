import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'http://www.grs.zju.edu.cn/';

const map = new Map([
    [1, { title: '浙大研究生院 -- 全部公告', tag: 'qbgg' }],
    [2, { title: '浙大研究生院 -- 教学管理', tag: 'jxgl' }],
    [3, { title: '浙大研究生院 -- 各类资助', tag: 'glzz' }],
    [4, { title: '浙大研究生院 -- 学科建设', tag: 'xkjs' }],
    [5, { title: '浙大研究生院 -- 海外交流', tag: 'hwjl' }],
]);

export const route: Route = {
    path: '/grs/:type',
    categories: ['university'],
    example: '/zju/grs/1',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院',
    maintainers: ['Caicailiushui'],
    handler,
    description: `| 全部公告 | 教学管理 | 各类资助 | 学科建设 | 海外交流 |
| -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        |`,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    const tag = map.get(type).tag;
    const url = `${host}${tag}/list.htm`;
    const res = await got(url);

    const $ = load(res.data);
    const list = $('#wp_news_w09').find('.list-item');

    const items = list.toArray().map((item) => {
        item = $(item);
        return {
            title: item.find('h3').attr('title'),
            pubDate: timezone(parseDate(item.find('.date').text().trim(), 'YY-MM-DD'), +8),
            link: `http://www.grs.zju.edu.cn${item.find('a').eq(-1).attr('href')}`,
            description: item.find('p').text(),
        };
    });

    return {
        title: map.get(type).title,
        link: `${host}${tag}/list.htm`,
        item: items,
    };
}
