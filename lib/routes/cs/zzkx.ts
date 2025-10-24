import { Route } from '@/types';
export const route: Route = {
    path: ['/news/zzkx', '/zzkx'],
    name: 'Unknown',
    maintainers: [],
    handler,
};

function handler(ctx) {
    // https://www.cs.com.cn/sylm/jsbd/

    const redirectTo = '/cs/sylm/jsbd';
    ctx.set('redirect', redirectTo);
}
