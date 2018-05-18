const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    let category = ctx.params.category;

    category = category === undefined || category === 'undefined' ? '' : category;

    const url = `http://www.mzitu.com/${category}`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
            Referer: url,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#pins li');

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item:
            list &&
            list
                .map((item, index) => {
                    item = $(index);
                    const linkA = item.find('a');
                    const previewImg = linkA.find('img');
                    return {
                        title: previewImg.attr('alt'),
                        description: `描述：${previewImg.attr('alt')}<br><img referrerpolicy="no-referrer" src="${previewImg.data('original')}">`,
                        pubDate: new Date(item.find('.time').text()).toUTCString(),
                        link: linkA.attr('href'),
                    };
                })
                .get(),
    };
};
