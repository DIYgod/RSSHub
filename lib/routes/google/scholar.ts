import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/scholar/:query',
    categories: ['finance'],
    example: '/google/scholar/data+visualization',
    parameters: { query: 'query statement which supports「Basic」and「Advanced」modes' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Keywords Monitoring',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    let params = ctx.req.param('query');
    let query = params;
    let description = `Google Scholar Monitor Query: ${query}`;

    if (params.includes('as_q=')) {
        const reg = /as_q=(.*?)&/g;
        query = reg.exec(params)[1];
        description = `Google Scholar Monitor Advanced Query: ${query}`;
    } else {
        params = 'q=' + params;
    }

    const url = `https://scholar.google.com/scholar?${params}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const list = $('#gs_res_ccl_mid .gs_r.gs_or.gs_scl .gs_ri').get();

    const out = list.map((item) => {
        const $ = load(item);
        const itemUrl = $('h3 a').attr('href');
        return {
            title: $('h3 a').text(),
            author: $('.gs_a').text(),
            description: $('.gs_rs').text(),
            link: itemUrl,
            guid: itemUrl,
        };
    });

    return {
        title: `Google Scholar Monitor: ${query}`,
        link: url,
        description,
        item: out,
    };
}
