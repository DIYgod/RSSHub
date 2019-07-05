const got = require('@/utils/got');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    let description = `Google Scholar Citation Monitor: ${id};`;
    const BASE_URL = `https://scholar.google.com`;
    const url = `https://scholar.google.com/citations?user=${id}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);

    const profile = $('#gsc_prf .gsc_prf_il').eq(0).text();
    const homePage = $('#gsc_prf_ivh a').attr('href');
    const name = $('#gsc_prf_in').text();
    description += `name: ${name}; profile: ${profile}; homePage: ${homePage}`;

    const list = $('#gsc_a_b .gsc_a_tr').get();
    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            let itemUrl = $('.gsc_a_t a').attr('data-href');
            itemUrl = BASE_URL + itemUrl;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const author = $('.gsc_a_t div').eq(0).text();
            const publication = $('.gsc_a_t div').eq(1).text();
            const single = {
                title: $('.gsc_a_t a').text(),
                description: `Author: ${author}; Publication: ${publication}`,
                link: itemUrl,
                guid: itemUrl,
            };

            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `Google Scholar Citation Monitor: ${id}`,
        link: url,
        description: description,
        item: out,
    };
};
