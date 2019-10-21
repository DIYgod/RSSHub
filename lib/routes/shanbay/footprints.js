const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const cat = ctx.params.category;
    const host = 'https://www.shanbay.com';
    const url = cat ? `${host}/footprints/?category=${cat}` : `${host}/footprints/`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('div.articles div.article-item').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('p.article-publish-day').text() + $('span.article-publish-month-year').text();
            const title = $('h3.article-title a').text();
            const itemUrl = host + $('h3.article-title a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
                description: $d('#content .content').html(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '扇贝精选文章',
        link: url,
        item: out,
    };
};
