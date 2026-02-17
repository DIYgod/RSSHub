import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// const host = 'http://physics.zju.edu.cn/redir.php?catalog_id=';
const host = 'http://physics.zju.edu.cn';
// const host = 'http://10.14.122.238/redir.php?catalog_id=';

const map = new Map([
    [1, { title: '浙大物理学院 -- 本院动态', id: '39060' }],
    [2, { title: '浙大物理学院 -- 科研进展', id: '39070' }],
    [3, { title: '浙大物理学院 -- 研究生教育最新消息', id: '39079' }],

    // could not find these sections due to http://physics.zju.edu.cn/2022/0325/c39060a2510676/page.htm
    /*    [4, { title: '浙大物理学院 -- 学生思政最新消息', id: '112' }],
    [5, { title: '浙大物理学院 -- 研究生思政消息公告', id: '155' }],
    [6, { title: '浙大物理学院 -- 研究生奖助学金', id: '661' }],
    [7, { title: '浙大物理学院 -- 研究生思政就业信息', id: '664' }],
    [8, { title: '浙大物理学院 -- 本科生思政消息公告', id: '667' }],
    [9, { title: '浙大物理学院 -- 本科生奖助学金', id: '670' }],
    [10, { title: '浙大物理学院 -- 本科生就业信息', id: '671' }],
    [11, { title: '浙大物理学院 -- 学术报告', id: '3735' }],*/
]);

export const route: Route = {
    path: '/physics/:type',
    categories: ['university'],
    example: '/zju/physics/1',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '物理学院',
    maintainers: ['Caicailiushui'],
    handler,
    description: `| 本院动态 | 科研进展 | 研究生教育最新消息 |
| -------- | -------- | ------------------ |
| 1        | 2        | 3                  |`,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    const id = map.get(type).id;
    const res = await got({
        method: 'get',
        url: `${host}/${id}/list.htm`,
    });

    const $ = load(res.data);
    const items = $('#arthd li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                pubDate: parseDate(item.find('.art-date').text()),

                link: `http://physics.zju.edu.cn/${item.find('a').attr('href')}`,
                // link: `http://10.14.122.238/${item.find('a').attr('href')}`,
            };
        });

    return {
        title: map.get(type).title,
        link: `${host}${id}`,
        item: items,
    };
}
