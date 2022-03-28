const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://sub.shinybbs.vip';
    const currentUrl = `${rootUrl}/?p=${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.elementor-section').last().remove();
    $('.elementor-section').last().remove();

    $('.elementor-tabs-wrapper').remove();

    const items = $('.elementor-tab-content a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
                enclosure_url: item.attr('href'),
                enclosure_type: 'application/x-bittorrent',
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('.post-title').text()} - 深影译站`,
        link: currentUrl,
        item: items.reverse(),
    };
};
