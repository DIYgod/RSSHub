import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import util from './utils';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/bjfu/jwc/jwkx',
    parameters: { type: '通知类别' },
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
            source: ['jwc.bjfu.edu.cn/:type/index.html'],
        },
    ],
    name: '教务处通知公告',
    maintainers: ['markmingjie'],
    handler,
    description: `| 教务快讯 | 考试信息 | 课程信息 | 教改动态 | 图片新闻 |
| -------- | -------- | -------- | -------- | -------- |
| jwkx     | ksxx     | kcxx     | jgdt     | tpxw     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    let title, path;
    switch (type) {
        case 'jgdt':
            title = '教改动态';
            path = 'jgdt/';
            break;
        case 'ksxx':
            title = '考试信息';
            path = 'ksxx/';
            break;
        case 'kcxx':
            title = '课程信息';
            path = 'tkxx/';
            break;
        case 'tpxw':
            title = '图片新闻';
            path = 'tpxw/';
            break;
        case 'jwkx':
        default:
            title = '教务快讯';
            path = 'jwkx/';
    }
    const base = 'http://jwc.bjfu.edu.cn/' + path;

    const response = await got({
        method: 'get',
        url: base,
    });

    const data = response.data; // 不用转码
    const $ = load(data);

    const list = $('.list_c li').slice(0, 15).toArray();

    const result = await util.ProcessFeed(base, list, cache); // 感谢@hoilc指导

    return {
        title: '北林教务处 - ' + title,
        link: 'http://jwc.bjfu.edu.cn/' + path,
        description: '北京林业大学教务处 - ' + title,
        item: result,
    };
}
