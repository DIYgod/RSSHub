// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
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

    const list = $('#gsc_a_b .gsc_a_tr').get();

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
    ctx.set('data', {
        title: `Google Scholar: ${name}`,
        link: url,
        description,
        item: out,
    });
};
