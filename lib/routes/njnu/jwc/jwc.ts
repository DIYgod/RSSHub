import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { ProcessFeed } from './utils';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/njnu/jwc/xstz',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务通知',
    maintainers: ['Shujakuinkuraudo'],
    handler,
    description: `| 教师通知 | 新闻动态 | 学生通知 |
| -------- | -------- | -------- |
| jstz     | xwdt     | xstz     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    let title, path;
    switch (type) {
        case 'jstz':
            title = '教师通知';
            path = 'jstz.htm';
            break;
        case 'xwdt':
            title = '新闻动态';
            path = 'xwdt.htm';
            break;
        case 'xstz':
            title = '学生通知';
            path = 'xstz.htm';
    }
    const base = 'http://jwc.njnu.edu.cn/index/' + path;

    const response = await got({
        method: 'get',
        url: base,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    const list = $('.list_txt a').toArray();

    const result = await ProcessFeed(list, cache);

    return {
        title: '南京师范大学教务处 - ' + title,
        link: 'http://jwc.njnu.edu.cn/',
        description: '南京师范大学教务处',
        item: result,
    };
}
