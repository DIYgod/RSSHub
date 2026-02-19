import type { Route } from '@/types';

export const route: Route = {
    path: '/itnews/:channel',
    name: 'Unknown',
    maintainers: [],
    handler,
};

function handler(ctx) {
    const { channel } = ctx.req.param();
    const redirectTo = `/liulinblog/${channel}`;
    ctx.set('redirect', redirectTo);
}
