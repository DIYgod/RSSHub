const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await got.get(`https://www.dongqiudi.com/special/${id}`);

    const $ = cheerio.load(response.data);

    const host = 'https://www.dongqiudi.com';

    const list = $('.detail.special ul li h3')
        .slice(0, 5)
        .get();

    const proList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = host + $('a').attr('href');

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title,
                link: itemUrl,
            };

            const es = got.get(itemUrl);
            proList.push(es);
            return Promise.resolve(single);
        })
    );

    const responses = await got.all(proList);
    for (let i = 0; i < proList.length; i++) {
        utils.ProcessFeedType2(out[i], responses[i].data);
    }
    ctx.state.data = {
        title: `懂球帝专题-${id}`,
        link: `https://www.dongqiudi.com/special/${id}`,
        item: out.filter((e) => e !== undefined),
    };
};
