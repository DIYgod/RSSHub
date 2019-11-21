const cheerio = require('cheerio');
const got = require('@/utils/got');

function batchRemove($, array) {
    array.forEach((element) => {
        $(element).remove();
    });
}

module.exports = async (ctx) => {
    const url = `https://1x.com/magazine`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const unnecessary = ['#navigation', '.Headnote', '.Logotype', '.Footer', '.SplashImage-wrapper', '.Cta', '.CartSidebar', '.bottomNavigation'];
    batchRemove($, unnecessary);
    const list = $('a')
        .slice(0, 10)
        .get();
    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $(item).text();
            const partial = $(item).attr('href');
            const address = `https://1x.com${partial}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const contents = capture('.PageSection.Static').html();
            const single = {
                title,
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '1X Magazine',
        link: url,
        item: out,
    };
};
