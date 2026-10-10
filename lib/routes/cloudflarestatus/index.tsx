import type { Route } from '@/types';

export const route: Route = {
    path: '/',
    name: 'Status (legacy)',
    url: 'www.cloudflarestatus.com',
    maintainers: ['nczitzk', 'ljh12138164'],
    example: '/cloudflarestatus',
    description: 'This route redirects to `/cloudflare/status`.',
    zh: {
        description: '此旧路由会重定向到 `/cloudflare/status`。',
    },
    handler: (ctx) => ctx.set('redirect', `/cloudflare/status${new URL(ctx.req.url).search}`),
};
