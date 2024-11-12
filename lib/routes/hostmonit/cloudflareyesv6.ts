import { Route } from '@/types';
export const route: Route = {
    path: '/cloudflareyesv6',
    name: 'Unknown',
    maintainers: [],
    handler,
};

function handler(ctx) {
    ctx.set('redirect', '/hostmonit/cloudflareyes/v6');
}
