const cheerio = require('cheerio');
const got = require('@/utils/got');

const fetch = require('./fetch_article');

module.exports = async (ctx) => {
    const baseURL = 'https://www.twreporter.org';
    const url = baseURL + `/photography`;
    const res = await got(url);
    const $ = cheerio.load(res.data);
    const coverList = $('.WPJvn').get();
    const commonList = $('.eVNsZf').get();

    const coverView = await Promise.all(
        coverList.map((item) => {
            const $ = cheerio.load(item);
            const address = baseURL + $('li > a').attr('href');
            const title = $('.sc-1aojo4z-4').text();
            return ctx.cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                return single;
            });
        })
    );

    const listView = await Promise.all(
        commonList.map((item) => {
            const $ = cheerio.load(item);
            const address = baseURL + $('li > a').attr('href');
            const title = $('.ii0887-4').text();

            return ctx.cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                return single;
            });
        })
    );

    ctx.state.data = {
        title: `報導者 | 影像`,
        link: url,
        item: coverView.concat(listView),
    };
};
