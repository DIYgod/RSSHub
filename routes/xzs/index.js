const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.xuezishi.net';

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const list = $('.tab-list>.item:not(.item-ad)').get();

    const items = list.map((i) => {
        const item = $(i);

        const title = item
            .find('.item-title')
            .text()
            .replace(/\s+/g, '');
        const desc = item
            .find('.item-excerpt')
            .text()
            .replace(/\s+/g, '');
        const date = item.find('.date').text();
        const href = item.find('.item-title>a').attr('href');

        return {
            title: title,
            description: desc,
            pubDate: date,
            link: href,
        };
    });

    ctx.state.data = {
        title: '学姿势 -最新文章',
        link: 'https://www.xuezishi.net',
        item: items,
    };
};
