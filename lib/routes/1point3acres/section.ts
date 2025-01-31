import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, apiRootUrl, types, ProcessThreads } from './utils';

const sections = {
    257: '留学申请',
    379: '世界公民',
    400: '投资理财',
    31: '生活干货',
    345: '职场达人',
    391: '人际关系',
    38: '海外求职',
    265: '签证移民',
};

export const route: Route = {
    path: '/section/:id?/:type?/:order?',
    categories: ['bbs'],
    example: '/1point3acres/section/345',
    parameters: { id: '分区 id，见下表，默认为全部', type: '帖子分类, 见下表，默认为 hot，即热门帖子', order: '排序方式，见下表，默认为空，即最新回复' },
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
            source: ['instant.1point3acres.com/section/:id', 'instant.1point3acres.com/'],
        },
    ],
    name: '分区',
    maintainers: ['nczitzk'],
    handler,
    description: `分区

| 分区     | id  |
| -------- | --- |
| 留学申请 | 257 |
| 世界公民 | 379 |
| 投资理财 | 400 |
| 生活干货 | 31  |
| 职场达人 | 345 |
| 人际关系 | 391 |
| 海外求职 | 38  |
| 签证移民 | 265 |

  分类

| 热门帖子 | 最新帖子 |
| -------- | -------- |
| hot      | new      |

  排序方式

| 最新回复 | 最新发布 |
| -------- | -------- |
|          | post     |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';
    const type = ctx.req.param('type') ?? 'hot';
    const order = ctx.req.param('order') ?? '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const currentUrl = `${rootUrl}${id ? (isNaN(id) ? `/category/${id}` : `/section/${id}`) : ''}`;
    const apiUrl = `${apiRootUrl}/api${id ? (isNaN(id) ? `/tags/${id}/` : `/forums/${id}/`) : ''}threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    return {
        title: `一亩三分地 - ${Object.hasOwn(sections, id) ? sections[id] : id}${types[type]}`,
        link: currentUrl,
        item: await ProcessThreads(cache.tryGet, apiUrl, order),
    };
}
