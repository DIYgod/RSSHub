const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const type = `${ctx.params.type ? ctx.params.type : ''}`;
    const url = `https://www.natgeomedia.com/category/${ctx.params.cat}/${type}`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const list = $('.td-ss-main-content').find('.td-animation-stack');

    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }
    const out = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const storyLink = each.find('a[itemprop=url]').attr('href');
            const item = {
                title: each.find('a[itemprop=url]').attr('title'),
                pubDate: each.find('time').attr('datetime'),
                link: storyLink,
                guid: storyLink.match(/\d+/g)[0],
            };
            const key = `${ctx.params.cat}${type}${item.guid}`;
            const value = await ctx.cache.get(key);
            if (value) {
                item.description = value;
            } else {
                const storyDetail = await axios.get(item.link);
                const data = storyDetail.data;
                const $ = cheerio.load(data);
                item.description = $('.td-post-content').html();
                ctx.cache.set(key, item.description, 12 * 60 * 60);
            }
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
