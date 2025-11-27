import type { APIRoute } from '@/types';

export const apiRoute: APIRoute = {
    path: '/',
    maintainers: ['DIYgod'],
    handler,
};

function handler() {
    return {
        code: 0,
    };
}
