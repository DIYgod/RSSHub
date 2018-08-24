const axios = require('../../utils/axios');
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
    const list = $('#gs_res_ccl_mid .gs_r.gs_or.gs_scl .gs_ri');

    const out = [];

    for (let i = 0; i < list.length; i++) {
        const $ = cheerio.load(list[i]);
        const itemUrl = $('h3 a').attr('href');
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
        }
        const single = {
            title: $('h3 a').text(),
            author: $('.gs_a').text(),
            description: $('.gs_rs').text(),
            link: itemUrl,
            guid: itemUrl,
        };

        out.push(single);
    }

    ctx.state.data = {
        title: `Google Scholar Monitor: ${query}`,
        link: url,
        description,
        item: out,
    };
};
