const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.kuai.media/portal.php?mod=list&catid=${ctx.params.id}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.data_row').get();

    const out = await Promise.all(
        list.slice(0, 40).map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.news_title h3 a').text();
            const partial = $('.news_title h3 a').attr('href');
            const address = `https://www.kuai.media/${partial}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return JSON.parse(cache);
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);
            const contents = get('.s').html();
            const single = {
                title,
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: '快媒体',
        link: url,
        item: out,
    };
};
