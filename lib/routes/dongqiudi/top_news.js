const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const id = ctx.params.id || 1;
    const response = await got.get(`https://api.dongqiudi.com/app/tabs/iphone/${id}.json?mark=gif&version=576`);
    const data = response.data.articles;
    const label = response.data.label;

    const proList = [];

    const out = await Promise.all(
        data.map(async (item) => {
            const title = item.title;
            const itemUrl = item.share;

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
        const $ = utils.ProcessVideo(cheerio.load(responses[i].data));
        const full = $('div.detail');

        out[i].description = utils.ProcessHref(full.find('div:nth-of-type(1)')).html();
        out[i].author = full.find('span.name').text();
        out[i].pubDate = date(
            full
                .find('span.time')
                .text()
                .trim(),
            8
        );
    }
    ctx.state.data = {
        title: `懂球帝 - ${label}`,
        link: 'http://dongqiudi.com/news',
        item: out.filter((e) => e !== undefined),
    };
};
