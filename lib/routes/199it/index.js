const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.199it.com/newly`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.entry-content').get();

    const out = await Promise.all(
        list.slice(0, 9).map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.post-time time').attr('datetime');
            const title = $('.entry-title a').attr('title');
            const partial = $('.entry-title a').attr('href');
            const address = partial;
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '199it',
        link: url,
        item: out,
    };
};
