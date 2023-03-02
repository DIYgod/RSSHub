const cheerio = require('cheerio');
const got = require('@/utils/got');

const fetch = require('./fetch_article');

module.exports = async (ctx) => {
    const url = 'https://www.twreporter.org';
    const res = await got(url);
    const $ = cheerio.load(res.data);
    const list = $('.gKMjSz').get();

    const out = await Promise.all(
        list.map((item) => {
            const $ = cheerio.load(item);
            const address = url + $('a').attr('href');
            const title = $('.latest-section__Title-hzxpx3-6').text();
            return ctx.cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                return single;
            });
        })
    );
    ctx.state.data = {
        title: `報導者 | 最新`,
        link: url,
        item: out,
    };
};
