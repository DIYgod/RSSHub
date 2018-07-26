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

    const image = $('.item.active');
    const today = $('.corriente');
    const list = [image, today[0], today[1]];

    const out = [];

    for (let i = 0; i < list.length; i++) {
        const url = $(list[i])
            .find('a')
            .attr('href');
        const item = {
            title: $(list[i])
                .find('a')
                .text()
                .replace(/\s+/g, ' ')
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
            item.description = $('.tab-content').html();
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
