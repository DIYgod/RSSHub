const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'http://zimuxia.cn';
    const currentUrl = `${rootUrl}/portfolio/${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = $('a')
        .filter(function () {
            return $(this).attr('href').substr(0, 7) === 'magnet:';
        })
        .reverse()
        .map((_, item) => {
            item = $(item);

            return {
                link: currentUrl,
                title: item.parent().text().split(' ')[0],
                description: `<p>${item.parent().html()}</p>`,
                enclosure_url: item.attr('href'),
                enclosure_type: 'application/x-bittorrent',
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('.content-page-title').text()} - FIX字幕侠`,
        link: currentUrl,
        item: items,
    };
};
