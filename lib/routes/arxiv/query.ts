import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:query',
    categories: ['journal'],
    example: '/arxiv/search_query=all:electron&start=0&max_results=10',
    parameters: { query: 'query statement' },
    description: `See [arXiv API User Manual](https://arxiv.org/help/api/user-manual) to find out all query statements.

Fill in parameter \`query\` with content after \`https://export.arxiv.org/api/query?\`. Only the first page is requested; \`start\` is always zero. The common \`limit\` parameter also limits the API response.`,
    name: 'Search Keyword',
    maintainers: ['nczitzk'],
    features: { antiCrawler: true },
    handler,
};

async function handler(ctx: Context) {
    const { query } = ctx.req.param();

    const apiUrl = new URL(`https://export.arxiv.org/api/query?${query}`);
    apiUrl.searchParams.set('start', '0');
    const limit = Number(ctx.req.query('limit'));
    if (Number.isSafeInteger(limit) && limit > 0) {
        const maxResults = Number(apiUrl.searchParams.get('max_results') ?? '10');
        const candidateLimit = getRouteLimit(ctx, maxResults);
        apiUrl.searchParams.set('max_results', String(Math.min(candidateLimit, maxResults)));
    }
    const response = await ofetch(apiUrl.href, { responseType: 'text' });

    const $ = load(response, { xmlMode: true });
    const list = $('entry')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('title').text(),
                link: $item.find('link[type="text/html"]').attr('href'),
                pubDate: parseDate($item.find('published').text()),
                updated: parseDate($item.find('updated').text()),
                author: $item
                    .find('author > name')
                    .toArray()
                    .map((author) => $(author).text())
                    .join(', '),
                category: $item
                    .find('category')
                    .toArray()
                    .map((category) => $(category).attr('term')!),
                description: $item.find('summary').text(),
            };
        });

    return {
        title: `arXiv (${query})`,
        link: 'https://arxiv.org/',
        item: list,
    };
}
