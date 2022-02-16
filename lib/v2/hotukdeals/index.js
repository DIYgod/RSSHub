const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let type = ctx.params.type;
    if (type === 'highlights') {
        type = '';
    }

    const data = await got.get(`https://www.hotukdeals.com/${type}?page=1&ajax=true&layout=horizontal`, {
        headers: {
            Referer: `https://www.hotukdeals.com/${type}`,
        },
    });
    const $ = cheerio.load(data.data.data.content);

    const list = $('article.thread');

    ctx.state.data = {
        title: `hotukdeals ${type}`,
        link: `https://www.hotukdeals.com/${type}`,
        item: list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('.cept-tt').text(),
                    description: `${item.find('.cept-thread-image-link').html()}<br>${item.find('.cept-vote-temp').html()}<br>${item.find('.overflow--fade').html()}<br>${item.find('.cept-description-container').html()}`,
                    link: item.find('.cept-tt').attr('href'),
                };
            })
            .get()
            .reverse(),
    };
};
