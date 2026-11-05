import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/csail/news',
    categories: ['university'],
    example: '/mit/csail/news',
    radar: [
        {
            source: ['www.csail.mit.edu/news'],
        },
    ],
    name: 'Computer Science and Artificial Intelligence Laboratory (CSAIL)',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.csail.mit.edu/news',
};

async function handler(ctx: Context) {
    const limit = getRouteLimit(ctx, 24);
    const rootUrl = 'https://www.csail.mit.edu';
    const currentUrl = `${rootUrl}/news/`;

    const response = await ofetch<{ response: { docs: Array<{ ss_title: string; ss_url: string }> } }>(`${rootUrl}/api-proxy/angular-solr?_api_proxy_uri=news&q=*%3A*&sort=ds_field_publication_date%20DESC&rows=${limit}&start=0`, {
        headers: {
            accept: 'application/json',
        },
    });

    const list: DataItem[] = response.response.docs.map((doc) => ({
        title: doc.ss_title,
        link: `${rootUrl}${doc.ss_url}`,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`mit:csail:article-details:v1:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                content('.sidebar-right, .sidebar-item').remove();

                const date = content('time').attr('datetime');
                return { description: content('.content-container-inner').html(), pubDate: date ? parseDate(date) : undefined };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: 'News - MIT CSAIL',
        link: currentUrl,
        item: items,
    };
}
