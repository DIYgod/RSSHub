// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `Google Scholar Monitor: ${query}`,
        link: url,
        description,
        item: out,
    });
};
