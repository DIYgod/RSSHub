const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.gameapps.hk/list/category/Game',
        headers: {
            Referer: 'https://www.gameapps.hk/list/category/Game',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.Mid2L_con li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('.tt').text(),
                link: $(this).find('.tt').attr('href'),
                pubDate: new Date($(this).find('.time').text()).toUTCString(),
                description: $(this).find('.txt').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: '香港手機遊戲網-家用主機',
        link: 'https://www.gameapps.hk/list/category/Game',
        item: out,
    };
};
