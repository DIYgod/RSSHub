const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `http://www.woshipm.com/u/${id}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const name = $('div.name').text();
    const list = $('div.postlist-item.u-clearfix div.content')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('h2.post-title a').attr('title'),
                link: $(this).find('h2.post-title a').attr('href'),
                date: $(this).find('time').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('div.grap').html().trim();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${name}的文章-人人都是产品经理`,
        link: link,
        item: out,
    };
};
