import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, apiRootUrl, types, ProcessThreads } from './utils';

export const route: Route = {
    path: '/category/:id?/:type?/:order?',
    categories: ['bbs'],
    example: '/1point3acres/category/h1b',
    parameters: { id: '标签 id，默认为全部', type: '帖子分类, 见下表，默认为 hot，即热门帖子', order: '排序方式，见下表，默认为空，即最新回复' },
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
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  更多标签可以在 [标签列表](https://instant.1point3acres.com/tags) 中找到。
:::

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

    const currentUrl = `${rootUrl}${id ? `/category/${id}` : ''}`;
    const apiUrl = `${apiRootUrl}/api${id ? `/tags/${id}/` : ''}threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    return {
        title: `一亩三分地 - ${id}${types[type]}`,
        link: currentUrl,
        item: await ProcessThreads(cache.tryGet, apiUrl, order),
    };
}
