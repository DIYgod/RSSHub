const fetch = require('node-fetch');
const cheerio = require('cheerio');
const utils = require('./utils');
const date = require('../../utils/date');

module.exports = async (ctx) => {
    const response = await fetch('https://www.dongqiudi.com/special/48');

    const $ = cheerio.load(await response.text());

    const host = 'https://www.dongqiudi.com';

    const list = $('.detail.special ul li h3')
        .slice(0, 5)
        .get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = host + $('a').attr('href');

            const single = await ctx.cache.tryGet(
                itemUrl,
                async () => {
                    const response = await fetch(itemUrl);
                    if (response.status !== 404) {
                        const $ = utils.ProcessVideo(cheerio.load(await response.text()));
                        const full = $('div.detail');

                        return {
                            title,
                            link: itemUrl,
                            description: utils.ProcessHref(full.find('div:nth-of-type(1)')).html(),
                            author: full.find('span.name').text(),
                            pubDate: date(
                                full
                                    .find('span.time')
                                    .text()
                                    .trim(),
                                8
                            ),
                        };
                    }
                },
                2 * 24 * 60 * 60
            );

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '懂球帝早报',
        link: 'http://www.dongqiudi.com/special/48',
        item: out.filter((e) => e !== undefined),
    };
};
