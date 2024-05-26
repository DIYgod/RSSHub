import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/httperror',
    name: 'httperror',
    maintainers: ['DIYgod'],
    example: '/httperror',
    handler,
};

async function handler() {
    await got({
        method: 'get',
        url: 'https://httpbingo.org/status/404',
    });
    return {
        title: 'Title',
        items: [
            {
                title: 'Title',
            },
        ],
    };
}
