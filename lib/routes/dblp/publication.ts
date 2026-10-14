import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

export const route: Route = {
    path: '/:field',
    categories: ['study'],
    example: '/dblp/knowledge%20tracing',
    parameters: { field: 'Research field' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            // Search keywords are query parameters, not arbitrary path segments.
            source: ['dblp.org/search'],
        },
    ],
    name: 'Keyword Search',
    maintainers: ['ytno1'],
    handler,
};

async function handler(ctx) {
    const field = ctx.req.param('field');
    const link = new URL('https://dblp.org/search');
    link.searchParams.set('q', field);

    const apiUrl = new URL('https://dblp.org/search/publ/api');
    apiUrl.search = new URLSearchParams({ q: field, format: 'json', h: '10' }).toString();
    let response = await ofetch(apiUrl.href, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
    });
    if (!response?.result?.hits) {
        const { page, destroy } = await getPlaywrightPage(apiUrl.href, { noGoto: true, closeTimeout: 0 });
        try {
            await page.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch', 'other'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
            await page.goto(apiUrl.href, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('body > pre');
            response = JSON.parse((await page.locator('body > pre').textContent()) ?? '');
        } finally {
            await destroy();
        }
    }
    if (!response?.result?.hits) {
        throw new Error('DBLP did not return publication search data. The source may be showing an anti-bot challenge.');
    }
    const {
        result: { hits },
    } = response;
    const { hit: data = [] } = hits;

    const list = data.map((item) => {
        const { info } = item;
        const { authors, title, venue, year, type, doi, ee } = info;

        const authorList = authors?.author ? (Array.isArray(authors.author) ? authors.author : [authors.author]) : [];

        return {
            title,
            link: ee,
            author: authorList.length ? authorList.map((author) => ({ name: author.text })) : undefined,
            doi,
            description: `Year: ${year ?? 'unknown'}, Venue: ${venue}, Type: ${type}, Doi: ${doi}`,
        };
    });

    return {
        title: `【dblp】${field}`,
        link: link.href,
        description: `DBLP ${field} RSS`,
        item: list,
    };
}
