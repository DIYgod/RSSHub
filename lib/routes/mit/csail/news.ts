import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 24;
    const rootUrl = 'https://www.csail.mit.edu';
    const currentUrl = `${rootUrl}/news/`;

    const response = await ofetch(`${rootUrl}/api-proxy/angular-solr?_api_proxy_uri=news&q=*%3A*&sort=ds_field_publication_date%20DESC&rows=${limit}&start=0`, {
        headers: {
            accept: 'application/json',
        },
    });

    const list = response.response.docs.map((doc) => ({
        title: doc.ss_title,
        link: `${rootUrl}${doc.ss_url}`,
    })) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                content('.sidebar-right, .sidebar-item').remove();

                item.description = content('.content-container-inner').html();
                item.pubDate = parseDate(content('time').attr('datetime')!);

                return item;
            })
        )
    );

    return {
        title: 'News - MIT CSAIL',
        link: currentUrl,
        item: items,
    };
}
