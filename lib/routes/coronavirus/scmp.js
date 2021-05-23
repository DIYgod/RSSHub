const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.scmp.com/topics/coronavirus-outbreak',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.article');

    ctx.state.data = {
        title: 'China coronavirus outbreak - SCMP',
        description: $('.topic__desc--p').html(),
        link: 'https://www.scmp.com/topics/coronavirus-outbreak',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.article__title').text(),
                        description: item.find('.article__summary').html(),
                        link: item.find('.article__link').attr('href') || item.find('.article-title__article-link').attr('href'),
                    };
                })
                .get(),
    };
};
