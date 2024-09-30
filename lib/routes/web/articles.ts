import type { Data, Route } from '@/types';
import { fetchItems } from './utils';

export const route: Route = {
    path: '/articles',
    categories: ['programming'],
    example: '/web/articles',
    radar: [
        {
            source: ['web.dev/articles'],
        },
    ],
    name: 'Articles',
    maintainers: ['KarasuShin'],
    handler,
};

async function handler(): Promise<Data> {
    return {
        title: 'Articles',
        link: 'https://web.dev/articles',
        image: 'https://web.dev/_pwa/web/icons/icon-144x144.png',
        item: await fetchItems('family_url:/articles'),
    };
}
