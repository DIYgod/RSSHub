import type { Context } from 'hono';

import type { Route } from '@/types';

import { getForumFeed } from './forum';

export const route: Route = {
    path: '/tieba/forum/good/:kw/:cid?/:sortBy?',
    categories: ['bbs'],
    example: '/baidu/tieba/forum/good/女图',
    parameters: { kw: '吧名', cid: '精品分类，默认为 `0`（全部分类），如果不传 `cid` 则获取全部分类', sortBy: '排序方式：`created`, `replied`。默认为 `created`' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: true,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        antiCrawler: true,
    },
    name: '精品帖子',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

function handler(ctx: Context) {
    const { kw, cid, sortBy } = ctx.req.param();
    return getForumFeed(kw, { cid, sortBy, isGood: true });
}
