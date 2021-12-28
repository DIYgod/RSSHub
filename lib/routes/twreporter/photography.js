const cheerio = require('cheerio');
const got = require('@/utils/got');

const fetch = require('./fetch_article');

module.exports = async (ctx) => {
    const baseURL = 'https://www.twreporter.org';
    const url = baseURL + `/photography`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const coverList = $('.WPJvn').get();
    const commonList = $('.eVNsZf').get();

    const coverView = await Promise.all(
        coverList.map(async (item) => {
            const $ = cheerio.load(item);
            const address = baseURL + $('li > a').attr('href');
            const title = $('.gRCDdm').text();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = await fetch(address);
            single.title = title;

            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    const listView = await Promise.all(
        commonList.map(async (item) => {
            const $ = cheerio.load(item);
            const address = baseURL + $('li > a').attr('href');
            const title = $('.etJLWI').text();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = await fetch(address);
            single.title = title;

            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `報導者 | 影像`,
        link: url,
        item: coverView.concat(listView),
    };
};
