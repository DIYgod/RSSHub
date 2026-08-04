import type { Route } from '@/types';

export const route: Route = {
    path: '/itnews/:channel',
    categories: ['new-media'],
    example: '/liulinblog/itnews/seo',
    parameters: { channel: '频道，见下表' },
    name: '网络营销',
    maintainers: ['Fatpandac', 'nczitzk'],
    handler,
    description: `| 网络营销 | 电商运营  | 互联网早报 | 站长圈 |
| -------- | --------- | ---------- | ------ |
|          | dianshang | internet   | seo    |`,
};

function handler(ctx) {
    const { channel } = ctx.req.param();
    return ctx.set('redirect', `/liulinblog/${channel}`);
}
