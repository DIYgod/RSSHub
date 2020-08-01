const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://diygod.me/gk',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.gk-item');

    ctx.state.data = {
        title: 'DIYgod 的可爱的手办们',
        link: 'https://diygod.me/gk',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const title = item.find('.gk-desc p').eq(0).text().slice(3);
                    return {
                        title,
                        description: item.html(),
                        link: 'https://diygod.me/gk',
                        guid: title,
                    };
                })
                .get(),
    };
};
