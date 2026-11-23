import { escapeText } from 'entities';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://yamap.com/activities/';
const host = 'https://api.yamap.com/v3/activities?page=1&per=24';

export const route: Route = {
    path: '/',
    categories: ['travel'],
    example: '/yamap',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['valuex'],
    handler,
    description: '',
};

async function handler() {
    const link = host;
    const response = await got(link);
    const metadata = response.data;
    const items = metadata.activities.map((item) => ({
        title: item.title + '-' + (item.map?.name || 'Japan'),
        link: baseUrl + item.id.toString(),
        pubDate: parseDate(item.public_at * 1000),
        updated: parseDate(item.updated_at * 1000),
        author: item.user.name,
        category: [item.activity_type.name],
        image: item.image?.url,
        description: item.description ? `<p>${escapeText(item.description).replaceAll('\n', '<br>\n')}</p>` : undefined,
    }));

    return {
        title: 'Yamap',
        link: baseUrl,
        description: 'Yamap',
        item: items,
    };
}
