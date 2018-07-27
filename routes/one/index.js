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

    const list = [$('.item.active'), $('.corriente')[0], $('.corriente')[1]];

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
        const detail = await axios({
            method: 'get',
            url: url,
            headers: {
                'User-Agent': config.ua,
                Referer: 'http://wufazhuce.com/',
            },
        });
        {
            const data = detail.data;
            const $ = cheerio.load(data);
            item.description = $('.tab-content').html();
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
