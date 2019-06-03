const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const type = ctx.params.type;
    const url = `http://www.3dmgame.com/games/${name}/${type}`;

    const response = await axios({
        method: 'get',
        url: url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    let list;
    if (type === 'resource') {
        list = $('.ZQ_Left .Llis_4 .lis:first-of-type li').get();
    } else {
        list = $('.ZQ_Left .lis')
            .slice(0, 10)
            .get();
    }

    const items = await Promise.all(
        list.map(async (i) => {
            const item = $(i);
            const url = item.find('.bt').attr('href');

            const cache = await ctx.cache.get(url);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title: item.find('.bt').text(),
                pubDate: item.find('p').text(),
                link: url,
                guid: url,
            };
            ctx.cache.set(url, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        item: items,
    };
};
