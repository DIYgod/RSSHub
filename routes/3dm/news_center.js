const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const url = 'http://www.3dmgame.com/news/';
    const res = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.QZlisttxt ul li p');
    const out = [];

    for (let i = 0; i < (list.length <= 20 ? list.length : 20); i++) {
        const item = list[i];
        const itemUrl = $(item)
            .find('a:nth-child(2)')
            .attr('href');
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(cache);
            continue;
        }
        const title = $(item)
            .find('a:nth-child(2)')
            .text();
        const time = $(item)
            .find('span')
            .text();
        let itemRes;
        try {
            itemRes = await axios({
                method: 'get',
                url: itemUrl,
                headers: {
                    'User-Agent': config.ua,
                },
            });
        } catch (e) {
            continue;
        }
        {
            const itemPage = itemRes.data;
            const $ = cheerio.load(itemPage);
            const content = $('.con div:nth-child(2)').html();
            const single = {
                title: title,
                description: content,
                pubDate: time,
                link: itemUrl,
                guid: itemUrl,
            };
            out.push(single);

            ctx.cache.set(itemUrl, single, 24 * 60 * 60);
        }
    }
    ctx.state.data = {
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        item: out,
    };
};
