import { html } from 'hono/html';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    name: 'Articles',
    categories: ['blog'],
    example: '/readsomethingwonderful',
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
            source: ['readsomethingwonderful.com/'],
        },
    ],
    maintainers: ['ttttmr'],
    handler,
};

async function handler() {
    const { data: response } = await got('https://api.getmatter.com/tools/api/rsw_entries/?format=json');

    const items = response.results.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: item.publication_date ? parseDate(item.publication_date) : undefined,
        author: item.author_name,
        description: html` ${item.recommender_name ? html`<p>Recommended by: ${item.recommender_name}</p>` : ''} ${item.screenshot ? html`<img src="${item.screenshot}" alt="${`Screenshot - ${item.title}`}" />` : ''} `.toString(),
    }));

    return {
        title: 'Read Something Wonderful',
        link: 'https://readsomethingwonderful.com/',
        item: items,
    };
}
