import type { Data, Route } from '@/types';
import { fetchItems } from './utils';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/web/blog',
    radar: [
        {
            source: ['web.dev/blog'],
        },
    ],
    name: 'Blog',
    maintainers: ['KarasuShin'],
    handler,
};

async function handler(): Promise<Data> {
    return {
        title: 'Blog',
        link: 'https://web.dev/blog',
        image: 'https://web.dev/_pwa/web/icons/icon-144x144.png',
        item: await fetchItems('type:blog'),
    };
}
