import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

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
    const BASE_URL = `https://scholar.google.com`;
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
        const $ = load(item);

        const itemUrl = BASE_URL + $('.gsc_a_t a').attr('href');

        const author = $('.gsc_a_t div').eq(0).text();
        const publication = $('.gsc_a_t div').eq(1).text();
        return {
            title: $('.gsc_a_t a').text(),
            author,
            description: `Author: ${author}; Publication: ${publication}`,
            link: itemUrl,
            guid: itemUrl,
        };
    });
    return {
        title: `Google Scholar: ${name}`,
        link: url,
        description,
        item: out,
    };
}
