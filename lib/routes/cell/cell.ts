// cell.com is extremely slow, and redirect too many times.
// Thus, the content page are replaced by www.sciencedirect.com.

import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cell/:category',
    categories: ['journal'],
    example: '/cell/cell/current',
    parameters: { category: 'Query type, see the table below' },
    features: {
        supportScihub: true,
    },
    name: 'Current Issue',
    maintainers: ['y9c'],
    description: `| \`:category\` |        Query Type       |
| :---------: | :---------------------: |
|   current   | Current Issue (default) |
|   inpress   |    Articles in press    |`,
    handler,
};

async function handler(ctx: Context) {
    const baseURL = 'https://www.cell.com';
    const { category } = ctx.req.param();
    const inPress = category === 'inpress';
    const pageURL = inPress ? `${baseURL}/cell/inpress.rss` : `${baseURL}/cell/current.rss`;
    const categoryTitle = inPress ? 'Articles in press' : 'Latest issue';

    const pageResponse = await ofetch(pageURL, { responseType: 'text' });
    const $ = load(pageResponse, { xmlMode: true });

    const out = $('item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const section = $item.find(String.raw`prism\:section`).text();
            const address = $item.find('link').text().replace('?rss=yes', '');

            return {
                title: $item.find(String.raw`dc\:title`).text(),
                author: $item.find(String.raw`dc\:creator`).text(),
                description: `<p style="color: #007dbc; text-transform: uppercase; font-weight: 700;">${section}</p>${$item.find('description').text()}`,
                link: address,
                guid: address,
                doi: $item.find(String.raw`dc\:identifier`).text(),
                pubDate: parseDate($item.find(String.raw`dc\:date`).text()),
            };
        });

    return {
        title: `Cell | ${categoryTitle}`,
        description: 'Cell, a research journal',
        link: baseURL,
        item: out,
    };
}
