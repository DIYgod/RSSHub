import { Route } from '@/types';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/config-not-found-error',
    name: 'config-not-found-error',
    maintainers: ['DIYgod'],
    example: '/config-not-found-error',
    handler,
};

function handler() {
    throw new ConfigNotFoundError('Test config not found error');
    return {
        title: 'Title',
        items: [
            {
                title: 'Title',
            },
        ],
    };
}
