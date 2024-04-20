import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, apiRootUrl, types, ProcessThreads } from './utils';

export const route: Route = {
    path: ['/post/:type?/:order?', '/thread/:type?/:order?'],
    name: '帖子',
    categories: ['bbs'],
    maintainers: ['EthanWng97', 'DIYgod', 'nczitzk'],
    handler,
    url: 'instant.1point3acres.com/',
    description: `分类

  | 热门帖子 | 最新帖子 |
  | -------- | -------- |
  | hot      | new      |

  排序方式

  | 最新回复 | 最新发布 |
  | -------- | -------- |
  |          | post     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'hot';
    const order = ctx.req.param('order') ?? '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const apiUrl = `${apiRootUrl}/api/threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    return {
        title: `一亩三分地 - ${types[type]}`,
        link: rootUrl,
        item: await ProcessThreads(cache.tryGet, apiUrl, order),
    };
}
