import { Route } from '@/types';
export const route: Route = {
    path: '/list/:id',
    name: 'Unknown',
    maintainers: [],
    handler,
};

function handler(ctx) {
    const id = ctx.req.param('id');

    const redirectTo = `/jiemian${id ? `/lists/${id}` : ''}`;
    ctx.set('redirect', redirectTo);
}
