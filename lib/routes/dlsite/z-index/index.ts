import { Route } from '@/types';
import { ProcessItems } from '../utils';

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: [],
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    return await ProcessItems(ctx);
}
