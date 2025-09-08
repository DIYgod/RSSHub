import { Route } from '@/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/memory',
    categories: ['new-media'],
    example: '/houxu/memory',
    radar: [
        {
            source: ['houxu.app/memory', 'houxu.app/'],
        },
    ],
    name: '跟踪',
    maintainers: ['nczitzk'],
    handler,
    url: 'houxu.app/memory',
};

async function handler(ctx) {
    const rootUrl = 'https://houxu.app';
    const apiUrl = `${rootUrl}/api/1/lives/updated?limit=${ctx.req.query('limit') ?? 50}`;
    const currentUrl = `${rootUrl}/memory`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.map((item) => ({
        guid: `${rootUrl}/lives/${item.id}#${item.last.id}`,
        title: item.last.link.title,
        link: `${rootUrl}/lives/${item.id}`,
        author: item.last.link.source,
        category: [item.title],
        pubDate: parseDate(item.last.create_at),
        description: art(path.join(__dirname, 'templates/memory.art'), {
            live: item.title,
            url: item.last.link.url,
            title: item.last.link.title,
            source: item.last.link.source,
            description: item.last.link.description,
        }),
    }));

    return {
        title: '后续 - 跟踪',
        link: currentUrl,
        item: items,
    };
}
