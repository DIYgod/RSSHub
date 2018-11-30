const cheerio = require('cheerio');
const axios = require('../../utils/axios');

const base_url = 'https://pigtails.moe';
module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: base_url,
        headers: {
            Referer: base_url,
        },
    });

    const $ = cheerio.load(response.data);

    const items = [];
    $('.posts > .post > a').each((idx, item) => {
        const $item = $(item);
        const img_url = $('.thumb', item)
            .attr('style')
            .split(')')[0]
            .split('(')[1];
        items.push({
            title: $item.text(),
            description: `<img referrerpolicy="no-referrer" src="${img_url}" >`,
            link: `${base_url}${$item.attr('href')}`,
        });
    });

    ctx.state.data = {
        title: 'Awesome Pigtails',
        description: 'Share awesome pigtails.',
        link: base_url,
        item: items,
    };
};
