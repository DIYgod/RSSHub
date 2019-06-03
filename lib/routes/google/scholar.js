const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let params = ctx.params.query;
    let query = params;
    let description = `Google Scholar Monitor Query: ${query}`;

    if (params.indexOf('as_q=', 0) !== -1) {
        const reg = /as_q=(.*?)&/g;
        query = reg.exec(params)[1];
        description = `Google Scholar Monitor Advanced Query: ${query}`;
    } else {
        params = 'q=' + params;
    }

    const url = `https://scholar.google.com/scholar?${params}`;

    const response = await axios({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('#gs_res_ccl_mid .gs_r.gs_or.gs_scl .gs_ri').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const itemUrl = $('h3 a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title: $('h3 a').text(),
                author: $('.gs_a').text(),
                description: $('.gs_rs').text(),
                link: itemUrl,
                guid: itemUrl,
            };

            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `Google Scholar Monitor: ${query}`,
        link: url,
        description,
        item: out,
    };
};
