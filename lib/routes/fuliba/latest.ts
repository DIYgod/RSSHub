import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/fuliba/latest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['fuliba2023.net/'],
        },
    ],
    name: '最新',
    maintainers: ['shinemoon'],
    handler,
    url: 'fuliba2023.net/',
};

async function handler(ctx) {
    let response;
    try {
        const result = await got('https://fuliba2023.net/wp-json/wp/v2/posts', {
            searchParams: {
                per_page: Math.min(getRouteLimit(ctx, 100), 100),
                _embed: 1,
            },
        });
        response = result.data;
    } catch (error) {
        if (error instanceof FetchError && error.statusCode === 410) {
            throw new Error('Fuliba returned HTTP 410 for its configured WordPress API. The route needs a verified current article source.', { cause: error });
        }
        throw error;
    }
    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        guid: item.guid.rendered,
        description: item.content.rendered,
        pubDate: item.date_gmt ? parseDate(item.date_gmt.endsWith('Z') ? item.date_gmt : `${item.date_gmt}Z`) : undefined,
        author: item._embedded.author[0].name,
    }));

    return {
        title: '福利吧',
        link: 'https://fuliba2023.net',
        item: items,
    };
}
