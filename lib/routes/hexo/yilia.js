const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const url = `http://${ctx.params.url}`;
    const res = await axios.get(`${url}/archives`);
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.archive-type-post');
    const item = await Promise.all(
        Array.from(list).map(async (each) => {
            const itemLink = $(each)
                .find('.archive-article-title')
                .attr('href');
            const item = {
                title: $(each)
                    .find('.archive-article-title')
                    .text(),
                link: encodeURI(`${url}${itemLink}`),
            };
            const key = item.link;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const storyDeatil = await axios.get(item.link);
                const data = storyDeatil.data;
                const $ = cheerio.load(data);
                item.pubDate = $('time').attr('datetime');
                item.description = $('.article-entry').html();
                ctx.cache.set(key, item.description, 6 * 60 * 60);
            }
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: $('.header-author')
            .find('a')
            .text(),
        link: url,
        description: $('.header-subtitle')
            .eq(0)
            .text(),
        item,
    };
};
