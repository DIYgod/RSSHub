const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://wufazhuce.com/',
        headers: {
            'User-Agent': config.ua,
            Referer: 'http://wufazhuce.com/',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.col-md-12').find('li');

    const out = [];

    for (let i = 0; i < list.length; i++) {
        const url = $(list[0])
            .find('a')
            .attr('href');
        const item = {
            title: $(list[i])
                .find('a')
                .text()
                .trim(),
            link: url,
            description: '',
        };
        const key = url.match(/\d+/g)[0];
        const value = await ctx.cache.get(key);

        if (value) {
            item.description = value;
        } else {
            const detail = await axios({
                method: 'get',
                url: url,
                headers: {
                    'User-Agent': config.ua,
                    Referer: 'http://wufazhuce.com/',
                },
            });
            const data = detail.data;
            const $ = cheerio.load(data);
            item.description = $('.one-articulo').html();
            ctx.cache.set(key, item.description, 24 * 60 * 60);
        }

        out.push(item);
    }
    ctx.state.data = {
        title: $('title').text(),
        link: 'http://wufazhuce.com/',
        item: out,
        description: '复杂世界里, 一个就够了. One is all.',
    };
};
