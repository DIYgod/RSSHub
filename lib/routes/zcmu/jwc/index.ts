import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'https://jwc.zcmu.edu.cn/';

const map = new Map([
    [0, { title: '教务处 -- 教务管理', id: 'jwgl' }],
    [1, { title: '教务处 -- 成绩管理', id: 'jwgl/cjgl' }],
    [2, { title: '教务处 -- 学籍管理', id: 'jwgl/xjgl' }],
    [3, { title: '教务处 -- 考试管理', id: 'jwgl/ksgl' }],
    [4, { title: '教务处 -- 选课管理', id: 'jwgl/xkgl' }],
    [5, { title: '教务处 -- 排课管理', id: 'jwgl/pkgl' }],
]);

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/zcmu/jwc/1',
    parameters: { type: '通知模块id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['CCraftY'],
    handler,
    description: `| 教务管理 | 成绩管理 | 学籍管理 | 考试管理 | 选课管理 | 排课管理 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 0        | 1        | 2        | 3        | 4        | 5        |`,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    const id = map.get(type).id;
    const res = await got({
        method: 'get',
        url: `${host}/${id}.htm`,
    });

    const $ = load(res.data);
    const items = $('.winstyle196327 tr:lt(20)')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `https://jwc.zcmu.edu.cn/${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('span.timestyle196327').text().trim()),
            };
        })
        .get();

    return {
        title: map.get(type).title,
        link: `${host}${id}`,
        item: items,
    };
}
