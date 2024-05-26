import { Route } from '@/types';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/invalid-parameter-error',
    name: 'invalid-parameter-error',
    maintainers: ['DIYgod'],
    example: '/invalid-parameter-error',
    handler,
};

function handler() {
    throw new InvalidParameterError('Test invalid parameter error');
    return {
        title: 'Title',
        items: [
            {
                title: 'Title',
            },
        ],
    };
}
