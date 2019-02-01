const cheerio = require('cheerio');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const url = `http://${ctx.params.url}`;
    const res = await axios.get(`${url}/archives`);
    const data = res.data;
    const $ = cheerio.load(data);

    const list = $('.post-header');

    const count = [];
    for (let i = 0; i < Math.min(list.length, 5); i++) {
        count.push(i);
    }
    const out = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const storyLink = each.find('.post-title-link').attr('href');
            const item = {
                title: each.find('[itemprop=name]').text(),
                link: encodeURI(`${url}${storyLink}`),
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
                item.description = $('.post-body').html();
                ctx.cache.set(key, item.description, 6 * 60 * 60);
            }
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: $('.site-title').text(),
        link: url,
        description: $('[name=description]').attr('content'),
        item: out,
    };
};
