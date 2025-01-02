import { Route } from '@/types';
export const route: Route = {
    path: '/daily',
    categories: ['new-media', 'popular'],
    example: '/dongqiudi/daily',
    radar: [
        {
            source: ['www.dongqiudi.com/special/48'],
        },
    ],
    name: '早报',
    maintainers: ['HenryQW'],
    handler,
    url: 'www.dongqiudi.com/special/48',
    description: `::: tip
部分球队和球员可能会有两个 id, 正确 id 应该由 \`5000\` 开头.
:::`,
};

function handler(ctx) {
    ctx.set('redirect', '/dongqiudi/special/48');
}
