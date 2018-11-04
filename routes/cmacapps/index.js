const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://cmacapps.com',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.loops-wrapper article');

    ctx.state.data = {
        title: 'Cmacapps',
        link: 'https://cmacapps.com',
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.post-title').text(),
                        description: `<br>Category：${item.find('.post-category').text()}<br><img referrerpolicy="no-referrer" src="${item
                            .find('.post-image')
                            .find('img')
                            .attr('src')}">`,
                        pubDate: item.find('.year').text(),
                        link: item.children('a').attr('href'),
                    };
                })
                .get(),
    };
};
