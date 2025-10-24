import { Route } from '@/types';
export const route: Route = {
    path: '/:region/:type?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

function handler(ctx) {
    const types = {
        news: 'press-release',
        blog: 'article',
    };

    const { region = 'en', type = 'news' } = ctx.req.param();
    const redirectTo = `/aqara/${region}/category/${types[type]}`;
    ctx.set('redirect', redirectTo);
}
