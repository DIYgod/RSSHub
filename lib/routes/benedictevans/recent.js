const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.ben-evans.com/benedictevans/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('section > article').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.BlogList-item-title').text();
            const address = 'https://www.ben-evans.com' + $('.BlogList-item-title').attr('href');
            const time = $('.Blog-meta-item--date').text();
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const contents = capture('.col.sqs-col-12.span-12').html();
            const single = {
                title,
                author: 'Benedict Evans',
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `Benedict Evans`,
        link: url,
        item: out,
    };
};
