import type { Route } from '@/types';
import got from '@/utils/got';

import { parseItem, parseList } from './utils';

export const route: Route = {
    path: '/scientific',
    categories: ['new-media'],
    example: '/guokr/scientific',
    radar: [
        {
            source: ['guokr.com/scientific', 'guokr.com/'],
        },
    ],
    name: '科学人',
    maintainers: ['alphardex', 'nczitzk'],
    handler,
    url: 'guokr.com/scientific',
};

async function handler() {
    const { data: response } = await got('https://www.guokr.com/beta/proxy/science_api/articles', {
        searchParams: {
            retrieve_type: 'by_category',
            page: 1,
        },
    });

    const result = parseList(response);

    const items = await Promise.all(result.map((item) => parseItem(item)));

    return {
        title: '果壳网 科学人',
        link: 'https://www.guokr.com/scientific',
        description: '果壳网 科学人',
        item: items,
    };
}
