const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = `https://ysfx.tv`;
    const currentUrl = `${rootUrl}/view/${id}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    $('img, .link-name').remove();

    $('a[title]').each(function () {
        $(this).text($(this).attr('title'));
    });

    const list = $('.team-con-area')
        .map((_, item) => {
            item = $(item);
            const link = item.find('a[data-target="#down-modal"]').eq(0).attr('href');

            return {
                link,
                enclosure_url: link,
                enclosure_type: 'application/x-bittorrent',
                title: item.find('.item-content').text(),
                description: `<ul>${item.find('.team-icons').html()}</ul>`,
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('.page-header-content .title').text()} - NEW字幕组`,
        link: currentUrl,
        item: list,
    };
};
