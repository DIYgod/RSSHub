import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:query',
    categories: ['journal'],
    example: '/arxiv/search_query=all:electron&start=0&max_results=10',
    parameters: { query: 'query statement' },
    description: `See [arXiv API User Manual](https://arxiv.org/help/api/user-manual) to find out all query statements.

Fill in parameter \`query\` with content after \`https://export.arxiv.org/api/query?\`.`,
    name: 'Search Keyword',
    maintainers: ['nczitzk'],
    features: { antiCrawler: true },
    handler,
};

async function handler(ctx: Context) {
    const { query } = ctx.req.param();

    const currentUrl = `https://export.arxiv.org/api/query?${query}`;
    const response = await ofetch(currentUrl, { responseType: 'text' });

    const $ = load(response);
    const list = $('entry')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('title').text(),
                link: $item.find('link[type="text/html"]').attr('href'),
                pubDate: parseDate($item.find('published').text()),
                description: $item.find('summary').text(),
            };
        });

    return {
        title: `arXiv (${query})`,
        link: currentUrl,
        item: list,
    };
}
