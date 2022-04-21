const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const response = await got.get('https://www.dongqiudi.com/special/48');

    const $ = cheerio.load(response.data);

    const host = 'https://www.dongqiudi.com';

    const list = $('.detail.special ul li h3')
        .slice(0, 5)
        .get()
        .filter((e) => cheerio.load(e).text().length > 3);

    const proList = [];

    const out = await Promise.all(
        list.map((item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = host + $('a').attr('href');

            return ctx.cache.tryGet(itemUrl, () => {
                const single = {
                    title,
                    link: itemUrl,
                };

                const es = got.get(itemUrl);
                proList.push(es);
                return single;
            });
        })
    );

    const responses = await got.all(proList);
    for (let i = 0; i < proList.length; i++) {
        utils.ProcessFeedType2(out[i], responses[i].data);
    }
    ctx.state.data = {
        title: '懂球帝早报',
        link: 'http://www.dongqiudi.com/special/48',
        item: out.filter((e) => e.description !== undefined),
    };
};
