import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/citations/:id',
    categories: ['journal'],
    example: '/google/citations/mlmE4JMAAAAJ',
    parameters: { id: 'N' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Scholar Author Citations',
    maintainers: ['KellyHwong', 'const7'],
    handler,
    description: `The parameter id in the route is the id in the URL of the user's Google Scholar reference page, for example \`https://scholar.google.com/citations?user=mlmE4JMAAAAJ\` to \`mlmE4JMAAAAJ\`.

Query parameters are also supported here, for example \`https://scholar.google.com/citations?user=mlmE4JMAAAAJ&sortby=pubdate\` to \`mlmE4JMAAAAJ&sortby=pubdate\`. Please make sure that the user id (\`mlmE4JMAAAAJ\` in this case) should be the first parameter in the query string.`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const baseUrl = 'https://scholar.google.com';
    const url = `https://scholar.google.com/citations?user=${id}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);

    const profile = $('#gsc_prf .gsc_prf_il').eq(0).text();
    const homePage = $('#gsc_prf_ivh a').attr('href');
    const name = $('#gsc_prf_in').text();
    const description = `Google Scholar Citation Monitor: ${name}; Profile: ${profile}; HomePage: ${homePage}`;

    const list = $('#gsc_a_b .gsc_a_tr').toArray();

    const out = list.map((item) => {
        const $item = $(item);

        const itemUrl = baseUrl + $item.find('.gsc_a_t a').attr('href');

        const author = $item.find('.gsc_a_t div').eq(0).text();
        const publication = $item.find('.gsc_a_t div').eq(1).text();
        const year = $item.find('.gsc_a_y').text().trim();
        return {
            title: $item.find('.gsc_a_t a').text(),
            author,
            description: `Publication: ${publication}`,
            link: itemUrl,
            guid: itemUrl,
            pubDate: /^\d{4}$/.test(year) ? parseDate(`${year}-01-01T00:00:00Z`) : undefined,
        };
    });
    return {
        title: `Google Scholar: ${name}`,
        link: url,
        description,
        item: out,
    };
}
