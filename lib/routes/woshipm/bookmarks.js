const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `http://www.woshipm.com/u/${id}`;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const name = $('div.name').text();

    const remark_api = `http://www.woshipm.com/__api/v1/users/${id}/bookmarks`;
    const response_api = await got.get(remark_api);
    const list = response_api.data.payload.value;
    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = info.permalink;

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
        title: `${name}的收藏-人人都是产品经理`,
        link: link,
        item: out,
    };
};
