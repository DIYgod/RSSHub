import { Route } from '@/types';

export const route: Route = {
    path: '/error',
    name: 'error',
    maintainers: ['DIYgod'],
    example: '/error',
    handler,
};

function handler() {
    throw new Error('Error test');
    return {
        title: 'Title',
        items: [
            {
                title: 'Title',
            },
        ],
    };
}
