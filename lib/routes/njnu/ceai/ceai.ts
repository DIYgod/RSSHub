import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import util from './utils';

export const route: Route = {
    path: '/ceai/:type',
    categories: ['university'],
    example: '/njnu/ceai/xszx',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机与电子信息学院 - 人工智能学院',
    maintainers: ['Shujakuinkuraudo'],
    handler,
    description: `| 学院公告 | 学院新闻 | 学生资讯 |
| -------- | -------- | -------- |
| xygg     | xyxw     | xszx     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    let title, path;
    switch (type) {
        case 'xygg':
            title = '学院公告';
            path = '1651';
            break;
        case 'xyxw':
            title = '学院新闻';
            path = '1652';
            break;
        case 'xszx':
            title = '学生资讯';
            path = '1659';
            break;
    }
    const base = 'http://ceai.njnu.edu.cn/Item/List.asp?ID=' + path;

    const response = await got({
        method: 'get',
        url: base,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    const list = $('span a').toArray();

    const result = await util.ProcessFeed(list, cache);

    return {
        title: '南京师范大学计电人院 - ' + title,
        link: 'http://ceai.njnu.edu.cn/',
        description: '南京师范大学计电人院',
        item: result,
    };
}
