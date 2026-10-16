import { escapeText } from 'entities';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://yamap.com/activities/';
const host = 'https://api.yamap.com/v3/activities?page=1&per=24';

function parseUnixDate(value?: number) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return;
    }

    const date = parseDate(value * 1000);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

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
        pubDate: parseUnixDate(item.public_at),
        updated: parseUnixDate(item.updated_at),
        author: typeof item.user?.name === 'string' ? item.user.name : undefined,
        category: typeof item.activity_type?.name === 'string' && item.activity_type.name ? [item.activity_type.name] : undefined,
        image: typeof item.image?.url === 'string' && item.image.url ? item.image.url : undefined,
        description: typeof item.description === 'string' && item.description ? `<p>${escapeText(item.description).replaceAll('\n', '<br>\n')}</p>` : undefined,
    }));

    return {
        title: 'Yamap',
        link: baseUrl,
        description: 'Yamap',
        item: items,
    };
}
