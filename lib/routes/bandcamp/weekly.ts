import { Route } from '@/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/weekly',
    categories: ['multimedia'],
    example: '/bandcamp/weekly',
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
            source: ['bandcamp.com/'],
        },
    ],
    name: 'Weekly',
    maintainers: ['nczitzk'],
    handler,
    url: 'bandcamp.com/',
};

async function handler() {
    const rootUrl = 'https://bandcamp.com';
    const apiUrl = `${rootUrl}/api/bcweekly/3/list`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.slice(0, 50).map((item) => ({
        title: item.title,
        link: `${rootUrl}/?show=${item.id}`,
        pubDate: parseDate(item.published_date),
        description: art(path.join(__dirname, 'templates/weekly.art'), {
            v2_image_id: item.v2_image_id,
            desc: item.desc,
        }),
    }));

    return {
        title: 'Bandcamp Weekly',
        link: rootUrl,
        item: items,
    };
}
