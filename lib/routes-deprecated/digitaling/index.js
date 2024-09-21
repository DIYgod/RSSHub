const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://www.digitaling.com';
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    // 文章列表
    const list = $('#home_latest li h3')
        .find('a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            // 判断缓存
            if (cache) {
                return JSON.parse(cache);
            }
            const res = await got.get(itemUrl);
            const $ = cheerio.load(res.data);

            const item = {
                title: $('.clearfix h2').text(),
                author: $('#avatar_by').find('a').text(),
                link: itemUrl,
                description: $('#article_con').html(),
                pubDate: new Date().toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(item));

            return item;
        })
    );

    ctx.state.data = {
        title: '数英网-最新文章',
        link,
        item: out,
    };
};
